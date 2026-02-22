"""
Domain Agent Subgraph Factory
Builds a LangGraph subgraph for any domain agent from its markdown definition.

All 12 domain agents share the same internal topology:
  receive_mission → activate_subagents → [subagent nodes in parallel]
      → compile_subagent_outputs → guideline_check
      → produce_output | reject_and_retry

The factory reads the agent's markdown to determine its subagent list,
then auto-creates nodes for each subagent.

Only @swarm-frontend overrides this (adds blocking authority) — see
graph_agents/frontend/graph.py.
"""

from __future__ import annotations

import json
from typing import Any

from langgraph.graph import StateGraph, START, END

from config.agent_registry import registry
from config.llm_factory import get_llm_for_agent
from core.prompt_loader import build_agent_system_prompt, build_delegation_prompt
from core.retry_system import assess_output_quality
from graph_agents.base_subagent import make_subagent_node, slugify
from state.schemas import DomainAgentState


# ============================================================
# Node Functions (parameterized by agent definition)
# ============================================================

def _make_receive_mission_node(agent_name: str):
    """Create the receive_mission node for a domain agent."""

    def receive_mission(state: DomainAgentState) -> dict:
        """
        Receive a mission from @swarm-lead.
        Determines CT level and which subagents to activate.
        """
        mission = state.get("mission", state.get("user_input", ""))
        execution_mode = state.get("execution_mode", "fast")

        # Determine CT level based on execution mode and mission complexity
        ct_level = "CT1"
        deep_indicators = ["security", "auth", "architecture", "scale", "payment", "encrypt"]
        if any(kw in mission.lower() for kw in deep_indicators):
            ct_level = "CT2"
        if execution_mode == "deep":
            ct_level = "CT2"

        # Get all subagents for this agent
        agent_def = registry.get_agent(agent_name)
        all_subagents = [slugify(sa) for sa in agent_def.get("subagents", [])]

        # In fast mode, activate only first subagent. In deep, all of them.
        if execution_mode == "fast" and len(all_subagents) > 1:
            active = all_subagents[:1]
        else:
            active = all_subagents

        return {
            "agent_name": f"@{agent_name}",
            "mission": mission,
            "ct_level": ct_level,
            "active_subagents": active,
            "subagent_outputs": {},
            "internal_retry_count": state.get("internal_retry_count", 0),
        }

    return receive_mission


def _make_compile_node(agent_name: str):
    """Create the compile_subagent_outputs node."""

    def compile_subagent_outputs(state: DomainAgentState) -> dict:
        """
        Compile all subagent outputs into a single coherent output.
        Main agent duty: compile, verify, reject if needed.
        """
        outputs = state.get("subagent_outputs", {})
        mission = state.get("mission", "")
        spec_packet = state.get("spec_packet")

        # Merge all subagent content
        all_assumptions = []
        all_decisions = []
        all_risks = []
        all_content_parts = []
        all_ac_refs = []

        for sa_name, sa_output in outputs.items():
            if isinstance(sa_output, dict):
                all_assumptions.extend(sa_output.get("assumptions", []))
                all_decisions.extend(sa_output.get("decisions", []))
                all_risks.extend(sa_output.get("open_risks", []))
                all_ac_refs.extend(sa_output.get("ac_refs", []))
                content = sa_output.get("content", "")
                if content:
                    all_content_parts.append(f"### {sa_name}\n{content}")

        # Deduplicate
        all_assumptions = list(dict.fromkeys(all_assumptions))
        all_decisions = list(dict.fromkeys(all_decisions))
        all_risks = list(dict.fromkeys(all_risks))

        compiled = {
            "agent": f"@{agent_name}",
            "mission": mission,
            "spec_ref": spec_packet.get("spec_ref", "ADHOC") if spec_packet else "ADHOC",
            "content": "\n\n".join(all_content_parts),
            "assumptions": all_assumptions,
            "decisions": all_decisions,
            "open_risks": all_risks,
            "ac_refs": list(set(all_ac_refs)),
            "subagent_count": len(outputs),
            "confidence": _compute_aggregate_confidence(outputs),
        }

        return {"compiled_output": compiled}

    return compile_subagent_outputs


def _make_guideline_check_node():
    """Create the guideline_check node (applies to all agents)."""

    def guideline_check(state: DomainAgentState) -> dict:
        """
        Check compiled output against global guidelines:
        1. Security by Design
        2. Simplicity by Design
        3. User-Obsessed

        Returns violations list. If empty → produce_output, if not → reject.
        """
        compiled = state.get("compiled_output", {})
        violations = []

        # Check: assumptions must be declared
        if not compiled.get("assumptions"):
            violations.append({
                "type": "ASSUMPTION_LEAK",
                "detail": "No assumptions declared in output",
            })

        # Check: decisions must be documented
        if not compiled.get("decisions") and compiled.get("content"):
            violations.append({
                "type": "EVIDENCE_GAP",
                "detail": "Content produced but no decisions documented",
            })

        # Quality gate check
        gate, score, feedback = assess_output_quality(compiled)
        if gate == "FAIL":
            violations.append({
                "type": "QUALITY_GATE_FAIL",
                "detail": f"Quality score {score:.2f}. Feedback: {'; '.join(feedback)}",
            })

        return {"guideline_violations": violations}

    return guideline_check


def _make_produce_output_node(agent_name: str):
    """Create the produce_output node (final output from this agent)."""

    def produce_output(state: DomainAgentState) -> dict:
        """Package the compiled output as a message for the parent graph."""
        compiled = state.get("compiled_output", {})

        # Add to messages so parent graph can see it
        message = {
            "role": "agent",
            "agent": f"@{agent_name}",
            "content": compiled.get("content", ""),
            "metadata": {
                "assumptions": compiled.get("assumptions", []),
                "decisions": compiled.get("decisions", []),
                "risks": compiled.get("open_risks", []),
                "confidence": compiled.get("confidence", 0.8),
                "spec_ref": compiled.get("spec_ref", "ADHOC"),
                "ac_refs": compiled.get("ac_refs", []),
            },
        }

        return {"messages": [message]}

    return produce_output


def _make_reject_node(agent_name: str):
    """Create the reject_and_retry node."""

    def reject_and_retry(state: DomainAgentState) -> dict:
        """
        Reject current output and prepare for retry.
        Increments retry counter and logs the rejection.
        """
        violations = state.get("guideline_violations", [])
        retry_count = state.get("internal_retry_count", 0)

        rejection = {
            "agent": f"@{agent_name}",
            "retry_attempt": retry_count + 1,
            "violations": violations,
        }

        return {
            "rejection_log": [rejection],
            "internal_retry_count": retry_count + 1,
            # Clear outputs so subagents re-run
            "subagent_outputs": {},
        }

    return reject_and_retry


# ============================================================
# Routing Functions
# ============================================================

def _route_to_active_subagents(state: DomainAgentState) -> list[str]:
    """Fan-out: route to all active subagent nodes."""
    return state.get("active_subagents", [])


def _route_on_guideline_result(state: DomainAgentState) -> str:
    """Route based on guideline check: clean → output, violations → reject."""
    violations = state.get("guideline_violations", [])
    retry_count = state.get("internal_retry_count", 0)

    # If violations and retries remaining, reject
    if violations and retry_count < 2:
        return "reject_and_retry"

    # Otherwise produce output (either clean or best-effort after retries)
    return "produce_output"


# ============================================================
# Factory Function
# ============================================================

def build_domain_subgraph(agent_name: str) -> Any:
    """
    Build a complete LangGraph subgraph for a domain agent.

    Reads the agent's markdown definition to determine subagents,
    then creates the graph:

        receive_mission → [subagent_1, subagent_2, ...] (parallel)
            → compile_subagent_outputs → guideline_check
            → produce_output | reject_and_retry → (loop back)

    Args:
        agent_name: Agent name (e.g. "swarm-dev", "swarm-frontend")

    Returns:
        A compiled LangGraph StateGraph
    """
    agent_def = registry.get_agent(agent_name)
    subagent_names = agent_def.get("subagents", [])

    if not subagent_names:
        # Agent has no subagents — create a pass-through graph
        return _build_passthrough_subgraph(agent_name)

    builder = StateGraph(DomainAgentState)

    # --- Add nodes ---
    builder.add_node("receive_mission", _make_receive_mission_node(agent_name))

    # Add each subagent as a node
    subagent_node_ids = []
    for sa_name in subagent_names:
        node_id = slugify(sa_name)
        subagent_node_ids.append(node_id)
        builder.add_node(node_id, make_subagent_node(agent_name, sa_name))

    builder.add_node("compile_subagent_outputs", _make_compile_node(agent_name))
    builder.add_node("guideline_check", _make_guideline_check_node())
    builder.add_node("produce_output", _make_produce_output_node(agent_name))
    builder.add_node("reject_and_retry", _make_reject_node(agent_name))

    # --- Add edges ---
    builder.add_edge(START, "receive_mission")

    # receive_mission fans out to active subagents
    builder.add_conditional_edges(
        "receive_mission",
        _route_to_active_subagents,
        # Map each subagent node_id to itself
        {node_id: node_id for node_id in subagent_node_ids},
    )

    # All subagents converge to compile
    for node_id in subagent_node_ids:
        builder.add_edge(node_id, "compile_subagent_outputs")

    builder.add_edge("compile_subagent_outputs", "guideline_check")

    # Guideline check routes to produce_output or reject
    builder.add_conditional_edges(
        "guideline_check",
        _route_on_guideline_result,
        {
            "produce_output": "produce_output",
            "reject_and_retry": "reject_and_retry",
        },
    )

    builder.add_edge("produce_output", END)
    # Reject loops back to receive_mission (which re-activates subagents)
    builder.add_edge("reject_and_retry", "receive_mission")

    return builder.compile()


def _build_passthrough_subgraph(agent_name: str) -> Any:
    """Build a minimal subgraph for agents with no subagents (shouldn't happen, but safe)."""
    from langchain_core.messages import HumanMessage, SystemMessage

    builder = StateGraph(DomainAgentState)

    def direct_execute(state: DomainAgentState) -> dict:
        """Agent with no subagents — execute directly via LLM."""
        system_prompt = build_agent_system_prompt(agent_name)
        mission = state.get("mission", state.get("user_input", ""))
        llm = get_llm_for_agent(agent_name)

        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=mission),
        ])

        message = {
            "role": "agent",
            "agent": f"@{agent_name}",
            "content": response.content if hasattr(response, "content") else str(response),
            "metadata": {},
        }

        return {"messages": [message]}

    builder.add_node("direct_execute", direct_execute)
    builder.add_edge(START, "direct_execute")
    builder.add_edge("direct_execute", END)

    return builder.compile()


# ============================================================
# Helpers
# ============================================================

def _compute_aggregate_confidence(outputs: dict[str, dict[str, Any]]) -> float:
    """Compute average confidence across subagent outputs."""
    confidences = []
    for output in outputs.values():
        if isinstance(output, dict) and "confidence" in output:
            confidences.append(output["confidence"])
    return sum(confidences) / len(confidences) if confidences else 0.8


def get_all_domain_subgraphs() -> dict[str, Any]:
    """
    Build subgraphs for ALL domain agents (excludes swarm-lead).
    Returns dict of agent_name → compiled subgraph.
    """
    agents = registry.get_agent_names()
    subgraphs = {}

    for name in agents:
        if name == "swarm-lead":
            continue  # Lead is the supervisor, not a domain agent
        subgraphs[name] = build_domain_subgraph(name)

    return subgraphs
