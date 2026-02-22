"""Tests for state schemas and reducers."""

import pytest
from state.schemas import (
    SwarmState,
    DomainAgentState,
    SpecPacket,
    VerificationResult,
    SubagentResponse,
    merge_dicts,
)


class TestMergeDicts:
    """Test the merge_dicts reducer."""

    def test_merge_empty(self):
        assert merge_dicts({}, {}) == {}

    def test_merge_non_overlapping(self):
        a = {"swarm-dev": {"status": "done"}}
        b = {"swarm-qa": {"status": "done"}}
        result = merge_dicts(a, b)
        assert "swarm-dev" in result
        assert "swarm-qa" in result

    def test_merge_overlapping_updates(self):
        a = {"swarm-dev": {"status": "pending"}}
        b = {"swarm-dev": {"status": "done"}}
        result = merge_dicts(a, b)
        assert result["swarm-dev"]["status"] == "done"

    def test_merge_preserves_original(self):
        a = {"swarm-dev": {"status": "done"}}
        b = {"swarm-qa": {"status": "done"}}
        merge_dicts(a, b)
        # Original should not be modified
        assert "swarm-qa" not in a


class TestSpecPacket:
    """Test SpecPacket creation."""

    def test_create_minimal(self):
        spec = SpecPacket(
            spec_ref="SPEC-20260215-001",
            goal="Fix the login bug",
        )
        assert spec["spec_ref"] == "SPEC-20260215-001"
        assert spec["goal"] == "Fix the login bug"

    def test_create_full(self):
        spec = SpecPacket(
            spec_ref="SPEC-20260215-001",
            version="1.0.0",
            status="draft",
            goal="Add user settings page",
            user_benefit="Users can customize their experience",
            non_goals=["Admin settings"],
            constraints=["Must use existing design system"],
            acceptance_criteria=[
                {"id": "AC-001", "description": "Settings page renders"}
            ],
            assumptions=["E0: Standard auth flow"],
        )
        assert len(spec["non_goals"]) == 1
        assert len(spec["constraints"]) == 1
        assert len(spec["acceptance_criteria"]) == 1


class TestVerificationResult:
    """Test VerificationResult creation."""

    def test_create_pass(self):
        result = VerificationResult(
            gate="BUILD",
            status="PASS",
            evidence="Build succeeded in 3.2s",
            timestamp="2026-02-15T10:00:00",
        )
        assert result["gate"] == "BUILD"
        assert result["status"] == "PASS"

    def test_create_fail(self):
        result = VerificationResult(
            gate="TEST",
            status="FAIL",
            evidence="3 tests failed",
            timestamp="2026-02-15T10:00:00",
        )
        assert result["status"] == "FAIL"


class TestSubagentResponse:
    """Test SubagentResponse creation."""

    def test_create_ct1(self):
        response = SubagentResponse(
            subagent_name="Vertical Slice Builder",
            spec_ref="SPEC-001",
            ac_refs=["AC-001"],
            assumptions=["Standard auth flow"],
            decisions=["Use JWT tokens"],
            open_risks=["Token expiry handling"],
            content="Implementation details...",
        )
        assert response["subagent_name"] == "Vertical Slice Builder"
        assert len(response["assumptions"]) == 1

    def test_create_ct2(self):
        response = SubagentResponse(
            subagent_name="ADR Writer",
            spec_ref="SPEC-001",
            ac_refs=["AC-001", "AC-002"],
            assumptions=[],
            decisions=["Use PostgreSQL"],
            open_risks=[],
            content="ADR content...",
            goal_in_own_words="Evaluate database options",
            summary="PostgreSQL recommended for ACID compliance",
            options_considered=["PostgreSQL", "MongoDB"],
            confidence=0.85,
        )
        assert response["confidence"] == 0.85
        assert len(response["options_considered"]) == 2
