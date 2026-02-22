---
description: "Rapid Bug Fix Protocol (The 'Triage Unit')"
---

# 🔧 QUICK FIX PROTOCOL

> **TRIGGER:** `/quick-fix`
> **INTERFACE:** You talk to Team Lead only
> **GOAL:** Fix a bug in <30 minutes
> **MODE:** Team Lead fast-tracks to Dev

---

## 🧠 HOW IT WORKS

```
YOU → "Fix [bug description]"
         ↓
TEAM LEAD → Routes immediately to @swarm-dev (or @swarm-analyst if complex)
         ↓
FIX APPLIED → Verified automatically
         ↓
TEAM LEAD → Reports result to YOU
```

---

## 📋 DECISION TREE

```
Bug reported
    ↓
Simple (single file, obvious cause)?
  ├── YES → Direct to @swarm-dev
  │            ↓
  │         Fix + Verify + Report
  │
  └── NO → Route to @swarm-analyst first
              ↓
           RCA → Identify root cause
              ↓
           Route to @swarm-dev with findings
              ↓
           Fix + Verify + Report
```

---

## 🎯 SIMPLE BUG PATH (<15 min)

**Team Lead delegates to:** @swarm-dev

**Mission:**
> "Fix [bug]. Read affected file first. Apply surgical fix. Verify build passes."

**Dev actions:**
1. Read file (lines 1-30)
2. Identify issue
3. Apply minimal fix
4. Verify: `npm run build && npm run lint && npm run test`
5. Report

**Output to YOU:**
```markdown
## ✅ BUG FIXED

**Issue:** [What was wrong]
**Fix:** [What was changed]
**File:** [path/to/file.ts]
**Verified:** Build ✅ | Lint ✅ | Test ✅
```

---

## 🔍 COMPLEX BUG PATH (<30 min)

**Team Lead delegates to:** @swarm-analyst → then @swarm-dev

**Step 1: Investigation**
Mission to Analyst:
> "Identify root cause. Check logs, traces, recent changes. Report findings."

Subagents activated:
- Root Cause Analyst
- Log & Trace Investigator

**Step 2: Fix**
Mission to Dev (with RCA findings):
> "Apply fix based on RCA. Verify no regression."

**Output to YOU:**
```markdown
## ✅ BUG FIXED (with RCA)

**Symptom:** [What user experienced]
**Root Cause:** [Actual cause]
**Fix:** [What was changed]
**Files:** [List]
**Verified:** Build ✅ | Lint ✅ | Test ✅

**Prevention:** [If applicable]
```

---

## 🚨 HARD RULES

| Rule | Enforcement |
|------|-------------|
| Read before edit | Must view file first |
| Minimal change | Only fix the bug |
| No scope creep | Don't "improve" other things |
| Always verify | Build must pass |
| No `console.log` | Clean code |

---

## 🚫 ESCALATION TRIGGERS

If any of these → Escalate to `/standard-feature`:

- Bug fix requires >3 files
- Bug reveals architectural issue
- Fix has >30 min estimate
- Security implications
- Data integrity risk

---

## ⏱️ TIME BUDGET

| Path | Target |
|------|--------|
| Simple bug | 15 min |
| Complex bug (RCA needed) | 30 min |

---

**Workflow Version:** 4.0.0-HIERARCHICAL
**Last Updated:** 2026-02-06
