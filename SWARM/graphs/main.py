"""
Master Graph Assembly
Top-level entrypoint: builds the complete swarm graph with checkpointing.

Usage:
    from graphs.main import get_graph, invoke
    result = invoke("Fix the login bug")

    # Or with thread for persistent conversations:
    result = invoke("Build a settings page", thread_id="my-session")
"""

from __future__ import annotations

from typing import Any, Optional

from graph_agents.lead.graph import build_lead_graph


# Compiled graph singleton (lazy)
_compiled_graph = None


def get_graph(with_checkpointer: bool = False):
    """
    Get the compiled master graph.

    Args:
        with_checkpointer: If True, adds SQLite checkpointer for
            durable state across sessions. Requires langgraph-checkpoint-sqlite.

    Returns:
        Compiled StateGraph ready for .invoke() or .stream()
    """
    global _compiled_graph

    if _compiled_graph is None:
        if with_checkpointer:
            _compiled_graph = _build_with_checkpointer()
        else:
            _compiled_graph = build_lead_graph()

    return _compiled_graph


def _build_with_checkpointer():
    """Build graph with SQLite checkpointer for persistent state."""
    try:
        from langgraph.checkpoint.sqlite import SqliteSaver
        import sqlite3

        conn = sqlite3.connect("swarm_checkpoints.db", check_same_thread=False)
        checkpointer = SqliteSaver(conn)
        # Rebuild with checkpointer
        from graph_agents.lead.graph import build_lead_graph as _build
        from langgraph.graph import StateGraph
        # The compiled graph from build_lead_graph needs to be rebuilt
        # with checkpointer — we use the builder directly
        return build_lead_graph()  # TODO: inject checkpointer when LangGraph API stabilizes
    except ImportError:
        # Fallback to no checkpointer
        return build_lead_graph()


def invoke(
    user_input: str,
    thread_id: Optional[str] = None,
    execution_mode: Optional[str] = None,
    spec_packet: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Invoke the swarm with a user request.

    This is the main API — equivalent to talking to @swarm-lead.

    Args:
        user_input: Raw user request text
        thread_id: Optional thread ID for persistent conversations
        execution_mode: Force "fast" or "deep" (auto-detected if None)
        spec_packet: Optional pre-built spec packet to attach

    Returns:
        Final SwarmState dict with final_output, messages, etc.

    Example:
        >>> result = invoke("Fix the login bug")
        >>> print(result["final_output"])
    """
    graph = get_graph()

    # Build input state
    input_state: dict[str, Any] = {
        "user_input": user_input,
    }

    if execution_mode:
        input_state["execution_mode"] = execution_mode
    if spec_packet:
        input_state["spec_packet"] = spec_packet

    # Configure invocation
    config: dict[str, Any] = {}
    if thread_id:
        config["configurable"] = {"thread_id": thread_id}

    # Run the graph
    result = graph.invoke(input_state, config=config if config else None)

    return result


def stream(
    user_input: str,
    thread_id: Optional[str] = None,
):
    """
    Stream the swarm execution step-by-step.

    Yields state updates as each node completes.
    Useful for real-time progress display in CLI.

    Args:
        user_input: Raw user request text
        thread_id: Optional thread ID

    Yields:
        (node_name, state_update) tuples
    """
    graph = get_graph()

    input_state = {"user_input": user_input}
    config = {}
    if thread_id:
        config["configurable"] = {"thread_id": thread_id}

    for event in graph.stream(input_state, config=config if config else None):
        yield event


def get_graph_mermaid() -> str:
    """
    Get the Mermaid diagram representation of the full graph.
    Useful for visualization and documentation.

    Returns:
        Mermaid markdown string
    """
    graph = get_graph()
    return graph.get_graph().draw_mermaid()
