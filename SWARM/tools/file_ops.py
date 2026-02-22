"""
File Operations Tools
LangChain tool wrappers for file system operations.
Used by agents when they need to read, write, or list files.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from langchain_core.tools import tool


@tool
def view_file(file_path: str, start_line: int = 1, end_line: int = 0) -> str:
    """
    View the contents of a file with line numbers.

    Args:
        file_path: Path to the file to read
        start_line: Starting line number (1-indexed, default: 1)
        end_line: Ending line number (0 = read to end, default: 0)

    Returns:
        File contents with line numbers, or error message
    """
    path = Path(file_path)
    if not path.exists():
        return f"Error: File not found: {file_path}"
    if not path.is_file():
        return f"Error: Not a file: {file_path}"

    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        total = len(lines)

        # Apply line range
        start_idx = max(0, start_line - 1)
        end_idx = end_line if end_line > 0 else total

        selected = lines[start_idx:end_idx]
        numbered = [
            f"{i + start_idx + 1:4d} | {line}"
            for i, line in enumerate(selected)
        ]

        return f"File: {file_path} ({total} lines)\n" + "\n".join(numbered)

    except Exception as e:
        return f"Error reading {file_path}: {str(e)[:200]}"


@tool
def write_file(file_path: str, content: str, create_dirs: bool = True) -> str:
    """
    Write content to a file. Creates parent directories if needed.

    Args:
        file_path: Path to write to
        content: File content to write
        create_dirs: Create parent directories if they don't exist

    Returns:
        Success message or error
    """
    path = Path(file_path)

    try:
        if create_dirs:
            path.parent.mkdir(parents=True, exist_ok=True)

        path.write_text(content, encoding="utf-8")
        return f"Written {len(content)} bytes to {file_path}"

    except Exception as e:
        return f"Error writing {file_path}: {str(e)[:200]}"


@tool
def list_dir(directory: str, pattern: str = "*", max_depth: int = 2) -> str:
    """
    List files in a directory with optional glob pattern.

    Args:
        directory: Path to list
        pattern: Glob pattern to filter (default: "*" = all files)
        max_depth: Maximum depth to traverse (default: 2)

    Returns:
        Formatted directory listing
    """
    path = Path(directory)
    if not path.exists():
        return f"Error: Directory not found: {directory}"
    if not path.is_dir():
        return f"Error: Not a directory: {directory}"

    try:
        entries = []
        glob_pattern = f"{'*/' * (max_depth - 1)}{pattern}" if max_depth > 1 else pattern

        for item in sorted(path.glob(glob_pattern)):
            rel = item.relative_to(path)
            if item.is_dir():
                entries.append(f"  📁 {rel}/")
            else:
                size = item.stat().st_size
                entries.append(f"  📄 {rel} ({size:,} bytes)")

        if not entries:
            return f"No files matching '{pattern}' in {directory}"

        return f"Directory: {directory}\n" + "\n".join(entries[:100])

    except Exception as e:
        return f"Error listing {directory}: {str(e)[:200]}"
