"""
One-Shot Spec Workflow
Generates a complete specification from a seed idea.

Pipeline: seed → expand → ACs → assumptions → tickets
Triggered by: /specify or /spec

From SPECIFICATION_LAYER.md — takes a 1-sentence goal and produces
a fully formed spec packet with acceptance criteria, assumptions (E0),
non-goals, and decomposed tickets.
"""

from __future__ import annotations

from typing import Any

from langgraph.graph import StateGraph, START, END

from core.spec_system import create_spec_packet, freeze_spec, format_spec_for_display
from state.schemas import SwarmState


# ============================================================
# Workflow-Specific State
# ============================================================

from typing import TypedDict, Optional, Annotated
import operator


class SpecWorkflowState(TypedDict, total=False):
    """State for the one-shot spec workflow."""
    user_input: str
    seed_goal: str
    expanded_goal: str
    acceptance_criteria: list[dict[str, Any]]
    assumptions: list[str]
    non_goals: list[str]
    constraints: list[str]
    tickets: list[dict[str, str]]
    spec_packet: Optional[dict[str, Any]]
    final_output: Optional[str]
    messages: Annotated[list[dict[str, Any]], operator.add]
    current_step: str


# ============================================================
# Nodes
# ============================================================

def extract_seed(state: SpecWorkflowState) -> dict:
    """Step 1: Extract the seed goal from user input."""
    user_input = state.get("user_input", "")

    # Strip the command prefix if present
    seed = user_input
    for prefix in ("/specify ", "/spec "):
        if seed.startswith(prefix):
            seed = seed[len(prefix):]

    return {
        "seed_goal": seed.strip(),
        "current_step": "seed",
    }


def expand_goal(state: SpecWorkflowState) -> dict:
    """Step 2: Expand the seed into a clear, measurable goal."""
    seed = state.get("seed_goal", "")

    # Structured expansion (deterministic for now — LLM call in production)
    expanded = seed
    if not any(word in seed.lower() for word in ["user", "customer", "developer"]):
        expanded = f"Enable users to {seed.lower()}"

    return {
        "expanded_goal": expanded,
        "current_step": "expand",
    }


def generate_acceptance_criteria(state: SpecWorkflowState) -> dict:
    """Step 3: Generate binary acceptance criteria from the expanded goal."""
    goal = state.get("expanded_goal", state.get("seed_goal", ""))

    # Default ACs — in production, this would be an LLM call with domain context
    acs = [
        {
            "id": "AC-001",
            "description": f"The implementation achieves: {goal}",
            "priority": "P0",
            "pass_threshold": "Binary: works or doesn't",
        },
        {
            "id": "AC-002",
            "description": "All existing tests continue to pass (no regressions)",
            "priority": "P0",
            "pass_threshold": "0 test failures",
        },
        {
            "id": "AC-003",
            "description": "Build and lint pass without errors",
            "priority": "P0",
            "pass_threshold": "exit code 0",
        },
        {
            "id": "AC-004",
            "description": "Loading, empty, and error states are handled in the UI",
            "priority": "P1",
            "pass_threshold": "All states visually verified",
        },
    ]

    return {
        "acceptance_criteria": acs,
        "current_step": "acs",
    }


def derive_assumptions(state: SpecWorkflowState) -> dict:
    """Step 4: Derive assumptions (E0 defaults) and non-goals."""
    goal = state.get("expanded_goal", "")

    assumptions = [
        f"E0: Standard project patterns apply. Falsifier: explicit user override.",
        f"E0: Existing auth system handles permissions. Falsifier: new auth requirements.",
        f"E0: Current data model can support this feature. Falsifier: schema change needed.",
    ]

    non_goals = [
        "Migration of existing data (unless explicitly required)",
        "Third-party integrations beyond current stack",
        "Performance optimization beyond baseline requirements",
    ]

    constraints = [
        "Must use existing tech stack",
        "Must not break existing API contracts",
        "Must be deployable independently",
    ]

    return {
        "assumptions": assumptions,
        "non_goals": non_goals,
        "constraints": constraints,
        "current_step": "assumptions",
    }


def decompose_tickets(state: SpecWorkflowState) -> dict:
    """Step 5: Decompose into implementation tickets."""
    goal = state.get("expanded_goal", "")
    acs = state.get("acceptance_criteria", [])

    tickets = [
        {
            "id": "T-001",
            "title": f"Implement core logic: {goal[:50]}",
            "agent": "@swarm-dev",
            "acs": ["AC-001"],
            "estimate": "SPRINT",
        },
        {
            "id": "T-002",
            "title": "Add test coverage for new feature",
            "agent": "@swarm-qa",
            "acs": ["AC-002"],
            "estimate": "INSTANT",
        },
        {
            "id": "T-003",
            "title": "Ensure build/lint compliance",
            "agent": "@swarm-dev",
            "acs": ["AC-003"],
            "estimate": "INSTANT",
        },
    ]

    return {
        "tickets": tickets,
        "current_step": "tickets",
    }


def assemble_spec(state: SpecWorkflowState) -> dict:
    """Final step: Assemble all parts into a frozen SpecPacket."""
    spec = create_spec_packet(
        goal=state.get("expanded_goal", state.get("seed_goal", "")),
        non_goals=state.get("non_goals"),
        constraints=state.get("constraints"),
        acceptance_criteria=state.get("acceptance_criteria"),
        assumptions=state.get("assumptions"),
    )

    spec = freeze_spec(spec)
    display = format_spec_for_display(spec)

    # Add ticket summary
    tickets = state.get("tickets", [])
    if tickets:
        ticket_lines = ["\n## Implementation Tickets"]
        for t in tickets:
            ticket_lines.append(
                f"- **{t['id']}**: {t['title']} → {t['agent']} ({t['estimate']})"
            )
        display += "\n".join(ticket_lines)

    return {
        "spec_packet": dict(spec),
        "final_output": display,
        "current_step": "complete",
        "messages": [{"role": "assistant", "content": display}],
    }


# ============================================================
# Graph Assembly
# ============================================================

def build_one_shot_spec_graph() -> Any:
    """
    Build the One-Shot Spec workflow graph.

    Pipeline:
        extract_seed → expand_goal → generate_acs → derive_assumptions
            → decompose_tickets → assemble_spec → END
    """
    builder = StateGraph(SpecWorkflowState)

    builder.add_node("extract_seed", extract_seed)
    builder.add_node("expand_goal", expand_goal)
    builder.add_node("generate_acs", generate_acceptance_criteria)
    builder.add_node("derive_assumptions", derive_assumptions)
    builder.add_node("decompose_tickets", decompose_tickets)
    builder.add_node("assemble_spec", assemble_spec)

    builder.add_edge(START, "extract_seed")
    builder.add_edge("extract_seed", "expand_goal")
    builder.add_edge("expand_goal", "generate_acs")
    builder.add_edge("generate_acs", "derive_assumptions")
    builder.add_edge("derive_assumptions", "decompose_tickets")
    builder.add_edge("decompose_tickets", "assemble_spec")
    builder.add_edge("assemble_spec", END)

    return builder.compile()
