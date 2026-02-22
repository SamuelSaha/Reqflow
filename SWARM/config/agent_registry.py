"""
Agent Registry
Discovers and loads all agent markdown definitions from agents/ directory.
Parses YAML frontmatter to extract metadata (subagents, triggers, skills, etc.).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from config.settings import settings


def _parse_agent_file(file_path: Path) -> dict[str, Any]:
    """
    Parse an agent markdown file with YAML frontmatter.

    Expected format:
    ---
    name: swarm-dev
    description: Full-Stack Engineer
    subagents:
      - Vertical Slice Builder
      - Cross-Layer Consistency Checker
    triggers: ["dev", "build", "code"]
    ...
    ---
    # @swarm-dev (DEV)
    [markdown body...]
    """
    content = file_path.read_text(encoding="utf-8")

    # Split on YAML frontmatter delimiters
    parts = content.split("---", 2)

    if len(parts) >= 3:
        frontmatter = yaml.safe_load(parts[1]) or {}
        body = parts[2].strip()
    else:
        frontmatter = {}
        body = content.strip()

    return {
        "name": frontmatter.get("name", file_path.stem),
        "description": frontmatter.get("description", ""),
        "version": frontmatter.get("version", "1.0.0"),
        "authority_level": frontmatter.get("authority_level", "Standard"),
        "domain": frontmatter.get("domain", ""),
        "triggers": frontmatter.get("triggers", []),
        "subagents": frontmatter.get("subagents", []),
        "skills": frontmatter.get("skills", []),
        "tools_authorized": frontmatter.get("tools_authorized", []),
        "tools_forbidden": frontmatter.get("tools_forbidden", []),
        "execution_mode": frontmatter.get("execution_mode", "standard"),
        "timing_targets": frontmatter.get("timing_targets", {}),
        "base": frontmatter.get("base", ""),
        "system_prompt": body,  # Full markdown body becomes the system prompt
        "file_path": str(file_path),
    }


class AgentRegistry:
    """Discovers and provides access to all agent definitions."""

    def __init__(self):
        self._agents: dict[str, dict[str, Any]] = {}
        self._trigger_map: dict[str, str] = {}
        self._loaded = False

    def _ensure_loaded(self):
        """Lazy-load agent definitions on first access."""
        if self._loaded:
            return

        agents_dir = settings.agents_dir
        if not agents_dir.exists():
            raise FileNotFoundError(f"Agents directory not found: {agents_dir}")

        for md_file in sorted(agents_dir.glob("*.md")):
            agent_def = _parse_agent_file(md_file)
            name = agent_def["name"]
            self._agents[name] = agent_def

            # Build trigger → agent mapping
            for trigger in agent_def["triggers"]:
                self._trigger_map[trigger.lower()] = name

        self._loaded = True

    def get_agent(self, name: str) -> dict[str, Any]:
        """Get a single agent definition by name."""
        self._ensure_loaded()
        # Normalize: accept both "swarm-dev" and "@swarm-dev"
        clean_name = name.lstrip("@")
        if clean_name not in self._agents:
            raise KeyError(f"Agent not found: {clean_name}. Available: {list(self._agents.keys())}")
        return self._agents[clean_name]

    def get_all_agents(self) -> dict[str, dict[str, Any]]:
        """Get all agent definitions."""
        self._ensure_loaded()
        return dict(self._agents)

    def get_agent_names(self) -> list[str]:
        """Get list of all agent names."""
        self._ensure_loaded()
        return list(self._agents.keys())

    def get_subagents_for(self, agent_name: str) -> list[str]:
        """Get the list of subagent names for a given agent."""
        agent = self.get_agent(agent_name)
        return agent.get("subagents", [])

    def find_agent_by_trigger(self, trigger: str) -> str | None:
        """Find which agent responds to a given trigger keyword."""
        self._ensure_loaded()
        return self._trigger_map.get(trigger.lower())

    def get_triggered_agents(self) -> list[str]:
        """Get agents that are triggered-only (not always dispatched)."""
        self._ensure_loaded()
        return [
            name for name, agent in self._agents.items()
            if agent.get("authority_level") == "Triggered"
            or name in ("swarm-sec", "swarm-analyst")
        ]

    def get_always_available_agents(self) -> list[str]:
        """Get agents that are always available for dispatch."""
        triggered = set(self.get_triggered_agents())
        return [name for name in self.get_agent_names() if name not in triggered and name != "swarm-lead"]


# Singleton instance
registry = AgentRegistry()
