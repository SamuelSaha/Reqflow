---
description: "Strategic Refactoring (The 'Scalpel')"
---

# 🧹 SMART REFACTOR PROTOCOL

> **TRIGGER:** `/smart-refactor`
> **GOAL:** Pay down tech debt without stopping the world or introducing regressions.
> **SQUAD:** Director → Analyst → Architect → Perf → Dev → QA → DevOps
> **MODE:** Strangler Fig (piece by piece replacement)
> **TIME ESTIMATE:** Variable (depends on scope)

---

## 🎯 Quick Summary
This workflow implements strategic refactoring using the Strangler Fig pattern—wrapping old code in new interfaces and replacing piece by piece. It ensures zero behavioral changes, no performance degradation, and no feature modifications during the refactor.

---

## 🚨 PRE-FLIGHT CHECKS

Before refactoring:
- [ ] Is this refactor necessary? (Answer: "What breaks if we don't?")
- [ ] Is there test coverage? (If <50%, write tests FIRST)
- [ ] Is there a deadline? (Never refactor before a launch)

---

## 📋 Workflow Steps

### STEP 1: DEBT ANALYSIS (10 min)
**Relevant Expertise:** Code Analysis, Technical Debt Assessment, Architecture Review

**Description:**
Analyze the technical debt to understand what specifically is wrong, measure the pain it causes, and define the target interface.

**Analysis Questions:**
1. **Locate the Spaghetti:** What specifically is wrong?
2. **Measure the Pain:** How often does this cause bugs/slowdowns?
3. **Define the Interface:** What should it look like post-refactor?

**Strangler Fig Strategy:**
- Don't rewrite all at once
- Wrap old code in new interface
- Replace piece by piece
- Delete old code when 100% migrated

**Turbo:**
```bash
# Find code complexity hotspots
wc -l src/**/*.ts | sort -n -r | head -20
```

**Output:** `## Refactor Target: [Component/Module]`

**Exit Criteria:**
- Debt location identified
- Pain measured
- Target interface defined
- Strangler strategy confirmed

---

### STEP 2: PERFORMANCE BASELINE (5 min)
**Relevant Expertise:** Performance Measurement, Metrics Collection, Benchmarking

**Description:**
Measure performance BEFORE refactoring to ensure no degradation occurs.

**Baseline Metrics:**
1. Bundle size (if frontend)
2. API latency (if backend)
3. Memory usage (if applicable)
4. Test execution time

**Turbo:**
```bash
npm run build && du -sh .next/ 2>/dev/null || du -sh dist/
```

**CONSTRAINT:** Refactor must NOT degrade performance.

**Output:** `## Baseline Metrics` table

**Exit Criteria:**
- All relevant metrics captured
- Baseline documented
- Degradation threshold defined

---

### STEP 3: THE REWRITE (Variable)
**Relevant Expertise:** Refactoring Patterns, Test-Driven Refactoring, Code Quality

**Description:**
Execute the refactor using safe patterns with continuous testing and small commits.

**MANDATORY PRE-CHECKS:**
```bash
# Ensure test coverage exists
npm run test -- --coverage 2>/dev/null || echo "Add coverage check"
```

**Safe Refactor Protocol:**
1. **Surround with tests** (if not already covered)
2. **Small commits** (one logical change per commit)
3. **Run tests after EVERY change**
4. **No behavior changes** (same inputs = same outputs)

**Refactor Patterns:**

| Pattern | When to Use |
|---------|-------------|
| Extract Function | Logic repeated 3+ times |
| Rename Variable | Name doesn't explain intent |
| Inline Function | Wrapper adds no value |
| Replace Conditional with Polymorphism | >3 if/else on same type |
| Move to Module | Function doesn't belong here |

**HARD RULES:**
- NO feature changes during refactor
- NO dependency upgrades during refactor
- Commit message: `refactor: [what changed]`

**Turbo:**
```bash
npm run test && npm run lint
```

**Output:** Refactored code with passing tests

**Exit Criteria:**
- Tests surround changes
- Commits small and logical
- Tests run after each change
- No behavior changes

---

### STEP 4: PARITY CHECK (10 min)
**Relevant Expertise:** Behavioral Testing, Regression Testing, Edge Case Validation

**Description:**
Verify that new code behaves exactly like old code with comprehensive parity testing.

**Parity Verification:**
1. Does new code behave EXACTLY like old code?
2. Same inputs → Same outputs?
3. Edge cases still handled?

**Regression Suite:**
- Run full test suite
- Manually test critical paths
- Check: nulls, undefined, empty states

**Turbo:**
```bash
npm run test:e2e
```

**GATE:** QA outputs `[PASS / FAIL]`

**Exit Criteria:**
- Behavioral parity confirmed
- Same inputs → same outputs
- Edge cases handled
- Critical paths tested

---

### STEP 5: METRICS CHECK (5 min)
**Relevant Expertise:** Performance Comparison, Metrics Analysis

**Description:**
Compare post-refactor metrics to baseline to ensure no degradation.

**Metrics Comparison:**

| Metric | Before | After | Verdict |
|--------|--------|-------|---------|
| Bundle size | [X] | [Y] | ✅/❌ |
| Latency | [X] | [Y] | ✅/❌ |
| Test time | [X] | [Y] | ✅/❌ |

**CONSTRAINT:** If ANY metric is worse, explain why or revert.

**Output:** Metrics comparison report

**Exit Criteria:**
- All metrics compared
- No degradation (or justified)
- Verdict: GO or REVERT

---

### STEP 6: ZERO-DEFECT VERIFICATION (MANDATORY)
**Relevant Expertise:** Build Verification, Quality Gates

**Description:**
Run complete verification to prove behavior is identical and quality is maintained.

**Verification Required:**

**Turbo:**
```bash
npm run build && npm run lint && npm run test
```

**Output required:**
```markdown
## ✅ VERIFICATION REPORT
**Build:** ✅ Passed
**Lint:** ✅ Passed
**Tests:** ✅ All tests pass (same as before refactor)
**Behavior:** ✅ Identical (same inputs → same outputs)
**Performance:** ✅ Not degraded (see metrics table)
```

**GATE:** ALL checks must pass.

**Exit Criteria:**
- Build passes
- Lint passes
- Tests pass
- Behavior identical
- Performance not degraded

---

### STEP 7: CLEANUP (5 min)
**Relevant Expertise:** Code Cleanup, Dead Code Removal, Documentation

**Description:**
Remove old implementation if Strangler pattern is complete, remove dead code, and update documentation.

**Cleanup Tasks:**
1. **Delete old implementation** (if strangler pattern complete)
2. **Remove dead code** (grep for unused exports)
3. **Update documentation** (if API changed)

**Turbo:**
```bash
# Find potentially unused exports
grep -r "export" src/ | wc -l
```

**Commit:** `refactor: [Component] - [Impact Summary]`

**Output:** Clean codebase with updated docs

**Exit Criteria:**
- Old code removed (if migrated)
- Dead code removed
- Documentation updated
- Commit follows convention

---

## 📊 EXIT CRITERIA

| Check | Required |
|-------|----------|
| All tests pass | ✅ |
| Performance not degraded | ✅ |
| No behavior changes | ✅ |
| Dead code removed | ✅ |
| Commit messages follow convention | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Analysis | 10 min |
| Baseline | 5 min |
| Rewrite | Variable (depends on scope) |
| Parity | 10 min |
| Metrics | 5 min |
| Cleanup | 5 min |
| **TOTAL** | **Variable** |

---

## 🚨 ABORT CONDITIONS

STOP refactoring immediately if:
- Test coverage drops
- Performance degrades unexpectedly
- Scope grows beyond original target
- You're fighting the framework

**Recovery:** `git stash && git checkout main`

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Debt Analysis | `@swarm-analyst` | `@swarm-arch` | Code analysis |
| 2: Baseline | `@swarm-ops` | `@swarm-dev` | Performance measurement |
| 3: Rewrite | `@swarm-dev` | `@swarm-qa` | Refactoring patterns |
| 4: Parity Check | `@swarm-qa` | `@swarm-dev` | Behavioral testing |
| 5: Metrics | `@swarm-ops` | `@swarm-dev` | Performance comparison |
| 6: Verification | `@swarm-dev` | `@swarm-qa` | Quality gates |
| 7: Cleanup | `@swarm-ops` | `@swarm-dev` | Code maintenance |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/feedback-ingestion` → When code quality issues identified
- Continuous → Scheduled tech debt sprints
- `/discovery-protocol` → When architecture improvements identified

**This Workflow Triggers:**
- `/standard-feature` → If refactor reveals needed features
- `/launch-protocol` → If changes need deployment

**Related Workflows:**
- Preceded by: Any workflow identifying tech debt
- Leads to: Verification and deployment
- Alternative: Sometimes better to use `/epic-feature` for major rewrites

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  SMART REFACTOR PROGRESS                                │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/7: Debt Analysis          │
│  [░░░░░░░░░░░░░░░░░░] Step 2/7: Performance Baseline   │
│  [░░░░░░░░░░░░░░░░░░] Step 3/7: The Rewrite            │
│  [░░░░░░░░░░░░░░░░░░] Step 4/7: Parity Check           │
│  [░░░░░░░░░░░░░░░░░░] Step 5/7: Metrics Check          │
│  [░░░░░░░░░░░░░░░░░░] Step 6/7: Zero-Defect Verification│
│  [░░░░░░░░░░░░░░░░░░] Step 7/7: Cleanup                │
├─────────────────────────────────────────────────────────┤
│  Target: [Component]    │  Parity: [Status]            │
│  Scope: [Size]          │  Performance: [Status]       │
│  Progress: [XX%]        │  Abort Risk: [Y/N]           │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Debt Analysis | `@swarm-analyst` + `@swarm-arch` identify real vs. perceived debt | Refactoring unnecessary code, missing real issues |
| 2: Baseline | `@swarm-ops` captures accurate performance metrics | Undetected performance regressions |
| 3: Rewrite | `@swarm-dev` applies safe refactoring patterns | Breaking changes, introducing bugs |
| 4: Parity Check | `@swarm-qa` verifies behavioral equivalence | Silent behavioral changes, regressions |
| 5: Metrics | `@swarm-ops` compares before/after objectively | Subjective "feels faster/slower" |
| 6: Verification | `@swarm-dev` ensures all quality gates pass | Incomplete refactoring merged |
| 7: Cleanup | `@swarm-ops` removes dead code systematically | Accumulating technical debt |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Debt analysis started | T+0 | Complexity hotspots identified |
| Baseline captured | T+10min | All metrics recorded |
| Rewrite started | T+15min | Test coverage verified |
| 25% rewrite complete | T+variable | Tests still passing |
| 50% rewrite complete | T+variable | No behavior changes detected |
| 75% rewrite complete | T+variable | Pattern consistency maintained |
| Rewrite complete | T+variable | All tests passing |
| Parity check | T+variable+10min | Behavioral equivalence confirmed |
| Metrics check | T+variable+15min | Performance not degraded |
| Verification complete | T+variable+20min | All gates passed |
| Cleanup complete | T+variable+25min | Old code removed |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Analyst + Architect → Ops
- **Trigger:** Debt analysis complete
- **Deliverable:** Refactor target with strangler strategy
- **Receiver Action:** Capture performance baseline

### Handoff 2: Ops → Dev
- **Trigger:** Baseline captured
- **Deliverable:** Performance metrics table
- **Receiver Action:** Begin safe refactor

### Handoff 3: Dev → QA (Continuous)
- **Trigger:** Each logical commit
- **Deliverable:** Code change
- **Receiver Action:** Verify tests still pass

### Handoff 4: Dev → QA (Final)
- **Trigger:** Rewrite complete
- **Deliverable:** Refactored code
- **Receiver Action:** Run parity check

### Handoff 5: QA → Ops
- **Trigger:** Parity confirmed
- **Deliverable:** Behavioral equivalence report
- **Receiver Action:** Compare metrics to baseline

### Handoff 6: Ops → Dev
- **Trigger:** Metrics compared
- **Deliverable:** Performance comparison
- **Receiver Action:** Run verification gates

### Handoff 7: Dev → Ops
- **Trigger:** Verification passed
- **Deliverable:** Verified refactor
- **Receiver Action:** Cleanup old code

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Strangler Fig Pattern | Safer than big-bang rewrite | Zero-downtime refactoring |
| Test Coverage Pre-Check | Can't safely refactor without tests | Prevents breaking changes |
| No Feature Changes Rule | Refactor != feature work | Prevents scope creep |
| Small Commits | Easier to bisect issues | Faster debugging if problems arise |
| Parity Check Required | Prove behavior identical | No silent regressions |
| Performance Constraint | Refactor shouldn't make things worse | User experience protected |
| Abort Conditions Defined | Know when to stop | Prevents digging deeper into bad refactor |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
