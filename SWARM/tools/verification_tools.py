"""
Verification Tools
LangChain tool wrappers for build/lint/test/security commands.
Used by verification gate nodes.
"""

from __future__ import annotations

from langchain_core.tools import tool

from core.verification import run_gate, run_all_gates, format_gate_results, all_gates_pass


@tool
def run_build(project_path: str = ".") -> str:
    """
    Run the BUILD verification gate.
    Auto-detects project type (node/rust/go/python).

    Args:
        project_path: Path to project root

    Returns:
        PASS/FAIL result with evidence
    """
    result = run_gate("BUILD", project_path)
    return f"{result['gate']}: {result['status']} — {result['evidence'][:200]}"


@tool
def run_lint(project_path: str = ".") -> str:
    """
    Run the LINT verification gate.

    Args:
        project_path: Path to project root

    Returns:
        PASS/FAIL result with evidence
    """
    result = run_gate("LINT", project_path)
    return f"{result['gate']}: {result['status']} — {result['evidence'][:200]}"


@tool
def run_tests(project_path: str = ".") -> str:
    """
    Run the TEST verification gate.

    Args:
        project_path: Path to project root

    Returns:
        PASS/FAIL result with evidence
    """
    result = run_gate("TEST", project_path)
    return f"{result['gate']}: {result['status']} — {result['evidence'][:200]}"


@tool
def run_security_check(project_path: str = ".") -> str:
    """
    Run the SECURITY verification gate.

    Args:
        project_path: Path to project root

    Returns:
        PASS/FAIL result with evidence
    """
    result = run_gate("SECURITY", project_path)
    return f"{result['gate']}: {result['status']} — {result['evidence'][:200]}"


@tool
def run_full_verification(project_path: str = ".") -> str:
    """
    Run ALL verification gates in dependency order.
    BUILD → LINT → (TEST + SECURITY in parallel)

    Args:
        project_path: Path to project root

    Returns:
        Summary of all gate results
    """
    results = run_all_gates(project_path)
    summary = format_gate_results(results)
    passed = all_gates_pass(results)

    return f"{'✅ ALL PASS' if passed else '❌ FAILURES DETECTED'}\n{summary}"
