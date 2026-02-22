"""
Swarm LangGraph Settings
Provider-agnostic configuration using Pydantic Settings.
All LLM providers configured via model strings (LiteLLM format).
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class SwarmSettings(BaseSettings):
    """Global settings for the swarm system. Loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- LLM Model Roles (LiteLLM format: "provider/model") ---
    lead_model: str = Field(
        default="anthropic/claude-sonnet-4-20250514",
        description="Model for @swarm-lead: orchestration, compilation, delivery",
    )
    domain_model: str = Field(
        default="openai/gpt-4o",
        description="Model for domain agents: specialized reasoning",
    )
    subagent_model: str = Field(
        default="openai/gpt-4o-mini",
        description="Model for subagents: focused single-task execution",
    )
    verification_model: str = Field(
        default="openai/gpt-4o-mini",
        description="Model for verification: fast binary pass/fail checks",
    )

    # --- Temperature Settings ---
    lead_temperature: float = 0.1
    domain_temperature: float = 0.2
    subagent_temperature: float = 0.3

    # --- API Keys (set the ones you use) ---
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    together_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"

    # --- Checkpointer ---
    checkpointer_backend: str = "sqlite"
    checkpointer_uri: str = "swarm_checkpoints.db"

    # --- Paths ---
    project_path: Optional[str] = None
    swarm_root_override: Optional[str] = Field(default=None, alias="SWARM_ROOT")

    @property
    def swarm_root(self) -> Path:
        """
        Root of the SWARM directory (where agent definitions + protocols live).
        Can be overridden via SWARM_ROOT env var for use from other projects.
        Default: auto-detected from this file's location.
        """
        if self.swarm_root_override:
            return Path(self.swarm_root_override)
        return Path(__file__).parent.parent

    @property
    def agents_dir(self) -> Path:
        """Directory containing agent markdown definitions."""
        return self.swarm_root / "agents"

    @property
    def protocols_dir(self) -> Path:
        """Directory containing protocol markdown files (root of SWARM)."""
        return self.swarm_root

    @property
    def workflows_dir(self) -> Path:
        """Directory containing workflow definitions."""
        return self.swarm_root / "workflows"

    @property
    def skills_dir(self) -> Path:
        """Directory containing skills taxonomy."""
        return self.swarm_root / "skills"

    @property
    def specifications_dir(self) -> Path:
        """Directory containing spec templates."""
        return self.swarm_root / "specifications"

    def get_model_for_role(self, role: str) -> str:
        """Get the configured model string for a given role."""
        role_map = {
            "lead": self.lead_model,
            "domain": self.domain_model,
            "subagent": self.subagent_model,
            "verification": self.verification_model,
        }
        return role_map.get(role, self.subagent_model)

    def get_temperature_for_role(self, role: str) -> float:
        """Get the configured temperature for a given role."""
        temp_map = {
            "lead": self.lead_temperature,
            "domain": self.domain_temperature,
            "subagent": self.subagent_temperature,
            "verification": 0.0,
        }
        return temp_map.get(role, self.subagent_temperature)


# Singleton instance — import this
settings = SwarmSettings()
