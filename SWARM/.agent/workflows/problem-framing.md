---
description: "Problem Framing - Turn vague ideas into buildable problems (Layer A)"
---

# 🎯 PROBLEM FRAMING WORKFLOW

> **TRIGGER:** `/problem-framing`
> **PURPOSE:** Turn vague ideas into buildable problems with clear constraints.
> **TIME ESTIMATE:** 1-2 hours
> **MODE:** Structured Problem Definition

---

## 🎯 Quick Summary
This workflow transforms vague feature ideas or user complaints into well-defined, buildable problems. It extracts core pain points, maps the environment, defines non-goals, and establishes measurable success signals before any solution design begins.

---

## 🚨 PRE-FLIGHT CHECKS

- [ ] User pain or opportunity is articulated
- [ ] Some constraints are known (time, budget, tech)
- [ ] Stakeholder available for clarification

---

## 📋 Workflow Steps

### STEP 1: PAIN EXTRACTION (15 min)
**Relevant Expertise:** User Research, Pain Point Identification, Root Cause Analysis

**Description:**
Identify the core user pain by understanding what users struggle with, what triggers the pain, and the cost of not solving it.

**Investigation Questions:**
- What is the user struggling with?
- What triggers the pain?
- What is the cost of not solving?

**Output:** Pain statement (1-2 sentences)

**Exit Criteria:**
- Core pain identified
- Triggers documented
- Cost of inaction quantified

---

### STEP 1.5: USER NEED VALIDATION (10 min) - MANDATORY
**Relevant Expertise:** User Validation, The Mom Test, Real Problem Verification
**Skill:** `user-centric-design`

**Description:**
Validate that the identified pain is a REAL user need using The Mom Test framework. Do not proceed without concrete evidence.

**The Mom Test (3 Questions):**

1. **"Tell me about the last time you [did this activity]"**
   - ❌ User can't recall → FAKE PROBLEM → STOP
   - ✅ User tells a story → REAL PROBLEM → Continue

2. **"What did you do instead when that didn't work?"**
   - ❌ User did nothing → LOW PRIORITY → STOP
   - ✅ User hacked a workaround → HIGH PRIORITY → Continue

3. **"How much did that cost you (time/money/frustration)?"**
   - ❌ Cost < 5 min/month → NOT WORTH SOLVING → STOP
   - ✅ Cost > 30 min/month → WORTH SOLVING → Continue

**Binary Gate:**
- **PASS:** All 3 questions answered with real examples
- **FAIL:** Any question fails → **STOP. Redesign or abandon.**

**Output:** Mom Test validation report

```markdown
## Mom Test Validation

**Question 1:** [User story]
- Result: ✅ Real pain / ❌ Fake problem

**Question 2:** [Workaround described]
- Result: ✅ High priority / ❌ Low priority

**Question 3:** [Cost quantified]
- Result: ✅ Worth solving (>30 min/month) / ❌ Not worth solving

**Gate:** ✅ PASS / 🚫 FAIL
```

**Exit Criteria:**
- All 3 Mom Test questions answered with concrete examples
- Real user pain validated (not hypothetical)
- Cost of problem quantified (> 30 min/month)
- **If FAIL → Do not proceed. Return to ideation.**

---

### STEP 2: ENVIRONMENT MAPPING (15 min)

---

### STEP 2: ENVIRONMENT MAPPING (15 min)
**Relevant Expertise:** Systems Analysis, Constraint Identification, Technical Discovery

**Description:**
Map the problem environment including involved systems, constraints (technical/legal/business), and prior attempts at solutions.

**Mapping Questions:**
- What systems are involved?
- What constraints exist (technical/legal/business)?
- What has been tried before?

**Output:** Environment brief

**Exit Criteria:**
- Systems identified
- Constraints documented
- Prior attempts cataloged

---

### STEP 2.5: COGNITIVE LOAD CHECK (5 min) - MANDATORY
**Relevant Expertise:** Cognitive Load Assessment, Decision Fatigue Analysis
**Skill:** `user-centric-design`

**Description:**
Measure the mental effort required to use any proposed solution. If it requires too much thinking, simplify before building.

**Cognitive Load Formula:**
```
COGNITIVE_LOAD = (Decisions per screen × Complexity per decision) + Memory required
```

**Measurement:**

| Load Level | Decisions/Screen | Verdict |
|------------|------------------|---------|
| 🟢 LOW | 1-2 | ✅ Proceed |
| 🟡 MEDIUM | 3 | ⚠️ Simplify if possible |
| 🔴 HIGH | 4+ | 🚫 **STOP - Redesign required** |

**Rule:** Maximum 3 decisions per screen. No exceptions.

**Decision Counting Method:**
1. List every choice user must make to solve the problem
2. Count: Click targets, form inputs, toggles, selections
3. Include implicit decisions ("Should I click this?")

**Binary Gate:**
- **PASS:** ≤ 3 decisions per screen
- **FAIL:** > 3 decisions → **STOP. Simplify or split flow.**

**Output:** Cognitive Load Assessment

```markdown
## Cognitive Load Assessment

**Decisions Required:**
1. [Decision 1]
2. [Decision 2]
3. [Decision 3]
...

**Total Decisions per Screen:** [X]
**Maximum Allowed:** 3

**Gate:** ✅ PASS / 🚫 FAIL

**If FAIL - Simplification Required:**
- Remove non-essential decisions
- Use smart defaults
- Split into multiple screens
- Progressive disclosure
```

**Exit Criteria:**
- Decision count completed for proposed solution
- ≤ 3 decisions per screen confirmed
- **If FAIL → Redesign before proceeding to problem statement**

---

### STEP 3: PROBLEM STATEMENT (15 min)

---

### STEP 3: PROBLEM STATEMENT (15 min)
**Relevant Expertise:** Problem Definition, Structured Writing, Stakeholder Communication

**Description:**
Write a formal problem statement using the Who/Experiences/When/Because/Impact framework for clarity and alignment.

**Problem Statement Template:**

```markdown
## Problem Statement

**Who:** [user segment]
**Experiences:** [pain/friction]
**When:** [trigger/context]
**Because:** [root cause]
**Impact:** [quantified cost]
```

**Output:** Formal problem statement

**Exit Criteria:**
- User segment defined
- Pain/friction described
- Trigger/context specified
- Root cause identified
- Impact quantified

---

### STEP 4: NON-GOALS DEFINITION (10 min)
**Relevant Expertise:** Scope Management, Prioritization, Focus Definition

**Description:**
Explicitly state what we are NOT solving to prevent scope creep and maintain focus on the core problem.

**Non-Goals Include:**
- Adjacent problems we're ignoring
- Scope boundaries
- Future considerations (not now)

**Output:** Non-goals list (minimum 3)

**Exit Criteria:**
- At least 3 non-goals identified
- Scope boundaries clear
- Adjacent problems acknowledged
- Future work documented but deferred

---

### STEP 5: SUCCESS SIGNALS (15 min)
**Relevant Expertise:** Metrics Definition, Analytics Planning, Success Measurement

**Description:**
Define measurable success indicators including leading indicators (early signals), lagging indicators (outcome metrics), and minimum viable metrics.

**Signal Types:**
- Leading indicators
- Lagging indicators
- Minimum viable metrics

**Output:** Success signals table

**Exit Criteria:**
- Leading indicators defined
- Lagging indicators identified
- Metrics are measurable
- Baseline data available or collection plan defined

---

### STEP 6: FEASIBILITY GATE (15 min)
**Relevant Expertise:** Technical Feasibility, Complexity Assessment, Dependency Analysis

**Description:**
Conduct technical feasibility check to confirm the problem can be expressed as an interface or API, identify blocking dependencies, and estimate rough complexity.

**Feasibility Questions:**
- Can this be expressed as an interface or API?
- Are there blocking dependencies?
- Rough complexity estimate (T-shirt size)

**Gate:** ✅ Feasibility confirmed OR 🚫 Blocked with reason

**Output:** Feasibility assessment

**Exit Criteria:**
- Interface/API expressibility confirmed
- Dependencies mapped
- Complexity estimated (S/M/L)
- Blocking issues identified or cleared

---

### STEP 7: AI UTILITY ANALYSIS (Optional - 15 min)
**Relevant Expertise:** AI Solution Assessment, Utility Analysis, Decision Frameworks

**Description:**
*For AI/LLM features: Determine if AI is the right solution by scoring non-deterministic complexity, blank page problem, and cognitive load.

**Skill:** `ai-development`

**Scoring Criteria:**

| Criterion | Score (1-5) |
|-----------|-------------|
| **Non-Deterministic Complexity**: Does it involve unstructured data? | __ |
| **Blank Page Problem**: Does user need help starting? | __ |
| **Cognitive Load**: Is user acting as "human router"? | __ |

**Rule:** Total < 9 → Consider non-AI solution first

**Output:** AI utility score

**Exit Criteria:**
- AI appropriateness scored
- Non-AI alternatives considered if score < 9
- Decision documented

---

### STEP 8: FAKE DOOR VALIDATION (Optional - 15 min)
**Relevant Expertise:** Rapid Validation, User Testing, Experiment Design

**Description:**
*For AI features: Validate demand before building by creating a fake door CTA, measuring click-through, and collecting user intent data.

**Validation Steps:**
1. Create CTA: "✨ [AI Feature Name]" button in UI
2. On click: Show "Early Access - Coming Soon" modal
3. Collect: Email + "What did you hope this would do?"
4. Measure: Click-through rate

**Result Interpretation:**

| Result | Action |
|--------|--------|
| >20% CTR | ✅ Proceed to build |
| 10-20% CTR | 🔄 Refine value prop |
| <10% CTR | 🚫 Pivot or abandon |

**Output:** Fake Door test results

**Exit Criteria:**
- CTA created and deployed
- CTR measured
- User intent data collected
- Proceed/refine/abandon decision made

---

### STEP 9: STOCHASTIC FLOOR DEFINITION (Optional - 10 min)
**Relevant Expertise:** AI Risk Assessment, Accuracy Thresholds, Fallback Design

**Description:**
*For AI features: Define minimum acceptable accuracy, risk level classification, and fallback strategy for when AI fails.

**Stochastic Floor Template:**

```markdown
## Stochastic Floor

**Risk Level:** [High/Medium/Low]
**Required Accuracy:** [99%/90%/70%]
**Fallback Strategy:** [Human review/Rule-based/User edits]
```

**Output:** Stochastic floor definition

**Exit Criteria:**
- Risk level classified
- Accuracy threshold set
- Fallback strategy defined

---

## 📤 DELIVERABLE

```markdown
# Problem Framing: [Title]

## Pain Statement
[1-2 sentences]

## Problem Statement
- Who:
- Experiences:
- When:
- Because:
- Impact:

## Environment
- Systems involved:
- Constraints:
- Prior attempts:

## Non-Goals
1. [Explicit exclusion]
2. [Explicit exclusion]
3. [Explicit exclusion]

## Success Signals
| Signal | Type | Target |
|--------|------|--------|
| ... | Leading | ... |
| ... | Lagging | ... |

## Feasibility
- Expressible as interface: ✅/🚫
- Blocking deps: None / [list]
- Complexity: S/M/L/XL

## AI Validation (if applicable)
- AI Utility Score: __/15
- Fake Door CTR: __%
- Stochastic Floor: __%
- Fallback: [strategy]
```

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| **User need validated (Mom Test)** | ✅ **MANDATORY** |
| **Cognitive load acceptable (≤3 decisions)** | ✅ **MANDATORY** |
| Problem statement is concrete | ✅ |
| Non-goals are explicit | ✅ |
| Success signals are measurable | ✅ |
| Feasibility is confirmed | ✅ |
| (AI) Fake Door validated (if applicable) | ✅ |
| (AI) Stochastic Floor defined (if applicable) | ✅ |

### User-Centric Exit Criteria Detail:

**Mom Test Gate:**
- All 3 questions answered with concrete user examples
- Real pain validated (not hypothetical)
- Cost > 30 min/month confirmed

**Cognitive Load Gate:**
- ≤ 3 decisions per screen
- ≤ 10 total decisions in user journey
- Progressive disclosure pattern identified

**IF ANY USER-CENTRIC GATE FAILS → DO NOT PROCEED TO WEDGE DEFINITION**

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Pain Extraction | 15 min |
| Environment Mapping | 15 min |
| Problem Statement | 15 min |
| Non-Goals | 10 min |
| Success Signals | 15 min |
| Feasibility Gate | 15 min |
| AI Analysis (optional) | 15 min |
| Fake Door (optional) | 15 min |
| Stochastic Floor (optional) | 10 min |
| **TOTAL** | **1.5-2 hours** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Pain Extraction | `@swarm-specifier` | `@swarm-growth` (user research) | User research, pain identification |
| 2: Environment Mapping | `@swarm-analyst` | `@swarm-arch` (systems) | Systems analysis, constraints |
| 3: Problem Statement | `@swarm-specifier` | - | Structured writing |
| 4: Non-Goals | `@swarm-specifier` | `@swarm-arch` (technical scope) | Scope management |
| 5: Success Signals | `@swarm-analyst` | `@swarm-growth` (metrics) | Analytics, measurement |
| 6: Feasibility | `@swarm-arch` | `@swarm-dev` (complexity) | Technical assessment |
| 7: AI Utility | `@swarm-arch` | `@swarm-specifier` | AI assessment |
| 8: Fake Door | `@swarm-specifier` | `@swarm-growth` | Validation design |
| 9: Stochastic Floor | `@swarm-arch` | `@swarm-sec` | Risk assessment |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/feedback-ingestion` → When feature requests identified
- User input → Direct feature requests or pain points
- Strategic planning → Quarterly/annual planning cycles

**This Workflow Triggers:**
- `/wedge-definition` → To define MVP scope
- `/discovery-protocol` → If problem requires ideation
- None → If problem is not feasible or not a priority

**Related Workflows:**
- Preceded by: `/feedback-ingestion` or direct user input
- Leads to: `/wedge-definition` for solution scope
- Parallel: Can run concurrently with other framing activities

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  PROBLEM FRAMING PROGRESS                               │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/9: Pain Extraction        │
│  [░░░░░░░░░░░░░░░░░░] Step 2/9: Environment Mapping    │
│  [░░░░░░░░░░░░░░░░░░] Step 3/9: Problem Statement      │
│  [░░░░░░░░░░░░░░░░░░] Step 4/9: Non-Goals Definition   │
│  [░░░░░░░░░░░░░░░░░░] Step 5/9: Success Signals        │
│  [░░░░░░░░░░░░░░░░░░] Step 6/9: Feasibility Gate       │
│  [░░░░░░░░░░░░░░░░░░] Step 7/9: AI Utility (Optional)  │
│  [░░░░░░░░░░░░░░░░░░] Step 8/9: Fake Door (Optional)   │
│  [░░░░░░░░░░░░░░░░░░] Step 9/9: Stochastic Floor (Opt) │
├─────────────────────────────────────────────────────────┤
│  Problem Clarity: [XX%]  │  Feasibility: [Status]      │
│  AI Feature: [Y/N]       │  Validation: [Status]       │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Pain Extraction | `@swarm-specifier` excels at translating user complaints into actionable problem statements | Vague requirements, unclear value proposition |
| 2: Environment Mapping | `@swarm-analyst` understands system interdependencies and can identify hidden constraints | Undetected blockers discovered late in development |
| 3: Problem Statement | `@swarm-specifier` structures problems for maximum clarity and stakeholder alignment | Misaligned teams working on different problems |
| 4: Non-Goals | `@swarm-specifier` enforces scope discipline to prevent creep | Unbounded scope, never-ending projects |
| 5: Success Signals | `@swarm-analyst` defines metrics that can actually be measured | Success defined subjectively, no way to validate |
| 6: Feasibility | `@swarm-arch` validates technical viability before resource commitment | Infeasible projects started, wasted effort |
| 7: AI Utility | `@swarm-arch` objectively scores AI appropriateness vs. hype | AI solutions for non-AI problems |
| 8: Fake Door | `@swarm-specifier` designs rapid validation experiments | Building features nobody wants |
| 9: Stochastic Floor | `@swarm-arch` sets realistic accuracy expectations | AI features ship with undefined reliability |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Pain extraction started | T+0 | User research materials reviewed |
| Environment mapping started | T+15min | Systems inventory begun |
| Problem statement drafting | T+30min | Who/When/Because framework applied |
| Non-goals defined | T+45min | At least 3 exclusions identified |
| Success signals identified | T+55min | Metrics are measurable |
| Feasibility check | T+70min | T-shirt complexity assigned |
| AI analysis (if needed) | T+85min | Utility score calculated |
| Fake door results | T+100min | CTR data collected |
| Stochastic floor | T+110min | Risk level classified |
| Deliverable complete | T+120min | Problem framing document ready |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Specifier → Analyst
- **Trigger:** Pain extraction complete
- **Deliverable:** Pain statement (1-2 sentences)
- **Receiver Action:** Begin environment mapping

### Handoff 2: Analyst → Specifier
- **Trigger:** Environment mapped
- **Deliverable:** Environment brief (systems, constraints, prior attempts)
- **Receiver Action:** Draft formal problem statement

### Handoff 3: Specifier → Specifier
- **Trigger:** Problem statement drafted
- **Deliverable:** Problem statement framework
- **Receiver Action:** Define non-goals

### Handoff 4: Specifier → Analyst
- **Trigger:** Non-goals documented
- **Deliverable:** Bounded problem scope
- **Receiver Action:** Define success signals/metrics

### Handoff 5: Analyst → Architect
- **Trigger:** Success signals defined
- **Deliverable:** Measurable success criteria
- **Receiver Action:** Assess technical feasibility

### Handoff 6: Architect → Specifier (AI branch)
- **Trigger:** Feasibility confirmed + AI feature suspected
- **Deliverable:** Feasibility assessment
- **Receiver Action:** Design fake door validation

### Handoff 7: Specifier → Architect (AI branch)
- **Trigger:** Fake door results analyzed
- **Deliverable:** CTR data and user intent
- **Receiver Action:** Define stochastic floor

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Who/When/Because/Impact Framework | Structured problem statements prevent misalignment | 90% reduction in "that's not what I meant" |
| Minimum 3 Non-Goals | Forces explicit scope discipline | Prevents feature creep from adjacent problems |
| Feasibility Gate Before Wedge | Don't scope solutions for infeasible problems | Saves 10+ hours on technically impossible features |
| AI Utility Score Threshold | Objective criteria prevents AI hype | Reduces inappropriate AI solutions by 60% |
| Fake Door Before Build | Validate demand before investing | Prevents building features with <10% interest |
| Optional AI Steps | Not all problems need AI validation | Reduces overhead for standard features |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
