"""Tests for the keyword dispatch system."""

import pytest
from core.dispatch import dispatch, classify_scope, get_pre_computed_flow


class TestDispatch:
    """Test keyword → agent dispatch."""

    def test_fix_bug_fast_mode(self):
        agents, scope = dispatch("Fix the login bug", "fast")
        assert "swarm-dev" in agents
        assert scope == "INSTANT"

    def test_fix_bug_deep_mode(self):
        agents, scope = dispatch("Fix the login bug", "deep")
        assert "swarm-dev" in agents
        assert "swarm-analyst" in agents  # Support agent included in deep

    def test_build_feature(self):
        agents, scope = dispatch("Build a user settings page", "deep")
        assert "swarm-dev" in agents
        assert "swarm-pm" in agents
        assert "swarm-qa" in agents

    def test_design_task(self):
        agents, scope = dispatch("Design the new dashboard UX", "deep")
        assert "swarm-ux" in agents
        assert "swarm-frontend" in agents

    def test_security_task(self):
        agents, scope = dispatch("Is the auth system secure?", "deep")
        assert "swarm-sec" in agents
        assert "swarm-arch" in agents

    def test_deploy_task(self):
        agents, scope = dispatch("Deploy to production", "fast")
        assert "swarm-ops" in agents

    def test_testing_task(self):
        agents, scope = dispatch("Run the test suite and verify", "fast")
        assert "swarm-qa" in agents

    def test_data_task(self):
        agents, scope = dispatch("Set up analytics metrics", "fast")
        assert "swarm-data" in agents

    def test_backend_task(self):
        agents, scope = dispatch("Create the REST API endpoint", "deep")
        assert "swarm-backend" in agents
        assert "swarm-arch" in agents

    def test_frontend_task(self):
        agents, scope = dispatch("Build the React component", "deep")
        assert "swarm-frontend" in agents

    def test_unknown_defaults_to_dev(self):
        agents, scope = dispatch("Do something unclear", "fast")
        assert "swarm-dev" in agents

    def test_fast_mode_excludes_support(self):
        agents, scope = dispatch("Build a new feature", "fast")
        assert "swarm-dev" in agents
        # Support agents excluded in fast mode
        assert "swarm-pm" not in agents

    def test_deep_mode_includes_support(self):
        agents, scope = dispatch("Build a new feature", "deep")
        assert "swarm-dev" in agents
        assert "swarm-pm" in agents
        assert "swarm-qa" in agents


class TestScopeClassification:
    """Test scope classification."""

    def test_instant_scope(self):
        assert classify_scope("Fix the typo") == "INSTANT"

    def test_sprint_scope(self):
        assert classify_scope("Build a new feature") == "SPRINT"

    def test_epic_scope(self):
        assert classify_scope("Redesign the system architecture") == "EPIC"

    def test_discovery_scope(self):
        assert classify_scope("Should we use GraphQL or REST?") == "DISCOVERY"

    def test_default_is_sprint(self):
        assert classify_scope("Something ambiguous happening") == "SPRINT"

    def test_quick_override(self):
        assert classify_scope("quick question about the API") == "INSTANT"


class TestPreComputedFlows:
    """Test pre-computed flow detection."""

    def test_bug_fix_flow(self):
        assert get_pre_computed_flow("Fix the login bug") == "bug_fix"

    def test_feature_build_flow(self):
        assert get_pre_computed_flow("Build a settings page") == "feature_build"

    def test_security_audit_flow(self):
        assert get_pre_computed_flow("Audit the auth system") == "ui_review"  # "audit" → review flow
        assert get_pre_computed_flow("Secure the payment flow") == "security_audit"

    def test_no_flow_match(self):
        assert get_pre_computed_flow("What should we do next?") is None
