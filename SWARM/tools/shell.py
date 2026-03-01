"""
Shell Execution Tool
LangChain tool wrapper for executing bash commands.
Sandboxed with timeout and output limits.

SECURITY: Uses shlex.split() to avoid shell injection. Never use shell=True.
"""
from __future__ import annotations

import subprocess
import shlex
import os
from pathlib import Path
from typing import Optional

from langchain_core.tools import tool


# SECURITY: Allowed commands whitelist (can be extended via environment)
ALLOWED_COMMANDS = set(os.environ.get("SWARM_ALLOWED_COMMANDS", "ls,cat,head,tail,grep,find,git,npm,node,python,pytest,ruff,pip").split(","))

# SECURITY: Blocked command patterns that should never run
BLOCKED_PATTERNS = [
    "rm -rf /",
    "rm -rf ~",
    "mkfs",
    "dd if=",
    ":(){",  # fork bomb
    "fork bomb",
    "> /dev/sd",
    "> /dev/hd",
    "chmod 777",
    "chown root",
    "curl | bash",
    "wget | bash",
    "nc -l",
    "/etc/passwd",
    "/etc/shadow",
]


@tool
def execute_bash(
    command: str,
    working_directory: str = ".",
    timeout: int = 30,
) -> str:
    """
    Execute a bash command and return the output.

    Args:
        command: The bash command to execute
        working_directory: Directory to run in (default: current)
        timeout: Max seconds to wait (default: 30)

    Returns:
        Command output (stdout + stderr), truncated to 5000 chars
    """
    # SECURITY: Check blocked patterns first
    command_lower = command.lower()
    for pattern in BLOCKED_PATTERNS:
        if pattern in command_lower:
            return f"Error: Command blocked for security reasons (matched pattern: {pattern})"

    # SECURITY: Validate working directory is within allowed paths
    work_dir = Path(working_directory).resolve()
    allowed_base = Path(os.environ.get("SWARM_WORK_DIR", ".")).resolve()
    
    try:
        # Ensure working directory is within allowed base
        work_dir.relative_to(allowed_base)
    except ValueError:
        return f"Error: Working directory must be within {allowed_base}"

    # SECURITY: Parse command safely without shell
    try:
        args = shlex.split(command)
    except ValueError as e:
        return f"Error: Invalid command syntax: {str(e)}"

    if not args:
        return "Error: Empty command"

    # SECURITY: Check if command is in allowed list
    base_cmd = Path(args[0]).name
    if base_cmd not in ALLOWED_COMMANDS:
        return f"Error: Command '{base_cmd}' is not in allowed list. Allowed: {', '.join(sorted(ALLOWED_COMMANDS))}"

    try:
        # SECURITY: Never use shell=True - this prevents shell injection
        result = subprocess.run(
            args,
            shell=False,  # CRITICAL: Never change this to True
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            timeout=timeout,
        )

        output = result.stdout
        if result.stderr:
            output += f"\n[stderr]\n{result.stderr}"

        # Truncate long output
        if len(output) > 5000:
            output = output[:5000] + f"\n... (truncated, total {len(output)} chars)"

        exit_info = f"[exit code: {result.returncode}]"

        return f"{output}\n{exit_info}"

    except subprocess.TimeoutExpired:
        return f"Error: Command timed out after {timeout}s"
    except FileNotFoundError:
        return f"Error: Command not found: {args[0]}"
    except Exception as e:
        return f"Error: {str(e)[:300]}"
