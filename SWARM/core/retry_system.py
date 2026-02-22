"""
Retry System (Adapted)
Adapted from .swarm/retry_system.py for LangGraph integration.
Provides escalation chains and quality assessment for graph conditional edges.
"""

from __future__ import annotations

from typing import Any, Optional


# ============================================================
# Escalation Chains (from .swarm/retry_system.py)
# ============================================================

ESCALATION_CHAINS: dict[str, list[str]] = {
    "swarm-dev":      ["swarm-dev", "swarm-arch"],
    "swarm-frontend": ["swarm-frontend", "swarm-ux", "swarm-arch"],
    "swarm-backend":  ["swarm-backend", "swarm-arch"],
    "swarm-qa":       ["swarm-qa", "swarm-dev", "swarm-arch"],
    "swarm-ux":       ["swarm-ux", "swarm-frontend"],
    "swarm-pm":       ["swarm-pm", "swarm-analyst"],
    "swarm-ops":      ["swarm-ops", "swarm-arch"],
    "swarm-data":     ["swarm-data", "swarm-pm"],
    "swarm-sec":      ["swarm-sec", "swarm-arch"],
    "swarm-analyst":  ["swarm-analyst", "swarm-arch"],
    "swarm-arch":     ["swarm-arch"],  # Terminal — no escalation beyond architect
}

MAX_RETRIES = 3


def get_next_in_chain(agent_name: str) -> str | None:
    """
    Get the next agent in the escalation chain.
    Returns None if at end of chain.
    """
    clean = agent_name.lstrip("@")
    chain = ESCALATION_CHAINS.get(clean, [clean])
    try:
        idx = chain.index(clean)
        if idx + 1 < len(chain):
            return chain[idx + 1]
    except ValueError:
        pass
    return None


def get_full_chain(agent_name: str) -> list[str]:
    """Get the full escalation chain for an agent."""
    clean = agent_name.lstrip("@")
    return ESCALATION_CHAINS.get(clean, [clean])


def should_retry(retry_count: int) -> bool:
    """Check if we should retry (under max)."""
    return retry_count < MAX_RETRIES


def should_escalate(retry_count: int) -> bool:
    """Check if we should escalate (at retry 2, try next agent)."""
    return retry_count >= 1


# ============================================================
# Quality Assessment (adapted from .swarm/retry_system.py)
# ============================================================

# Quality criteria weights (same as original QualityAssessor)
QUALITY_CRITERIA = {
    "assumptions_declared": 0.2,
    "decisions_documented": 0.2,
    "risks_identified": 0.15,
    "scope_aligned": 0.2,
    "evidence_based": 0.15,
    "verifiable": 0.1,
}


def assess_output_quality(output: dict[str, Any]) -> tuple[str, float, list[str]]:
    """
    Assess quality of an agent output.

    Args:
        output: Agent output dict with optional keys:
            assumptions, decisions, risks, scope_aligned, confidence

    Returns:
        Tuple of (quality_gate, score, feedback)
        quality_gate: "PASS" | "NEEDS_IMPROVEMENT" | "FAIL"
        score: 0.0 - 1.0
        feedback: List of improvement suggestions
    """
    score = 0.0
    feedback: list[str] = []

    # Check assumptions
    if output.get("assumptions"):
        score += QUALITY_CRITERIA["assumptions_declared"]
    else:
        feedback.append("Explicitly declare all assumptions made")

    # Check decisions
    if output.get("decisions"):
        score += QUALITY_CRITERIA["decisions_documented"]
    else:
        feedback.append("Document key decisions with rationale")

    # Check risks
    if output.get("risks") or output.get("open_risks"):
        score += QUALITY_CRITERIA["risks_identified"]
    else:
        feedback.append("Identify and flag open risks")

    # Check scope alignment
    if output.get("scope_aligned", True):
        score += QUALITY_CRITERIA["scope_aligned"]
    else:
        feedback.append("Ensure output stays within defined scope")

    # Check evidence/confidence
    confidence = output.get("confidence", 0.8)
    if confidence >= 0.7:
        score += QUALITY_CRITERIA["evidence_based"]
    else:
        feedback.append("Provide evidence or increase confidence")

    # Determine gate
    if score >= 0.8:
        gate = "PASS"
    elif score >= 0.5:
        gate = "NEEDS_IMPROVEMENT"
    else:
        gate = "FAIL"

    return gate, score, feedback


def determine_retry_action(
    retry_count: int,
    current_agent: str,
    quality_gate: str,
) -> dict[str, Any]:
    """
    Determine what action to take on quality failure.

    Returns a dict describing the action:
    {
        "action": "retry" | "escalate" | "fail",
        "agent": agent to use,
        "reason": explanation,
    }
    """
    if quality_gate == "PASS":
        return {"action": "accept", "agent": current_agent, "reason": "Quality gate passed"}

    if retry_count >= MAX_RETRIES:
        return {
            "action": "fail",
            "agent": current_agent,
            "reason": f"Max retries ({MAX_RETRIES}) exceeded",
        }

    if should_escalate(retry_count):
        next_agent = get_next_in_chain(current_agent)
        if next_agent:
            return {
                "action": "escalate",
                "agent": next_agent,
                "reason": f"Escalating from {current_agent} to {next_agent} (retry {retry_count + 1})",
            }

    return {
        "action": "retry",
        "agent": current_agent,
        "reason": f"Retrying with feedback (attempt {retry_count + 1}/{MAX_RETRIES})",
    }
