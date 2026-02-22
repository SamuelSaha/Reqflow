"""Tests for domain agent factory — verifies all 12 subgraphs compile."""

import pytest
from unittest.mock import patch, MagicMock
from state.schemas import DomainAgentState


# ============================================================
# Mock the agent registry so tests don't depend on .md files
# ============================================================

MOCK_AGENTS = {
    "swarm-dev": {
        "name": "swarm-dev",
        "subagents": ["Vertical Slice Builder", "Cross-Layer Consistency Checker"],
        "triggers": ["dev"],
        "execution_mode": "standard",
    },
    "swarm-pm": {
        "name": "swarm-pm",
        "subagents": ["Outcome Framer", "Scope Guardian", "Stakeholder Mapper", "Risk-First Planner", "Ticket Decomposer"],
        "triggers": ["plan"],
        "execution_mode": "standard",
    },
    "swarm-frontend": {
        "name": "swarm-frontend",
        "subagents": [
            "UI Architecture Designer", "Component API Designer",
            "State & Data Flow Planner", "Interaction & Animation Engineer",
            "Accessibility & Responsive Specialist", "Performance Optimizer",
            "Cross-Browser Tester",
        ],
        "triggers": ["frontend"],
        "execution_mode": "standard",
    },
    "swarm-ux": {
        "name": "swarm-ux",
        "subagents": ["Journey Mapper", "Wireframe Generator", "Usability Validator", "Design System Guardian", "Micro-Interaction Designer"],
        "triggers": ["ux"],
        "execution_mode": "standard",
    },
    "swarm-arch": {
        "name": "swarm-arch",
        "subagents": ["Pattern Selector", "Boundary Definer", "Scale Planner", "Trade-Off Analyzer", "Migration Strategist"],
        "triggers": ["architecture"],
        "execution_mode": "standard",
    },
    "swarm-backend": {
        "name": "swarm-backend",
        "subagents": ["API Designer", "Data Modeler", "Service Orchestrator", "Cache Strategist", "Queue Planner"],
        "triggers": ["backend"],
        "execution_mode": "standard",
    },
    "swarm-qa": {
        "name": "swarm-qa",
        "subagents": ["Test Strategist", "E2E Test Builder", "Unit Test Builder", "Performance Test Runner", "Edge Case Hunter", "Regression Tracker"],
        "triggers": ["qa"],
        "execution_mode": "standard",
    },
    "swarm-ops": {
        "name": "swarm-ops",
        "subagents": ["CI/CD Pipeline Builder", "Infra Provisioner", "Monitor Configurer", "Rollback Planner", "Cost Optimizer"],
        "triggers": ["ops"],
        "execution_mode": "standard",
    },
    "swarm-data": {
        "name": "swarm-data",
        "subagents": ["Schema Designer", "ETL Builder", "Query Optimizer", "Dashboard Planner", "Data Quality Guard"],
        "triggers": ["data"],
        "execution_mode": "standard",
    },
    "swarm-sec": {
        "name": "swarm-sec",
        "subagents": ["Threat Modeler", "Auth Validator"],
        "triggers": ["security"],
        "execution_mode": "standard",
    },
    "swarm-analyst": {
        "name": "swarm-analyst",
        "subagents": ["Root Cause Analyzer", "Impact Assessor"],
        "triggers": ["analyze"],
        "execution_mode": "standard",
    },
    "swarm-lead": {
        "name": "swarm-lead",
        "subagents": ["Lightning Router", "Parallel Optimizer", "Binary Gatekeeper"],
        "triggers": [],
        "execution_mode": "turbo",
    },
}


def _mock_registry():
    """Create a mock registry returning our test agents."""
    mock = MagicMock()
    mock.get_agent.side_effect = lambda name: MOCK_AGENTS[name.lstrip("@")]
    mock.get_agent_names.return_value = list(MOCK_AGENTS.keys())
    mock.get_subagents_for.side_effect = lambda name: MOCK_AGENTS[name.lstrip("@")]["subagents"]
    return mock


class TestSubgraphCompilation:
    """Test that every domain agent subgraph compiles without errors."""

    @pytest.fixture(autouse=True)
    def _patch_registry(self):
        """Patch the registry singleton for all tests in this class."""
        mock = _mock_registry()
        with patch("graph_agents.domain.factory.registry", mock), \
             patch("graph_agents.base_subagent.build_subagent_system_prompt", return_value="mock prompt"), \
             patch("graph_agents.base_subagent.get_llm_for_subagent") as mock_llm:
            # Mock LLM returns a simple response
            mock_response = MagicMock()
            mock_response.content = "Test response content"
            mock_llm.return_value.invoke.return_value = mock_response
            yield

    def test_swarm_dev_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-dev")
        assert graph is not None

    def test_swarm_pm_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-pm")
        assert graph is not None

    def test_swarm_ux_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-ux")
        assert graph is not None

    def test_swarm_arch_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-arch")
        assert graph is not None

    def test_swarm_backend_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-backend")
        assert graph is not None

    def test_swarm_qa_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-qa")
        assert graph is not None

    def test_swarm_ops_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-ops")
        assert graph is not None

    def test_swarm_data_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-data")
        assert graph is not None

    def test_swarm_sec_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-sec")
        assert graph is not None

    def test_swarm_analyst_compiles(self):
        from graph_agents.domain.factory import build_domain_subgraph
        graph = build_domain_subgraph("swarm-analyst")
        assert graph is not None

    def test_all_11_domain_agents_compile(self):
        """Compile all domain agents (excluding lead) at once."""
        from graph_agents.domain.factory import build_domain_subgraph
        domain_agents = [k for k in MOCK_AGENTS if k != "swarm-lead"]
        compiled = {}
        for name in domain_agents:
            compiled[name] = build_domain_subgraph(name)
        assert len(compiled) == 11
        assert all(g is not None for g in compiled.values())


class TestFrontendOverride:
    """Test that the frontend subgraph override compiles with blocking authority."""

    @pytest.fixture(autouse=True)
    def _patch_registry(self):
        mock = _mock_registry()
        with patch("graph_agents.frontend.graph.registry", mock), \
             patch("graph_agents.domain.factory.registry", mock), \
             patch("graph_agents.base_subagent.build_subagent_system_prompt", return_value="mock prompt"), \
             patch("graph_agents.base_subagent.get_llm_for_subagent") as mock_llm:
            mock_response = MagicMock()
            mock_response.content = "Test response with loading skeleton error handling"
            mock_llm.return_value.invoke.return_value = mock_response
            yield

    def test_frontend_subgraph_compiles(self):
        from graph_agents.frontend.graph import build_frontend_subgraph
        graph = build_frontend_subgraph()
        assert graph is not None

    def test_blocking_check_blocks_without_ui_states(self):
        from graph_agents.frontend.graph import _make_blocking_check_node
        check = _make_blocking_check_node()

        # Simulate output without UI state keywords
        state = {
            "compiled_output": {"content": "just a simple component"},
            "guideline_violations": [],
        }
        result = check(state)
        violations = result.get("guideline_violations", [])
        assert len(violations) > 0
        assert any(v["type"] == "FRONTEND_BLOCK" for v in violations)

    def test_blocking_check_passes_with_ui_states(self):
        from graph_agents.frontend.graph import _make_blocking_check_node
        check = _make_blocking_check_node()

        state = {
            "compiled_output": {
                "content": "loading skeleton with error state and fallback, includes pagination for performance"
            },
            "guideline_violations": [],
        }
        result = check(state)
        # No new violations added
        assert result == {}


class TestSubagentNodeFactory:
    """Test the base subagent node factory."""

    def test_slugify(self):
        from graph_agents.base_subagent import slugify
        assert slugify("UI Architecture Designer") == "ui_architecture_designer"
        assert slugify("Cross-Layer Consistency Checker") == "cross_layer_consistency_checker"
        assert slugify("CI/CD Pipeline Builder") == "ci_cd_pipeline_builder"

    def test_parse_structured_response_yaml(self):
        from graph_agents.base_subagent import parse_structured_response

        content = """Here is my analysis:
```yaml
assumptions:
  - User is authenticated
  - Database is PostgreSQL
decisions:
  - Use connection pooling
open_risks:
  - Migration downtime unclear
confidence: 0.85
```
"""
        result = parse_structured_response(content, "CT2")
        assert "User is authenticated" in result["assumptions"]
        assert "Use connection pooling" in result["decisions"]
        assert result["confidence"] == 0.85

    def test_parse_structured_response_markdown(self):
        from graph_agents.base_subagent import parse_structured_response

        content = """Assumptions:
- User is logged in
- API is REST-based

Decisions:
- Use Express.js middleware

Risks:
- Rate limiting not in scope

Confidence: 0.9"""
        result = parse_structured_response(content, "CT1")
        assert len(result["assumptions"]) >= 1
        assert len(result["decisions"]) >= 1

    def test_parse_structured_response_raw(self):
        from graph_agents.base_subagent import parse_structured_response
        content = "Just some raw text with no structure."
        result = parse_structured_response(content)
        assert result["content"] == content
        assert result["assumptions"] == []


class TestRouting:
    """Test the routing functions in the factory."""

    def test_route_to_active_subagents(self):
        from graph_agents.domain.factory import _route_to_active_subagents
        state = {"active_subagents": ["vertical_slice_builder", "cross_layer_consistency_checker"]}
        result = _route_to_active_subagents(state)
        assert result == ["vertical_slice_builder", "cross_layer_consistency_checker"]

    def test_route_on_guideline_no_violations(self):
        from graph_agents.domain.factory import _route_on_guideline_result
        state = {"guideline_violations": [], "internal_retry_count": 0}
        assert _route_on_guideline_result(state) == "produce_output"

    def test_route_on_guideline_with_violations_retries_remaining(self):
        from graph_agents.domain.factory import _route_on_guideline_result
        state = {"guideline_violations": [{"type": "test"}], "internal_retry_count": 0}
        assert _route_on_guideline_result(state) == "reject_and_retry"

    def test_route_on_guideline_violations_retries_exhausted(self):
        from graph_agents.domain.factory import _route_on_guideline_result
        state = {"guideline_violations": [{"type": "test"}], "internal_retry_count": 2}
        assert _route_on_guideline_result(state) == "produce_output"
