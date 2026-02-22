"""Tests for the lead supervisor graph and nodes."""

import pytest
from unittest.mock import patch, MagicMock
from state.schemas import SwarmState


class TestParseIntent:
    """Test the parse_intent node."""

    def test_basic_intent(self):
        from graph_agents.lead.nodes import parse_intent
        state = {"user_input": "Fix the login bug"}
        result = parse_intent(state)
        assert result["scope"] == "INSTANT"
        assert result["current_phase"] == "intake"
        assert result["user_input"] == "Fix the login bug"

    def test_feature_scope(self):
        from graph_agents.lead.nodes import parse_intent
        state = {"user_input": "Build a new settings page"}
        result = parse_intent(state)
        assert result["scope"] == "SPRINT"

    def test_workflow_detection(self):
        from graph_agents.lead.nodes import parse_intent
        state = {"user_input": "Fix the broken auth flow"}
        result = parse_intent(state)
        assert result["workflow_type"] == "bug_fix"

    def test_no_workflow(self):
        from graph_agents.lead.nodes import parse_intent
        state = {"user_input": "What should we do next?"}
        result = parse_intent(state)
        assert result["workflow_type"] is None


class TestDetectMode:
    """Test the detect_mode node."""

    def test_fast_mode_for_bug(self):
        from graph_agents.lead.nodes import detect_mode
        state = {"user_input": "Fix the crash on login"}
        result = detect_mode(state)
        assert result["execution_mode"] == "fast"

    def test_deep_mode_for_architecture(self):
        from graph_agents.lead.nodes import detect_mode
        state = {"user_input": "Design the system architecture for scaling"}
        result = detect_mode(state)
        assert result["execution_mode"] == "deep"


class TestSelectWorkflow:
    """Test workflow selection from command prefixes."""

    def test_specify_command(self):
        from graph_agents.lead.nodes import select_workflow
        state = {"user_input": "/specify Build a dashboard", "workflow_type": None}
        result = select_workflow(state)
        assert result["workflow_type"] == "one_shot_spec"

    def test_fix_command(self):
        from graph_agents.lead.nodes import select_workflow
        state = {"user_input": "/fix the auth bug", "workflow_type": None}
        result = select_workflow(state)
        assert result["workflow_type"] == "fix_and_10x"

    def test_turbo_command(self):
        from graph_agents.lead.nodes import select_workflow
        state = {"user_input": "/turbo implement the search bar", "workflow_type": None}
        result = select_workflow(state)
        assert result["workflow_type"] == "turbo_execute"

    def test_no_command(self):
        from graph_agents.lead.nodes import select_workflow
        state = {"user_input": "Regular request here", "workflow_type": None}
        result = select_workflow(state)
        assert result["workflow_type"] is None


class TestDispatchAgents:
    """Test the dispatch_agents node."""

    def test_bug_fix_dispatch(self):
        from graph_agents.lead.nodes import dispatch_agents
        state = {"user_input": "Fix the login bug", "execution_mode": "fast"}
        result = dispatch_agents(state)
        assert "swarm-dev" in result["dispatched_agents"]
        assert result["scope"] == "INSTANT"

    def test_feature_dispatch_deep(self):
        from graph_agents.lead.nodes import dispatch_agents
        state = {"user_input": "Build a new feature", "execution_mode": "deep"}
        result = dispatch_agents(state)
        assert "swarm-dev" in result["dispatched_agents"]
        assert "swarm-pm" in result["dispatched_agents"]
        assert result["spec_packet"] is not None

    def test_instant_scope_no_spec(self):
        from graph_agents.lead.nodes import dispatch_agents
        state = {"user_input": "Fix the typo", "execution_mode": "fast"}
        result = dispatch_agents(state)
        assert result["spec_packet"] is None


class TestCompileResults:
    """Test the compile_results node."""

    def test_compile_empty(self):
        from graph_agents.lead.nodes import compile_results
        state = {"agent_outputs": {}}
        result = compile_results(state)
        assert "No agent outputs" in result["final_output"]

    def test_compile_single_agent(self):
        from graph_agents.lead.nodes import compile_results
        state = {
            "agent_outputs": {
                "swarm-dev": {
                    "content": "Fixed the login handler",
                    "decisions": ["Use bcrypt for hashing"],
                    "assumptions": ["PostgreSQL backend"],
                    "open_risks": ["Session expiry unclear"],
                }
            }
        }
        result = compile_results(state)
        assert "Fixed the login handler" in result["final_output"]
        assert "bcrypt" in result["final_output"]


class TestRouting:
    """Test routing functions."""

    def test_route_to_workflow(self):
        from graph_agents.lead.nodes import route_after_workflow_check
        state = {"workflow_type": "one_shot_spec"}
        assert route_after_workflow_check(state) == "execute_workflow"

    def test_route_to_dispatch(self):
        from graph_agents.lead.nodes import route_after_workflow_check
        state = {"workflow_type": None}
        assert route_after_workflow_check(state) == "dispatch_agents"

    def test_route_verification_pass(self):
        from graph_agents.lead.nodes import route_after_verification
        state = {
            "verification_results": [{"gate": "SCOPE", "status": "PASS"}],
            "retry_count": 0,
        }
        assert route_after_verification(state) == "deliver"

    def test_route_verification_fail(self):
        from graph_agents.lead.nodes import route_after_verification
        state = {
            "verification_results": [{"gate": "BUILD", "status": "FAIL"}],
            "retry_count": 0,
        }
        assert route_after_verification(state) == "handle_rejection"

    def test_route_verification_max_retries(self):
        from graph_agents.lead.nodes import route_after_verification
        state = {
            "verification_results": [{"gate": "BUILD", "status": "FAIL"}],
            "retry_count": 3,
        }
        # Force deliver after max retries
        assert route_after_verification(state) == "deliver"

    def test_fan_out_returns_agent_list(self):
        from graph_agents.lead.nodes import route_fan_out_to_agents
        state = {"dispatched_agents": ["swarm-dev", "swarm-qa"]}
        result = route_fan_out_to_agents(state)
        assert result == ["swarm-dev", "swarm-qa"]


class TestLeadGraphCompilation:
    """Test that the full lead graph compiles."""

    def test_lead_graph_compiles(self):
        from graph_agents.lead.graph import build_lead_graph
        graph = build_lead_graph()
        assert graph is not None

    def test_lead_graph_has_all_nodes(self):
        from graph_agents.lead.graph import build_lead_graph
        graph = build_lead_graph()
        node_names = list(graph.get_graph().nodes.keys())

        # Check intake pipeline
        assert "parse_intent" in node_names
        assert "detect_mode" in node_names
        assert "load_memory" in node_names
        assert "select_workflow" in node_names

        # Check dispatch + domain agents
        assert "dispatch_agents" in node_names
        assert "swarm-dev" in node_names
        assert "swarm-frontend" in node_names
        assert "swarm-qa" in node_names

        # Check post-execution
        assert "compile_results" in node_names
        assert "verify_gates" in node_names
        assert "deliver" in node_names
        assert "handle_rejection" in node_names
        assert "save_memory" in node_names

    def test_lead_graph_node_count(self):
        from graph_agents.lead.graph import build_lead_graph
        graph = build_lead_graph()
        nodes = list(graph.get_graph().nodes.keys())
        # 11 domain agents + 9 pipeline nodes + __start__ + __end__ = 22+
        assert len(nodes) >= 22


class TestDeliver:
    """Test the deliver node."""

    def test_deliver_formats_output(self):
        from graph_agents.lead.nodes import deliver
        state = {
            "final_output": "Here is the fix",
            "verification_results": [
                {"gate": "SCOPE", "status": "PASS", "evidence": "OK", "timestamp": "now"},
            ],
            "execution_mode": "fast",
            "scope": "INSTANT",
            "dispatched_agents": ["swarm-dev"],
        }
        result = deliver(state)
        assert "FAST" in result["final_output"]
        assert "INSTANT" in result["final_output"]
        assert "@swarm-dev" in result["final_output"]


class TestHandleRejection:
    """Test the handle_rejection node."""

    def test_rejection_increments_retry(self):
        from graph_agents.lead.nodes import handle_rejection
        state = {
            "verification_results": [
                {"gate": "BUILD", "status": "FAIL", "evidence": "exit 1", "timestamp": "now"},
            ],
            "retry_count": 0,
        }
        result = handle_rejection(state)
        assert result["retry_count"] == 1
        assert len(result["error_log"]) > 0

    def test_rejection_clears_verification(self):
        from graph_agents.lead.nodes import handle_rejection
        state = {
            "verification_results": [
                {"gate": "TEST", "status": "FAIL", "evidence": "3 failed", "timestamp": "now"},
            ],
            "retry_count": 1,
        }
        result = handle_rejection(state)
        assert result["verification_results"] == []
        assert result["current_phase"] == "dispatch"
