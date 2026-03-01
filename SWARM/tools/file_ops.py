"""
File Operations Tools
LangChain tool wrappers for file system operations.
Used by agents when they need to read, write, or list files.

SECURITY: All file operations are sandboxed to allowed directories.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, List

from langchain_core.tools import tool


# SECURITY: Base directories that are allowed for file operations
# Can be overridden via environment variable
ALLOWED_BASE_DIRS = [
    Path(os.environ.get("SWARM_WORK_DIR", ".")).resolve(),
]

# SECURITY: Patterns that are never allowed in file paths
BLOCKED_PATTERNS = [
    "../",  # Path traversal
    "..\\",  # Windows path traversal
    "/etc/passwd",
    "/etc/shadow",
    "/.ssh/",
    "/.env",
    "id_rsa",
    "id_ed25519",
]


def _validate_path(file_path: str) -> Path:
    """
    Validate and resolve a file path, ensuring it's within allowed directories.
    
    SECURITY: Prevents path traversal attacks by:
    1. Resolving the path to its absolute form
    2. Checking for blocked patterns
    3. Ensuring the path is within allowed base directories
    
    Raises:
        ValueError: If path is invalid or outside allowed directories
    """
    # Check for blocked patterns
    for pattern in BLOCKED_PATTERNS:
        if pattern in file_path:
            raise ValueError(f"Path contains blocked pattern: {pattern}")
    
    # Resolve to absolute path
    path = Path(file_path).resolve()
    
    # Check if path is within any allowed base directory
    for base_dir in ALLOWED_BASE_DIRS:
        try:
            path.relative_to(base_dir)
            return path  # Path is within allowed directory
        except ValueError:
            continue
    
    # Path is not within any allowed directory
    allowed_str = ", ".join(str(d) for d in ALLOWED_BASE_DIRS)
    raise ValueError(f"Path must be within allowed directories: {allowed_str}")


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
    try:
        path = _validate_path(file_path)
    except ValueError as e:
        return f"Error: {str(e)}"
    
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
    try:
        path = _validate_path(file_path)
    except ValueError as e:
        return f"Error: {str(e)}"

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
    try:
        path = _validate_path(directory)
    except ValueError as e:
        return f"Error: {str(e)}"
    
    if not path.exists():
        return f"Error: Directory not found: {directory}"
    if not path.is_dir():
        return f"Error: Not a directory: {directory}"

    try:
        entries = []
        glob_pattern = f"{'*/' * (max_depth - 1)}{pattern}" if max_depth > 1 else pattern

        for item in sorted(path.glob(glob_pattern)):
            # SECURITY: Double-check each item is within allowed directory
            try:
                item.resolve().relative_to(path.resolve())
            except ValueError:
                continue  # Skip items outside allowed directory
            
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
