---
description: "Autonomous Feature Discovery & Implementation (The 'Skunkworks' Protocol)"
---

# 🔬 DISCOVERY PROTOCOL

> **TRIGGER:** `/discovery-protocol`
> **INTERFACE:** You talk to Team Lead only
> **GOAL:** Explore vague problem space → Discover solution → Build MVP
> **TIME ESTIMATE:** 2-4 hours exploration, then implementation
> **MODE:** Team Lead runs autonomous discovery

---

## 🧠 HOW IT WORKS

```
YOU → "We need better [vague thing]" or "Explore [problem space]"
         ↓
TEAM LEAD → Deploys discovery agents
         ↓
PARALLEL EXPLORATION → PM, UX, Analyst, Arch
         ↓
SYNTHESIS → Converge findings into options
         ↓
DECISION MATRIX → Present options to YOU
         ↓
YOU → Pick direction
         ↓
TEAM LEAD → Executes as /standard-feature or /epic-feature
```

---

## 📋 PHASE 1: PROBLEM FRAMING (30 min)

**Team Lead delegates in parallel:**

| Agent | Mission |
|-------|---------|
| @swarm-pm | "What user pain might this solve? Who's affected?" |
| @swarm-analyst | "What data do we have? What patterns exist?" |
| @swarm-ux | "How do users cope today? What's the friction?" |
| @swarm-arch | "What's technically possible? What are constraints?" |

**Output per agent:**
```yaml
assumptions:
  - "..."
findings:
  - "..."
opportunities:
  - "..."
risks:
  - "..."
```

---

## 📋 PHASE 2: OPPORTUNITY SYNTHESIS (20 min)

**Team Lead compiles findings into opportunities:**

```markdown
## 🔍 DISCOVERY FINDINGS

### Problem Space
[Summary of the vague problem]

### User Pain Points
1. [Pain 1] - Severity: HIGH/MED/LOW
2. [Pain 2] - Severity: HIGH/MED/LOW
3. [Pain 3] - Severity: HIGH/MED/LOW

### Existing Data
- [Finding from analytics]
- [Pattern observed]

### Technical Context
- [Constraint 1]
- [Opportunity 1]

### Opportunities Identified
1. **[Opportunity A]**: [Description]
2. **[Opportunity B]**: [Description]
3. **[Opportunity C]**: [Description]
```

---

## 📋 PHASE 3: OPTION DEVELOPMENT (40 min)

**Team Lead has agents develop top 2-3 options:**

For each opportunity:

| Agent | Contribution |
|-------|--------------|
| @swarm-pm | User story, success metric |
| @swarm-ux | Quick wireframe, flow |
| @swarm-arch | Effort estimate, feasibility |
| @swarm-frontend | UI complexity assessment |

**Output: Decision Matrix**

```markdown
## 📊 DECISION MATRIX

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| User value | High | Medium | High |
| Effort | 2 days | 5 days | 3 days |
| Risk | Low | Medium | Low |
| Learning | Low | High | Medium |
| Dependencies | None | External API | None |
| **Score** | **8/10** | **5/10** | **7/10** |

### Recommendation
**Option A** - Best value/effort ratio with lowest risk.

### Trade-offs
- Option B would give more data but takes 2.5x longer
- Option C is safer but slightly less impactful
```

---

## 📋 PHASE 4: DECISION POINT

**Team Lead presents to YOU:**

```markdown
## 🎯 DISCOVERY COMPLETE

**Original Question:** "[Your vague request]"

**We Found:**
1. [Key insight 1]
2. [Key insight 2]
3. [Key insight 3]

**Recommended Path:** Option A
**Effort:** ~2 days
**Expected Outcome:** [Measurable result]

**Alternatives:**
- Option B: [Trade-off]
- Option C: [Trade-off]

**Your Decision Needed:**
- [ ] Go with Option A
- [ ] Prefer Option B/C
- [ ] Need more exploration
- [ ] Abort - not worth it
```

---

## 📋 PHASE 5: EXECUTION

Based on your decision:

| Decision | Action |
|----------|--------|
| Option approved | Route to `/standard-feature` or `/epic-feature` |
| More exploration | Run targeted discovery on specific question |
| Abort | Document learnings, close |

---

## 🎯 DISCOVERY SUBAGENT ACTIVATION

| Phase | Subagents Activated |
|-------|---------------------|
| Problem Framing | PM: User Research Analyst |
| | Analyst: Root Cause Analyst |
| | UX: User Flow Designer |
| | Arch: System Boundary Validator |
| Option Development | PM: Prioritization Analyst |
| | UX: Wireframe Designer |
| | Frontend: UI Architecture Designer |
| | Arch: Failure Mode Analyst |

---

## 🚨 ABORT CONDITIONS

Team Lead aborts discovery if:

- [ ] No clear user pain found
- [ ] Technical impossibility confirmed
- [ ] Scope exceeds available resources
- [ ] Better solution already exists
- [ ] Problem is organizational, not technical

---

## ⏱️ TIME BUDGET

| Phase | Target |
|-------|--------|
| Problem Framing | 30 min |
| Synthesis | 20 min |
| Option Development | 40 min |
| Decision Point | 10 min |
| **TOTAL DISCOVERY** | **~2 hours** |

Then execution time depends on selected option.

---

**Workflow Version:** 4.0.0-HIERARCHICAL
**Last Updated:** 2026-02-06
