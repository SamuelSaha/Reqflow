#!/usr/bin/env python3
"""
Swarm Retry & Escalation System
Self-correcting agent execution with escalation chains
Version: 1.0.0
"""

from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime


class AgentTier(Enum):
    """Agent seniority levels for escalation."""

    STANDARD = "standard"
    SENIOR = "senior"
    EXPERT = "expert"


class QualityGate(Enum):
    """Quality assessment results."""

    PASS = "pass"
    FAIL = "fail"
    NEEDS_IMPROVEMENT = "needs_improvement"


@dataclass
class AgentOutput:
    """Structured agent output for quality assessment."""

    content: str
    agent_name: str
    subagent_name: str
    timestamp: str
    has_assumptions: bool = False
    has_decisions: bool = False
    has_risks: bool = False
    scope_aligned: bool = True
    confidence: float = 0.8


@dataclass
class RetryAttempt:
    """Record of a retry attempt."""

    attempt_number: int
    agent_name: str
    subagent_name: str
    quality_before: QualityGate
    quality_after: QualityGate
    changes_made: List[str]
    timestamp: str


class EscalationChain:
    """Defines escalation paths for different agent types."""

    CHAINS = {
        "@swarm-dev": ["@swarm-dev", "@swarm-arch"],
        "@swarm-frontend": ["@swarm-frontend", "@swarm-ux", "@swarm-arch"],
        "@swarm-backend": ["@swarm-backend", "@swarm-arch"],
        "@swarm-qa": ["@swarm-qa", "@swarm-dev", "@swarm-arch"],
        "@swarm-ux": ["@swarm-ux", "@swarm-frontend"],
        "@swarm-pm": ["@swarm-pm", "@swarm-analyst"],
        "@swarm-ops": ["@swarm-ops", "@swarm-arch"],
        "@swarm-data": ["@swarm-data", "@swarm-pm"],
    }

    @classmethod
    def get_next_agent(cls, current_agent: str) -> Optional[str]:
        """Get the next agent in the escalation chain."""
        chain = cls.CHAINS.get(current_agent, [current_agent])
        try:
            idx = chain.index(current_agent)
            if idx + 1 < len(chain):
                return chain[idx + 1]
        except ValueError:
            pass
        return None

    @classmethod
    def get_chain(cls, agent: str) -> List[str]:
        """Get full escalation chain for an agent."""
        return cls.CHAINS.get(agent, [agent])


class QualityAssessor:
    """Assesses quality of agent outputs."""

    # Quality criteria weights
    CRITERIA = {
        "assumptions_declared": 0.2,
        "decisions_documented": 0.2,
        "risks_identified": 0.15,
        "scope_aligned": 0.2,
        "evidence_based": 0.15,
        "verifiable": 0.1,
    }

    def assess(self, output: AgentOutput, spec_context: Dict[str, Any]) -> QualityGate:
        """Assess output quality against criteria."""
        scores = []

        # Check assumptions
        if output.has_assumptions:
            scores.append(self.CRITERIA["assumptions_declared"])

        # Check decisions
        if output.has_decisions:
            scores.append(self.CRITERIA["decisions_documented"])

        # Check risks
        if output.has_risks:
            scores.append(self.CRITERIA["risks_identified"])

        # Check scope
        if output.scope_aligned:
            scores.append(self.CRITERIA["scope_aligned"])

        # Check confidence
        if output.confidence >= 0.7:
            scores.append(self.CRITERIA["evidence_based"])

        total_score = sum(scores)

        if total_score >= 0.8:
            return QualityGate.PASS
        elif total_score >= 0.5:
            return QualityGate.NEEDS_IMPROVEMENT
        else:
            return QualityGate.FAIL

    def get_feedback(self, output: AgentOutput, gate: QualityGate) -> List[str]:
        """Generate specific feedback for improvement."""
        feedback = []

        if gate in [QualityGate.FAIL, QualityGate.NEEDS_IMPROVEMENT]:
            if not output.has_assumptions:
                feedback.append("Explicitly declare all assumptions made")
            if not output.has_decisions:
                feedback.append("Document key decisions with rationale")
            if not output.has_risks:
                feedback.append("Identify and flag open risks")
            if not output.scope_aligned:
                feedback.append("Ensure output stays within defined scope")
            if output.confidence < 0.7:
                feedback.append("Provide evidence or reduce confidence score")

        return feedback


class RetryOrchestrator:
    """Manages retry logic and escalation."""

    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries
        self.assessor = QualityAssessor()
        self.attempt_history: List[RetryAttempt] = []

    def execute_with_retry(
        self,
        agent_name: str,
        subagent_name: str,
        execute_fn: Callable[[], AgentOutput],
        spec_context: Dict[str, Any],
    ) -> tuple[AgentOutput, List[RetryAttempt]]:
        """Execute agent with retry and escalation."""
        attempts: List[RetryAttempt] = []
        current_agent = agent_name
        current_subagent = subagent_name
        output: AgentOutput = execute_fn()  # Initial execution

        for attempt_num in range(self.max_retries + 1):
            # Set metadata
            output.agent_name = current_agent
            output.subagent_name = current_subagent

            # Assess quality
            quality = self.assessor.assess(output, spec_context)

            if quality == QualityGate.PASS:
                # Success!
                return output, attempts

            # Need retry or escalation
            if attempt_num < self.max_retries:
                feedback = self.assessor.get_feedback(output, quality)

                # Try different subagent first
                if attempt_num == 0:
                    # Same agent, different approach
                    changes = ["Retry with explicit quality feedback"] + feedback
                else:
                    # Escalate to next agent in chain
                    next_agent = EscalationChain.get_next_agent(current_agent)
                    if next_agent:
                        current_agent = next_agent
                        changes = [
                            f"Escalated from {agent_name} to {next_agent}"
                        ] + feedback
                    else:
                        # No escalation available, just retry
                        changes = ["Final retry attempt"] + feedback

                attempt = RetryAttempt(
                    attempt_number=attempt_num + 1,
                    agent_name=current_agent,
                    subagent_name=current_subagent,
                    quality_before=quality,
                    quality_after=QualityGate.PASS,  # Will be assessed on next iteration
                    changes_made=changes,
                    timestamp=datetime.now().isoformat(),
                )
                attempts.append(attempt)

                # Re-execute for next attempt
                output = execute_fn()
            else:
                # Max retries reached, return best effort
                final_attempt = RetryAttempt(
                    attempt_number=attempt_num + 1,
                    agent_name=current_agent,
                    subagent_name=current_subagent,
                    quality_before=quality,
                    quality_after=quality,
                    changes_made=["Max retries reached - returning best effort"],
                    timestamp=datetime.now().isoformat(),
                )
                attempts.append(final_attempt)
                return output, attempts

        return output, attempts

    def get_failure_patterns(self) -> Dict[str, int]:
        """Analyze failure patterns for system improvement."""
        patterns = {}
        for attempt in self.attempt_history:
            key = f"{attempt.agent_name}.{attempt.subagent_name}"
            if attempt.quality_before != QualityGate.PASS:
                patterns[key] = patterns.get(key, 0) + 1
        return patterns


# Example usage and testing
if __name__ == "__main__":
    # Test quality assessment
    assessor = QualityAssessor()

    good_output = AgentOutput(
        content="Complete implementation",
        agent_name="@swarm-dev",
        subagent_name="Vertical Slice Builder",
        timestamp=datetime.now().isoformat(),
        has_assumptions=True,
        has_decisions=True,
        has_risks=True,
        scope_aligned=True,
        confidence=0.85,
    )

    bad_output = AgentOutput(
        content="Quick fix",
        agent_name="@swarm-dev",
        subagent_name="Vertical Slice Builder",
        timestamp=datetime.now().isoformat(),
        has_assumptions=False,
        has_decisions=False,
        has_risks=False,
        scope_aligned=True,
        confidence=0.5,
    )

    print("Good output assessment:", assessor.assess(good_output, {}))
    print("Bad output assessment:", assessor.assess(bad_output, {}))
    print(
        "Feedback for bad output:", assessor.get_feedback(bad_output, QualityGate.FAIL)
    )

    # Test escalation chain
    print("\nEscalation chain for @swarm-dev:")
    chain = EscalationChain.get_chain("@swarm-dev")
    print(f"  Full chain: {chain}")
    print(f"  Next from @swarm-dev: {EscalationChain.get_next_agent('@swarm-dev')}")
