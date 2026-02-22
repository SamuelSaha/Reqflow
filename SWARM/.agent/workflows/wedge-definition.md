---
description: "Wedge Definition - Define the minimum differentiated solution (Layer A)"
---

# 🔪 WEDGE DEFINITION WORKFLOW

> **TRIGGER:** `/wedge-definition`
> **PURPOSE:** Define the minimum differentiated solution that can ship fast and validate fast.
> **TIME ESTIMATE:** 1 hour
> **MODE:** MVP Scoping with Validation Plan

---

## 🎯 Quick Summary
This workflow transforms a framed problem into a sharp MVP definition with clear differentiation, explicit scope boundaries, sprint feasibility validation, and a concrete validation plan. It ensures the team builds the smallest thing that proves the core value hypothesis.

---

## 🚨 PRE-FLIGHT CHECKS

- [ ] Problem framing complete
- [ ] Non-goals are explicit
- [ ] Feasibility confirmed

**Required Input:** `/problem-framing` output

---

## 📋 Workflow Steps

### STEP 1: LOAD PROBLEM CONTEXT (10 min)
**Relevant Expertise:** Problem Review, Context Synthesis, Priority Validation

**Description:**
Review the problem framing output to ensure the problem is still valid, prioritized, and understood before defining the solution wedge.

**Review Checklist:**
- Pain statement
- Environment constraints
- Non-goals
- Success signals

**Verify:** Problem is still valid and prioritized

**Output:** Problem context summary

**Exit Criteria:**
- Problem framing reviewed
- Validity confirmed
- Priority unchanged

---

### STEP 2: COMPETITIVE WEDGE (15 min)
**Relevant Expertise:** Competitive Analysis, Differentiation Strategy, Positioning

**Description:**
Identify the differentiation angle that makes this solution different from competitors and alternatives. Define the unfair advantage.

**Wedge Questions:**
- What makes our solution different?
- What's the unfair advantage?
- Where do we NOT compete?

**Output:** Wedge statement (1 sentence)

**Exit Criteria:**
- Differentiation angle identified
- Unfair advantage articulated
- Competitive boundaries defined

---

### STEP 2.5: USER VALIDATION PLAN (10 min) - MANDATORY
**Relevant Expertise:** User Testing Strategy, Validation Planning
**Skill:** `user-centric-design`

**Description:**
Define how we will test the MVP with real users BEFORE building. Every wedge must have a validation plan or it cannot proceed.

**Validation Plan Components:**

1. **Who will we test with?**
   - Minimum 3 real users from target segment
   - Must match problem framing user profile

2. **What will we test?**
   - The Mom Test questions again (validation of validation)
   - Task completion rate
   - Time-on-task
   - Error rate

3. **When will we test?**
   - Prototype stage (before full build)
   - MVP stage (after build, before polish)
   - Post-launch (continuous)

4. **Success Criteria:**
   - Task completion rate > 80%
   - User satisfaction > 4/5
   - Zero critical usability issues

**Binary Gate:**
- **PASS:** Validation plan defined with specific users, metrics, and timeline
- **FAIL:** No plan → **STOP. Cannot build without validation strategy.**

**User-Centric Veto Power:**
```
At any point in this workflow:
- If user validation plan is rejected by stakeholders → STOP
- If target users are not accessible → STOP  
- If success criteria seem unachievable → REDESCOPE
```

**Output:** User Validation Plan

```markdown
## User Validation Plan

**Test Users:**
- [User 1: Role, segment]
- [User 2: Role, segment]
- [User 3: Role, segment]

**Test Scenarios:**
1. [Scenario 1: Task to complete]
2. [Scenario 2: Task to complete]
3. [Scenario 3: Edge case]

**Success Metrics:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Task completion | >80% | Observed |
| Time on task | <5 min | Measured |
| Error rate | <5% | Logged |
| Satisfaction | >4/5 | Survey |

**Timeline:**
- Prototype test: [Date]
- MVP test: [Date]
- Launch decision: [Date]

**Gate:** ✅ PASS / 🚫 FAIL
```

**Exit Criteria:**
- 3+ test users identified
- Test scenarios defined
- Success metrics with targets documented
- Timeline established
- **If FAIL → Cannot proceed without validation plan**

---

### STEP 3: MVP BOUNDARY (20 min)

---

### STEP 3: MVP BOUNDARY (20 min)
**Relevant Expertise:** MVP Definition, Scope Management, Critical Path Identification

**Description:**
Define the sharp MVP boundary with explicit MUST Have (≤5 items), WON'T Have (v1 exclusions), and MIGHT Have (if time permits) lists.

**MVP Scope Template:**

```markdown
## MVP Scope

### MUST Have (Critical Path)
- [Feature that proves the wedge]
- [Feature that proves the wedge]

### WON'T Have (Explicit Cuts)
- [Feature deferred to v2]
- [Feature deferred to v2]

### MIGHT Have (If time permits)
- [Low-risk enhancement]
```

**Rule:** MUST Have ≤ 5 items

**Output:** MVP scope definition

**Exit Criteria:**
- ≤5 MUST Have items identified
- WON'T Have list explicit
- MIGHT Have options noted
- Critical path clear

---

### STEP 4: SPRINT FIT CHECK (10 min)
**Relevant Expertise:** Sprint Planning, Capacity Planning, Complexity Assessment

**Description:**
Validate that the MVP can ship in ≤1 sprint by checking dependencies and team capacity.

**Sprint Fit Questions:**
- Can MUST Have ship in ≤1 sprint?
- Dependencies identified?
- Team capacity confirmed?

**Gate:** ✅ Fits in 1 sprint OR 🔄 Re-scope

**Output:** Sprint fit assessment

**Exit Criteria:**
- Sprint feasibility confirmed
- Dependencies mapped
- Capacity verified
- Rescope if needed

---

### STEP 5: ROLLBACK SAFETY (10 min)
**Relevant Expertise:** Deployment Strategy, Feature Flags, Database Migration Planning

**Description:**
Define rollback strategy including feature flag approach, database migration reversibility, and API versioning if needed.

**Rollback Checklist:**
- Feature flag approach
- Database migration reversibility
- API versioning (if needed)

**Gate:** Clean rollback path exists

**Output:** Rollback strategy

**Exit Criteria:**
- Feature flag strategy defined
- DB migrations reversible
- API versioning plan (if applicable)
- Rollback tested

---

### STEP 5.5: LOGICAL DESIGN CHECK (10 min) - MANDATORY
**Relevant Expertise:** Logical Flow Validation, User Journey Design
**Skill:** `user-centric-design`

**Description:**
Validate that the proposed MVP flow makes logical sense from user perspective. Users should never be surprised or confused.

**Logical Flow Validation (4 Questions):**

1. **Does step N+1 naturally follow step N?**
   - ✅ Yes: Flow makes sense
   - ❌ No: Jarring jump → **REDESIGN**

2. **Does the user have everything needed at each step?**
   - ✅ Yes: No backtracking required
   - ❌ No: Missing context → **ADD PREREQUISITES**

3. **Can the user predict what happens next?**
   - ✅ Yes: Clear progression
   - ❌ No: Mystery navigation → **ADD PREVIEW/PROGRESS**

4. **Is there a clear way back/undo?**
   - ✅ Yes: User feels safe
   - ❌ No: Trapped → **ADD NAVIGATION/UNDO**

**Binary Gate:**
- **PASS:** All 4 questions answered positively
- **FAIL:** Any question fails → **STOP. Redesign flow logic.**

**Output:** Logical Flow Validation Report

```markdown
## Logical Flow Validation

**Step-by-Step Analysis:**

Step 1 → Step 2:
- Natural progression? ✅/❌
- User has context? ✅/❌
- Predictable? ✅/❌
- Can go back? ✅/❌

Step 2 → Step 3:
- Natural progression? ✅/❌
- User has context? ✅/❌
- Predictable? ✅/❌
- Can go back? ✅/❌

[Continue for all steps...]

**Journey Logic Score:** [X]/[Total Steps × 4]
**Pass Threshold:** 100% (all checks must pass)

**Gate:** ✅ PASS / 🚫 FAIL

**If FAIL:**
- Redesign specific step transitions that fail
- Apply Principle of Least Astonishment
- Add progress indicators where needed
- Ensure clear way back at each step
```

**Exit Criteria:**
- All 4 validation questions answered for each step transition
- 100% of logical flow checks pass
- No mystery navigation or surprise jumps
- Clear back/undo path at every step
- **If FAIL → Redesign flow before proceeding**

---

### STEP 6: WEDGE VALIDATION PLAN (15 min)

---

### STEP 6: WEDGE VALIDATION PLAN (15 min)
**Relevant Expertise:** Experiment Design, Metrics Definition, Success Validation

**Description:**
Define how to validate that the wedge works: what metric proves value, minimum sample size, and decision timeline.

**Validation Questions:**
- What metric proves value?
- Minimum sample size?
- Decision timeline?

**Output:** Validation plan

**Exit Criteria:**
- Success metric defined
- Sample size calculated
- Timeline set
- Decision criteria explicit

---

## 📤 DELIVERABLE

```markdown
# Wedge Definition: [Title]

## Problem Reference
[Link to problem-framing]

## Wedge Statement
[One sentence: "We win by doing X differently"]

## MVP Scope

### MUST Have
1. [ ] [Critical feature]
2. [ ] [Critical feature]

### WON'T Have (v1)
1. [Deferred]
2. [Deferred]

### MIGHT Have
1. [If time]

## Sprint Fit
- Estimated: [X] story points
- Sprint capacity: [Y] points
- Fit: ✅/🚫

## Rollback Strategy
- Feature flag: [name]
- DB reversible: ✅/🚫
- API versioned: ✅/N/A

## Validation Plan
| Metric | Target | Timeline |
|--------|--------|----------|
| ... | ... | 2 weeks |

## Exit Decision
After validation period:
- If [metric] > [target]: Continue to v2
- If [metric] < [target]: Pivot or kill
```

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| MVP scope ≤ 5 MUST Have items | ✅ |
| **User validation plan defined** | ✅ **MANDATORY** |
| **Logical flow validated** | ✅ **MANDATORY** |
| Fits in 1 sprint | ✅ |
| Rollback path exists | ✅ |
| Validation plan defined | ✅ |

### User-Centric Veto Power:

**At any point:**
- If users cannot be found for validation → STOP
- If logical flow check fails → STOP and redesign
- If cognitive load exceeds 3 decisions per MVP screen → REDESCOPE

**No wedge may proceed to development without:**
1. Specific users identified for testing
2. Logical flow 100% validated
3. User-centric exit criteria met

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Load Context | 10 min |
| Competitive Wedge | 15 min |
| MVP Boundary | 20 min |
| Sprint Fit | 10 min |
| Rollback Safety | 10 min |
| Validation Plan | 15 min |
| **TOTAL** | **1 hour** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Load Context | `@swarm-specifier` | - | Problem review |
| 2: Competitive Wedge | `@swarm-growth` | `@swarm-specifier` | Competitive analysis |
| 3: MVP Boundary | `@swarm-specifier` | `@swarm-arch` | MVP definition |
| 4: Sprint Fit | `@swarm-ops` | `@swarm-dev` | Sprint planning |
| 5: Rollback Safety | `@swarm-arch` | `@swarm-ops` | Deployment strategy |
| 6: Validation Plan | `@swarm-analyst` | `@swarm-specifier` | Experiment design |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/problem-framing` → After feasibility confirmed
- Strategic planning → Quarterly roadmap sessions

**This Workflow Triggers:**
- `/discovery-protocol` → For solution design
- `/tech-contract` → If API contracts needed
- None → If wedge invalidated

**Related Workflows:**
- Preceded by: `/problem-framing`
- Leads to: `/discovery-protocol` or `/tech-contract`
- Parallel: None (sequential dependency)

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  WEDGE DEFINITION PROGRESS                              │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/6: Load Problem Context   │
│  [░░░░░░░░░░░░░░░░░░] Step 2/6: Competitive Wedge      │
│  [░░░░░░░░░░░░░░░░░░] Step 3/6: MVP Boundary           │
│  [░░░░░░░░░░░░░░░░░░] Step 4/6: Sprint Fit Check       │
│  [░░░░░░░░░░░░░░░░░░] Step 5/6: Rollback Safety        │
│  [░░░░░░░░░░░░░░░░░░] Step 6/6: Validation Plan        │
├─────────────────────────────────────────────────────────┤
│  MUST Have Items: [X/5]  │  Sprint Fit: [Status]       │
│  Wedge Clarity: [XX%]    │  Validation: [Defined Y/N]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Load Context | `@swarm-specifier` validates problem is still relevant and prioritized | Building solutions for deprioritized problems |
| 2: Competitive Wedge | `@swarm-growth` understands market positioning and differentiation | Solutions that don't stand out from competitors |
| 3: MVP Boundary | `@swarm-specifier` enforces the ≤5 MUST Have rule | Scope creep, features that don't prove wedge |
| 4: Sprint Fit | `@swarm-ops` understands team capacity and sprint planning | Unrealistic timelines, missed commitments |
| 5: Rollback Safety | `@swarm-arch` designs reversible technical solutions | Irreversible changes that can't be undone |
| 6: Validation Plan | `@swarm-analyst` designs measurable experiments | No way to know if the wedge worked |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Problem context loaded | T+0 | Problem framing document reviewed |
| Wedge analysis started | T+10min | Competitive research begun |
| MVP scoping started | T+25min | MUST Have list initiated |
| Sprint fit check | T+45min | Capacity vs. scope compared |
| Rollback strategy | T+55min | Feature flag approach selected |
| Validation plan | T+65min | Success metric defined |
| Deliverable complete | T+80min | Wedge definition document ready |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Specifier → Growth
- **Trigger:** Problem context confirmed valid
- **Deliverable:** Problem framing summary
- **Receiver Action:** Begin competitive wedge analysis

### Handoff 2: Growth → Specifier
- **Trigger:** Wedge statement defined
- **Deliverable:** One-sentence differentiation statement
- **Receiver Action:** Define MVP scope boundaries

### Handoff 3: Specifier → Architect (MVP)
- **Trigger:** MVP scope drafted with ≤5 MUST Haves
- **Deliverable:** MVP scope with critical path
- **Receiver Action:** Validate sprint fit

### Handoff 4: Specifier + Architect → Ops
- **Trigger:** MVP scope finalized
- **Deliverable:** Scoped requirements with complexity estimates
- **Receiver Action:** Validate sprint capacity fit

### Handoff 5: Ops → Architect
- **Trigger:** Sprint fit confirmed
- **Deliverable:** Sprint capacity analysis
- **Receiver Action:** Design rollback strategy

### Handoff 6: Architect → Analyst
- **Trigger:** Rollback safety confirmed
- **Deliverable:** Deployment strategy with reversibility
- **Receiver Action:** Design validation plan

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| ≤5 MUST Have Items | Sharp focus prevents scope creep | 60% reduction in MVP scope bloat |
| WON'T Have Explicit | Naming exclusions prevents "just one more thing" | Clear boundaries protect timeline |
| Sprint Fit Gate | If it doesn't fit in 1 sprint, it's not an MVP | Realistic timelines, achievable goals |
| Rollback Required | Every MVP must be safely reversible | Ability to undo failed experiments |
| Validation Plan Required | Must know how to measure success before building | Objective success/failure criteria |
| Continue/Pivot/Kill Framework | Clear decision points prevent zombie features | Fast iteration, quick kills |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
