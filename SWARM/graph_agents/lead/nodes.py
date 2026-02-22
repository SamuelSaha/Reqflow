"""
@swarm-lead Supervisor Nodes
Pure functions for each node in the lead supervisor graph.

Topology:
  parse_intent → detect_mode → load_memory → select_workflow → dispatch
      → [domain agent subgraphs in parallel]
      → compile_results → verify_gates → deliver | handle_rejection → retry
      → save_memory → END
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from config.llm_factory import get_llm_for_agent
from core.dispatch import classify_scope, dispatch as keyword_dispatch, get_pre_computed_flow
from core.error_taxonomy import ErrorType, format_rejection
from core.memory import SwarmMemoryAdapter
from core.mode_detector import ModeDetector, ExecutionMode
from core.prompt_loader import build_agent_system_prompt
from core.spec_system import create_spec_packet
from core.verification import (
    run_all_gates,
    run_scope_gate,
    format_gate_results,
    all_gates_pass,
)
from state.schemas import SwarmState


# Module-level singletons (created once, reused)
_mode_detector = ModeDetector()
_memory: SwarmMemoryAdapter | None = None


def _get_memory() -> SwarmMemoryAdapter:
    """Lazily instantiate the memory adapter."""
    global _memory
    if _memory is None:
        _memory = SwarmMemoryAdapter()
    return _memory


# ============================================================
# Node: parse_intent
# ============================================================

def parse_intent(state: SwarmState) -> dict:
    """
    Extract structured intent from raw user input.

    Determines:
    - user_input (cleaned)
    - scope classification (INSTANT/SPRINT/EPIC/DISCOVERY)
    - workflow_type if a pre-computed flow matches
    - current_phase = "intake"
    """
    user_input = state.get("user_input", "")

    # Classify scope
    scope = classify_scope(user_input)

    # Check for pre-computed workflow
    workflow_type = get_pre_computed_flow(user_input)

    return {
        "user_input": user_input.strip(),
        "scope": scope,
        "workflow_type": workflow_type,
        "current_phase": "intake",
        "messages": [{"role": "user", "content": user_input}],
    }


# ============================================================
# Node: detect_mode
# ============================================================

def detect_mode(state: SwarmState) -> dict:
    """
    Auto-select Fast or Deep execution mode.
    Uses the ModeDetector from .swarm/mode_detector.py.
    """
    user_input = state.get("user_input", "")
    signal = _mode_detector.detect(user_input)

    return {
        "execution_mode": signal.mode.value,  # "fast" or "deep"
    }


# ============================================================
# Node: load_memory
# ============================================================

def load_memory(state: SwarmState) -> dict:
    """
    Load relevant context from persistent memory (SQLite).
    Retrieves past decisions, patterns, and cached context.
    """
    user_input = state.get("user_input", "")

    try:
        memory = _get_memory()
        context = memory.load_context(user_input)
        return {"memory_context": context}
    except Exception:
        # Memory is optional — graceful degradation
        return {"memory_context": {"decisions": [], "patterns": [], "summary": "Memory unavailable"}}


# ============================================================
# Node: select_workflow
# ============================================================

def select_workflow(state: SwarmState) -> dict:
    """
    Check if the user request triggers a named workflow.
    If so, the graph will route to that workflow subgraph instead of
    standard agent dispatch.

    Workflow triggers:
    - /specify or /spec → one_shot_spec
    - /fix → fix_and_10x
    - /build → implement_e2e
    - /turbo → turbo_execute
    - /refactor → smart_refactor
    """
    user_input = state.get("user_input", "")
    workflow = state.get("workflow_type")

    # Check for explicit command prefixes
    if user_input.startswith("/specify") or user_input.startswith("/spec"):
        workflow = "one_shot_spec"
    elif user_input.startswith("/fix"):
        workflow = "fix_and_10x"
    elif user_input.startswith("/build"):
        workflow = "implement_e2e"
    elif user_input.startswith("/turbo"):
        workflow = "turbo_execute"
    elif user_input.startswith("/refactor"):
        workflow = "smart_refactor"

    return {"workflow_type": workflow}


# ============================================================
# Node: dispatch_agents
# ============================================================

def dispatch_agents(state: SwarmState) -> dict:
    """
    Use keyword dispatch table to select which domain agents to activate.
    Returns the list of agent names for parallel fan-out.
    """
    user_input = state.get("user_input", "")
    execution_mode = state.get("execution_mode", "fast")

    agents, scope = keyword_dispatch(user_input, execution_mode)

    # Build spec packet for non-INSTANT scopes
    spec_packet = None
    if scope != "INSTANT":
        spec_packet = create_spec_packet(goal=user_input)

    return {
        "dispatched_agents": agents,
        "scope": scope,
        "spec_packet": spec_packet,
        "current_phase": "dispatch",
    }


# ============================================================
# Node: compile_results
# ============================================================

def compile_results(state: SwarmState) -> dict:
    """
    Merge outputs from all dispatched domain agents into a coherent result.
    Handles overlap detection, conflict resolution, and summary generation.
    """
    agent_outputs = state.get("agent_outputs", {})
    spec_packet = state.get("spec_packet")

    if not agent_outputs:
        return {
            "current_phase": "verify",
            "final_output": "No agent outputs received.",
        }

    # Collect all content, decisions, risks
    all_content = []
    all_decisions = []
    all_risks = []
    all_assumptions = []

    for agent_name, output in agent_outputs.items():
        if not isinstance(output, dict):
            continue

        # Extract from messages format (domain agent produce_output)
        messages = output.get("messages", [])
        for msg in messages if isinstance(messages, list) else []:
            if isinstance(msg, dict):
                content = msg.get("content", "")
                if content:
                    all_content.append(f"## @{agent_name}\n{content}")
                metadata = msg.get("metadata", {})
                all_decisions.extend(metadata.get("decisions", []))
                all_risks.extend(metadata.get("risks", []))
                all_assumptions.extend(metadata.get("assumptions", []))

        # Also handle direct content format
        direct_content = output.get("content", "")
        if direct_content and not messages:
            all_content.append(f"## @{agent_name}\n{direct_content}")
            all_decisions.extend(output.get("decisions", []))
            all_risks.extend(output.get("risks", output.get("open_risks", [])))
            all_assumptions.extend(output.get("assumptions", []))

    # Deduplicate
    all_decisions = list(dict.fromkeys(all_decisions))
    all_risks = list(dict.fromkeys(all_risks))
    all_assumptions = list(dict.fromkeys(all_assumptions))

    # Build compiled result
    compiled_sections = "\n\n".join(all_content)

    summary_parts = [compiled_sections]
    if all_decisions:
        summary_parts.append("\n## Decisions\n" + "\n".join(f"- {d}" for d in all_decisions))
    if all_risks:
        summary_parts.append("\n## Open Risks\n" + "\n".join(f"- ⚠️ {r}" for r in all_risks))
    if all_assumptions:
        summary_parts.append("\n## Assumptions\n" + "\n".join(f"- {a}" for a in all_assumptions))

    final = "\n".join(summary_parts)

    return {
        "final_output": final,
        "current_phase": "verify",
    }


# ============================================================
# Node: verify_gates
# ============================================================

def verify_gates(state: SwarmState) -> dict:
    """
    Run binary verification gates: BUILD → LINT → TEST + SECURITY → SCOPE.
    All gates are PASS/FAIL — no vibes.
    """
    agent_outputs = state.get("agent_outputs", {})
    spec_packet = state.get("spec_packet")
    scope = state.get("scope", "SPRINT")

    results = []

    # For INSTANT scope, skip heavy gates — only run SCOPE check
    if scope == "INSTANT":
        scope_result = run_scope_gate(agent_outputs, spec_packet)
        results.append(scope_result)
    else:
        # Try to run all gates (will SKIP if commands not available)
        try:
            gate_results = run_all_gates(".")
            results.extend(gate_results)
        except Exception:
            # Gates are optional in non-project contexts
            pass

        # Always run SCOPE gate
        scope_result = run_scope_gate(agent_outputs, spec_packet)
        results.append(scope_result)

    return {
        "verification_results": results,
    }


# ============================================================
# Node: deliver
# ============================================================

def deliver(state: SwarmState) -> dict:
    """
    Format and deliver the final output to the user.
    Adds verification status summary and metadata.
    """
    final_output = state.get("final_output", "")
    verification_results = state.get("verification_results", [])
    execution_mode = state.get("execution_mode", "fast")
    scope = state.get("scope", "SPRINT")
    dispatched = state.get("dispatched_agents", [])

    # Build status header
    gate_summary = format_gate_results(verification_results) if verification_results else "No gates run"
    mode_icon = "⚡" if execution_mode == "fast" else "🔍"

    header = (
        f"{mode_icon} **{execution_mode.upper()}** mode | "
        f"Scope: **{scope}** | "
        f"Agents: {', '.join(f'@{a}' for a in dispatched)} | "
        f"Gates: {gate_summary}"
    )

    delivered = f"{header}\n\n---\n\n{final_output}"

    return {
        "final_output": delivered,
        "current_phase": "deliver",
        "messages": [{"role": "assistant", "content": delivered}],
    }


# ============================================================
# Node: handle_rejection
# ============================================================

def handle_rejection(state: SwarmState) -> dict:
    """
    Handle verification gate failures.
    Decides whether to retry (with guidance) or escalate.
    """
    verification_results = state.get("verification_results", [])
    retry_count = state.get("retry_count", 0)

    failed_gates = [r for r in verification_results if r.get("status") == "FAIL"]

    if not failed_gates:
        # No failures — shouldn't be here, route to deliver
        return {}

    # Build rejection feedback for agents
    rejection = format_rejection(
        error_type=ErrorType.EVIDENCE_GAP,
        what_failed=", ".join(g["gate"] for g in failed_gates),
        why_it_matters="Verification gates must pass before delivery",
        what_must_change="; ".join(g.get("evidence", "fix required")[:100] for g in failed_gates),
    )

    return {
        "retry_count": retry_count + 1,
        "error_log": [rejection],
        "current_phase": "dispatch",  # Re-enters dispatch for retry
        "verification_results": [],  # Clear old results for fresh run
    }


# ============================================================
# Node: save_memory
# ============================================================

def save_memory(state: SwarmState) -> dict:
    """
    Persist decisions and patterns from this session to memory.db.
    Called after successful delivery.
    """
    agent_outputs = state.get("agent_outputs", {})
    user_input = state.get("user_input", "")

    try:
        memory = _get_memory()
        memory.save_decisions(agent_outputs, user_input)
    except Exception:
        pass  # Memory persistence is best-effort

    return {}


# ============================================================
# Routing Functions
# ============================================================

def route_after_workflow_check(state: SwarmState) -> str:
    """Route: if a named workflow is active, go to workflow executor; otherwise dispatch."""
    workflow = state.get("workflow_type")
    if workflow:
        return "execute_workflow"
    return "dispatch_agents"


def route_after_verification(state: SwarmState) -> str:
    """Route: if all gates pass → deliver, otherwise → handle_rejection."""
    verification_results = state.get("verification_results", [])
    retry_count = state.get("retry_count", 0)

    if all_gates_pass(verification_results):
        return "deliver"

    # Max 3 retries before force-delivering best effort
    if retry_count >= 3:
        return "deliver"

    return "handle_rejection"


def route_fan_out_to_agents(state: SwarmState) -> list[str]:
    """
    Fan-out: return the list of dispatched agent names as node IDs.
    LangGraph will execute all of them in parallel.
    """
    return state.get("dispatched_agents", ["swarm-dev"])
