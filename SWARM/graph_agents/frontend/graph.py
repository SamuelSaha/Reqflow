"""
@swarm-frontend Subgraph Override
Extends the standard domain agent factory with BLOCKING AUTHORITY.

Per SWARM_PROTOCOL.md Law 5 — Frontend as Gravity Center:
@swarm-frontend can BLOCK without:
  - [ ] Defined UI states
  - [ ] Defined error handling
  - [ ] Defined performance budget

This override adds a blocking_check node after guideline_check.
"""

from __future__ import annotations

from typing import Any

from langgraph.graph import StateGraph, START, END

from config.agent_registry import registry
from graph_agents.base_subagent import make_subagent_node, slugify
from graph_agents.domain.factory import (
    _make_receive_mission_node,
    _make_compile_node,
    _make_guideline_check_node,
    _make_produce_output_node,
    _make_reject_node,
    _route_to_active_subagents,
)
from state.schemas import DomainAgentState


def _make_blocking_check_node():
    """
    Frontend-specific blocking authority check.
    Can block the entire pipeline if critical UI concerns aren't addressed.
    """

    def blocking_check(state: DomainAgentState) -> dict:
        """
        Check if frontend can proceed or must block.

        Blocking conditions (any missing = BLOCK):
        1. UI states not defined (loading, empty, error, success)
        2. Error handling not defined
        3. Performance budget not defined
        """
        compiled = state.get("compiled_output", {})
        content = compiled.get("content", "").lower()
        blocking_reasons = []

        # Check for UI state definitions
        ui_state_keywords = ["loading", "empty state", "error state", "success state", "skeleton"]
        has_ui_states = any(kw in content for kw in ui_state_keywords)
        if not has_ui_states:
            blocking_reasons.append("UI states (loading/empty/error/success) not defined")

        # Check for error handling
        error_keywords = ["error handling", "error boundary", "fallback", "catch", "recovery"]
        has_error_handling = any(kw in content for kw in error_keywords)
        if not has_error_handling:
            blocking_reasons.append("Error handling strategy not defined")

        # Check for performance considerations
        perf_keywords = ["performance", "bundle", "lazy", "virtualization", "pagination", "debounce"]
        has_perf = any(kw in content for kw in perf_keywords)
        if not has_perf:
            blocking_reasons.append("Performance budget/strategy not addressed")

        if blocking_reasons:
            return {
                "guideline_violations": state.get("guideline_violations", []) + [
                    {
                        "type": "FRONTEND_BLOCK",
                        "detail": f"Frontend blocking: {'; '.join(blocking_reasons)}",
                        "blocking": True,
                    }
                ]
            }

        return {}

    return blocking_check


def _route_after_blocking_check(state: DomainAgentState) -> str:
    """Route based on blocking check + guideline violations."""
    violations = state.get("guideline_violations", [])
    retry_count = state.get("internal_retry_count", 0)

    # Check for hard blocks from frontend
    has_blocks = any(v.get("blocking") for v in violations)

    if has_blocks and retry_count < 2:
        return "reject_and_retry"
    if violations and retry_count < 2:
        return "reject_and_retry"

    return "produce_output"


def build_frontend_subgraph() -> Any:
    """
    Build the @swarm-frontend subgraph with blocking authority.

    Same as standard factory PLUS:
    - blocking_check node after guideline_check
    - Frontend can block without UI states, error handling, or perf budget
    """
    agent_name = "swarm-frontend"
    agent_def = registry.get_agent(agent_name)
    subagent_names = agent_def.get("subagents", [])

    builder = StateGraph(DomainAgentState)

    # --- Standard nodes ---
    builder.add_node("receive_mission", _make_receive_mission_node(agent_name))

    subagent_node_ids = []
    for sa_name in subagent_names:
        node_id = slugify(sa_name)
        subagent_node_ids.append(node_id)
        builder.add_node(node_id, make_subagent_node(agent_name, sa_name))

    builder.add_node("compile_subagent_outputs", _make_compile_node(agent_name))
    builder.add_node("guideline_check", _make_guideline_check_node())

    # --- Frontend-specific node ---
    builder.add_node("blocking_check", _make_blocking_check_node())

    builder.add_node("produce_output", _make_produce_output_node(agent_name))
    builder.add_node("reject_and_retry", _make_reject_node(agent_name))

    # --- Edges ---
    builder.add_edge(START, "receive_mission")

    builder.add_conditional_edges(
        "receive_mission",
        _route_to_active_subagents,
        {node_id: node_id for node_id in subagent_node_ids},
    )

    for node_id in subagent_node_ids:
        builder.add_edge(node_id, "compile_subagent_outputs")

    builder.add_edge("compile_subagent_outputs", "guideline_check")

    # Frontend adds blocking_check after guideline_check
    builder.add_edge("guideline_check", "blocking_check")

    # Blocking check routes to output or reject
    builder.add_conditional_edges(
        "blocking_check",
        _route_after_blocking_check,
        {
            "produce_output": "produce_output",
            "reject_and_retry": "reject_and_retry",
        },
    )

    builder.add_edge("produce_output", END)
    builder.add_edge("reject_and_retry", "receive_mission")

    return builder.compile()
