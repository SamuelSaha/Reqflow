"""
Prompt Loader
Loads agent markdown files and protocol documents.
Builds system prompts by composing agent identity + delegation protocol + spec context.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from config.settings import settings
from config.agent_registry import registry


def load_protocol(protocol_name: str) -> str:
    """
    Load a protocol markdown file from the SWARM root.

    Args:
        protocol_name: e.g. "SWARM_PROTOCOL", "SWARM_DELEGATION", "SWARM_TURBO"

    Returns:
        Full text content of the protocol file.
    """
    # Try with .md extension
    path = settings.protocols_dir / f"{protocol_name}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")

    # Try without extension
    path = settings.protocols_dir / protocol_name
    if path.exists():
        return path.read_text(encoding="utf-8")

    raise FileNotFoundError(f"Protocol not found: {protocol_name} (looked in {settings.protocols_dir})")


def extract_ct_response_format(delegation_text: str, ct_level: str = "CT1") -> str:
    """
    Extract the CT1 or CT2 response format from SWARM_DELEGATION.md or SWARM_TURBO.md.

    Returns the expected response format as a string.
    """
    if ct_level == "CT2":
        return """## Response Format (CT2 - Full Analysis Required)
```yaml
ref: "SPEC-ID"
ticket: "T-XXX"
acs: [AC-001, AC-002]
goal: "One sentence"
summary: "One sentence + recommendation"
assumptions: ["Listed"]
unknowns: ["What would change decision"]
options:
  - "A: pro | con"
  - "B: pro | con"
decision: "Chose A because X"
evidence: ["code:L42", "log:timestamp"]
verification: ["test:name", "metric:threshold"]
risks: ["risk: mitigation"]
confidence: 0.75
```"""
    else:
        return """## Response Format (CT1 - Minimal)
```yaml
ref: "SPEC-ID | ADHOC"
acs: [AC-001]
done: true | false
changes: ["file.ts +10 -5"]
assumptions: ["Listed"]
decisions: ["Key decisions with rationale"]
risks: ["Open risks"]
verified: build ✅ lint ✅ test ✅
```"""


def build_agent_system_prompt(agent_name: str) -> str:
    """
    Build the full system prompt for a domain agent.

    Composes:
    1. Agent identity (from markdown body)
    2. Core protocol rules (abbreviated)
    3. Response format expectations
    """
    agent_def = registry.get_agent(agent_name)

    prompt_parts = [
        f"# You are @{agent_def['name']}",
        f"**Role:** {agent_def['description']}",
        f"**Domain:** {agent_def['domain']}",
        f"**Authority Level:** {agent_def['authority_level']}",
        "",
        "## Your Identity and Instructions",
        agent_def["system_prompt"][:4000],  # Cap to avoid context overflow
        "",
        "## Core Rules (Non-Negotiable)",
        "1. Security > Everything",
        "2. User Value > Technical Elegance",
        "3. Simplicity > Features",
        "4. Include assumptions in every response",
        "5. Document decisions with rationale",
        "6. Flag open risks",
        "7. Stay within scope",
    ]

    if agent_def.get("subagents"):
        prompt_parts.extend([
            "",
            "## Your Subagents",
            "You have the following subagents available:",
        ])
        for sa in agent_def["subagents"]:
            prompt_parts.append(f"- {sa}")

    return "\n".join(prompt_parts)


def build_subagent_system_prompt(
    agent_name: str,
    subagent_name: str,
    ct_level: str = "CT1",
    spec_packet: Optional[dict[str, Any]] = None,
) -> str:
    """
    Build the system prompt for a subagent.

    Composes:
    1. Parent agent context (abbreviated)
    2. Subagent-specific capability
    3. CT response format (CT1 or CT2)
    4. Spec context packet
    """
    agent_def = registry.get_agent(agent_name)

    # Get subagent capability description from agent markdown
    capability = _extract_subagent_capability(agent_def["system_prompt"], subagent_name)

    parts = [
        f"# You are: {subagent_name}",
        f"## Part of: @{agent_def['name']} ({agent_def['description']})",
        "",
        "## Your Specific Capability",
        capability or f"Specialized subagent: {subagent_name}",
        "",
        extract_ct_response_format("", ct_level),
        "",
        "## Rules",
        "1. Include assumptions in EVERY response",
        "2. Document decisions with rationale",
        "3. Flag open risks",
        "4. Stay within assigned scope",
        "5. Reference spec ACs where applicable",
    ]

    if spec_packet:
        parts.extend([
            "",
            "## Current Spec Context",
            f"spec_ref: {spec_packet.get('spec_ref', 'ADHOC')}",
            f"goal: {spec_packet.get('goal', 'Not specified')}",
            f"constraints: {', '.join(spec_packet.get('constraints', [])[:3])}",
        ])

    return "\n".join(parts)


def build_delegation_prompt(
    spec_packet: Optional[dict[str, Any]],
    question: str,
    ct_level: str = "CT1",
) -> str:
    """
    Build the compact delegation micro-format from SWARM_TURBO.md.
    Maximum 5 lines.
    """
    spec_ref = spec_packet.get("spec_ref", "ADHOC") if spec_packet else "ADHOC"
    goal = spec_packet.get("goal", "Ad-hoc task") if spec_packet else "Ad-hoc task"
    constraints = ", ".join(spec_packet.get("constraints", [])[:3]) if spec_packet else "None"

    return f"""spec_ref: {spec_ref}
goal: {goal}
constraints: {constraints}
question: {question}
ct_level: {ct_level}"""


def _extract_subagent_capability(agent_markdown: str, subagent_name: str) -> str | None:
    """
    Extract a subagent's capability description from the parent agent's markdown.

    Looks for a section header matching the subagent name and returns the text
    between that header and the next header.
    """
    lines = agent_markdown.split("\n")
    capturing = False
    captured: list[str] = []

    for line in lines:
        # Check if this line is a header containing the subagent name
        if subagent_name.lower() in line.lower() and line.strip().startswith("#"):
            capturing = True
            continue

        if capturing:
            # Stop at next header
            if line.strip().startswith("#") and captured:
                break
            captured.append(line)

    result = "\n".join(captured).strip()
    return result if result else None
