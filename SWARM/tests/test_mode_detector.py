"""Tests for the mode detector (adapted from .swarm/test_integration.py)."""

import pytest
from core.mode_detector import ModeDetector, ExecutionMode


class TestModeDetector:
    """Test fast vs deep mode detection."""

    def setup_method(self):
        self.detector = ModeDetector()

    def test_fast_mode_bug_fix(self):
        signal = self.detector.detect("Fix the login bug ASAP")
        assert signal.mode == ExecutionMode.FAST

    def test_deep_mode_architecture(self):
        signal = self.detector.detect("What architecture should we use for the new payment system?")
        assert signal.mode == ExecutionMode.DEEP

    def test_fast_mode_simple_task(self):
        signal = self.detector.detect("Just update the color scheme")
        assert signal.mode == ExecutionMode.FAST

    def test_deep_mode_strategy(self):
        signal = self.detector.detect("Should we use REST or GraphQL for our API?")
        assert signal.mode == ExecutionMode.DEEP

    def test_deep_mode_security(self):
        signal = self.detector.detect("Design a scalable notification system with multiple channels")
        assert signal.mode == ExecutionMode.DEEP

    def test_fast_mode_short_request(self):
        signal = self.detector.detect("Fix it")
        assert signal.mode == ExecutionMode.FAST

    def test_confidence_range(self):
        signal = self.detector.detect("Fix the login bug")
        assert 0.0 <= signal.confidence <= 1.0

    def test_reasons_populated(self):
        signal = self.detector.detect("Fix the broken authentication")
        assert len(signal.reasons) > 0

    def test_mode_description(self):
        signal = self.detector.detect("Fix it")
        desc = self.detector.get_mode_description(signal)
        assert "FAST MODE" in desc or "DEEP MODE" in desc
