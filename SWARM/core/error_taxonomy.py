"""
Error Taxonomy
Structured rejection types from SWARM_PROTOCOL.md.
Every rejection is tagged with a type for systematic tracking.
"""

from __future__ import annotations

from enum import Enum
from typing import Any


class ErrorType(str, Enum):
    """All error types from SWARM_PROTOCOL.md error taxonomy."""
    SCOPE_VIOLATION = "SCOPE_VIOLATION"
    ASSUMPTION_LEAK = "ASSUMPTION_LEAK"
    MISSING_EDGE_CASE = "MISSING_EDGE_CASE"
    INCONSISTENT_CONTRACT = "INCONSISTENT_CONTRACT"
    UNMEASURABLE_OUTCOME = "UNMEASURABLE_OUTCOME"
    PERFORMANCE_BLIND_SPOT = "PERFORMANCE_BLIND_SPOT"
    ACCESSIBILITY_GAP = "ACCESSIBILITY_GAP"
    SECURITY_HOLE = "SECURITY_HOLE"
    COMPLEXITY_LEAK = "COMPLEXITY_LEAK"
    USER_DISCONNECT = "USER_DISCONNECT"
    EVIDENCE_GAP = "EVIDENCE_GAP"
    PREMATURE_CONVERGENCE = "PREMATURE_CONVERGENCE"
    SPEC_GROUNDING_FAILURE = "SPEC_GROUNDING_FAILURE"

    # Global guideline violations
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
    # Anti-patterns from SWARM_TURBO.md
    PERMISSION_LOOP = "PERMISSION_LOOP"
    ROUTING_LEAK = "ROUTING_LEAK"
    VIBES_GATE = "VIBES_GATE"
    COMPLETION_LIE = "COMPLETION_LIE"


# Human-readable descriptions
ERROR_DESCRIPTIONS: dict[str, str] = {
    ErrorType.SCOPE_VIOLATION: "Exceeds defined boundaries",
    ErrorType.ASSUMPTION_LEAK: "Undeclared assumption in output",
    ErrorType.MISSING_EDGE_CASE: "Failure scenario unaddressed",
    ErrorType.INCONSISTENT_CONTRACT: "API or type mismatch",
    ErrorType.UNMEASURABLE_OUTCOME: "Cannot verify success",
    ErrorType.PERFORMANCE_BLIND_SPOT: "No performance consideration",
    ErrorType.ACCESSIBILITY_GAP: "Accessibility missing",
    ErrorType.SECURITY_HOLE: "Security violated",
    ErrorType.COMPLEXITY_LEAK: "Unnecessary abstraction",
    ErrorType.USER_DISCONNECT: "No clear user benefit",
    ErrorType.EVIDENCE_GAP: "No proof or unlabeled heuristics",
    ErrorType.PREMATURE_CONVERGENCE: "One option where multiple required",
    ErrorType.SPEC_GROUNDING_FAILURE: "Misread or ignored spec",
}


def format_rejection(
    error_type: ErrorType | str,
    what_failed: str,
    why_it_matters: str,
    what_must_change: str,
    what_must_not_change: str = "",
) -> dict[str, Any]:
    """
    Format a structured rejection per SWARM_PROTOCOL.md template.

    Returns a dict suitable for inclusion in error_log state.
    """
    if isinstance(error_type, str):
        error_type = ErrorType(error_type)

    return {
        "error_type": error_type.value,
        "description": ERROR_DESCRIPTIONS.get(error_type, "Unknown error"),
        "what_failed": what_failed,
        "why_it_matters": why_it_matters,
        "what_must_change": what_must_change,
        "what_must_not_change": what_must_not_change,
    }


def format_rejection_markdown(rejection: dict[str, Any]) -> str:
    """Format a rejection dict as markdown (for display)."""
    lines = [
        "## ❌ REJECTED",
        f"**Error Type:** `{rejection['error_type']}`",
        f"**What failed:** {rejection['what_failed']}",
        f"**Why it matters:** {rejection['why_it_matters']}",
        f"**What must change:** {rejection['what_must_change']}",
    ]
    if rejection.get("what_must_not_change"):
        lines.append(f"**What must NOT change:** {rejection['what_must_not_change']}")
    return "\n".join(lines)
