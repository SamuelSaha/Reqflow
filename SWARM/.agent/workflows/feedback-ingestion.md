---
description: "Feedback Ingestion - Turn runtime behavior into actionable backlog (Layer E)"
---

# 📊 FEEDBACK INGESTION WORKFLOW

> **TRIGGER:** `/feedback-ingestion`
> **PURPOSE:** Turn runtime behavior into actionable backlog items. Every signal maps to code.
> **TIME ESTIMATE:** 1-2 hours per cycle
> **MODE:** Continuous Signal Processing

---

## 🎯 Quick Summary
This workflow continuously ingests signals from automated sources (logs, metrics, feature flags) and manual sources (support tickets, user interviews) to create actionable backlog items. All feedback must map to specific code locations for efficient triage.

---

## 🚨 PRE-FLIGHT CHECKS

- [ ] Feature is live (post-rollout)
- [ ] Monitoring active
- [ ] Support channels monitored

**Required Input:** Live feature with observability

---

## 📋 Workflow Steps

### STEP 1: COLLECT AUTOMATED SIGNALS (15 min)
**Relevant Expertise:** Observability, Log Analysis, Metrics Analysis

**Description:**
Gather signals from automated sources including error logs (bugs), performance metrics (optimizations), feature flag data (enhancements), and analytics (behavior patterns).

**Signal Sources:**

| Source | Signal Type | Example |
|--------|-------------|---------|
| Error logs | Bugs | `TypeError: Cannot read property 'x'` |
| Performance metrics | Optimization | P99 > baseline |
| Feature flags | Enhancement | Low adoption rate |
| Analytics | Behavior | Drop-off at step 3 |

**Skill:** `observability`

**Output:** Signal inventory

**Exit Criteria:**
- All automated sources polled
- Error logs categorized
- Performance anomalies identified
- Feature flag metrics captured

---

### STEP 2: COLLECT MANUAL SIGNALS (15 min)
**Relevant Expertise:** Support Ticket Analysis, User Research, Stakeholder Communication

**Description:**
Gather signals from human sources including support tickets (UX issues), user interviews (feature requests), sales feedback (blockers), and social/reviews (sentiment).

**Feedback Sources:**

| Source | Signal Type | Example |
|--------|-------------|---------|
| Support tickets | UX issues | "Can't find button" |
| User interviews | Feature requests | "Would be nice if..." |
| Sales feedback | Blockers | "Lost deal because..." |
| Social/reviews | Sentiment | "This sucks" |

**Output:** Feedback inventory

**Exit Criteria:**
- Support tickets reviewed and tagged
- User interview insights captured
- Sales blockers documented
- Sentiment tracked

---

### STEP 3: CATEGORIZE & PRIORITIZE (20 min)
**Relevant Expertise:** Ticket Triaging, Priority Assessment, Workflow Routing

**Description:**
Categorize each signal into Bug (P0/P1), UX Issue, Enhancement, or Feature Request with clear routing rules for next steps.

**Categorization Matrix:**

| Category | Priority Rule | Action |
|----------|---------------|--------|
| **Bug** (P0) | Users blocked | Immediate fix |
| **Bug** (P1) | Workaround exists | Next sprint |
| **UX Issue** | Friction, not broken | Backlog |
| **Enhancement** | Nice to have | Evaluate |
| **Feature Request** | New scope | Discovery |

**Skill:** `saas-workflows` (problem-framing for new features)

**Output:** Categorized signal backlog with priorities

**Exit Criteria:**
- All signals categorized
- Priorities assigned (P0, P1, P2, P3)
- Routing decisions made
- Urgent items flagged

---

### STEP 4: MAP TO CODE (20 min)
**Relevant Expertise:** Code Analysis, Root Cause Investigation, Debugging

**Description:**
Every issue must map to specific code location. If no mapping possible, create investigation task. This is critical for efficient developer handoff.

**Issue Template:**

```markdown
## Issue: [Title]

**Signal Source:** [log/ticket/analytics]
**Code Location:** [file:line or module]
**Root Cause:** [analysis]
**Fix Complexity:** [S/M/L]
```

**Gate:** If no code mapping possible → needs investigation task

**Output:** Code-mapped issue list

**Exit Criteria:**
- All issues have code location
- Root cause identified for 80%+ of issues
- Complexity estimated
- Investigation tasks created for unclear items

---

### STEP 5: CREATE PLANE ISSUES (20 min)
**Relevant Expertise:** Issue Tracking, Ticket Creation, Workflow Integration

**Description:**
Create properly formatted Plane issues with source, code location, root cause, acceptance criteria, and verification steps.

```bash
python3 swarm-plane-client.py -w samsam create_issue \
  -p PROJECT \
  -t "Bug: [Signal summary]" \
  -d "## Source
[Where this came from]

## Code Location
\`file.ts:123\`

## Root Cause
[Analysis]

## Acceptance Criteria
- [ ] [Specific fix]

## Verification
[How to confirm fixed]" \
  --priority 2 \
  --state "Backlog" \
  --labels "Bug"
```

**Skill:** `plane-management`, `task-creation`

**Output:** Tracked issues in Plane

**Exit Criteria:**
- Issues created with proper formatting
- Priority assigned
- Labels applied
- Links to original signals preserved

---

### STEP 6: CLOSE THE LOOP (10 min)
**Relevant Expertise:** Stakeholder Communication, Customer Success

**Description:**
Notify stakeholders that feedback has been processed and tracked: Support team gets issue IDs, Users get acknowledgment, Sales gets roadmap updates.

**Notifications:**
- Support: "Issue logged as PROJ-123"
- Users: "Thanks for feedback, we're on it"
- Sales: "Blocker addressed in roadmap"

**Output:** Stakeholder notifications sent

**Exit Criteria:**
- Support team notified
- Users acknowledged (where appropriate)
- Sales team updated on blockers
- Feedback loop formally closed

---

## 📊 SIGNAL QUALITY METRICS

Track feedback system health:

| Metric | Target | Why |
|--------|--------|-----|
| Signal → Issue time | <24h | Fast response |
| Code mapping rate | >90% | Actionable signals |
| Issue close rate | >80%/sprint | Throughput |
| Repeat signals | <10% | Actually fixing |

---

## 📤 DELIVERABLE

```markdown
# Feedback Report: [Feature Name] — Week [N]

## Signal Summary

| Type | Count | Converted to Issues |
|------|-------|---------------------|
| Errors | 12 | 3 (grouped) |
| Support tickets | 8 | 5 |
| Analytics anomalies | 2 | 2 |

## Issues Created

| ID | Title | Priority | Source |
|----|-------|----------|--------|
| PROJ-45 | Login timeout on slow networks | P1 | Error logs |
| PROJ-46 | Confusing button label | P3 | Support |
| PROJ-47 | Mobile layout broken | P2 | Support |

## Trends

- **Recurring:** Login issues (3rd week)
- **New:** Mobile layout (first reports)
- **Resolved:** Signup flow (no new tickets)

## Recommendations

1. Prioritize login reliability → skill-feature
2. Mobile audit needed → design task
3. Close out signup backlog → documentation
```

---

## 🔄 BEHAVIOR CORRECTION PATH

For minor tweaks that don't need full workflow:

### Allowed (behavior-correction)
- Copy/text changes
- UI tweaks (colors, spacing, labels)
- Logic adjustments within existing contracts

### Not Allowed
- New API endpoints → `/standard-feature`
- Schema changes → `/skill-feature`
- New dependencies → `/skill-feature`

**Gate:** If contract changes needed, escalate to proper workflow

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| All signals categorized | ✅ |
| Issues created with code mapping | ✅ |
| Stakeholders notified | ✅ |
| Trends documented | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Automated Signals | 15 min |
| Manual Signals | 15 min |
| Categorize | 20 min |
| Map to Code | 20 min |
| Create Issues | 20 min |
| Close Loop | 10 min |
| **TOTAL** | **1.5 hours** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Automated Signals | `@swarm-ops` | `@swarm-analyst` | Observability, log analysis |
| 2: Manual Signals | `@swarm-ops` | `@swarm-specifier` | Support analysis, research |
| 3: Categorize | `@swarm-specifier` | `@swarm-orch` | Priority assessment, routing |
| 4: Map to Code | `@swarm-analyst` | `@swarm-dev` | Code analysis, debugging |
| 5: Create Issues | `@swarm-orch` | `@swarm-specifier` | Issue tracking, integration |
| 6: Close Loop | `@swarm-ops` | `@swarm-growth` | Stakeholder communication |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/progressive-rollout` → After GA stage reached
- `/launch-protocol` → After 24hr monitoring complete
- Continuous → Scheduled runs (daily/weekly)

**This Workflow Triggers:**
- `/standard-feature` → For P1/P2 bugs and UX issues
- `/skill-feature` → For schema/contract changes
- `/problem-framing` → For feature requests requiring discovery
- `/discovery-protocol` → For new feature opportunities

**Related Workflows:**
- Preceded by: Any rollout or launch workflow
- Leads to: Implementation workflows based on categorization

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  FEEDBACK INGESTION PROGRESS                            │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/6: Automated Signals      │
│  [░░░░░░░░░░░░░░░░░░] Step 2/6: Manual Signals         │
│  [░░░░░░░░░░░░░░░░░░] Step 3/6: Categorize             │
│  [░░░░░░░░░░░░░░░░░░] Step 4/6: Map to Code            │
│  [░░░░░░░░░░░░░░░░░░] Step 5/6: Create Issues          │
│  [░░░░░░░░░░░░░░░░░░] Step 6/6: Close Loop             │
├─────────────────────────────────────────────────────────┤
│  Signals Collected: [XX]  │  Issues Created: [YY]      │
│  P0 Blockers: [ZZ]        │  Code Mapping Rate: [AA%]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Automated Signals | `@swarm-ops` has direct access to observability systems and understands metric patterns | Missed production errors, delayed incident detection |
| 2: Manual Signals | `@swarm-ops` understands support systems and can translate user complaints into technical signals | User feedback siloed in support tools, never reaches dev |
| 3: Categorize | `@swarm-specifier` understands technical complexity and can assess fix effort | Incorrect prioritization, urgent bugs in backlog |
| 4: Map to Code | `@swarm-analyst` can trace symptoms to root code locations | Issues filed without context, developers waste time hunting |
| 5: Create Issues | `@swarm-orch` manages Plane integration and ensures proper formatting | Inconsistent tickets, missing context for developers |
| 6: Close Loop | `@swarm-ops` ensures stakeholders know their feedback was heard | Users feel ignored, support team lacks visibility |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Signal collection started | T+0 | Monitoring systems accessed |
| Automated signals complete | T+15min | Error logs + metrics captured |
| Manual signals complete | T+30min | Support tickets reviewed |
| Categorization 50% | T+40min | Priority matrix applied |
| Code mapping started | T+50min | Root cause analysis begun |
| Issues creation started | T+70min | Plane integration active |
| Stakeholder notifications | T+90min | Communications queued |
| Cycle complete | T+100min | Report generated |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Ops → Ops (Auto → Manual)
- **Trigger:** Automated signal collection complete
- **Deliverable:** Signal inventory with error logs, metrics, analytics
- **Receiver Action:** Begin manual signal collection

### Handoff 2: Ops → Specifier
- **Trigger:** All signals collected (auto + manual)
- **Deliverable:** Complete signal inventory
- **Receiver Action:** Begin categorization and prioritization

### Handoff 3: Specifier → Analyst
- **Trigger:** Categorization complete with priorities
- **Deliverable:** Categorized backlog with routing decisions
- **Receiver Action:** Begin code mapping and root cause analysis

### Handoff 4: Analyst → Orch
- **Trigger:** Code mapping complete (>90% mapped)
- **Deliverable:** Code-mapped issues with locations and complexity
- **Receiver Action:** Create Plane issues with proper formatting

### Handoff 5: Orch → Ops
- **Trigger:** Issues created in Plane
- **Deliverable:** Issue IDs and tracking links
- **Receiver Action:** Notify stakeholders and close feedback loop

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 90% Code Mapping Target | Not all issues immediately traceable, but most should be | Ensures actionable tickets, reduces dev investigation time |
| <24h Signal→Issue Time | User feedback should be acknowledged quickly | Improves user satisfaction, catches critical issues fast |
| Separate Auto/Manual Steps | Different skills needed: technical analysis vs. support translation | Prevents missed signals from either source |
| P0/P1 Immediate Routing | Blockers need fast response | Reduces user impact, prevents revenue loss |
| Continuous Mode | Feedback is ongoing, not one-time | Ensures no signals fall through cracks |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
