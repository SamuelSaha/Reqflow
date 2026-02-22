"""
@swarm-lead Top-Level Supervisor Graph
Wires all nodes from nodes.py into a complete LangGraph.

Topology:
  parse_intent → detect_mode → load_memory → select_workflow
      ─ (workflow?) ─→ execute_workflow ─────────────┐
      ─ (no workflow) → dispatch_agents               │
           → [domain agent subgraphs in parallel]     │
           → compile_results → verify_gates           │
               ─ (pass?) → deliver                    │
               ─ (fail?) → handle_rejection → retry   │
           → save_memory → END  ←─────────────────────┘
"""

from __future__ import annotations

from typing import Any

from langgraph.graph import StateGraph, START, END

from config.agent_registry import registry
from graph_agents.base_subagent import slugify
from graph_agents.domain.factory import build_domain_subgraph
from graph_agents.frontend.graph import build_frontend_subgraph
from graph_agents.lead.nodes import (
    parse_intent,
    detect_mode,
    load_memory,
    select_workflow,
    dispatch_agents,
    compile_results,
    verify_gates,
    deliver,
    handle_rejection,
    save_memory,
    route_after_workflow_check,
    route_after_verification,
    route_fan_out_to_agents,
)
from state.schemas import SwarmState


def _build_domain_agent_node(agent_name: str):
    """
    Wrap a domain agent subgraph as a node function for the lead graph.

    The subgraph expects DomainAgentState, but the lead graph operates on
    SwarmState. This wrapper adapts between the two by:
    1. Extracting relevant fields from SwarmState into DomainAgentState
    2. Invoking the compiled subgraph
    3. Merging the subgraph output back into SwarmState
    """
    # Build the appropriate subgraph
    if agent_name == "swarm-frontend":
        subgraph = build_frontend_subgraph()
    else:
        subgraph = build_domain_subgraph(agent_name)

    def domain_agent_node(state: SwarmState) -> dict:
        """Execute domain agent subgraph and return results to lead graph."""
        # Build input state for the subgraph
        subgraph_input = {
            "mission": state.get("user_input", ""),
            "spec_packet": state.get("spec_packet"),
            "user_input": state.get("user_input", ""),
            "execution_mode": state.get("execution_mode", "fast"),
        }

        # Invoke the compiled subgraph
        result = subgraph.invoke(subgraph_input)

        # Extract agent output and merge into SwarmState
        messages = result.get("messages", [])
        compiled = result.get("compiled_output", {})

        # Package as agent_outputs entry (merged via reduce)
        agent_output = {
            "messages": messages,
            "content": compiled.get("content", ""),
            "assumptions": compiled.get("assumptions", []),
            "decisions": compiled.get("decisions", []),
            "open_risks": compiled.get("open_risks", []),
            "confidence": compiled.get("confidence", 0.8),
            "spec_ref": compiled.get("spec_ref", "ADHOC"),
        }

        return {
            "agent_outputs": {agent_name: agent_output},
        }

    domain_agent_node.__name__ = f"agent_{agent_name.replace('-', '_')}"
    return domain_agent_node


def _build_workflow_placeholder_node():
    """
    Placeholder for workflow execution.
    Phase 4 will replace this with actual workflow routing.
    """

    def execute_workflow(state: SwarmState) -> dict:
        """Execute a named workflow (placeholder — returns info message)."""
        workflow = state.get("workflow_type", "unknown")
        return {
            "final_output": f"Workflow '{workflow}' triggered. "
                           f"Workflow graphs will be built in Phase 4.",
            "current_phase": "deliver",
        }

    return execute_workflow


def build_lead_graph() -> Any:
    """
    Build the complete @swarm-lead supervisor graph.

    This is the top-level graph that:
    1. Parses user intent
    2. Detects execution mode (fast/deep)
    3. Loads relevant memory context
    4. Checks for named workflows
    5. Dispatches to domain agent subgraphs in parallel
    6. Compiles and verifies results
    7. Delivers output or retries on failure
    8. Persists decisions to memory

    Returns:
        A compiled LangGraph ready for .invoke()
    """
    builder = StateGraph(SwarmState)

    # --- Intake nodes ---
    builder.add_node("parse_intent", parse_intent)
    builder.add_node("detect_mode", detect_mode)
    builder.add_node("load_memory", load_memory)
    builder.add_node("select_workflow", select_workflow)

    # --- Workflow placeholder (Phase 4) ---
    builder.add_node("execute_workflow", _build_workflow_placeholder_node())

    # --- Dispatch node ---
    builder.add_node("dispatch_agents", dispatch_agents)

    # --- Domain agent subgraph nodes ---
    # Get all domain agent names (exclude lead)
    agent_names = [n for n in registry.get_agent_names() if n != "swarm-lead"]

    for agent_name in agent_names:
        builder.add_node(agent_name, _build_domain_agent_node(agent_name))

    # --- Post-execution nodes ---
    builder.add_node("compile_results", compile_results)
    builder.add_node("verify_gates", verify_gates)
    builder.add_node("deliver", deliver)
    builder.add_node("handle_rejection", handle_rejection)
    builder.add_node("save_memory", save_memory)

    # ============================================================
    # Edges
    # ============================================================

    # Linear intake pipeline
    builder.add_edge(START, "parse_intent")
    builder.add_edge("parse_intent", "detect_mode")
    builder.add_edge("detect_mode", "load_memory")
    builder.add_edge("load_memory", "select_workflow")

    # After workflow check: workflow or dispatch
    builder.add_conditional_edges(
        "select_workflow",
        route_after_workflow_check,
        {
            "execute_workflow": "execute_workflow",
            "dispatch_agents": "dispatch_agents",
        },
    )

    # Workflow goes straight to deliver (for now)
    builder.add_edge("execute_workflow", "deliver")

    # Dispatch fans out to selected agents
    builder.add_conditional_edges(
        "dispatch_agents",
        route_fan_out_to_agents,
        {agent_name: agent_name for agent_name in agent_names},
    )

    # All domain agents converge to compile_results
    for agent_name in agent_names:
        builder.add_edge(agent_name, "compile_results")

    # Compile → verify → deliver or reject
    builder.add_edge("compile_results", "verify_gates")

    builder.add_conditional_edges(
        "verify_gates",
        route_after_verification,
        {
            "deliver": "deliver",
            "handle_rejection": "handle_rejection",
        },
    )

    # Deliver → save_memory → END
    builder.add_edge("deliver", "save_memory")
    builder.add_edge("save_memory", END)

    # Rejection loops back to dispatch (retry with guidance)
    builder.add_edge("handle_rejection", "dispatch_agents")

    return builder.compile()
