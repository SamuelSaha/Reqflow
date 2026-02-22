"""
Swarm State Schemas
All TypedDict definitions for the LangGraph state machine.

Three levels:
1. SwarmState — top-level, visible to all nodes in the master graph
2. DomainAgentState — per-domain-agent subgraph state
3. SubagentResponse — structured output from individual subagent LLM calls
"""

from __future__ import annotations

import operator
from typing import Annotated, Any, Literal, Optional, TypedDict


# ============================================================
# Custom Reducers
# ============================================================

def merge_dicts(a: dict, b: dict) -> dict:
    """Reducer: merge dicts (used for agent_outputs, subagent_outputs)."""
    result = {**a}
    result.update(b)
    return result


# ============================================================
# Spec Context Packet (flows between all levels)
# ============================================================

class SpecPacket(TypedDict, total=False):
    """Compact spec context passed to every delegation."""
    spec_ref: str              # e.g. "SPEC-20260215-001"
    version: str               # e.g. "1.0.0"
    status: str                # "draft" | "approved" | "frozen" | "in_progress" | "completed"
    goal: str                  # Single sentence objective
    user_benefit: str          # Why user cares
    non_goals: list[str]       # Explicitly out of scope
    constraints: list[str]     # Hard constraints
    acceptance_criteria: list[dict[str, Any]]  # Binary ACs with pass thresholds
    assumptions: list[str]     # E0 defaults with falsifiers
    glossary: list[dict[str, str]]  # Domain-specific terms
    boundaries: dict[str, Any]  # Scope boundaries


# ============================================================
# Verification Result
# ============================================================

class VerificationResult(TypedDict):
    """Result from a single verification gate."""
    gate: str       # "BUILD" | "LINT" | "TEST" | "SECURITY" | "SCOPE"
    status: str     # "PASS" | "FAIL" | "SKIP" | "WARN"
    evidence: str   # Stdout/stderr excerpt or explanation
    timestamp: str  # ISO 8601


# ============================================================
# Subagent Response (structured output from a single LLM call)
# ============================================================

class SubagentResponse(TypedDict, total=False):
    """Structured output from a subagent. Matches CT1/CT2 formats from SWARM_DELEGATION.md."""
    # CT1 (always present)
    subagent_name: str
    spec_ref: str
    ac_refs: list[str]
    assumptions: list[str]
    decisions: list[str]
    open_risks: list[str]
    content: str  # The actual work output

    # CT2 (optional, for complex tasks)
    goal_in_own_words: str
    summary: str
    unknowns: list[str]
    options_considered: list[str]
    evidence: list[str]
    verification: list[str]
    confidence: float


# ============================================================
# Top-Level Swarm State (master graph)
# ============================================================

class SwarmState(TypedDict, total=False):
    """
    Top-level state for the master graph.
    Visible to all nodes. Uses append-only for messages and verification_results.
    """
    # --- User interaction ---
    user_input: str                   # Current user request (raw text)
    messages: Annotated[list[dict[str, Any]], operator.add]  # Conversation history (append-only)

    # --- Orchestration ---
    execution_mode: str               # "fast" | "deep"
    scope: str                        # "INSTANT" | "SPRINT" | "EPIC" | "DISCOVERY"
    current_phase: str                # "intake" | "dispatch" | "execute" | "verify" | "deliver"
    dispatched_agents: list[str]      # Agent names currently active (e.g. ["swarm-dev", "swarm-qa"])
    workflow_type: Optional[str]      # Named workflow if triggered (e.g. "one-shot-spec")

    # --- Spec ---
    spec_packet: Optional[SpecPacket]  # Active spec context (None for ad-hoc tasks)

    # --- Agent outputs ---
    agent_outputs: Annotated[dict[str, dict[str, Any]], merge_dicts]  # agent_name → output dict

    # --- Verification ---
    verification_results: Annotated[list[VerificationResult], operator.add]
    retry_count: int

    # --- Results ---
    final_output: Optional[str]       # Compiled result for user
    error_log: Annotated[list[dict[str, Any]], operator.add]  # Error taxonomy entries

    # --- Memory ---
    memory_context: Optional[dict[str, Any]]  # Loaded decisions/patterns from memory.db


# ============================================================
# Domain Agent Subgraph State
# ============================================================

class DomainAgentState(TypedDict, total=False):
    """
    State for each domain agent subgraph.
    Shared keys (messages, spec_packet, user_input, execution_mode) flow in/out from parent.
    Private keys stay within the subgraph.
    """
    # --- Shared with parent (flows in/out) ---
    messages: Annotated[list[dict[str, Any]], operator.add]
    spec_packet: Optional[SpecPacket]
    user_input: str
    execution_mode: str

    # --- Private to this subgraph ---
    agent_name: str                   # "@swarm-frontend" etc.
    mission: str                      # Question delegated by lead
    ct_level: str                     # "CT1" | "CT2"
    active_subagents: list[str]       # Which subagents to activate
    subagent_outputs: Annotated[dict[str, dict[str, Any]], merge_dicts]  # subagent_name → output
    compiled_output: Optional[dict[str, Any]]  # Final verified output from this agent
    guideline_violations: list[dict[str, Any]]
    rejection_log: Annotated[list[dict[str, Any]], operator.add]
    internal_retry_count: int
