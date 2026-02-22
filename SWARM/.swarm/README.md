# Swarm Support Systems

This directory contains the supporting infrastructure for the @swarm-lead agent.

## Files

| File | Purpose |
|------|---------|
| `memory.py` | Persistent context storage across sessions |
| `mode_detector.py` | Automatic Fast/Deep mode selection |
| `retry_system.py` | Smart retry and escalation logic |
| `memory.db` | SQLite database (auto-created) |
| `test_integration.py` | Integration test suite |

## Usage

These modules are used internally by @swarm-lead. No manual intervention required.

### Testing

```bash
cd .swarm
python3 test_integration.py
```

### Manual Memory Operations

```python
from memory import SwarmMemory

memory = SwarmMemory("/path/to/project")
memory.store_decision("context", "decision", "rationale")
decisions = memory.get_relevant_decisions("query")
```

## Database Schema

The `memory.db` file contains:
- `decisions` - Stored decisions with context
- `patterns` - Commonly used patterns
- `context_cache` - Quick-loading context

---

**Do not modify files manually** - Let @swarm-lead manage these.
