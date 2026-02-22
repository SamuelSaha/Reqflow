---
specification:
  metadata:
    id: "SPEC-YYYYMMDD-NNN"
    version: "1.0.0"
    status: "draft|approved|frozen"
    created: "ISO8601 timestamp"
    author: "@swarm-lead|@swarm-pm|user"

  # Spec Seed: minimal input. Everything else can be auto-derived as E0 defaults.
  seed:
    goal: "One sentence objective"
    user: "Primary user (or 'Unknown' -> assume generic)"
    must_have:
      - "One non-negotiable capability"
    constraints:
      - "One hard constraint (optional)"
    non_goals:
      - "One explicit non-goal (optional)"

frozen: false
immutable_elements:
  - goal
  - acceptance_criteria
  - constraints
  - non_goals
---

# ⚡ ONE-SHOT SPEC: {Title}

**ID:** SPEC-YYYYMMDD-NNN  
**Version:** 1.0.0  
**Status:** draft|approved|frozen  
**Created:** {YYYY-MM-DD}

## ✅ Spec Seed (Minimal Input)
```yaml
seed:
  goal: "..."
  user: "..."
  must_have: ["..."]
  constraints: ["..."]
  non_goals: ["..."]
```

## 📦 Spec Context Packet (Copy into tickets/delegations)
```yaml
spec_packet:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  version: "1.0.0"
  status: "approved|frozen"

  goal: "..."
  user_benefit: "..."

  non_goals:
    - "..."

  constraints:
    - "..."

  acceptance_criteria:
    - id: "AC-001"
      criterion: "..."
      pass_threshold: "..."
      priority: "P0"

  assumptions:
    - "Key E0 default (only the highest-impact ones)"
```

## 🎯 Executive Summary (Outcome Only)
1–3 sentences: what changes for the user and why it matters.

## 🏆 Differentiator (1 sentence)
The single thing that makes this spec worth building (not a checklist).

## 🚫 Non-Goals (Out of Scope)
- ❌ ...

## ⚠️ Constraints (Hard)
- ...

## ✅ Acceptance Criteria (Binary, High Impact)
Target: **5–12** ACs. Prefer outcome + verification over implementation.

| ID | Criterion | Test Method | Pass Threshold | Priority |
|----|----------|-------------|----------------|----------|
| AC-001 | ... | ... | ... | P0 |

## 🧠 Assumptions Ledger (AUTO)
List E0 defaults explicitly. Keep it short (3–8). Include falsifiers.

| ID | Assumption | Evidence | Falsifier | Default Action |
|----|------------|----------|-----------|----------------|
| A-001 | ... | E0 | ... | ... |

## ❓ Open Questions (Only if Blocking)
- Q-001 (blocking?): ... (Default: ...)

## 🧯 Top Failure Modes (User-Facing)
List the 3 most likely failure modes and the user recovery path.
- Failure: ... → Recovery: ...

## ✅ Verification Plan
How we prove ACs (tests/metrics/checks). Include at least:
- Build/lint/tests gates (if code)
- A11y focus-visible check (if UI)
- Performance budgets (if perf-sensitive)
