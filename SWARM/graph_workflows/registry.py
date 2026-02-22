"""
Workflow Registry
Maps workflow trigger patterns to graph builders.

Each workflow is a specialized LangGraph that orchestrates domain agents
in a specific sequence (unlike standard dispatch which fans out in parallel).
"""

from __future__ import annotations

from typing import Any, Callable


# Registry: workflow_name → builder function
# Each builder returns a compiled StateGraph
_WORKFLOW_BUILDERS: dict[str, Callable[[], Any]] = {}


def register_workflow(name: str, builder: Callable[[], Any]):
    """Register a workflow builder function."""
    _WORKFLOW_BUILDERS[name] = builder


def get_workflow(name: str) -> Any:
    """
    Get a compiled workflow graph by name.

    Args:
        name: Workflow name (e.g. "one_shot_spec", "fix_and_10x")

    Returns:
        Compiled StateGraph

    Raises:
        KeyError: If workflow name not found
    """
    if name not in _WORKFLOW_BUILDERS:
        available = list(_WORKFLOW_BUILDERS.keys())
        raise KeyError(f"Workflow '{name}' not found. Available: {available}")
    return _WORKFLOW_BUILDERS[name]()


def list_workflows() -> list[dict[str, str]]:
    """List all registered workflows with their names."""
    return [{"name": name} for name in _WORKFLOW_BUILDERS]


# ============================================================
# Trigger Detection (slash commands → workflow names)
# ============================================================

COMMAND_TRIGGERS: dict[str, str] = {
    "/specify": "one_shot_spec",
    "/spec": "one_shot_spec",
    "/fix": "fix_and_10x",
    "/build": "implement_e2e",
    "/turbo": "turbo_execute",
    "/refactor": "smart_refactor",
}


def detect_workflow_trigger(user_input: str) -> str | None:
    """
    Check if user input starts with a workflow command.
    Returns workflow name if matched, None otherwise.
    """
    for command, workflow in COMMAND_TRIGGERS.items():
        if user_input.strip().startswith(command):
            return workflow
    return None


# ============================================================
# Auto-register all workflows on import
# ============================================================

def _auto_register():
    """Import and register all workflow modules."""
    try:
        from graph_workflows.one_shot_spec import build_one_shot_spec_graph
        register_workflow("one_shot_spec", build_one_shot_spec_graph)
    except ImportError:
        pass

    try:
        from graph_workflows.fix_and_10x import build_fix_and_10x_graph
        register_workflow("fix_and_10x", build_fix_and_10x_graph)
    except ImportError:
        pass

    try:
        from graph_workflows.implement_e2e import build_implement_e2e_graph
        register_workflow("implement_e2e", build_implement_e2e_graph)
    except ImportError:
        pass

    try:
        from graph_workflows.turbo_execute import build_turbo_execute_graph
        register_workflow("turbo_execute", build_turbo_execute_graph)
    except ImportError:
        pass

    try:
        from graph_workflows.smart_refactor import build_smart_refactor_graph
        register_workflow("smart_refactor", build_smart_refactor_graph)
    except ImportError:
        pass


_auto_register()
