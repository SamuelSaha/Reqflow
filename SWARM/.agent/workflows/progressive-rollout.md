---
description: "Progressive Rollout - Controlled feature exposure with metrics gates (Layer D)"
---

# 🚀 PROGRESSIVE ROLLOUT WORKFLOW

> **TRIGGER:** `/progressive-rollout`
> **PURPOSE:** Controlled exposure to users with metrics-based gates. Never ship to 100% on day one.
> **TIME ESTIMATE:** Days to weeks (depends on stages)
> **MODE:** Phased Rollout with Abort Criteria

---

## 🎯 Quick Summary
This workflow implements controlled feature rollouts through multiple stages (internal → canary → beta → GA) with strict metrics gates at each stage. Automatic abort criteria protect users from bad releases, and AI-specific metrics add extra protection for ML features.

---

## 🚨 PRE-FLIGHT CHECKS

- [ ] Launch readiness confirmed
- [ ] Feature flag configured
- [ ] Monitoring dashboards ready
- [ ] Rollback tested

**Required Input:** `/launch-protocol` completion

---

## 📋 Workflow Steps

### STEP 1: ROLLOUT CONFIGURATION (20 min)
**Relevant Expertise:** Feature Flag Management, CI/CD Pipelines, Rollout Strategy

**Description:**
Configure feature flag with stage definitions, abort criteria, and kill switches. Define progression percentages and duration for each stage.

**Configuration Template:**

```typescript
// Feature flag configuration
const rolloutConfig = {
  flagName: 'feature-xyz',
  stages: [
    { name: 'internal', percentage: 0.5, duration: '24h' },
    { name: 'canary', percentage: 5, duration: '48h' },
    { name: 'beta', percentage: 25, duration: '1w' },
    { name: 'ga', percentage: 100, duration: 'permanent' }
  ],
  abortCriteria: {
    errorRate: 0.01,      // >1% = abort
    p99Latency: 2.0,      // >2x baseline = abort
    userComplaints: 10    // >10 in 24h = abort
  },
  // AI-SPECIFIC: Kill Switch
  killSwitch: {
    flag: 'ai-feature-xyz-killswitch',
    autoTrip: true,
    tripConditions: {
      errorRate: 0.05,           // 5% errors = auto-kill
      hallucinationRate: 0.15,   // 15% hallucinations = auto-kill
      costPerQuery: 0.50         // $0.50/query = auto-kill
    }
  }
};
```

**Skill:** `cicd-pipelines`, `ai-development`

**Output:** Rollout configuration document

**Exit Criteria:**
- Feature flag configured
- Stages defined (internal, canary, beta, GA)
- Abort criteria documented
- Kill switch configured (for AI features)

---

### STEP 2: BASELINE METRICS (15 min)
**Relevant Expertise:** Observability, Metrics Collection, Performance Baseline

**Description:**
Capture baseline metrics before rollout begins to enable accurate comparison and abort threshold detection.

**Baseline Metrics Table:**

| Metric | Baseline | Alert Threshold |
|--------|----------|-----------------|
| Error rate | X% | >X + 1% |
| P99 latency | Yms | >2Y ms |
| Throughput | Z rps | <0.8Z rps |

**AI-Specific Metrics:**

| Metric | Baseline | Alert Threshold |
|--------|----------|-----------------|
| **Hallucination rate** | X% | >X + 5% |
| **Faithfulness score** | 0.9+ | <0.85 |
| **Cost per query** | $X | >$X × 1.5 |
| **Token consumption** | Xk | >Xk × 2 |
| **Time-to-First-Token** | Xs | >2s |

**Skill:** `observability`, `ai-development`

**Output:** Baseline snapshot

**Exit Criteria:**
- All metrics baselined
- Alert thresholds configured
- Monitoring dashboards set up
- AI-specific metrics captured (if applicable)

---

### STEP 3: STAGE 1 — INTERNAL (0.5%) (24 hours)
**Relevant Expertise:** Internal Testing, Dogfooding, Team Validation

**Description:**
Deploy to internal users only for 24 hours minimum. Team members validate the feature in production-like environment.

**Stage Parameters:**
- Duration: 24 hours minimum
- Audience: Team members, dogfooding

**Monitoring Checklist:**
- [ ] Error rate stable
- [ ] No critical bugs
- [ ] Internal feedback positive

**Gate:** ✅ Proceed OR 🚫 Fix issues

**Output:** Internal stage report

**Exit Criteria:**
- 24-hour minimum duration met
- Error rate stable
- No critical bugs reported
- Internal feedback collected

---

### STEP 4: STAGE 2 — CANARY (5%) (48 hours)
**Relevant Expertise:** Canary Deployment, Risk Mitigation, Gradual Exposure

**Description:**
Expand to 5% of random users for 48 hours minimum. Monitor for regressions compared to baseline.

**Stage Parameters:**
- Duration: 48 hours minimum
- Audience: Random 5% of users

**Monitoring Checklist:**
- [ ] Error rate < baseline + 0.5%
- [ ] Latency < 1.5x baseline
- [ ] No support ticket spike

**Gate:** ✅ Proceed OR 🔄 Hold OR 🚫 Rollback

**Output:** Canary stage report

**Exit Criteria:**
- 48-hour minimum duration met
- Error rate within threshold
- Latency within threshold
- Support tickets normal

---

### STEP 5: STAGE 3 — BETA (25%) (1 week)
**Relevant Expertise:** Beta Testing, User Validation, Business Impact Assessment

**Description:**
Expand to 25% of users for 1 week. Validate business metrics and user engagement remain positive.

**Stage Parameters:**
- Duration: 1 week
- Audience: 25% of users

**Monitoring Checklist:**
- [ ] All canary metrics stable
- [ ] Business metrics positive or neutral
- [ ] User engagement maintained

**Gate:** ✅ Proceed to GA OR 🔄 Extend beta

**Output:** Beta stage report

**Exit Criteria:**
- 1-week minimum duration met
- All canary metrics stable
- Business metrics acceptable
- User engagement maintained

---

### STEP 6: STAGE 4 — GENERAL AVAILABILITY (100%) (2 weeks)
**Relevant Expertise:** Full Rollout, Production Monitoring, Feature Flag Cleanup

**Description:**
Full rollout to 100% of users. Monitor for 2 weeks post-launch before considering rollout complete.

**Stage Parameters:**
- Remove feature flag (optional)
- Monitor for 2 weeks post-launch

**Post-GA Monitoring:**
- [ ] 2-week stability confirmed
- [ ] No regression in key metrics
- [ ] Feature flag cleanup scheduled

**Output:** GA stage report + cleanup plan

**Exit Criteria:**
- 100% traffic exposed
- 2-week stability confirmed
- No regressions detected
- Feature flag cleanup scheduled

---

## 🚨 ABORT PROTOCOL

If any abort criteria triggered:

```
1. IMMEDIATE: Set flag to 0%
2. NOTIFY: Alert on-call + stakeholders
3. TRIAGE: @swarm-analyst investigates
4. DOCUMENT: Incident report
5. FIX: Address root cause
6. RETRY: Restart from Stage 1
```

**Skill:** `observability` for detection

---

## 📤 DELIVERABLE

```markdown
# Rollout Report: [Feature Name]

## Configuration
- Flag: `feature-xyz`
- Start: 2026-01-21
- Current Stage: [Stage]

## Stage History

| Stage | Start | End | Result |
|-------|-------|-----|--------|
| Internal | Jan 21 | Jan 22 | ✅ Passed |
| Canary | Jan 22 | Jan 24 | ✅ Passed |
| Beta | Jan 24 | Jan 31 | 🔄 In Progress |

## Metrics

### Error Rate
| Stage | Baseline | Observed | Status |
|-------|----------|----------|--------|
| Internal | 0.1% | 0.1% | ✅ |
| Canary | 0.1% | 0.15% | ✅ |

### Latency (P99)
| Stage | Baseline | Observed | Status |
|-------|----------|----------|--------|
| Internal | 200ms | 210ms | ✅ |
| Canary | 200ms | 220ms | ✅ |

## Issues Discovered
- [Issue 1]: Fixed in canary
- [Issue 2]: Monitoring

## Decision
[ ] Proceed to next stage
[ ] Hold at current stage
[ ] Rollback
```

---

## 🔌 PLANE INTEGRATION

Create tracking issues:

```bash
# Rollout tracking issue
python3 plane_client.py -w samsam create_issue \
  -p PROJECT \
  -t "Release: Feature XYZ Progressive Rollout" \
  -d "Tracking rollout stages..." \
  --priority 2 \
  --state "In Progress" \
  --labels "release"
```

**Skill:** `plane-management`

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| 100% reached | ✅ |
| 2 weeks stable at GA | ✅ |
| No abort criteria triggered | ✅ |
| Documentation updated | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Configuration | 20 min |
| Baseline | 15 min |
| Stage 1 (Internal) | 24 hours |
| Stage 2 (Canary) | 48 hours |
| Stage 3 (Beta) | 1 week |
| Stage 4 (GA) | 2 weeks |
| **TOTAL** | **~3.5 weeks** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Configuration | `@swarm-ops` | `@swarm-arch` | Feature flags, CI/CD |
| 2: Baseline | `@swarm-ops` | `@swarm-analyst` | Observability, metrics |
| 3: Internal | `@swarm-ops` | `@swarm-qa` | Internal testing |
| 4: Canary | `@swarm-ops` | `@swarm-analyst` | Risk mitigation |
| 5: Beta | `@swarm-ops` | `@swarm-growth` | User validation |
| 6: GA | `@swarm-ops` | `@swarm-dev` | Full rollout |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/launch-protocol` → After successful deployment
- `/epic-feature` → Phase 7 completion
- `/standard-feature` → Step 7 completion with feature flags

**This Workflow Triggers:**
- `/feedback-ingestion` → After GA stage reached
- None → If aborted/rolled back (returns to bug fixing)

**Related Workflows:**
- Preceded by: `/launch-protocol`
- Leads to: `/feedback-ingestion`
- Parallel: Monitoring runs continuously during all stages

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  PROGRESSIVE ROLLOUT PROGRESS                           │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/6: Configuration          │
│  [░░░░░░░░░░░░░░░░░░] Step 2/6: Baseline               │
│  [░░░░░░░░░░░░░░░░░░] Step 3/6: Internal (0.5%)        │
│  [░░░░░░░░░░░░░░░░░░] Step 4/6: Canary (5%)            │
│  [░░░░░░░░░░░░░░░░░░] Step 5/6: Beta (25%)             │
│  [░░░░░░░░░░░░░░░░░░] Step 6/6: GA (100%)              │
├─────────────────────────────────────────────────────────┤
│  Current Stage: [Name]  │  Traffic %: [XX%]            │
│  Duration: [XX hours]   │  Status: [Pass/Watch/Abort]  │
│  Error Rate: [X%]       │  Latency: [Yms]              │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Configuration | `@swarm-ops` manages feature flags and CI/CD pipelines | Incorrect flag configuration causes accidental full exposure |
| 2: Baseline | `@swarm-ops` has access to monitoring systems and understands metric patterns | No comparison baseline, can't detect regressions |
| 3: Internal | `@swarm-ops` coordinates team testing and collects internal feedback | Team discovers critical bugs in production |
| 4: Canary | `@swarm-ops` manages gradual exposure with automated rollback | 100% user impact from bad releases |
| 5: Beta | `@swarm-ops` monitors business metrics alongside technical metrics | Business impact (conversion, revenue) undetected |
| 6: GA | `@swarm-ops` ensures stable full rollout and cleanup | Lingering feature flags, technical debt |

---

## ⏱️ MICRO-CHECKPOINTS (Per Stage)

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Stage started | T+0 | Flag percentage updated |
| 25% stage elapsed | Stage × 0.25 | Initial metrics stable |
| 50% stage elapsed | Stage × 0.50 | No regressions detected |
| 75% stage elapsed | Stage × 0.75 | All metrics within thresholds |
| Stage complete | 100% | Gate decision made |
| Next stage started | T+stage duration | New percentage deployed |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Configuration → Baseline
- **Trigger:** Rollout config documented
- **Deliverable:** Feature flag configuration with stages
- **Receiver Action:** Capture baseline metrics

### Handoff 2: Baseline → Internal
- **Trigger:** Baseline metrics captured
- **Deliverable:** Metrics snapshot with thresholds
- **Receiver Action:** Begin internal rollout (0.5%)

### Handoff 3: Internal → Canary
- **Trigger:** Internal stage passes + 24hr elapsed
- **Deliverable:** Internal stage report
- **Receiver Action:** Expand to canary (5%)

### Handoff 4: Canary → Beta
- **Trigger:** Canary stage passes + 48hr elapsed
- **Deliverable:** Canary stage report
- **Receiver Action:** Expand to beta (25%)

### Handoff 5: Beta → GA
- **Trigger:** Beta stage passes + 1 week elapsed
- **Deliverable:** Beta stage report
- **Receiver Action:** Full rollout (100%)

### Handoff 6: GA → Complete
- **Trigger:** GA stable for 2 weeks
- **Deliverable:** GA stage report + cleanup plan
- **Receiver Action:** Schedule feature flag removal

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 4-Stage Rollout (0.5% → 5% → 25% → 100%) | Gradual exposure limits blast radius of bad releases | 90% reduction in user-facing incidents from rollouts |
| 24hr/48hr/1week Minimums | Statistical significance needs time | Prevents premature progression on insufficient data |
| Auto-Abort Criteria | Automated protection responds faster than humans | 5-minute MTTR for detected regressions |
| AI-Specific Kill Switch | AI failures have unique patterns (hallucinations, cost) | Prevents runaway AI costs and quality degradation |
| Baseline Required First | Can't detect regressions without "normal" reference | Eliminates subjective "seems fine" assessments |
| Feature Flag Cleanup Scheduled | Prevents technical debt accumulation | Cleaner codebase, fewer active flags |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
