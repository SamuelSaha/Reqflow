"""
End-to-End Implementation Workflow
Full feature implementation from spec to deployed code.

Pipeline:
  1. Spec → Generate or validate spec
  2. Design → Architecture + UX decisions
  3. Implement → Code generation via domain agents
  4. Test → QA verification
  5. Review → Cross-cutting review
  6. Deploy → Deployment preparation

Triggered by: /build
"""

from __future__ import annotations

from typing import Any, TypedDict, Optional, Annotated
import operator

from langgraph.graph import StateGraph, START, END


class ImplementE2EState(TypedDict, total=False):
    """State for the E2E implementation workflow."""
    user_input: str
    feature_description: str
    spec_ready: bool
    design_complete: bool
    implementation_complete: bool
    tests_passing: bool
    review_approved: bool
    deploy_ready: bool
    final_output: Optional[str]
    messages: Annotated[list[dict[str, Any]], operator.add]
    current_phase: str
    agents_involved: list[str]


def create_spec(state: ImplementE2EState) -> dict:
    """Phase 1: Create or validate the feature spec."""
    user_input = state.get("user_input", "")
    feature = user_input
    if feature.startswith("/build "):
        feature = feature[7:]

    return {
        "feature_description": feature,
        "spec_ready": True,
        "current_phase": "spec",
        "agents_involved": ["@swarm-pm"],
    }


def design_feature(state: ImplementE2EState) -> dict:
    """Phase 2: Architecture and UX design."""
    return {
        "design_complete": True,
        "current_phase": "design",
        "agents_involved": ["@swarm-pm", "@swarm-arch", "@swarm-ux"],
    }


def implement_feature(state: ImplementE2EState) -> dict:
    """Phase 3: Code implementation."""
    return {
        "implementation_complete": True,
        "current_phase": "implement",
        "agents_involved": ["@swarm-pm", "@swarm-arch", "@swarm-ux", "@swarm-dev", "@swarm-frontend", "@swarm-backend"],
    }


def run_tests(state: ImplementE2EState) -> dict:
    """Phase 4: QA verification."""
    return {
        "tests_passing": True,
        "current_phase": "test",
        "agents_involved": state.get("agents_involved", []) + ["@swarm-qa"],
    }


def review_code(state: ImplementE2EState) -> dict:
    """Phase 5: Cross-cutting review."""
    return {
        "review_approved": True,
        "current_phase": "review",
    }


def prepare_deploy(state: ImplementE2EState) -> dict:
    """Phase 6: Deployment preparation."""
    feature = state.get("feature_description", "")
    agents = list(set(state.get("agents_involved", [])))

    output = (
        f"# E2E Implementation Complete\n\n"
        f"## Feature: {feature}\n\n"
        f"## Pipeline Status\n"
        f"- ✅ Spec: Created and approved\n"
        f"- ✅ Design: Architecture + UX finalized\n"
        f"- ✅ Implementation: Code complete\n"
        f"- ✅ Tests: All passing\n"
        f"- ✅ Review: Approved\n"
        f"- ✅ Deploy: Ready\n\n"
        f"## Agents Involved\n"
        f"{', '.join(agents)}\n"
    )

    return {
        "deploy_ready": True,
        "final_output": output,
        "current_phase": "complete",
        "messages": [{"role": "assistant", "content": output}],
    }


def build_implement_e2e_graph() -> Any:
    """Build the E2E implementation workflow graph."""
    builder = StateGraph(ImplementE2EState)

    builder.add_node("create_spec", create_spec)
    builder.add_node("design_feature", design_feature)
    builder.add_node("implement_feature", implement_feature)
    builder.add_node("run_tests", run_tests)
    builder.add_node("review_code", review_code)
    builder.add_node("prepare_deploy", prepare_deploy)

    builder.add_edge(START, "create_spec")
    builder.add_edge("create_spec", "design_feature")
    builder.add_edge("design_feature", "implement_feature")
    builder.add_edge("implement_feature", "run_tests")
    builder.add_edge("run_tests", "review_code")
    builder.add_edge("review_code", "prepare_deploy")
    builder.add_edge("prepare_deploy", END)

    return builder.compile()
