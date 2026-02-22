"""
Shell Execution Tool
LangChain tool wrapper for executing bash commands.
Sandboxed with timeout and output limits.
"""

from __future__ import annotations

import subprocess
from typing import Optional

from langchain_core.tools import tool


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
    # Safety: block dangerous commands
    dangerous = ["rm -rf /", "rm -rf ~", "mkfs", "dd if=", ":(){", "fork bomb"]
    if any(d in command.lower() for d in dangerous):
        return "Error: Command blocked for safety reasons."

    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=working_directory,
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
    except Exception as e:
        return f"Error: {str(e)[:300]}"
