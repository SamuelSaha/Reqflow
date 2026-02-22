#!/usr/bin/env python3
"""
Swarm Memory System
Persistent context storage for @swarm-lead
Version: 1.0.0
"""

import sqlite3
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any, Union


class SwarmMemory:
    """Persistent memory system for swarm operations."""

    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.db_path = self.project_path / ".swarm" / "memory.db"
        self.project_hash = self._compute_project_hash()
        self._init_db()

    def _compute_project_hash(self) -> str:
        """Compute unique hash for project identification."""
        # Use git remote or directory structure
        git_dir = self.project_path / ".git"
        if git_dir.exists():
            try:
                with open(git_dir / "config", "r") as f:
                    content = f.read()
                    return hashlib.sha256(content.encode()).hexdigest()[:16]
            except:
                pass

        # Fallback to directory name + structure hash
        structure = str(
            sorted([p.name for p in self.project_path.iterdir() if p.is_dir()])
        )
        return hashlib.sha256(structure.encode()).hexdigest()[:16]

    def _init_db(self):
        """Initialize database schema."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS decisions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    project_hash TEXT NOT NULL,
                    context TEXT NOT NULL,
                    decision TEXT NOT NULL,
                    rationale TEXT,
                    confidence REAL DEFAULT 0.8,
                    tags TEXT
                );
                
                CREATE TABLE IF NOT EXISTS patterns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    project_hash TEXT NOT NULL,
                    usage_count INTEGER DEFAULT 1,
                    last_used TEXT
                );
                
                CREATE TABLE IF NOT EXISTS context_cache (
                    project_hash TEXT PRIMARY KEY,
                    last_accessed TEXT,
                    context_json TEXT
                );
                
                CREATE INDEX IF NOT EXISTS idx_decisions_project ON decisions(project_hash);
                CREATE INDEX IF NOT EXISTS idx_decisions_context ON decisions(context);
                CREATE INDEX IF NOT EXISTS idx_patterns_project ON patterns(project_hash);
            """)

    def store_decision(
        self,
        context: str,
        decision: str,
        rationale: str = "",
        confidence: float = 0.8,
        tags: Optional[List[str]] = None,
    ) -> int:
        """Store a decision with context."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """INSERT INTO decisions (timestamp, project_hash, context, decision, 
                   rationale, confidence, tags) VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    datetime.now().isoformat(),
                    self.project_hash,
                    context,
                    decision,
                    rationale,
                    confidence,
                    json.dumps(tags or []),
                ),
            )
            return cursor.lastrowid or 0

    def get_relevant_decisions(
        self, query: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get decisions relevant to current context (simple keyword matching)."""
        keywords = query.lower().split()

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """SELECT * FROM decisions 
                   WHERE project_hash = ? 
                   ORDER BY timestamp DESC LIMIT 50""",
                (self.project_hash,),
            )

            decisions = [dict(row) for row in cursor.fetchall()]

            # Simple relevance scoring
            scored = []
            for d in decisions:
                score = sum(1 for kw in keywords if kw in d["context"].lower())
                score += sum(1 for kw in keywords if kw in d["decision"].lower())
                if score > 0:
                    d["relevance_score"] = score
                    scored.append(d)

            scored.sort(key=lambda x: x["relevance_score"], reverse=True)
            return scored[:limit]

    def store_pattern(self, pattern_type: str, description: str):
        """Store or increment a pattern."""
        with sqlite3.connect(self.db_path) as conn:
            # Check if pattern exists
            cursor = conn.execute(
                """SELECT id, usage_count FROM patterns 
                   WHERE project_hash = ? AND pattern_type = ? AND description = ?""",
                (self.project_hash, pattern_type, description),
            )
            row = cursor.fetchone()

            if row:
                # Increment usage
                conn.execute(
                    """UPDATE patterns SET usage_count = ?, last_used = ?
                       WHERE id = ?""",
                    (row[1] + 1, datetime.now().isoformat(), row[0]),
                )
            else:
                # Insert new pattern
                conn.execute(
                    """INSERT INTO patterns (pattern_type, description, project_hash, last_used)
                       VALUES (?, ?, ?, ?)""",
                    (
                        pattern_type,
                        description,
                        self.project_hash,
                        datetime.now().isoformat(),
                    ),
                )

    def get_common_patterns(
        self, pattern_type: Optional[str] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get commonly used patterns."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            if pattern_type:
                cursor = conn.execute(
                    """SELECT * FROM patterns WHERE project_hash = ? AND pattern_type = ?
                       ORDER BY usage_count DESC LIMIT ?""",
                    (self.project_hash, pattern_type, limit),
                )
            else:
                cursor = conn.execute(
                    """SELECT * FROM patterns WHERE project_hash = ?
                       ORDER BY usage_count DESC LIMIT ?""",
                    (self.project_hash, limit),
                )

            return [dict(row) for row in cursor.fetchall()]

    def cache_context(self, context_data: Dict[str, Any]):
        """Cache current context for quick loading."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """INSERT OR REPLACE INTO context_cache 
                   (project_hash, last_accessed, context_json) VALUES (?, ?, ?)""",
                (
                    self.project_hash,
                    datetime.now().isoformat(),
                    json.dumps(context_data),
                ),
            )

    def load_cached_context(self) -> Optional[Dict[str, Any]]:
        """Load cached context for this project."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """SELECT context_json FROM context_cache WHERE project_hash = ?""",
                (self.project_hash,),
            )
            row = cursor.fetchone()

            if row:
                # Update last accessed
                conn.execute(
                    """UPDATE context_cache SET last_accessed = ? WHERE project_hash = ?""",
                    (datetime.now().isoformat(), self.project_hash),
                )
                return json.loads(row[0])
            return None

    def get_memory_summary(self) -> str:
        """Get a summary of stored memory for this project."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """SELECT COUNT(*) FROM decisions WHERE project_hash = ?""",
                (self.project_hash,),
            )
            decision_count = cursor.fetchone()[0]

            cursor = conn.execute(
                """SELECT COUNT(*) FROM patterns WHERE project_hash = ?""",
                (self.project_hash,),
            )
            pattern_count = cursor.fetchone()[0]

            return f"Memory: {decision_count} decisions, {pattern_count} patterns"


# CLI interface for testing
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python memory.py <project_path> [store|get|summary]")
        sys.exit(1)

    project_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "summary"

    memory = SwarmMemory(project_path)

    if command == "summary":
        print(memory.get_memory_summary())
    elif command == "test":
        # Store test data
        memory.store_decision(
            "Authentication system design",
            "Use JWT with refresh tokens",
            "Standard pattern for session management",
            0.9,
            ["auth", "security"],
        )
        memory.store_pattern("auth", "JWT with refresh tokens")
        print("Test data stored")
        print(memory.get_memory_summary())

        # Retrieve
        decisions = memory.get_relevant_decisions("authentication")
        print(f"\nFound {len(decisions)} relevant decisions")
