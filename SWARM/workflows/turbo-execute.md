---
name: turbo-execute
version: "5.0.0-OPTIMIZED"
description: Maximum velocity execution - zero ceremony, parallel by default
---

# Workflow: Turbo Execute

## Philosophy

Every millisecond is a bug. Every question is a failure. Execute.

## Trigger

Any user request requiring agent work.

## Process (Total: < 3 minutes for INSTANT)

### Step 1: PARSE (< 100ms)

Extract from user request:
- **action**: fix, build, review, deploy, etc.
- **domain**: frontend, backend, security, etc.
- **urgency**: now, asap, normal
- **scope**: INSTANT, SPRINT, EPIC, DISCOVERY

Output: Intent object. No deliberation.

---

### Step 2: DISPATCH (< 200ms)

**Lookup Table:**

| Action + Domain | Primary | Parallel Support |
|-----------------|---------|------------------|
| fix + any | @swarm-dev | +@swarm-analyst |
| build + frontend | @swarm-frontend | +@swarm-ux +@swarm-qa |
| build + backend | @swarm-backend | +@swarm-arch +@swarm-qa |
| build + full | @swarm-dev | +@swarm-pm +@swarm-qa |
| review + code | @swarm-analyst | +@swarm-dev |
| review + ux | @swarm-ux | +@swarm-frontend +@swarm-pm |
| review + security | @swarm-sec | +@swarm-arch |
| deploy + any | @swarm-ops | +@swarm-qa |
| analyze + any | @swarm-analyst | solo |

Fire immediately. Announce deployment. Do not wait for confirmation.

---

### Step 3: EXECUTE (Parallel by default)

**No dependencies:**
```
PARALLEL:
  @agent-1: mission-1
  @agent-2: mission-2
  @agent-3: mission-3
→ SYNC_POINT
```

**Dependencies exist:**
```
CHAIN: @agent-1 → @agent-2 → @agent-3
```

**Agent communication format:**
```yaml
from: "@swarm-dev"
artifact: "changes.md"
status: "COMPLETE | BLOCKED | NEEDS_INPUT"
next: "@swarm-qa"
blockers: []
```

---

### Step 4: VERIFY (< 10s per gate)

Run ALL gates in parallel:

| Gate | Command | Pass Condition |
|------|---------|----------------|
| BUILD | `npm run build` | exit 0 |
| LINT | `npm run lint` | 0 errors |
| TEST | `npm run test` | all pass |
| SECURITY | `audit check` | 0 critical |

- IF any FAIL: BLOCK + REPORT + FIX
- IF all PASS: PROCEED

---

### Step 5: COMPILE (< 30s)

Merge agent outputs:
1. Collect all artifacts
2. Resolve conflicts (Lead arbitrates)
3. Generate unified report
4. Verify scope adherence

---

### Step 6: DELIVER (< 10s)

To user:
```markdown
## ✅ COMPLETE

**Task:** [Original request]
**Agents:** [@list]
**Result:** [Specific outcome]
**Changes:** [file:lines]
**Verified:** build ✅ lint ✅ test ✅
```

---

## Timing Targets

| Scope | Total Time Target |
|-------|-------------------|
| INSTANT | < 3 minutes |
| SPRINT | < 1 hour |
| EPIC | < 1 day (first deliverable) |
| DISCOVERY | < 15 minutes (to scope decision) |

---

## Anti-Patterns (Auto-Fail)

| Pattern | Violation |
|---------|-----------|
| Asked for permission | PERMISSION_LOOP |
| Options without recommendation | DECISION_DUMP |
| "looks good" or "almost" | VIBES_GATE |
| No verification evidence | EVIDENCE_GAP |
| Exceeded scope | SCOPE_VIOLATION |

---

## Emergency Overrides

| Keyword | Action |
|---------|--------|
| `!rollback` | @swarm-ops: immediate rollback |
| `!halt` | Stop all execution |
| `!escalate` | Route to human |

---

## Success Criteria

- Parse → Dispatch in < 100ms
- Parallel utilization > 60%
- All gates pass
- User receives result, not options
- No permission loops
- No scope violations
- Verification evidence attached
