"""
Swarm MCP Server — Claude-Native Mode
======================================
No separate API calls. Claude IS the LLM.

The MCP tools provide Claude with:
  - Agent identity/prompts (Claude "becomes" the agent)
  - Dispatch routing (which agents to think as)
  - Verification gates (real subprocess checks)
  - Spec/workflow scaffolding
  - Protocol enforcement

Claude does the reasoning. The swarm provides the structure.

Setup:
  claude mcp add --scope user --transport stdio swarm-lead -- \
    /path/to/SWARM/.venv/bin/python /path/to/SWARM/mcp_server.py
"""

from __future__ import annotations

import logging
import os
import sys

# CRITICAL: logging to stderr only. stdout = JSON-RPC.
logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,
    format="%(asctime)s [swarm] %(levelname)s: %(message)s",
)
logger = logging.getLogger("swarm-mcp")

# Setup paths
_swarm_root = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("SWARM_ROOT", _swarm_root)
if _swarm_root not in sys.path:
    sys.path.insert(0, _swarm_root)

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    name="swarm-lead",
    instructions=(
        "You have access to the Swarm agent system. When a user asks you to work on something, "
        "use swarm_dispatch to get the right agent identities + instructions, then follow "
        "those instructions to produce the output. Use swarm_verify to run real verification "
        "gates (build/lint/test) on the project. Use swarm_spec to generate specifications."
    ),
)


# ============================================================
# CORE TOOL: Dispatch — tells Claude WHICH agents to be + HOW
# ============================================================

@mcp.tool()
def swarm_dispatch(request: str, mode: str = "auto") -> str:
    """
    Analyze a request and return the agent instructions Claude should follow.

    This is the main tool. It:
    1. Detects execution mode (fast/deep)
    2. Selects the right domain agents
    3. Returns their full system prompts and protocols

    Claude should then follow those agent instructions to produce the output.

    Args:
        request: What the user needs (e.g. "Fix the login bug")
        mode: "auto" (detect), "fast", or "deep"

    Returns:
        Agent identities, system prompts, and instructions for Claude to follow.
    """
    logger.info(f"dispatch: '{request[:80]}' mode={mode}")

    from core.dispatch import dispatch as keyword_dispatch, classify_scope, get_pre_computed_flow
    from core.mode_detector import ModeDetector
    from core.prompt_loader import build_agent_system_prompt, extract_ct_response_format
    from config.agent_registry import registry

    # Detect mode
    detector = ModeDetector()
    if mode == "auto":
        signal = detector.detect(request)
        exec_mode = signal.mode.value
    else:
        exec_mode = mode

    # Dispatch
    agents, scope = keyword_dispatch(request, exec_mode)
    flow = get_pre_computed_flow(request)
    ct_level = "CT2" if exec_mode == "deep" else "CT1"

    # Build the instruction package
    sections = []
    sections.append(f"# 🐝 Swarm Dispatch\n")
    sections.append(f"**Mode:** {'⚡ FAST' if exec_mode == 'fast' else '🔍 DEEP'}")
    sections.append(f"**Scope:** {scope}")
    sections.append(f"**Agents:** {', '.join(f'@{a}' for a in agents)}")
    if flow:
        sections.append(f"**Pre-computed flow:** {flow}")
    sections.append(f"**Response format:** {ct_level}")
    sections.append("")

    # Instructions for Claude
    sections.append("---")
    sections.append("## Instructions")
    sections.append("")
    sections.append("Adopt each agent identity below and produce their output.")
    if len(agents) > 1:
        sections.append(f"There are {len(agents)} agents — produce a section for EACH one.")
    sections.append("Follow the response format. Include assumptions, decisions, and risks.")
    sections.append("")

    # Agent prompts
    for agent_name in agents:
        try:
            prompt = build_agent_system_prompt(agent_name)
            agent_def = registry.get_agent(agent_name)
            subagents = agent_def.get("subagents", [])

            sections.append(f"---")
            sections.append(f"## Agent: @{agent_name}")
            sections.append(f"**Subagents:** {', '.join(subagents) if subagents else 'None'}")
            sections.append("")

            if exec_mode == "fast" and subagents:
                sections.append(f"**FAST mode:** Use only primary subagent: {subagents[0]}")
            elif subagents:
                sections.append(f"**DEEP mode:** Use ALL subagents: {', '.join(subagents)}")

            sections.append("")
            sections.append(prompt)
            sections.append("")
        except Exception as e:
            sections.append(f"## Agent: @{agent_name}\n(Error loading: {e})\n")

    # Response format
    sections.append("---")
    sections.append(extract_ct_response_format("", ct_level))

    return "\n".join(sections)


# ============================================================
# TOOL: Get a single agent's full identity + prompt
# ============================================================

@mcp.tool()
def swarm_agent(agent_name: str) -> str:
    """
    Get the full identity and system prompt for a specific agent.

    Use this when you need to think as a specific agent (e.g. @swarm-frontend)
    without running the full dispatch pipeline.

    Args:
        agent_name: Agent name (e.g. "swarm-dev", "swarm-frontend", "swarm-qa")

    Returns:
        The agent's full system prompt, subagent list, and capabilities.
    """
    logger.info(f"agent: {agent_name}")

    from core.prompt_loader import build_agent_system_prompt
    from config.agent_registry import registry

    try:
        agent_def = registry.get_agent(agent_name)
        prompt = build_agent_system_prompt(agent_name)

        sections = [
            f"# @{agent_def['name']} — {agent_def.get('description', '')}",
            f"**Domain:** {agent_def.get('domain', 'General')}",
            f"**Authority:** {agent_def.get('authority_level', 'Standard')}",
            f"**Subagents:** {', '.join(agent_def.get('subagents', [])) or 'None'}",
            f"**Skills:** {', '.join(agent_def.get('skills', [])[:10]) or 'None'}",
            "",
            prompt,
        ]
        return "\n".join(sections)

    except Exception as e:
        return f"Error loading agent '{agent_name}': {e}"


# ============================================================
# TOOL: Verification gates — REAL subprocess checks
# ============================================================

@mcp.tool()
def swarm_verify(project_path: str = ".", gates: str = "all") -> str:
    """
    Run REAL verification gates on a project (build, lint, test, security).

    These are actual subprocess commands — not vibes. PASS or FAIL.
    Auto-detects project type (node/python/rust/go).

    Args:
        project_path: Path to project root (default: current directory)
        gates: Which gates — "all", "build", "lint", "test", "security"

    Returns:
        Binary PASS/FAIL results with evidence (stdout/stderr excerpts).
    """
    logger.info(f"verify: gates={gates} path={project_path}")

    from core.verification import run_gate, run_all_gates, format_gate_results, all_gates_pass

    try:
        if gates == "all":
            results = run_all_gates(project_path)
        else:
            results = [run_gate(gates.upper(), project_path)]

        output = ["# Verification Gates\n"]
        for r in results:
            icon = {"PASS": "✅", "FAIL": "❌", "SKIP": "⏭️"}.get(r["status"], "?")
            output.append(f"**{r['gate']}** {icon} {r['status']}")
            output.append(f"  Evidence: {r['evidence'][:200]}")
            output.append("")

        passed = all_gates_pass(results)
        output.append(f"**Overall: {'✅ ALL PASS' if passed else '❌ FAILURES DETECTED'}**")
        output.append(f"\nCompact: {format_gate_results(results)}")

        return "\n".join(output)

    except Exception as e:
        return f"Verification error: {e}"


# ============================================================
# TOOL: Spec generation — structured specification
# ============================================================

@mcp.tool()
def swarm_spec(goal: str, non_goals: str = "", constraints: str = "") -> str:
    """
    Generate a complete frozen specification from a goal.

    Produces: acceptance criteria, E0 assumptions, non-goals,
    constraints, and implementation tickets.

    Args:
        goal: What to build (1 sentence)
        non_goals: Comma-separated things NOT in scope (optional)
        constraints: Comma-separated hard constraints (optional)

    Returns:
        A frozen spec in markdown, ready to reference during implementation.
    """
    logger.info(f"spec: '{goal[:80]}'")

    from graph_workflows.one_shot_spec import build_one_shot_spec_graph

    try:
        graph = build_one_shot_spec_graph()
        result = graph.invoke({"user_input": f"/specify {goal}"})
        return result.get("final_output", "Spec generation failed.")
    except Exception as e:
        return f"Spec error: {e}"


# ============================================================
# TOOL: Protocol loader — load any swarm protocol doc
# ============================================================

@mcp.tool()
def swarm_protocol(protocol_name: str) -> str:
    """
    Load a swarm protocol document for Claude to follow.

    Available protocols:
    - SWARM_PROTOCOL (core laws and rules)
    - SWARM_DELEGATION (CT1/CT2 response formats)
    - SWARM_VERIFICATION (gate definitions)
    - SWARM_TURBO (speed optimizations, dispatch table)
    - SWARM_GUIDELINES (global design principles)
    - SWARM_ORGANIZATION (hierarchy and structure)
    - SWARM_SKILLS (skill taxonomy)
    - SPECIFICATION_LAYER (spec system)

    Args:
        protocol_name: Name of the protocol to load

    Returns:
        Full protocol document text.
    """
    logger.info(f"protocol: {protocol_name}")

    from core.prompt_loader import load_protocol

    try:
        return load_protocol(protocol_name)
    except FileNotFoundError:
        # Try listing available protocols
        from pathlib import Path
        swarm_root = Path(_swarm_root)
        available = [f.stem for f in swarm_root.glob("*.md")]
        return f"Protocol '{protocol_name}' not found. Available: {', '.join(available)}"


# ============================================================
# TOOL: Status — overview of the system
# ============================================================

@mcp.tool()
def swarm_status() -> str:
    """
    Show all available swarm agents, their subagents, and capabilities.

    Returns:
        System overview with agent list, workflows, and execution modes.
    """
    from config.agent_registry import registry

    try:
        agents = registry.get_agent_names()
        agent_lines = []
        total_subagents = 0

        for name in agents:
            agent_def = registry.get_agent(name)
            subs = agent_def.get("subagents", [])
            total_subagents += len(subs)
            desc = agent_def.get("description", "")
            triggers = ", ".join(agent_def.get("triggers", [])[:5])
            agent_lines.append(
                f"  **@{name}** — {desc}\n"
                f"    Subagents: {', '.join(subs) if subs else 'None'}\n"
                f"    Triggers: {triggers or 'N/A'}"
            )

        return (
            f"# 🐝 Swarm Agent System\n\n"
            f"**{len(agents)} agents** with **{total_subagents} subagents** total\n\n"
            f"## Agents\n"
            + "\n\n".join(agent_lines)
            + "\n\n## How to Use\n"
            "- `swarm_dispatch(\"your request\")` → Get agent instructions, then follow them\n"
            "- `swarm_agent(\"swarm-dev\")` → Get a specific agent's identity\n"
            "- `swarm_verify()` → Run build/lint/test/security gates\n"
            "- `swarm_spec(\"goal\")` → Generate a frozen specification\n"
            "- `swarm_protocol(\"SWARM_PROTOCOL\")` → Load a protocol document\n"
        )
    except Exception as e:
        return f"Status error: {e}"


# ============================================================
# TOOL: Dispatch preview (lightweight, no prompts)
# ============================================================

@mcp.tool()
def swarm_dispatch_preview(request: str) -> str:
    """
    Quick preview of which agents would handle a request. No prompts loaded.

    Args:
        request: The request to analyze

    Returns:
        Agent names, scope, mode — no full prompts.
    """
    from core.dispatch import dispatch as kw_dispatch, classify_scope, get_pre_computed_flow
    from core.mode_detector import ModeDetector

    detector = ModeDetector()
    signal = detector.detect(request)

    agents_fast, scope = kw_dispatch(request, "fast")
    agents_deep, _ = kw_dispatch(request, "deep")
    flow = get_pre_computed_flow(request)

    return (
        f"**Request:** {request}\n"
        f"**Detected mode:** {signal.mode.value} ({signal.confidence:.0%})\n"
        f"**Scope:** {scope}\n"
        f"**Flow:** {flow or 'standard dispatch'}\n"
        f"**Fast agents:** {', '.join(f'@{a}' for a in agents_fast)}\n"
        f"**Deep agents:** {', '.join(f'@{a}' for a in agents_deep)}"
    )


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    logger.info("Starting Swarm MCP Server (Claude-native mode)...")
    mcp.run(transport="stdio")
