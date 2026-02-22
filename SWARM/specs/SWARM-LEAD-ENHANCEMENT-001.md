# SWARM Lead Enhancement Spec
# Version: 5.1.0-MEMORY

---

## Overview

Enhance @swarm-lead with three capabilities:
1. Persistent Context Memory
2. Smart Retry with Escalation
3. Auto Mode Selection

---

## 1. Persistent Context Memory

### Goal
Eliminate context loss between sessions by storing decisions, patterns, and project knowledge.

### Implementation
- SQLite database at `.swarm/memory.db`
- Auto-loads relevant context when project detected
- Stores: decisions, patterns, assumptions, code locations
- Semantic search for context retrieval

### Schema
```sql
CREATE TABLE decisions (
    id INTEGER PRIMARY KEY,
    timestamp TEXT,
    context TEXT,
    decision TEXT,
    rationale TEXT,
    confidence REAL
);

CREATE TABLE patterns (
    id INTEGER PRIMARY KEY,
    pattern_type TEXT,
    description TEXT,
    usage_count INTEGER
);

CREATE TABLE context_cache (
    project_hash TEXT PRIMARY KEY,
    last_accessed TEXT,
    context_json TEXT
);
```

---

## 2. Smart Retry with Escalation

### Goal
Self-correcting system when agents produce poor outputs.

### Flow
```
Agent Output
    ↓
Quality Check
    ↓
IF FAIL → Retry with different subagent
    ↓
IF FAIL AGAIN → Escalate to senior agent
    ↓
Log failure pattern for learning
```

### Escalation Chain
- @swarm-dev → @swarm-arch (architecture issues)
- @swarm-frontend → @swarm-ux (UX feasibility)
- @swarm-qa → @swarm-arch (system-level bugs)

---

## 3. Auto Mode Selection

### Goal
Lead automatically chooses Fast vs Deep mode based on request signals.

### Fast Mode Signals
- Keywords: fix, bug, broken, asap, quick, now
- Single domain scope
- Clear boundaries
- Time indicators

### Deep Mode Signals  
- Keywords: architecture, design, system, scale, strategy
- Multiple domains
- Ambiguous requirements
- Strategic impact

### Output
- Fast: Concise, action-oriented
- Deep: Full reasoning, options, trade-offs

---

## Success Criteria

- [ ] Context persists across sessions
- [ ] Auto-detection accuracy >80%
- [ ] Retry success rate >60%
- [ ] No user configuration required

---

**Status:** Ready for Implementation
**Estimated Time:** 2-3 hours
