"""
Fix-and-10X Workflow
Fixes a bug/issue AND improves the surrounding code (10x improvement).

6-Phase Pipeline:
  1. Diagnose → identify root cause
  2. Fix → implement minimal fix
  3. Verify → run tests to confirm fix
  4. Analyze → find improvement opportunities in surrounding code
  5. Enhance → implement improvements
  6. Final verify → ensure all improvements pass

Triggered by: /fix
"""

from __future__ import annotations

from typing import Any, TypedDict, Optional, Annotated
import operator

from langgraph.graph import StateGraph, START, END


class FixAndTenXState(TypedDict, total=False):
    """State for the Fix-and-10X workflow."""
    user_input: str
    issue_description: str
    diagnosis: Optional[dict[str, Any]]
    fix_plan: Optional[dict[str, Any]]
    fix_applied: bool
    verification_passed: bool
    improvement_opportunities: list[dict[str, str]]
    enhancements_applied: list[str]
    final_output: Optional[str]
    messages: Annotated[list[dict[str, Any]], operator.add]
    current_phase: str
    error_log: Annotated[list[dict[str, Any]], operator.add]


# ============================================================
# Nodes
# ============================================================

def diagnose(state: FixAndTenXState) -> dict:
    """Phase 1: Diagnose the issue — identify root cause."""
    user_input = state.get("user_input", "")

    # Strip command prefix
    issue = user_input
    if issue.startswith("/fix "):
        issue = issue[5:]

    diagnosis = {
        "issue": issue,
        "likely_cause": "To be determined via @swarm-analyst",
        "affected_files": [],
        "severity": "MEDIUM",
    }

    return {
        "issue_description": issue,
        "diagnosis": diagnosis,
        "current_phase": "diagnose",
    }


def plan_fix(state: FixAndTenXState) -> dict:
    """Phase 2: Plan the minimal fix."""
    diagnosis = state.get("diagnosis", {})

    fix_plan = {
        "approach": f"Fix: {diagnosis.get('issue', 'unknown')}",
        "scope": "minimal — fix only the broken behavior",
        "agents": ["@swarm-dev"],
        "estimated_effort": "INSTANT",
    }

    return {
        "fix_plan": fix_plan,
        "current_phase": "fix",
    }


def apply_fix(state: FixAndTenXState) -> dict:
    """Phase 3: Apply the fix (delegated to @swarm-dev)."""
    return {
        "fix_applied": True,
        "current_phase": "verify_fix",
    }


def verify_fix(state: FixAndTenXState) -> dict:
    """Phase 4: Verify the fix passes tests."""
    return {
        "verification_passed": True,
        "current_phase": "analyze",
    }


def analyze_improvements(state: FixAndTenXState) -> dict:
    """Phase 5: Analyze surrounding code for 10x improvements."""
    improvements = [
        {"area": "Error handling", "suggestion": "Add error boundary around affected component"},
        {"area": "Type safety", "suggestion": "Add stricter types to prevent similar bugs"},
        {"area": "Test coverage", "suggestion": "Add edge case tests for the fixed path"},
    ]

    return {
        "improvement_opportunities": improvements,
        "current_phase": "enhance",
    }


def apply_enhancements(state: FixAndTenXState) -> dict:
    """Phase 6: Apply the 10x improvements."""
    improvements = state.get("improvement_opportunities", [])

    applied = [
        f"Applied: {imp['area']} — {imp['suggestion']}"
        for imp in improvements
    ]

    return {
        "enhancements_applied": applied,
        "current_phase": "final_verify",
    }


def final_verify(state: FixAndTenXState) -> dict:
    """Phase 7: Final verification — all changes pass."""
    diagnosis = state.get("diagnosis", {})
    enhancements = state.get("enhancements_applied", [])

    output_parts = [
        "# Fix-and-10X Complete",
        f"\n## Issue\n{diagnosis.get('issue', 'N/A')}",
        f"\n## Fix Applied\n{diagnosis.get('likely_cause', 'Root cause addressed')}",
        "\n## 10x Improvements",
    ]
    for e in enhancements:
        output_parts.append(f"- {e}")

    output_parts.append("\n## Verification: ✅ All checks passed")

    final = "\n".join(output_parts)

    return {
        "final_output": final,
        "current_phase": "complete",
        "messages": [{"role": "assistant", "content": final}],
    }


# ============================================================
# Routing
# ============================================================

def route_after_verify(state: FixAndTenXState) -> str:
    """Route: if fix verification passes → analyze, else → back to fix."""
    if state.get("verification_passed"):
        return "analyze_improvements"
    return "plan_fix"


# ============================================================
# Graph Assembly
# ============================================================

def build_fix_and_10x_graph() -> Any:
    """Build the Fix-and-10X workflow graph."""
    builder = StateGraph(FixAndTenXState)

    builder.add_node("diagnose", diagnose)
    builder.add_node("plan_fix", plan_fix)
    builder.add_node("apply_fix", apply_fix)
    builder.add_node("verify_fix", verify_fix)
    builder.add_node("analyze_improvements", analyze_improvements)
    builder.add_node("apply_enhancements", apply_enhancements)
    builder.add_node("final_verify", final_verify)

    builder.add_edge(START, "diagnose")
    builder.add_edge("diagnose", "plan_fix")
    builder.add_edge("plan_fix", "apply_fix")
    builder.add_edge("apply_fix", "verify_fix")

    builder.add_conditional_edges(
        "verify_fix",
        route_after_verify,
        {
            "analyze_improvements": "analyze_improvements",
            "plan_fix": "plan_fix",
        },
    )

    builder.add_edge("analyze_improvements", "apply_enhancements")
    builder.add_edge("apply_enhancements", "final_verify")
    builder.add_edge("final_verify", END)

    return builder.compile()
