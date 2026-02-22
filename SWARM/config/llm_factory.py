"""
LLM-Agnostic Factory
Uses LiteLLM for unified access to 100+ providers.
Swap models by changing config strings — zero code changes.
"""

from typing import Optional

from langchain_core.language_models import BaseChatModel
from langchain_community.chat_models import ChatLiteLLM

from config.settings import settings


def get_llm(
    role: str = "subagent",
    model_override: Optional[str] = None,
    temperature_override: Optional[float] = None,
) -> BaseChatModel:
    """
    Get an LLM instance for a given role.

    Args:
        role: One of "lead", "domain", "subagent", "verification"
        model_override: Override the configured model string
        temperature_override: Override the configured temperature

    Returns:
        A LangChain-compatible chat model

    Examples:
        get_llm("lead")                                    # Uses configured lead model
        get_llm("subagent")                                # Uses configured subagent model
        get_llm(model_override="ollama/llama3.2")          # Force specific model
        get_llm("domain", temperature_override=0.0)        # Domain model, zero temp
    """
    model = model_override or settings.get_model_for_role(role)
    temperature = temperature_override if temperature_override is not None else settings.get_temperature_for_role(role)

    return ChatLiteLLM(
        model=model,
        temperature=temperature,
        # LiteLLM picks up API keys from env vars automatically
        # OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
    )


def get_llm_for_agent(agent_name: str) -> BaseChatModel:
    """
    Get the appropriate LLM for a specific agent.

    The lead agent gets the best model. All other main agents get
    the domain model. Their subagents get the subagent model.
    """
    if agent_name == "swarm-lead":
        return get_llm("lead")
    return get_llm("domain")


def get_llm_for_subagent() -> BaseChatModel:
    """Get the cost-effective LLM for subagent execution."""
    return get_llm("subagent")


def get_llm_for_verification() -> BaseChatModel:
    """Get the fast LLM for verification gates."""
    return get_llm("verification")
