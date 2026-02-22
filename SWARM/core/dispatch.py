"""
Keyword Dispatch Table
Direct translation of SWARM_TURBO.md dispatch rules.
Maps user keywords → agent lists + scope classification.

< 100ms decision time target.
"""

from __future__ import annotations


# ============================================================
# Turbo Dispatch Table (from SWARM_TURBO.md)
# Format: keyword → (primary_agents, parallel_support_agents)
# ============================================================

KEYWORD_DISPATCH_TABLE: dict[str, tuple[list[str], list[str]]] = {
    # Bug fix
    "fix":          (["swarm-dev"],       ["swarm-analyst"]),
    "bug":          (["swarm-dev"],       ["swarm-analyst"]),
    "broken":       (["swarm-dev"],       ["swarm-analyst"]),
    "error":        (["swarm-dev"],       ["swarm-analyst"]),

    # Feature build
    "build":        (["swarm-dev"],       ["swarm-pm", "swarm-qa"]),
    "create":       (["swarm-dev"],       ["swarm-pm", "swarm-qa"]),
    "add":          (["swarm-dev"],       ["swarm-pm", "swarm-qa"]),
    "implement":    (["swarm-dev"],       ["swarm-pm", "swarm-qa"]),

    # Design / UX
    "design":       (["swarm-ux"],        ["swarm-frontend"]),
    "ux":           (["swarm-ux"],        ["swarm-frontend"]),
    "ui":           (["swarm-ux"],        ["swarm-frontend"]),
    "visual":       (["swarm-ux"],        ["swarm-frontend"]),

    # Review / Audit
    "review":       (["swarm-analyst"],   []),
    "audit":        (["swarm-analyst"],   []),
    "check":        (["swarm-analyst"],   []),

    # Security
    "secure":       (["swarm-sec"],       ["swarm-arch"]),
    "auth":         (["swarm-sec"],       ["swarm-arch"]),
    "encrypt":      (["swarm-sec"],       ["swarm-arch"]),
    "pii":          (["swarm-sec"],       ["swarm-arch"]),

    # Architecture
    "scale":        (["swarm-arch"],      ["swarm-ops"]),
    "architecture": (["swarm-arch"],      ["swarm-ops"]),
    "system":       (["swarm-arch"],      ["swarm-ops"]),

    # Deployment
    "deploy":       (["swarm-ops"],       ["swarm-qa"]),
    "ship":         (["swarm-ops"],       ["swarm-qa"]),
    "release":      (["swarm-ops"],       ["swarm-qa"]),

    # Testing
    "test":         (["swarm-qa"],        ["swarm-dev"]),
    "qa":           (["swarm-qa"],        ["swarm-dev"]),
    "verify":       (["swarm-qa"],        ["swarm-dev"]),

    # Data / Analytics
    "data":         (["swarm-data"],      ["swarm-pm"]),
    "metrics":      (["swarm-data"],      ["swarm-pm"]),
    "analytics":    (["swarm-data"],      ["swarm-pm"]),

    # Analysis
    "why":          (["swarm-analyst"],   []),
    "analyze":      (["swarm-analyst"],   []),
    "root cause":   (["swarm-analyst"],   []),

    # Spec / Planning
    "spec":         (["swarm-pm"],        ["swarm-ux"]),
    "plan":         (["swarm-pm"],        ["swarm-ux"]),
    "scope":        (["swarm-pm"],        ["swarm-ux"]),

    # Frontend specific
    "frontend":     (["swarm-frontend"],  ["swarm-ux"]),
    "component":    (["swarm-frontend"],  ["swarm-ux"]),
    "react":        (["swarm-frontend"],  ["swarm-ux"]),

    # Backend specific
    "backend":      (["swarm-backend"],   ["swarm-arch"]),
    "api":          (["swarm-backend"],   ["swarm-arch"]),
    "database":     (["swarm-backend"],   ["swarm-arch"]),
}


# ============================================================
# Scope Classifier (from SWARM_TURBO.md)
# ============================================================

SCOPE_KEYWORDS: dict[str, set[str]] = {
    "INSTANT": {"fix", "bug", "broken", "error", "just", "quick", "small", "typo", "only", "simple"},
    "SPRINT":  {"build", "create", "add", "implement", "feature", "page", "component"},
    "EPIC":    {"system", "architecture", "platform", "migration", "payment", "redesign", "overhaul"},
    "DISCOVERY": {"should", "what if", "explore", "strategy", "compare", "evaluate", "investigate"},
}

# Priority trigger words (from SWARM_TURBO.md)
PRIORITY_BOOSTERS: set[str] = {"now", "asap", "urgent", "immediately"}
SCOPE_OVERRIDES: dict[str, str] = {
    "quick": "INSTANT",
    "full": "EPIC",
    "audit": "SPRINT",
    "rollback": "INSTANT",  # Emergency
}


def classify_scope(user_input: str) -> str:
    """
    Classify the scope of a user request.

    Returns: "INSTANT" | "SPRINT" | "EPIC" | "DISCOVERY"
    Default: "SPRINT" (safe assumption per SWARM_TURBO.md)
    """
    words = set(user_input.lower().split())

    # Check explicit scope overrides first
    for word, scope in SCOPE_OVERRIDES.items():
        if word in words:
            return scope

    # Score each scope category
    scores: dict[str, int] = {}
    for scope_name, keywords in SCOPE_KEYWORDS.items():
        score = len(words & keywords)
        if score > 0:
            scores[scope_name] = score

    if scores:
        return max(scores, key=scores.get)  # type: ignore

    return "SPRINT"  # Default safe assumption


def dispatch(user_input: str, execution_mode: str = "fast") -> tuple[list[str], str]:
    """
    Dispatch user input to the appropriate agent(s).

    Args:
        user_input: Raw user request text
        execution_mode: "fast" (primary agents only) or "deep" (include support agents)

    Returns:
        Tuple of (agent_names, scope)
        agent_names: List of agent names to activate (e.g. ["swarm-dev", "swarm-analyst"])
        scope: "INSTANT" | "SPRINT" | "EPIC" | "DISCOVERY"
    """
    words = user_input.lower().split()
    primary: set[str] = set()
    support: set[str] = set()

    # Match keywords to agents
    for word in words:
        if word in KEYWORD_DISPATCH_TABLE:
            p, s = KEYWORD_DISPATCH_TABLE[word]
            primary.update(p)
            support.update(s)

    # Multi-word keyword check (e.g. "root cause")
    input_lower = user_input.lower()
    for keyword, (p, s) in KEYWORD_DISPATCH_TABLE.items():
        if " " in keyword and keyword in input_lower:
            primary.update(p)
            support.update(s)

    # Classify scope
    scope = classify_scope(user_input)

    # If no agents matched, default to swarm-dev (safe fallback)
    if not primary:
        primary.add("swarm-dev")

    # In fast mode, only primary agents
    if execution_mode == "fast":
        return sorted(primary), scope

    # In deep mode, include support agents
    all_agents = primary | support
    return sorted(all_agents), scope


def get_pre_computed_flow(user_input: str) -> str | None:
    """
    Check if user input matches a pre-computed flow from SWARM_TURBO.md.

    Returns flow name if matched, None otherwise.
    """
    input_lower = user_input.lower()

    if any(kw in input_lower for kw in ["fix", "bug", "broken", "error"]):
        return "bug_fix"
    if any(kw in input_lower for kw in ["build", "create", "implement"]):
        return "feature_build"
    if any(kw in input_lower for kw in ["review", "audit"]):
        return "ui_review"
    if any(kw in input_lower for kw in ["secure", "auth", "encrypt"]):
        return "security_audit"

    return None
