"""
Subagent Node Factory
Creates LangGraph node functions for individual subagents.
Each subagent = one LLM call with a composed system prompt + structured output.
"""

from __future__ import annotations

import json
import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from config.llm_factory import get_llm_for_subagent
from core.prompt_loader import build_subagent_system_prompt


def slugify(name: str) -> str:
    """Convert subagent name to a valid graph node ID.
    'UI Architecture Designer' → 'ui_architecture_designer'
    """
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    slug = slug.strip("_")
    return slug


def parse_structured_response(content: str, ct_level: str = "CT1") -> dict[str, Any]:
    """
    Parse an LLM response into a structured SubagentResponse dict.
    Attempts to extract YAML/JSON blocks, falls back to raw content.
    """
    result: dict[str, Any] = {
        "content": content,
        "assumptions": [],
        "decisions": [],
        "open_risks": [],
        "ac_refs": [],
    }

    # Try to extract YAML-like block from response
    yaml_match = re.search(r"```(?:yaml|json)?\s*\n(.*?)```", content, re.DOTALL)
    if yaml_match:
        try:
            import yaml
            parsed = yaml.safe_load(yaml_match.group(1))
            if isinstance(parsed, dict):
                result.update(parsed)
                return result
        except Exception:
            pass

    # Fallback: extract structured fields from markdown-style response
    # Look for assumption bullets
    assumption_pattern = re.findall(r"(?:assumptions?|assumed?):\s*\n((?:\s*[-*].*\n?)+)", content, re.IGNORECASE)
    if assumption_pattern:
        for block in assumption_pattern:
            items = re.findall(r"[-*]\s*(.+)", block)
            result["assumptions"].extend(items)

    # Look for decision bullets
    decision_pattern = re.findall(r"(?:decisions?|decided?):\s*\n((?:\s*[-*].*\n?)+)", content, re.IGNORECASE)
    if decision_pattern:
        for block in decision_pattern:
            items = re.findall(r"[-*]\s*(.+)", block)
            result["decisions"].extend(items)

    # Look for risk bullets
    risk_pattern = re.findall(r"(?:risks?|open risks?):\s*\n((?:\s*[-*].*\n?)+)", content, re.IGNORECASE)
    if risk_pattern:
        for block in risk_pattern:
            items = re.findall(r"[-*]\s*(.+)", block)
            result["open_risks"].extend(items)

    # Look for confidence
    conf_match = re.search(r"confidence:\s*([\d.]+)", content, re.IGNORECASE)
    if conf_match:
        try:
            result["confidence"] = float(conf_match.group(1))
        except ValueError:
            pass

    return result


def make_subagent_node(
    agent_name: str,
    subagent_name: str,
):
    """
    Create a LangGraph node function for a subagent.

    The returned function:
    1. Builds a system prompt from (agent markdown + subagent capability + CT format + spec)
    2. Makes one LLM call
    3. Parses the structured response
    4. Returns state update with subagent output

    Args:
        agent_name: Parent agent name (e.g. "swarm-dev")
        subagent_name: Subagent name (e.g. "Vertical Slice Builder")

    Returns:
        A function compatible with StateGraph.add_node()
    """
    node_id = slugify(subagent_name)

    def subagent_node(state: dict) -> dict:
        """Execute this subagent: build prompt → LLM call → parse response."""
        # Build the system prompt
        ct_level = state.get("ct_level", "CT1")
        spec_packet = state.get("spec_packet")

        system_prompt = build_subagent_system_prompt(
            agent_name=agent_name,
            subagent_name=subagent_name,
            ct_level=ct_level,
            spec_packet=spec_packet,
        )

        # Build the user message (the mission/question)
        mission = state.get("mission", state.get("user_input", ""))

        # Make the LLM call
        llm = get_llm_for_subagent()
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=mission),
        ]

        response = llm.invoke(messages)
        response_text = response.content if hasattr(response, "content") else str(response)

        # Parse into structured format
        parsed = parse_structured_response(response_text, ct_level)
        parsed["subagent_name"] = subagent_name
        parsed["spec_ref"] = spec_packet.get("spec_ref", "ADHOC") if spec_packet else "ADHOC"

        # Return state update — merges into subagent_outputs dict
        return {"subagent_outputs": {node_id: parsed}}

    # Attach metadata for introspection
    subagent_node.__name__ = f"subagent_{node_id}"
    subagent_node.__qualname__ = f"{agent_name}.{subagent_name}"

    return subagent_node
