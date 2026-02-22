---
description: "High-Velocity Feature Implementation (The 'Sprint Killer')"
---

# ⚡ STANDARD FEATURE PROTOCOL

> **TRIGGER:** `/standard-feature`
> **INTERFACE:** You talk to Team Lead only
> **GOAL:** Ship a routine feature with zero regression in <1 day
> **TIME ESTIMATE:** 75 min
> **MODE:** Team Lead ruthlessly delegates

---

## 🧠 HOW IT WORKS

```
YOU → Tell Team Lead what you want
         ↓
TEAM LEAD → Parses intent, deploys agents in parallel
         ↓
MAIN AGENTS → Invoke subagents, compile outputs
         ↓
TEAM LEAD → Verifies, compiles, delivers result to YOU
```

**You never interact with individual agents. Team Lead handles everything.**

---

## 🚨 PRE-FLIGHT CHECKS (Team Lead Runs Automatically)

- [ ] Feature request is clear and specific
- [ ] No active incidents on the codebase
- [ ] Required context available

---

## 📋 Workflow Steps

### STEP 1: SCOPE LOCK (5 min)
**Team Lead delegates to:** @swarm-pm

**Mission assigned:**
> "Define clear, testable scope. Apply MVP Razor. Write user story with 3-5 binary ACs."

**PM subagents activated:**
- Requirements/User Story Writer
- Acceptance Criteria Author

**Gate:** PM outputs `[GO / NO-GO]`

---

### STEP 2: PIXEL PERFECT (10 min)
**Team Lead delegates to:** @swarm-ux + @swarm-frontend (PARALLEL)

**Missions assigned:**

To @swarm-ux:
> "Design user flow, define all 5 UI states (default, loading, error, empty, success)"

To @swarm-frontend:
> "Review feasibility, define component architecture, set performance budget"

**Subagents activated:**
- UX: User Flow Designer, Usability Edge-Case Reviewer
- Frontend: UI Architecture Designer, Error/Empty/Loading State Designer

**Gate:** Both output `[SPEC COMPLETE]`

---

### STEP 3: BLUEPRINT (5 min)
**Team Lead delegates to:** @swarm-arch

**Mission assigned:**
> "Identify reusable patterns, define data flow, apply Ockham Protocol"

**Constraint passed:** If solution requires >3 new files → REJECT and simplify

**Subagents activated:**
- System Boundary Validator

**Output:** Technical approach (max 10 lines)

---

### STEP 4: SURGICAL BUILD (30 min)
**Team Lead delegates to:** @swarm-dev (or @swarm-backend + @swarm-frontend if needed)

**Mission assigned:**
> "Implement feature. READ files first. TEST first. Satisfy ACs only. Zero bloat."

**Hard Rules Enforced:**
- `<input type="date">` for dates
- Imports at TOP only
- NO `any` types
- NO `console.log`

**Subagents activated:**
- Vertical Slice Builder
- Cross-Layer Consistency Checker

**Automatic verification:**
```bash
npm run build && npm run lint && npm run test
```

---

### STEP 5: DESTRUCTIVE QA (15 min)
**Team Lead delegates to:** @swarm-qa

**Mission assigned:**
> "Prove it breaks. Test: null, undefined, '', rapid clicks, 320px, XSS, SQL injection."

**Subagents activated:**
- Edge-Case/Sad-Path Designer
- Accessibility Tester
- Automated Test Author

**Gate:** QA outputs `[PASS / WARN / FAIL]`
- If `FAIL` → Routes back to Dev with specific bug list

---

### STEP 6: ZERO-DEFECT VERIFICATION (MANDATORY)
**Team Lead verifies:**

```bash
npm run build && npm run lint && npm run test
```

**All must pass. No exceptions.**

---

### STEP 7: SHIP
**Team Lead delegates to:** @swarm-ops (if deployment needed)

**Mission assigned:**
> "Clean up, merge, monitor 15 min post-deploy"

**Subagents activated:**
- CI/CD Pipeline Manager
- Release Safety Validator

**Final output to YOU:**
```markdown
## ✅ DONE

**Feature:** [Name]
**Result:** [What was delivered]
**Files Changed:** [List]
**Verified:** Build ✅ | Lint ✅ | Test ✅
**How to see it:** [URL or steps]
```

---

## 🚪 EXIT CRITERIA (NON-NEGOTIABLE)

| Check | Required |
|-------|----------|
| All Acceptance Criteria met | ✅ |
| All UI states defined | ✅ |
| Error handling complete | ✅ |
| Build passes | ✅ |
| Tests pass | ✅ |
| No lint errors | ✅ |
| Mobile responsive | ✅ |
| Verification report delivered | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target | Owner |
|------|--------|-------|
| Scope Lock | 5 min | @swarm-pm |
| UX/FE Spec | 10 min | @swarm-ux + @swarm-frontend |
| Blueprint | 5 min | @swarm-arch |
| Build | 30 min | @swarm-dev |
| QA | 15 min | @swarm-qa |
| Verification | 5 min | Team Lead |
| Ship | 5 min | @swarm-ops |
| **TOTAL** | **75 min** | |

---

## 🎯 TEAM LEAD CONTROLS EVERYTHING

| What You Do | What Team Lead Does |
|-------------|---------------------|
| Describe the feature | Parses your intent |
| Wait | Deploys agents in parallel |
| Wait | Compiles and verifies outputs |
| Receive result | Delivers concise summary |

**You don't need to know which agent does what.**
**Team Lead figures it out.**

---

**Workflow Version:** 4.0.0-HIERARCHICAL
**Last Updated:** 2026-02-06
