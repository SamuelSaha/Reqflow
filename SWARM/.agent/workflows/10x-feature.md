---
description: "Feature Optimization & Multiplication (The '10x' Protocol)"
---

# 🚀 10X FEATURE PROTOCOL

> **TRIGGER:** `/10x-feature <feature_name>`
> **OUTPUT:** One "10x bet" shipped + measured, or killed fast with evidence.
> **GOLDEN RULE:** 10x comes from **ONE main lever**, not 8 mediocre upgrades.
> **MODE:** Hypothesis-Driven with Kill Gates

---

## 🎯 Quick Summary
This workflow identifies and implements a single high-impact optimization that can deliver 10x improvement on one KPI. It uses hypothesis-driven bets, rapid validation, and kill criteria to avoid wasted effort on ineffective changes.

---

## 🚨 ENTRY CRITERIA

**You can start this protocol if you can answer:**
```
/10x Feature: ____
KPI: ____
Baseline: ____
Segment: ____
Bottleneck: ____
Ship deadline: ____
```

**If you CAN'T name metric + baseline in 60 seconds:**
→ Start with **Instrumentation Sprint** first (Step 1)

---

## 📋 Workflow Steps

### STEP 1: SCOPE LOCK (15 min)
**Relevant Expertise:** KPI Selection, Baseline Definition, Focus Management

**Description:**
Choose exactly 1 KPI to optimize and define "10x" precisely with baseline and target numbers.

**KPI Options (Choose 1):**
- Activation
- Conversion
- Retention
- ARPA (Average Revenue Per Account)
- Time-to-Value
- Latency

**Define "10x" precisely:**
```
KPI_target = KPI_baseline × 10
```
(For time metrics: 10x faster)

**Define user segment:** Who exactly benefits? (ICP slice)

**Turbo:**
```bash
# Check existing analytics
grep -r "trackEvent\|analytics" src/ | head -10
```

**Output:** `10x Brief (1 page)` with:
- Single KPI
- Baseline number
- Target number
- User segment
- Hard deadline

**Exit Criteria:**
- 1 KPI selected
- Baseline measured
- Target calculated (10x)
- User segment defined
- Deadline set

---

### STEP 2: BASELINE + INSTRUMENTATION (30 min)
**Relevant Expertise:** Analytics Implementation, Metric Tracking, Funnel Analysis

**Description:**
Measure current state and add missing tracking to ensure you can detect changes.

**Measurement Tasks:**
1. Current KPI value
2. Funnel step performance
3. Latency percentiles (p50, p95)

**Map the constraint:**
- Find THE ONE bottleneck (where value dies)
- Top 3 drop-off points

**Add missing tracking:**
- Events for user actions
- Timing spans for latency
- Cohort tags for segmentation

**Turbo:**
```bash
# Check instrumentation coverage
grep -r "console.time\|performance.mark" src/ | wc -l
```

**Output:** `Baseline Report` + `Metric Tree` + Top 3 bottlenecks

**GATE:** Can you answer "what changed?" within 2 minutes from logs?
- If NO → Add more instrumentation
- If YES → Proceed

**Exit Criteria:**
- Baseline documented
- Funnel mapped
- Bottlenecks identified
- Tracking sufficient to detect changes

---

### STEP 3: ROOT CAUSE DIAGNOSIS (20 min)
**Relevant Expertise:** Root Cause Analysis, Five Whys, Failure Mode Classification

**Description:**
Use 5 Whys to identify the root cause of the #1 bottleneck and classify the failure mode.

**5 Whys Analysis:**
1. Why do users drop here?
2. Why [cause 1]?
3. Why [cause 2]?
4. Why [cause 3]?
5. **ROOT CAUSE:** [single sentence]

**Failure Mode Classification:**

| Mode | Description |
|------|-------------|
| Friction | Too many steps |
| Confusion | UI unclear |
| Mistrust | Users don't believe us |
| Missing | Feature doesn't exist |
| Slow | Takes too long |
| Cost | Too expensive |

**Quantify the loss:**
- Users lost at this point: [X]
- Revenue lost: $[Y]/month
- Time wasted: [Z] hours/user

**Output:** Root Cause Statement (testable, single lever)

**Exit Criteria:**
- 5 Whys completed
- Root cause identified
- Failure mode classified
- Loss quantified

---

### STEP 4: 10X BETS (30 min)
**Relevant Expertise:** Ideation, Solution Design, Impact Assessment

**Description:**
Generate 10 bets across 3 levers (Remove Work, Collapse Steps, Increase Certainty). Focus on transformative changes, not polish.

**Three Levers:**

#### Lever 1: Remove Work
- Automate manual steps
- Set smart defaults
- Delete unnecessary features

#### Lever 2: Collapse Steps
- Fewer decisions
- Fewer screens
- Fewer form fields

#### Lever 3: Increase Certainty
- Show previews before commit
- Add proof/validation
- Provide guarantees

**Bet Format:**
```
Bet: [What changes]
Mechanism: [Why it moves KPI]
Risk: [What could fail]
Test: [Smallest proof]
```

**Turbo:**
```bash
# Find complexity hotspots
find src -name "*.tsx" -exec wc -l {} \; | sort -n -r | head -10
```

**Output:** 10 Bets Backlog

**CHECK:** At least 3 bets should be "remove entire workflow" level, not polish

**Exit Criteria:**
- 10 bets generated
- Spread across 3 levers
- At least 3 "remove workflow" level bets
- Each bet has mechanism, risk, and test defined

---

### STEP 5: AI LAYER (Optional - 20 min)
**Relevant Expertise:** AI Integration, LLM Design, Guardrail Architecture

**Description:**
*Optional: Add AI only if it removes user effort or uncertainty. No "AI because AI".

**AI Role Selection:**
- Autofill (pre-populate fields)
- Recommend (suggest next action)
- Predict (forecast outcomes)
- Generate (create content)
- Verify (check correctness)
- Guardrail (prevent errors)

**Define evaluation:**
- Offline test set
- Success threshold
- Failure handling (fallback)
- Kill threshold (max error rate)

**Output:** AI Spec (inputs, outputs, guardrails, fallback)

**Exit Criteria:**
- AI role justified (removes effort/uncertainty)
- Test set defined
- Thresholds set
- Fallback designed

---

### STEP 6: PRIORITIZATION (15 min)
**Relevant Expertise:** Prioritization Frameworks, ROI Assessment, Risk Management

**Description:**
Score each bet on lift, time, reversibility, and risk. Pick 1 primary bet (ship in 48h) and 1 backup bet.

**Scoring Matrix:**

| Bet | Lift | Time | Reversible | Risk | Score |
|-----|------|------|------------|------|-------|
| A | [1-10] | [hours] | [Y/N] | [H/M/L] | [calc] |
| B | [1-10] | [hours] | [Y/N] | [H/M/L] | [calc] |

**Selection:**
- 1 Primary Bet (ship in 48h)
- 1 Backup Bet (if primary fails)

**Kill Criteria:**
```
IF KPI_lift < X% after 7 days → KILL this bet
```

**Output:** Chosen Bet + Kill Criteria + Rollback Plan

**Exit Criteria:**
- All bets scored
- Primary bet selected
- Backup bet identified
- Kill criteria defined
- Rollback plan ready

---

### STEP 7: BUILD FAST (2-4 hours)
**Relevant Expertise:** Rapid Implementation, Feature Flags, Experiment Setup

**Description:**
Ship the smallest version that tests the mechanism. No polish unless it affects KPI.

**Build Requirements:**
1. Feature flag ON
2. Gradual rollout ready
3. Logging instrumented
4. Rollback command documented

**NO polish unless it affects KPI.**

**Turbo:**
```bash
# Verify feature flag
grep -r "featureFlag\|FEATURE_" src/ | head -5
npm run build && npm run test
```

**Output:** Release + Experiment Config

**CHECK:** Can you turn it off in 30 seconds?

**Exit Criteria:**
- Feature flag active
- Rollout configured
- Logging in place
- Rollback documented
- Build + test passing

---

### STEP 8: ZERO-DEFECT VERIFICATION (MANDATORY)
**Relevant Expertise:** Build Verification, Quality Gates

**Description:**
No experiment runs on broken code. Run complete verification before launching experiment.

**Turbo:**
```bash
npm run build && npm run lint && npm run test
```

**Output required:**
```markdown
## ✅ VERIFICATION REPORT
**Build:** ✅ Passed
**Lint:** ✅ Passed
**Tests:** ✅ Passed
**Feature Flag:** ✅ Tested ON and OFF
**Rollback:** ✅ 30-second rollback verified
```

**GATE:** ALL checks must pass.

**Exit Criteria:**
- Build passes
- Lint passes
- Tests pass
- Feature flag tested
- Rollback verified

---

### STEP 9: SPEED OPTIMIZATION (30 min)
**Relevant Expertise:** Performance Engineering, Latency Optimization

**Description:**
Only optimize what blocks the KPI. Focus on bottleneck step, not global optimization.

**Performance Targets:**

| Target | Threshold |
|--------|-----------|
| Perceived interaction | <100ms |
| Backend p95 | Defined per feature |
| First Contentful Paint | <1.5s |

**Turbo:**
```bash
# Check bundle size
npm run build && du -sh .next/ 2>/dev/null || du -sh dist/
```

**Output:** Perf Budget + Top 3 Fixes

**CHECK:** Did perf improve at the bottleneck step, not globally?

**Exit Criteria:**
- Performance targets defined
- Bottleneck optimized
- Bundle size checked
- Latency improved at constraint point

---

### STEP 10: UX OPTIMIZATION (30 min)
**Relevant Expertise:** UX Design, Interaction Design, Cognitive Load Reduction

**Description:**
Apply the "Remove 50%" Rule to reduce decisions, clicks, and uncertainty.

**50% Rule Application:**
- Remove 50% of decisions (use defaults)
- Remove 50% of clicks (collapse steps)
- Remove 50% of uncertainty (add previews)

**Measurement:**
- Steps before: [X]
- Steps after: [Y]
- Click count delta: [Z]

**Output:** New Critical Path (step count comparison)

**Exit Criteria:**
- Decisions reduced
- Steps collapsed
- Uncertainty addressed
- New critical path documented

---

### STEP 11: GROWTH LOOP (20 min)
**Relevant Expertise:** Growth Strategy, Viral Design, Habit Formation

**Description:**
Add ONE growth loop max if value is proven. Choose from sharing, habit, or monetization loops.

**Loop Types:**

| Loop Type | Example |
|-----------|---------|
| Sharing | Export, link, embed |
| Habit | Daily trigger, reminder |
| Monetization | Paywall (only if value proven) |

**Loop Definition:**
```
Trigger → Action → Reward → [Back to Trigger]
```

**Output:** Loop Spec + Activation Event

**Exit Criteria:**
- Loop type selected
- Trigger defined
- Action clear
- Reward motivating
- Viral mechanism designed

---

### STEP 12: IMPACT CHECK (30 min)
**Relevant Expertise:** Experiment Analysis, Statistical Significance, Decision Making

**Description:**
Run experiment for 7 days and make clear decision: Scale, Kill, or Iterate (max 2 iterations).

**Experiment Setup:**
- A/B test OR phased rollout
- Cohort comparison
- 7-day measurement period

**Decision Framework:**

| Result | Action |
|--------|--------|
| KPI_lift ≥ target | SCALE to 100% |
| KPI_lift < target/2 | KILL the bet |
| Otherwise | ITERATE (2 max) |

**Output:** Impact Report
- Delta achieved
- Confidence level
- Notes
- Next bet recommendation

**Exit Criteria:**
- Experiment complete
- Impact measured
- Decision made (Scale/Kill/Iterate)
- Next steps defined

---

## 🌿 BRANCHES & EDGE CASES

| Situation | Action |
|-----------|--------|
| Baseline missing | Instrumentation Sprint (4h) → restart Step 1 |
| Lagging KPI (retention/ARR) | Use proxy KPI (time-to-value) for 48h build |
| AI adds risk | Ship rules-based first → add AI behind flag |
| "10x" unrealistic | Redefine to "10x on sub-metric" |

---

## 🔥 KILL LIST (Anti-Patterns)

| Failure | Prevention |
|---------|------------|
| "Improved everything, moved nothing" | Force 1 KPI + 1 bottleneck + 1 bet |
| AI ships without eval, causes trust loss | Step 4 requires thresholds + kill criteria |
| Perf work burns time, no KPI linkage | Optimize bottleneck step only |
| Scope creep | Hard deadline at Step 0 |

---

## 🔁 CONTROL LOOP

```
1. Ship primary bet to 10% of segment
2. Measure: KPI + guardrail (error rate, churn)
3. Threshold: Scale if KPI ≥ X AND guardrail ≤ Y
4. Rule: 2 iterations max, then kill or switch to backup
```

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| Single KPI defined | ✅ |
| Baseline measured | ✅ |
| Primary bet shipped | ✅ |
| Experiment running | ✅ |
| Impact report generated | ✅ |
| Decision made (Scale/Kill/Iterate) | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Scope Lock | 15 min |
| Baseline | 30 min |
| Root Cause | 20 min |
| 10x Bets | 30 min |
| AI Layer | 20 min (optional) |
| Prioritization | 15 min |
| Build | 2-4 hours |
| Verification | 10 min |
| Speed | 30 min |
| UX | 30 min |
| Growth Loop | 20 min |
| Impact Check | 30 min |
| **TOTAL** | **6-8 hours** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Scope Lock | `@swarm-orch` | `@swarm-analyst` | KPI selection |
| 2: Baseline | `@swarm-analyst` | `@swarm-ops` | Instrumentation |
| 3: Root Cause | `@swarm-analyst` | `@swarm-specifier` | 5 Whys analysis |
| 4: 10x Bets | `@swarm-specifier` | `@swarm-ux` | Solution ideation |
| 5: AI Layer | `@swarm-verifier` | `@swarm-arch` | AI integration |
| 6: Prioritization | `@swarm-specifier` | `@swarm-growth` | ROI assessment |
| 7: Build Fast | `@swarm-dev` | `@swarm-qa` | Rapid implementation |
| 8: Verification | `@swarm-dev` | `@swarm-qa` | Quality gates |
| 9: Speed | `@swarm-ops` | `@swarm-dev` | Performance optimization |
| 10: UX | `@swarm-ux` | `@swarm-specifier` | UX optimization |
| 11: Growth Loop | `@swarm-growth` | `@swarm-specifier` | Viral design |
| 12: Impact Check | `@swarm-analyst` | `@swarm-growth` | Experiment analysis |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/feedback-ingestion` → When metrics show opportunity
- `/discovery-protocol` → When 10x opportunity identified
- Strategic planning → Growth initiatives

**This Workflow Triggers:**
- `/standard-feature` → To implement the chosen bet
- `/skill-feature` → If bet requires specialized implementation
- `/progressive-rollout` → To deploy the experiment

**Related Workflows:**
- Preceded by: Feedback or discovery identifying opportunity
- Leads to: Implementation + rollout
- Parallel: Monitoring and optimization can overlap

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  10X FEATURE PROTOCOL PROGRESS                          │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/12: Scope Lock            │
│  [░░░░░░░░░░░░░░░░░░] Step 2/12: Baseline + Inst       │
│  [░░░░░░░░░░░░░░░░░░] Step 3/12: Root Cause            │
│  [░░░░░░░░░░░░░░░░░░] Step 4/12: 10x Bets              │
│  [░░░░░░░░░░░░░░░░░░] Step 5/12: AI Layer (Opt)        │
│  [░░░░░░░░░░░░░░░░░░] Step 6/12: Prioritization        │
│  [░░░░░░░░░░░░░░░░░░] Step 7/12: Build Fast            │
│  [░░░░░░░░░░░░░░░░░░] Step 8/12: Verification          │
│  [░░░░░░░░░░░░░░░░░░] Step 9/12: Speed Opt             │
│  [░░░░░░░░░░░░░░░░░░] Step 10/12: UX Opt               │
│  [░░░░░░░░░░░░░░░░░░] Step 11/12: Growth Loop          │
│  [░░░░░░░░░░░░░░░░░░] Step 12/12: Impact Check         │
├─────────────────────────────────────────────────────────┤
│  KPI: [Name]            │  Baseline: [X]  Target: [Y]   │
│  Bottleneck: [Name]     │  Bets Generated: [N]          │
│  Primary Bet: [Status]  │  Impact: [Result]             │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Scope Lock | `@swarm-orch` maintains focus on single KPI | Trying to optimize everything, achieving nothing |
| 2: Baseline | `@swarm-analyst` knows what to measure and how | No way to detect if changes worked |
| 3: Root Cause | `@swarm-analyst` finds the real bottleneck, not symptoms | Fixing symptoms while root cause persists |
| 4: 10x Bets | `@swarm-specifier` generates transformative ideas, not tweaks | 10% improvements instead of 10x breakthroughs |
| 5: AI Layer | `@swarm-verifier` validates AI appropriateness objectively | AI added for hype, not utility |
| 6: Prioritization | `@swarm-specifier` uses disciplined scoring frameworks | Subjective picks, wasted effort on low-impact bets |
| 7: Build Fast | `@swarm-dev` ships minimal testable versions | Perfectionism delays validation |
| 8: Verification | `@swarm-dev` ensures code quality before experiment | Invalid experiments on broken code |
| 9: Speed | `@swarm-ops` optimizes bottleneck specifically | Wasted time on non-constraint optimizations |
| 10: UX | `@swarm-ux` applies systematic reduction frameworks | Incremental improvements, not transformative UX |
| 11: Growth Loop | `@swarm-growth` designs viral mechanics | Missed viral growth opportunities |
| 12: Impact Check | `@swarm-analyst` runs rigorous experiments | Subjective "feels better" assessments |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| KPI selected | T+0 | Single metric identified |
| Baseline captured | T+15min | Current value documented |
| Tracking complete | T+45min | Can detect changes in 2 min |
| Root cause identified | T+65min | 5 Whys complete |
| Bets generated | T+95min | 10 bets across 3 levers |
| Primary bet selected | T+110min | Scoring complete |
| Build started | T+125min | Feature flag created |
| Build complete | T+4hr | Tests passing |
| Verification complete | T+4hr10min | All gates passed |
| Experiment launched | T+4.5hr | 10% traffic exposed |
| 7-day mark | T+7 days | Impact measured |
| Decision made | T+7.5 days | Scale/Kill/Iterate |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Orch → Analyst
- **Trigger:** KPI locked with baseline
- **Deliverable:** 10x brief with target metric
- **Receiver Action:** Capture baseline + add instrumentation

### Handoff 2: Analyst → Analyst (Internal)
- **Trigger:** Baseline captured
- **Deliverable:** Metric tree + bottlenecks
- **Receiver Action:** Run 5 Whys on #1 bottleneck

### Handoff 3: Analyst → Specifier
- **Trigger:** Root cause identified
- **Deliverable:** Root cause statement
- **Receiver Action:** Generate 10x bets

### Handoff 4: Specifier → Verifier (AI branch)
- **Trigger:** Bets include AI options
- **Deliverable:** 10 bets backlog
- **Receiver Action:** Design AI layer with guardrails

### Handoff 5: Verifier → Specifier
- **Trigger:** AI spec complete (or skipped)
- **Deliverable:** AI spec with thresholds
- **Receiver Action:** Score and prioritize bets

### Handoff 6: Specifier → Dev
- **Trigger:** Primary bet selected
- **Deliverable:** Chosen bet + kill criteria
- **Receiver Action:** Build minimal testable version

### Handoff 7: Dev → Dev (Verification)
- **Trigger:** Build complete
- **Deliverable:** Feature implementation
- **Receiver Action:** Run verification gates

### Handoff 8: Dev → Ops
- **Trigger:** Verification passed
- **Deliverable:** Verified build
- **Receiver Action:** Optimize performance at bottleneck

### Handoff 9: Ops → UX
- **Trigger:** Performance optimized
- **Deliverable:** Performance budget met
- **Receiver Action:** Apply 50% rule UX optimization

### Handoff 10: UX → Growth
- **Trigger:** UX optimized
- **Deliverable:** New critical path
- **Receiver Action:** Design growth loop

### Handoff 11: Growth → Analyst
- **Trigger:** Growth loop designed
- **Deliverable:** Loop spec
- **Receiver Action:** Launch experiment and measure impact

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Single KPI Only | 10x requires focus, not scattered effort | 5x more likely to achieve 10x result |
| 10 Bets Across 3 Levers | Forces consideration of transformative changes, not tweaks | Prevents incremental thinking |
| 48hr Build Target | Speed of validation beats perfection | Faster learning, faster kills |
| Kill Criteria Required | Every bet needs clear failure definition | Prevents zombie experiments |
| 2 Iterations Max | Limits sunk cost fallacy | Faster pivot to backup bets |
| 50% Reduction Rule | Systematic approach to simplicity | Dramatic UX improvements |
| One Growth Loop Max | Focus on core KPI first | Prevents feature bloat |
| 7-Day Experiment | Statistical significance needs time | Valid experiment results |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
