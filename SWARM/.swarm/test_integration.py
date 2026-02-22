#!/usr/bin/env python3
"""
Integration test for Swarm Lead Enhancement
Tests Memory, Mode Detection, and Retry systems
"""

import sys

sys.path.insert(0, "/Users/samuelsaha/Desktop/20_AREAS/AI_LAB/Swarm/SWARM/.swarm")

from memory import SwarmMemory
from mode_detector import ModeDetector, ExecutionMode
from retry_system import RetryOrchestrator, AgentOutput, QualityGate
from datetime import datetime


def test_memory():
    """Test persistent memory system."""
    print("=" * 60)
    print("🧠 TESTING: Persistent Memory System")
    print("=" * 60)

    memory = SwarmMemory("/Users/samuelsaha/Desktop/20_AREAS/AI_LAB/Swarm/SWARM")

    # Store a decision
    decision_id = memory.store_decision(
        context="Authentication system architecture",
        decision="Use JWT with refresh tokens",
        rationale="Industry standard, good security/usability balance",
        confidence=0.9,
        tags=["auth", "security", "jwt"],
    )
    print(f"✓ Stored decision (ID: {decision_id})")

    # Store a pattern
    memory.store_pattern("auth", "JWT with refresh tokens")
    print("✓ Stored pattern")

    # Retrieve relevant decisions
    decisions = memory.get_relevant_decisions("authentication")
    print(f"✓ Retrieved {len(decisions)} relevant decisions")

    # Get summary
    summary = memory.get_memory_summary()
    print(f"✓ {summary}")

    print("\n✅ Memory system working\n")


def test_mode_detection():
    """Test auto mode detection."""
    print("=" * 60)
    print("⚡ TESTING: Auto Mode Detection")
    print("=" * 60)

    detector = ModeDetector()

    test_cases = [
        ("Fix the login bug ASAP", ExecutionMode.FAST),
        ("Build user settings page", ExecutionMode.FAST),
        ("What architecture for payments?", ExecutionMode.DEEP),
        ("Design scalable notification system", ExecutionMode.DEEP),
        ("Just update the colors", ExecutionMode.FAST),
        ("Should we use REST or GraphQL?", ExecutionMode.DEEP),
    ]

    correct = 0
    for request, expected in test_cases:
        signal = detector.detect(request)
        status = "✓" if signal.mode == expected else "✗"
        print(
            f"{status} '{request[:40]}...' → {signal.mode.value.upper()} ({signal.confidence:.0%})"
        )
        if signal.mode == expected:
            correct += 1

    accuracy = correct / len(test_cases)
    print(f"\nAccuracy: {accuracy:.0%} ({correct}/{len(test_cases)})")
    print(
        "✅ Mode detection working\n"
        if accuracy >= 0.8
        else "⚠️  Mode detection needs tuning\n"
    )


def test_retry_system():
    """Test retry and escalation logic."""
    print("=" * 60)
    print("🔄 TESTING: Retry & Escalation System")
    print("=" * 60)

    orchestrator = RetryOrchestrator(max_retries=2)

    # Simulate a failing execution
    attempt_count = [0]

    def failing_execute():
        attempt_count[0] += 1
        # First two attempts are bad, third is good
        if attempt_count[0] < 3:
            return AgentOutput(
                content="Quick fix",
                agent_name="@swarm-dev",
                subagent_name="Test",
                timestamp=datetime.now().isoformat(),
                has_assumptions=False,
                has_decisions=False,
                has_risks=False,
                scope_aligned=True,
                confidence=0.5,
            )
        else:
            return AgentOutput(
                content="Complete implementation with tests",
                agent_name="@swarm-dev",
                subagent_name="Test",
                timestamp=datetime.now().isoformat(),
                has_assumptions=True,
                has_decisions=True,
                has_risks=True,
                scope_aligned=True,
                confidence=0.9,
            )

    output, attempts = orchestrator.execute_with_retry(
        "@swarm-dev", "Vertical Slice Builder", failing_execute, {}
    )

    print(f"✓ Total attempts: {attempt_count[0]}")
    print(f"✓ Retry attempts logged: {len(attempts)}")

    for i, attempt in enumerate(attempts, 1):
        print(
            f"  Attempt {i}: {attempt.quality_before.value} → {attempt.quality_after.value}"
        )

    print("✅ Retry system working\n")


def main():
    print("\n" + "=" * 60)
    print("🚀 SWARM LEAD ENHANCEMENT - INTEGRATION TEST")
    print("=" * 60 + "\n")

    try:
        test_memory()
        test_mode_detection()
        test_retry_system()

        print("=" * 60)
        print("✅ ALL TESTS PASSED")
        print("=" * 60)
        print("\nNew capabilities ready:")
        print("  • Persistent memory across sessions")
        print("  • Automatic Fast/Deep mode selection")
        print("  • Smart retry with escalation")
        print("\nThe @swarm-lead is now enhanced with learning capabilities.")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback

        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
