---
description: "Large-Scale Feature Implementation (The 'Enterprise' Protocol)"
---

# 🏢 EPIC FEATURE PROTOCOL

> **TRIGGER:** `/epic-feature`
> **INTERFACE:** You talk to Team Lead only
> **GOAL:** Ship a complex, multi-day feature with full swarm coordination
> **TIME ESTIMATE:** 1-5 days
> **MODE:** Team Lead orchestrates full swarm

---

## 🧠 HOW IT WORKS

```
YOU → Describe the epic
         ↓
TEAM LEAD → Activates ALL main agents
         ↓
PARALLEL SPEC PHASE → PM, UX, Frontend, Arch, Backend, QA, Data, Ops
         ↓
CONSTRAINT PHASE → Converge, resolve conflicts
         ↓
BUILD PHASE → Parallel execution with sync points
         ↓
VERIFY PHASE → Full verification cycle
         ↓
TEAM LEAD → Delivers shipped feature to YOU
```

---

## 📋 PHASE 1: FULL SWARM SUMMONS

**Team Lead summons all main agents with missions:**

| Agent | Mission |
|-------|---------|
| @swarm-pm | "Define user problem, success metrics, scope" |
| @swarm-ux | "Design complete user journey, all flows" |
| @swarm-frontend | "Define UI architecture, performance budget, states" |
| @swarm-arch | "Define system architecture, API contracts, ADRs" |
| @swarm-backend | "Define data model, business logic, integrity rules" |
| @swarm-qa | "Define test strategy, critical paths, edge cases" |
| @swarm-data | "Define metrics, event schema, experiment design" |
| @swarm-ops | "Define deployment strategy, observability, rollback" |
| @swarm-sec | "Threat model, security requirements" (if auth/data) |

**All run in PARALLEL where possible.**

---

## 📋 PHASE 2: SPEC COMPILATION

**Team Lead compiles outputs:**

1. Collect all agent outputs
2. Run controlled redundancy checks:
   - Frontend API Shape ↔ Backend API Contract
   - UX Edge Cases ↔ QA Sad Paths
   - PM Success Metrics ↔ Data Metrics Definition
3. Identify conflicts
4. Resolve using Hierarchy of Value
5. Document resolved spec

**Output:** Compiled Epic Specification

---

## 📋 PHASE 3: DECOMPOSITION

**Team Lead decomposes into workstreams:**

```
Epic: [Name]
├── Workstream A: [Domain 1] → @swarm-frontend
│   ├── Ticket A-1: [Component 1]
│   ├── Ticket A-2: [Component 2]
│   └── Ticket A-3: [Component 3]
│
├── Workstream B: [Domain 2] → @swarm-backend
│   ├── Ticket B-1: [API 1]
│   └── Ticket B-2: [Data Model]
│
├── Workstream C: [Domain 3] → @swarm-ops
│   └── Ticket C-1: [CI/CD Updates]
│
└── Sync Points:
    ├── Sync 1: After A-1 + B-1 → Integration test
    └── Sync 2: After all → Full QA cycle
```

---

## 📋 PHASE 4: PARALLEL BUILD

**Team Lead coordinates parallel execution:**

| Day | Morning | Afternoon |
|-----|---------|-----------|
| 1 | @swarm-backend: API skeleton | @swarm-frontend: Component scaffold |
| 2 | @swarm-backend: Business logic | @swarm-frontend: UI implementation |
| 3 | Integration sync | @swarm-qa: Test suite |
| 4 | Bug fixes | @swarm-ops: Deployment prep |
| 5 | Final QA | Ship |

**Sync points enforced. Dependencies tracked.**

---

## 📋 PHASE 5: VERIFICATION

**Team Lead runs full verification:**

| Check | Owner | Gate |
|-------|-------|------|
| Build | @swarm-dev | Must pass |
| Lint | @swarm-dev | Must pass |
| Unit tests | @swarm-qa | Must pass |
| Integration tests | @swarm-qa | Must pass |
| E2E critical paths | @swarm-qa | Must pass |
| Performance budget | @swarm-frontend | Must pass |
| Security review | @swarm-sec | Must pass |
| Accessibility | @swarm-qa | Must pass |

---

## 📋 PHASE 6: SHIP

**Team Lead coordinates release:**

1. @swarm-ops executes deployment plan
2. Canary rollout (if applicable)
3. Monitor for 15 min
4. Full rollout
5. Post-deploy metrics check

**Final output to YOU:**
```markdown
## 🚀 EPIC SHIPPED

**Epic:** [Name]
**Duration:** [X days]
**Agents Deployed:** [List]

### Delivered
- [Feature 1]
- [Feature 2]
- [Feature N]

### Key Decisions
1. [Decision]: [Rationale]

### Metrics
- Success metric baseline: [X]
- To be measured: [After Y days]

### How to Access
[URL or instructions]

**Status:** LIVE ✅
```

---

## 🔄 DAILY STANDUPS (Automated)

Team Lead generates daily status:

```markdown
## 📊 EPIC STATUS: Day [N]

### Completed
- [✅] Ticket A-1
- [✅] Ticket B-1

### In Progress
- [🔄] Ticket A-2 (ETA: today)
- [🔄] Ticket C-1 (blocked on B-2)

### Blockers
- [🚫] B-2 requires API from external team

### Today's Focus
1. Complete A-2
2. Unblock B-2

### Sync Point
- Next sync: Tomorrow after A-2 + B-2
```

---

## 🚨 ESCALATION TRIGGERS

Team Lead escalates to YOU if:

- [ ] External dependency unmet
- [ ] Scope significantly larger than estimated
- [ ] Security issue discovered
- [ ] Technical impossibility found
- [ ] Business decision required

---

## ⏱️ TIME BUDGET BY SIZE

| Epic Size | Duration | Agents |
|-----------|----------|--------|
| Small | 1-2 days | 3-4 |
| Medium | 2-3 days | 5-6 |
| Large | 3-5 days | Full swarm |

---

**Workflow Version:** 4.0.0-HIERARCHICAL
**Last Updated:** 2026-02-06
