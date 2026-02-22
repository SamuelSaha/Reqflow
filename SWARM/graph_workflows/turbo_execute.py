"""
Turbo Execute Workflow
Maximum velocity execution — skip deliberation, go straight to action.

Pipeline:
  1. Parse → Extract action + target
  2. Execute → Direct implementation (minimal subagents)
  3. Quick verify → Fast gate check
  4. Deliver → Output immediately

Triggered by: /turbo
From SWARM_TURBO.md — optimized for <200ms dispatch target.
"""

from __future__ import annotations

from typing import Any, TypedDict, Optional, Annotated
import operator

from langgraph.graph import StateGraph, START, END


class TurboState(TypedDict, total=False):
    """State for turbo execution."""
    user_input: str
    action: str
    target: str
    execution_result: Optional[str]
    verified: bool
    final_output: Optional[str]
    messages: Annotated[list[dict[str, Any]], operator.add]


def turbo_parse(state: TurboState) -> dict:
    """Quick parse — extract action and target with zero deliberation."""
    user_input = state.get("user_input", "")
    if user_input.startswith("/turbo "):
        user_input = user_input[7:]

    words = user_input.split()
    action = words[0] if words else "execute"
    target = " ".join(words[1:]) if len(words) > 1 else user_input

    return {
        "action": action,
        "target": target,
    }


def turbo_execute(state: TurboState) -> dict:
    """Direct execution — single agent, no parallel, no deliberation."""
    action = state.get("action", "")
    target = state.get("target", "")

    result = f"Turbo executed: {action} → {target}"

    return {
        "execution_result": result,
    }


def turbo_verify(state: TurboState) -> dict:
    """Quick verification — check result is non-empty."""
    result = state.get("execution_result", "")
    return {"verified": bool(result)}


def turbo_deliver(state: TurboState) -> dict:
    """Deliver turbo result immediately."""
    result = state.get("execution_result", "")
    output = f"⚡ **TURBO** | {result}"

    return {
        "final_output": output,
        "messages": [{"role": "assistant", "content": output}],
    }


def build_turbo_execute_graph() -> Any:
    """Build the turbo execution workflow."""
    builder = StateGraph(TurboState)

    builder.add_node("turbo_parse", turbo_parse)
    builder.add_node("turbo_execute", turbo_execute)
    builder.add_node("turbo_verify", turbo_verify)
    builder.add_node("turbo_deliver", turbo_deliver)

    builder.add_edge(START, "turbo_parse")
    builder.add_edge("turbo_parse", "turbo_execute")
    builder.add_edge("turbo_execute", "turbo_verify")
    builder.add_edge("turbo_verify", "turbo_deliver")
    builder.add_edge("turbo_deliver", END)

    return builder.compile()
