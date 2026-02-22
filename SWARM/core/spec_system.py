"""
Spec System
Spec context packet builder, delegation prompt formatter, and spec lifecycle management.
Implements the spec system from SPECIFICATION_LAYER.md.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from state.schemas import SpecPacket


def create_spec_packet(
    goal: str,
    user_benefit: str = "",
    non_goals: Optional[list[str]] = None,
    constraints: Optional[list[str]] = None,
    acceptance_criteria: Optional[list[dict[str, Any]]] = None,
    assumptions: Optional[list[str]] = None,
) -> SpecPacket:
    """
    Create a new SpecPacket from user seed input.
    Missing info is converted to E0 assumptions (per SPECIFICATION_LAYER.md).

    Args:
        goal: Single sentence objective
        user_benefit: Why user cares (E0 default if empty)
        non_goals: Explicitly out of scope
        constraints: Hard constraints
        acceptance_criteria: Binary ACs with pass thresholds
        assumptions: E0 defaults with falsifiers

    Returns:
        A new SpecPacket ready for delegation
    """
    spec_id = f"SPEC-{datetime.now().strftime('%Y%m%d')}-{_next_spec_number():03d}"

    return SpecPacket(
        spec_ref=spec_id,
        version="1.0.0",
        status="draft",
        goal=goal,
        user_benefit=user_benefit or f"E0: General improvement for user via '{goal[:50]}'",
        non_goals=non_goals or [],
        constraints=constraints or [],
        acceptance_criteria=acceptance_criteria or _generate_default_acs(goal),
        assumptions=assumptions or [f"E0: Standard patterns apply. Falsifier: explicit user override."],
        glossary=[],
        boundaries={},
    )


def freeze_spec(spec: SpecPacket) -> SpecPacket:
    """
    Freeze a spec (immutability protocol from SPECIFICATION_LAYER.md).
    Once frozen: goal, non-goals, constraints, ACs CANNOT be modified.
    Only implementation notes and status can change.
    """
    frozen = dict(spec)
    frozen["status"] = "frozen"
    return SpecPacket(**frozen)


def advance_spec_status(spec: SpecPacket, new_status: str) -> SpecPacket:
    """Advance spec through lifecycle: draft → approved → frozen → in_progress → completed."""
    valid_transitions = {
        "draft": ["approved", "frozen"],
        "approved": ["frozen", "in_progress"],
        "frozen": ["in_progress"],
        "in_progress": ["completed"],
    }

    current = spec.get("status", "draft")
    if new_status not in valid_transitions.get(current, []):
        raise ValueError(
            f"Invalid spec transition: {current} → {new_status}. "
            f"Valid: {valid_transitions.get(current, [])}"
        )

    updated = dict(spec)
    updated["status"] = new_status
    return SpecPacket(**updated)


def format_spec_for_display(spec: SpecPacket) -> str:
    """Format a spec packet as readable markdown."""
    lines = [
        f"# {spec.get('spec_ref', 'SPEC-???')} (v{spec.get('version', '1.0')})",
        f"**Status:** {spec.get('status', 'draft')}",
        f"**Goal:** {spec.get('goal', 'Not specified')}",
        f"**User Benefit:** {spec.get('user_benefit', 'Not specified')}",
    ]

    if spec.get("non_goals"):
        lines.append("\n**Non-Goals:**")
        for ng in spec["non_goals"]:
            lines.append(f"- {ng}")

    if spec.get("constraints"):
        lines.append("\n**Constraints:**")
        for c in spec["constraints"]:
            lines.append(f"- {c}")

    if spec.get("acceptance_criteria"):
        lines.append("\n**Acceptance Criteria:**")
        for ac in spec["acceptance_criteria"]:
            status = "☐"
            lines.append(f"- {status} {ac.get('id', '?')}: {ac.get('description', '?')}")

    if spec.get("assumptions"):
        lines.append("\n**Assumptions:**")
        for a in spec["assumptions"]:
            lines.append(f"- {a}")

    return "\n".join(lines)


# ============================================================
# Internal helpers
# ============================================================

_spec_counter = 0


def _next_spec_number() -> int:
    """Simple monotonic spec counter. Resets per session."""
    global _spec_counter
    _spec_counter += 1
    return _spec_counter


def _generate_default_acs(goal: str) -> list[dict[str, Any]]:
    """Generate default acceptance criteria from a goal (E0 defaults)."""
    return [
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
    ]
