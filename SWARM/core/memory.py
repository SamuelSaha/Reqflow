"""
Memory Adapter
Wraps the existing SwarmMemory class from .swarm/memory.py for LangGraph integration.
Provides graph node functions for loading and saving context.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

# Add .swarm to path so we can import the original memory module
_swarm_utils_dir = Path(__file__).parent.parent / ".swarm"
if str(_swarm_utils_dir) not in sys.path:
    sys.path.insert(0, str(_swarm_utils_dir))

from memory import SwarmMemory  # noqa: E402 — imported from .swarm/memory.py


class SwarmMemoryAdapter:
    """
    Wraps the existing SwarmMemory for use as LangGraph graph nodes.
    Preserves the SQLite schema and all existing functionality.
    """

    def __init__(self, project_path: str | None = None):
        """
        Initialize with a project path.
        If not provided, uses the SWARM root directory.
        """
        if project_path is None:
            project_path = str(Path(__file__).parent.parent)
        self._memory = SwarmMemory(project_path)

    @property
    def memory(self) -> SwarmMemory:
        """Access the underlying SwarmMemory instance."""
        return self._memory

    def load_context(self, user_input: str) -> dict[str, Any]:
        """
        Load relevant context for a user request.
        Called as part of the load_memory graph node.

        Returns a dict with:
        - decisions: relevant past decisions
        - patterns: common patterns
        - summary: memory summary string
        """
        decisions = self._memory.get_relevant_decisions(user_input, limit=5)
        patterns = self._memory.get_common_patterns(limit=5)
        cached = self._memory.load_cached_context()
        summary = self._memory.get_memory_summary()

        return {
            "decisions": decisions,
            "patterns": [dict(p) if hasattr(p, "keys") else p for p in patterns],
            "cached_context": cached,
            "summary": summary,
        }

    def save_decisions(self, agent_outputs: dict[str, dict[str, Any]], user_input: str) -> int:
        """
        Save decisions from agent outputs to persistent memory.
        Called as part of the save_memory graph node.

        Returns count of decisions stored.
        """
        count = 0
        for agent_name, output in agent_outputs.items():
            if not isinstance(output, dict):
                continue

            # Extract decisions from agent output
            decisions = output.get("decisions", [])
            rationale = output.get("rationale", "")
            confidence = output.get("confidence", 0.8)

            for decision in decisions:
                if isinstance(decision, str):
                    self._memory.store_decision(
                        context=user_input,
                        decision=decision,
                        rationale=rationale,
                        confidence=confidence,
                        tags=[agent_name],
                    )
                    count += 1

            # Store patterns
            patterns = output.get("patterns", [])
            for pattern in patterns:
                if isinstance(pattern, dict):
                    self._memory.store_pattern(
                        pattern.get("type", "general"),
                        pattern.get("description", str(pattern)),
                    )
                elif isinstance(pattern, str):
                    self._memory.store_pattern("general", pattern)

        return count

    def get_summary(self) -> str:
        """Get a human-readable memory summary."""
        return self._memory.get_memory_summary()
