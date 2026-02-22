#!/usr/bin/env python3
"""
Swarm Mode Detector
Auto-selects Fast vs Deep mode based on request signals
Version: 1.0.0
"""

import re
from typing import Dict, Any, Tuple
from dataclasses import dataclass
from enum import Enum


class ExecutionMode(Enum):
    FAST = "fast"
    DEEP = "deep"


@dataclass
class ModeSignal:
    mode: ExecutionMode
    confidence: float
    reasons: list


class ModeDetector:
    """Detects execution mode from user request."""

    # Fast mode indicators
    FAST_KEYWORDS = [
        "fix",
        "bug",
        "broken",
        "error",
        "crash",
        "fail",
        "asap",
        "urgent",
        "quick",
        "fast",
        "now",
        "immediately",
        "simple",
        "easy",
        "small",
        "tiny",
        "minor",
        "just",
        "only",
        "merely",
    ]

    # Deep mode indicators
    DEEP_KEYWORDS = [
        "architecture",
        "design",
        "system",
        "strategy",
        "approach",
        "scale",
        "scaling",
        "performance",
        "optimize",
        "should we",
        "what if",
        "consider",
        "compare",
        "long-term",
        "future",
        "maintain",
        "evolve",
        "security",
        "secure",
        "auth",
        "payment",
        "encrypt",
        "migration",
        "refactor",
        "restructure",
    ]

    # Complexity indicators
    COMPLEX_PATTERNS = [
        r"\band\b.*\band\b",  # Multiple "and" suggests complexity
        r"\bor\b.*\bor\b",  # Multiple options
        r"\bmultiple\b",  # Explicit complexity
        r"\bseveral\b",
        r"\bvarious\b",
    ]

    def detect(self, request: str) -> ModeSignal:
        """Analyze request and determine execution mode."""
        request_lower = request.lower()

        fast_score = 0
        deep_score = 0
        reasons = []

        # Check fast keywords
        for keyword in self.FAST_KEYWORDS:
            if keyword in request_lower:
                fast_score += 1
                reasons.append(f"Fast keyword: '{keyword}'")

        # Check deep keywords
        for keyword in self.DEEP_KEYWORDS:
            if keyword in request_lower:
                deep_score += 2  # Weight deep keywords higher
                reasons.append(f"Deep keyword: '{keyword}'")

        # Check complexity patterns
        for pattern in self.COMPLEX_PATTERNS:
            if re.search(pattern, request_lower):
                deep_score += 1.5
                reasons.append(f"Complexity pattern detected")

        # Length heuristic
        word_count = len(request.split())
        if word_count < 10:
            fast_score += 1
            reasons.append("Short request")
        elif word_count > 50:
            deep_score += 1
            reasons.append("Detailed request")

        # Determine mode
        if deep_score > fast_score:
            confidence = min(0.95, 0.5 + (deep_score - fast_score) * 0.1)
            return ModeSignal(ExecutionMode.DEEP, confidence, reasons)
        else:
            confidence = min(0.95, 0.5 + (fast_score - deep_score) * 0.1)
            return ModeSignal(ExecutionMode.FAST, confidence, reasons)

    def get_mode_description(self, signal: ModeSignal) -> str:
        """Get human-readable description of selected mode."""
        if signal.mode == ExecutionMode.FAST:
            return (
                f"⚡ FAST MODE (confidence: {signal.confidence:.0%})\n"
                f"→ Quick, action-oriented execution\n"
                f"→ Concise output\n"
                f"→ Minimal deliberation"
            )
        else:
            return (
                f"🔍 DEEP MODE (confidence: {signal.confidence:.0%})\n"
                f"→ Full reasoning and analysis\n"
                f"→ Multiple options explored\n"
                f"→ Trade-offs documented"
            )


# CLI for testing
if __name__ == "__main__":
    import sys

    detector = ModeDetector()

    if len(sys.argv) > 1:
        request = " ".join(sys.argv[1:])
    else:
        # Test cases
        test_requests = [
            "Fix the login bug ASAP",
            "What architecture should we use for the new payment system?",
            "Build a simple user settings page",
            "Design a scalable notification system with multiple channels",
            "Just update the color scheme",
            "Should we use REST or GraphQL for our API?",
        ]

        for req in test_requests:
            print(f"\n{'=' * 60}")
            print(f"Request: {req}")
            signal = detector.detect(req)
            print(detector.get_mode_description(signal))
            print(f"Signals: {', '.join(signal.reasons[:3])}")

        sys.exit(0)

    signal = detector.detect(request)
    print(detector.get_mode_description(signal))
    print(f"\nSignals detected:")
    for reason in signal.reasons:
        print(f"  • {reason}")
