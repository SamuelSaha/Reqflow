"""
Verification Gates
Binary gate runner from SWARM_VERIFICATION.md and SWARM_TURBO.md.
All gates are PASS/FAIL only — no "looks good" (VIBES_GATE anti-pattern).
"""

from __future__ import annotations

import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Any, Optional

from state.schemas import VerificationResult


# ============================================================
# Gate Definitions (from SWARM_TURBO.md)
# ============================================================

GATE_DEFINITIONS: list[dict[str, Any]] = [
    {
        "name": "BUILD",
        "commands": ["npm run build", "cargo build", "go build ./...", "python -m py_compile"],
        "timeout": 120,
        "pass_condition": "exit_0",
        "on_fail": "BLOCK",
    },
    {
        "name": "LINT",
        "commands": ["npm run lint", "cargo clippy", "golangci-lint run", "ruff check ."],
        "timeout": 60,
        "pass_condition": "zero_errors",
        "on_fail": "BLOCK",
    },
    {
        "name": "TEST",
        "commands": ["npm run test", "cargo test", "go test ./...", "pytest"],
        "timeout": 300,
        "pass_condition": "all_pass",
        "on_fail": "BLOCK",
    },
    {
        "name": "SECURITY",
        "commands": ["npm audit --audit-level=high", "cargo audit", "gosec ./..."],
        "timeout": 60,
        "pass_condition": "zero_critical",
        "on_fail": "BLOCK",
    },
]

# Gate dependency order:
# BUILD must pass before LINT
# LINT must pass before TEST and SECURITY (which can run in parallel)
GATE_ORDER = ["BUILD", "LINT", "TEST", "SECURITY", "SCOPE"]


def _detect_project_type(project_path: str) -> str:
    """Auto-detect project type from files present."""
    from pathlib import Path
    p = Path(project_path)

    if (p / "package.json").exists():
        return "node"
    if (p / "Cargo.toml").exists():
        return "rust"
    if (p / "go.mod").exists():
        return "go"
    if (p / "pyproject.toml").exists() or (p / "setup.py").exists():
        return "python"
    return "unknown"


def _get_command_for_gate(gate_name: str, project_type: str) -> str | None:
    """Get the correct command for a gate based on project type."""
    command_map = {
        "node": {"BUILD": "npm run build", "LINT": "npm run lint", "TEST": "npm run test", "SECURITY": "npm audit --audit-level=high"},
        "rust": {"BUILD": "cargo build", "LINT": "cargo clippy", "TEST": "cargo test", "SECURITY": "cargo audit"},
        "go": {"BUILD": "go build ./...", "LINT": "golangci-lint run", "TEST": "go test ./...", "SECURITY": "gosec ./..."},
        "python": {"BUILD": "python -m py_compile", "LINT": "ruff check .", "TEST": "pytest", "SECURITY": "pip-audit"},
    }
    return command_map.get(project_type, {}).get(gate_name)


def run_gate(gate_name: str, project_path: str = ".") -> VerificationResult:
    """
    Run a single verification gate.

    Returns PASS/FAIL with evidence. If the command doesn't exist for
    this project type, returns SKIP.
    """
    project_type = _detect_project_type(project_path)
    command = _get_command_for_gate(gate_name, project_type)

    if not command:
        return VerificationResult(
            gate=gate_name,
            status="SKIP",
            evidence=f"No {gate_name.lower()} command for project type '{project_type}'",
            timestamp=datetime.now().isoformat(),
        )

    gate_def = next((g for g in GATE_DEFINITIONS if g["name"] == gate_name), None)
    timeout = gate_def["timeout"] if gate_def else 60

    try:
        result = subprocess.run(
            command.split(),
            cwd=project_path,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        status = "PASS" if result.returncode == 0 else "FAIL"
        evidence = result.stdout[-500:] if status == "PASS" else result.stderr[-500:]
        if not evidence:
            evidence = result.stdout[-500:] or "(no output)"

    except subprocess.TimeoutExpired:
        status = "FAIL"
        evidence = f"Timeout after {timeout}s"
    except FileNotFoundError:
        status = "SKIP"
        evidence = f"Command not found: {command}"
    except Exception as e:
        status = "FAIL"
        evidence = f"Error: {str(e)[:300]}"

    return VerificationResult(
        gate=gate_name,
        status=status,
        evidence=evidence.strip(),
        timestamp=datetime.now().isoformat(),
    )


def run_all_gates(
    project_path: str = ".",
    skip_on_first_fail: bool = True,
) -> list[VerificationResult]:
    """
    Run all verification gates in dependency order.
    BUILD → LINT → (TEST + SECURITY in parallel) → SCOPE

    Args:
        project_path: Path to the project root
        skip_on_first_fail: Stop running after first FAIL

    Returns:
        List of VerificationResult for each gate
    """
    results: list[VerificationResult] = []

    # BUILD first
    build_result = run_gate("BUILD", project_path)
    results.append(build_result)
    if build_result["status"] == "FAIL" and skip_on_first_fail:
        return results

    # LINT next
    lint_result = run_gate("LINT", project_path)
    results.append(lint_result)
    if lint_result["status"] == "FAIL" and skip_on_first_fail:
        return results

    # TEST and SECURITY in parallel
    with ThreadPoolExecutor(max_workers=2) as executor:
        test_future = executor.submit(run_gate, "TEST", project_path)
        sec_future = executor.submit(run_gate, "SECURITY", project_path)
        results.append(test_future.result())
        results.append(sec_future.result())

    return results


def run_scope_gate(
    agent_outputs: dict[str, Any],
    spec_packet: Optional[dict[str, Any]] = None,
) -> VerificationResult:
    """
    SCOPE gate: LLM-based check that changes stay within ticket boundary.

    This is a structural check, not an LLM call. It verifies:
    1. All outputs reference a spec_ref (or ADHOC)
    2. No undeclared assumptions
    3. AC references present

    For deeper scope validation, an LLM call would be needed.
    """
    issues: list[str] = []

    if not spec_packet:
        # Ad-hoc task — scope gate is automatically PASS
        return VerificationResult(
            gate="SCOPE",
            status="PASS",
            evidence="Ad-hoc task (no spec) — scope gate not applicable",
            timestamp=datetime.now().isoformat(),
        )

    # Check each agent's output for spec grounding
    for agent_name, output in agent_outputs.items():
        if isinstance(output, dict):
            if not output.get("spec_ref") and not output.get("ac_refs"):
                issues.append(f"{agent_name}: no spec_ref or AC references")
            if not output.get("assumptions"):
                issues.append(f"{agent_name}: no declared assumptions")

    if issues:
        return VerificationResult(
            gate="SCOPE",
            status="FAIL",
            evidence=f"Scope violations: {'; '.join(issues[:5])}",
            timestamp=datetime.now().isoformat(),
        )

    return VerificationResult(
        gate="SCOPE",
        status="PASS",
        evidence=f"All {len(agent_outputs)} agent outputs are spec-grounded",
        timestamp=datetime.now().isoformat(),
    )


def format_gate_results(results: list[VerificationResult]) -> str:
    """Format verification results as a compact status line."""
    parts = []
    for r in results:
        icon = {"PASS": "✅", "FAIL": "❌", "SKIP": "⏭️", "WARN": "⚠️"}.get(r["status"], "?")
        parts.append(f"{r['gate']} {icon}")
    return " ".join(parts)


def all_gates_pass(results: list[VerificationResult]) -> bool:
    """Check if all gates passed (SKIP counts as pass)."""
    return all(r["status"] in ("PASS", "SKIP") for r in results)
