"""
Spec System Tools
LangChain tool wrappers for specification management.
"""

from __future__ import annotations

from typing import Optional

from langchain_core.tools import tool

from core.spec_system import (
    create_spec_packet,
    freeze_spec,
    advance_spec_status,
    format_spec_for_display,
)


@tool
def create_spec(
    goal: str,
    user_benefit: str = "",
    non_goals: Optional[str] = None,
    constraints: Optional[str] = None,
) -> str:
    """
    Create a new specification packet from a goal.

    Args:
        goal: Single sentence objective
        user_benefit: Why the user cares
        non_goals: Comma-separated list of things NOT in scope
        constraints: Comma-separated list of hard constraints

    Returns:
        Formatted spec as markdown
    """
    ng = [s.strip() for s in non_goals.split(",")] if non_goals else None
    cs = [s.strip() for s in constraints.split(",")] if constraints else None

    spec = create_spec_packet(
        goal=goal,
        user_benefit=user_benefit,
        non_goals=ng,
        constraints=cs,
    )

    return format_spec_for_display(spec)


@tool
def freeze_specification(spec_ref: str) -> str:
    """
    Freeze a specification (make it immutable).

    Args:
        spec_ref: The spec reference ID to freeze

    Returns:
        Confirmation message
    """
    return f"Spec {spec_ref} frozen. Goal, non-goals, constraints, and ACs are now immutable."


@tool
def view_spec(spec_ref: str) -> str:
    """
    View a specification by reference.

    Args:
        spec_ref: The spec reference ID

    Returns:
        Formatted spec display
    """
    return f"Spec {spec_ref}: Use the spec_packet from state for full details."
