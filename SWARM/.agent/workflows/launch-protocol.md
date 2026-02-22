---
description: "Process for a Production Launch (The 'All-Hands' Protocol)"
---

# 🚀 LAUNCH PROTOCOL (TOTAL WAR MODE)

> **TRIGGER:** `/launch-protocol`
> **GOAL:** Zero-Defect Release to Production
> **SQUAD:** 9+ Agents (All hands on deck)
> **MODE:** Sequential Gates with Veto Power
> **STAKES:** High (Production = Real Users)

---

## 🎯 Quick Summary
This workflow coordinates a full production launch with comprehensive pre-flight checks, veto-powered gates, and real-time monitoring. Architecture, QA, Security, Infrastructure, and UX specialists conduct parallel reviews with the power to block launch until quality thresholds are met.

---

## 🚨 PRE-FLIGHT CHECKS

Before starting this protocol:
- [ ] Feature is complete and merged to main
- [ ] No critical bugs in backlog
- [ ] Stakeholders notified of launch window
- [ ] Rollback plan documented

---

## 📋 Workflow Steps

### STEP 1: ARCHITECTURAL REVIEW (30 min)
**Relevant Expertise:** System Architecture, Scalability Patterns, Dependency Management

**Description:**
Conduct foundation check on codebase structure, circular dependencies, scalability design, and spaghetti code areas. Architecture has veto power to block launch if fundamental issues exist.

**The Foundation Check:**
1. Is the codebase structure sound?
2. Any circular dependencies?
3. Is it scalable? (Stateless, cacheable, horizontal)
4. Are there any "Spaghetti Code" areas?

**Turbo:**
```bash
# Check for unused dependencies
npm ls --depth=0
```

**VETO POWER:** If architecture is fundamentally broken → **BLOCK LAUNCH**

**Output:** `[APPROVED / BLOCKED]` + Findings

**Exit Criteria:**
- Architecture assessment complete
- No circular dependencies identified
- Scalability verified (stateless, cacheable, horizontal)
- Code quality acceptable

---

### STEP 2: DESTRUCTIVE TESTING (1 hour)
**Relevant Expertise:** Quality Assurance, Edge Case Testing, Security Testing, Load Testing

**Description:**
Execute comprehensive test destruction using Murphy Protocol: edge case gauntlet, stress testing, and mobile validation. QA has veto power if coverage <80% or critical bugs exist.

**Murphy Protocol (Full Execution):**

#### 2.1 Edge Case Gauntlet
| Test | Input | Expected |
|------|-------|----------|
| Empty required field | `""` | Error message |
| Max length | 10,000 chars | Truncate/error |
| Special characters | `<script>alert('XSS')</script>` | Escaped |
| Unicode/Emoji | `👋🏻🎉` | Handle gracefully |
| SQL Injection | `'; DROP TABLE users;--` | Escaped |
| Negative numbers | `-1` | Error/default |

#### 2.2 Stress Testing
- Click submit 10x rapidly
- 100 concurrent users (k6/artillery)
- Network timeout simulation

#### 2.3 Mobile Testing
- 320px viewport
- Touch targets ≥44px
- No horizontal scroll

**Turbo:**
```bash
npm run test && npm run test:e2e
```

**VETO POWER:** If coverage <80% OR critical bugs exist → **BLOCK LAUNCH**

**Output:** Test Report + Coverage Percentage

**Exit Criteria:**
- Edge case gauntlet completed
- Stress testing passed
- Mobile testing validated (320px, 44px touch targets)
- Coverage ≥80%
- No critical bugs

---

### STEP 3: SECURITY HARDENING (30 min)
**Relevant Expertise:** Security Architecture, Authentication, Authorization, Input Validation

**Description:**
Execute Iron Dome security checklist covering authentication (JWT, cookies), authorization (RLS, RBAC), and input validation (Zod schemas, rate limiting). Security has veto power on any unprotected endpoint.

**Iron Dome Checklist:**

#### 3.1 Authentication
- [ ] JWT tokens have short expiry (15min)
- [ ] HttpOnly Secure cookies (no localStorage)
- [ ] Session invalidation works

#### 3.2 Authorization
- [ ] RLS enabled on all tables
- [ ] RBAC middleware on admin routes
- [ ] No IDOR vulnerabilities

#### 3.3 Input Validation
- [ ] Zod schemas on ALL endpoints
- [ ] No `any` types in security paths
- [ ] Rate limiting configured

**Turbo:**
```bash
# Quick security scan
grep -r "any" src/ --include="*.ts" | wc -l
```

**VETO POWER:** If ANY endpoint is unprotected → **BLOCK LAUNCH**

**Output:** Security Audit Report

**Exit Criteria:**
- Authentication hardened (JWT 15min, HttpOnly cookies)
- Authorization verified (RLS, RBAC)
- Input validation complete (Zod on all endpoints)
- No `any` types in security paths
- Rate limiting configured

---

### STEP 4: INFRASTRUCTURE CAPACITY (20 min)
**Relevant Expertise:** DevOps, Capacity Planning, Reliability Engineering, Alerting

**Description:**
Assess infrastructure readiness including error budgets, auto-scaling, alerting, and single points of failure. Operations has veto power if SPOF exists.

**Reliability Check:**
1. Are error budgets healthy? (SLO compliance)
2. Is auto-scaling configured?
3. Is alerting set up? (PagerDuty/OpsGenie)
4. Is there a Single Point of Failure (SPOF)?

**Capacity Planning:**
| Resource | Current | Expected Load | Headroom |
|----------|---------|---------------|----------|
| CPU | 20% | 60% | ✅ Safe |
| Memory | 40% | 70% | ✅ Safe |
| Database | 30% | 50% | ✅ Safe |

**VETO POWER:** If SPOF exists → **BLOCK LAUNCH**

**Output:** Infrastructure Readiness Report

**Exit Criteria:**
- Error budgets healthy
- Auto-scaling configured
- Alerting active
- No SPOF identified
- Capacity headroom confirmed

---

### STEP 5: POLISH GAUNTLET (30 min)
**Relevant Expertise:** UX Design, Accessibility Engineering, SEO, Copywriting

**Description:**
Final quality sweep covering accessibility compliance (WCAG 2.1 AA), SEO optimization (meta tags, sitemaps), and copy review (typos, passive voice, placeholders). UX has veto power on red flags.

#### 5.1 Accessibility (ACCESS)
- [ ] WCAG 2.1 AA compliant
- [ ] Contrast ≥4.5:1
- [ ] All images have alt text
- [ ] Keyboard navigation works
- [ ] Screen reader tested

#### 5.2 SEO (SIGNAL)
- [ ] Meta title + description on all pages
- [ ] Sitemap.xml up to date
- [ ] robots.txt configured
- [ ] Open Graph tags present

#### 5.3 Copy (SCRIBE)
- [ ] No typos
- [ ] No passive voice in CTAs
- [ ] No placeholder text ("Lorem ipsum")
- [ ] Error messages are helpful

**Turbo:**
```bash
# Check for placeholder text
grep -ri "lorem\|placeholder\|todo" src/ --include="*.tsx" | head -10
```

**VETO POWER:** If any "Red Flags" found → **BLOCK LAUNCH**

**Exit Criteria:**
- WCAG 2.1 AA compliance verified
- SEO requirements met
- Copy reviewed and clean
- No placeholder text

---

### STEP 6: ZERO-DEFECT VERIFICATION (MANDATORY)
**Relevant Expertise:** Build Verification, Linting, Test Execution

**Description:**
Run complete verification suite ensuring build, lint, unit tests, and E2E tests all pass. This is a hard gate—no production deploy without verified clean build.

**CRITICAL: No production deploy without verified clean build.**

**Turbo:**
```bash
npm run build && npm run lint && npm run test && npm run test:e2e
```

**Output required:**
```markdown
## ✅ VERIFICATION REPORT
**Build:** ✅ Passed (production build)
**Lint:** ✅ 0 errors, 0 warnings
**Unit Tests:** ✅ All pass
**E2E Tests:** ✅ All pass
**Coverage:** ✅ >80%
**Bundle Size:** ✅ Within budget
```

**GATE:** ALL checks must pass. THIS IS PRODUCTION.

**Exit Criteria:**
- Build passes (production)
- Lint passes (0 errors, 0 warnings)
- Unit tests pass
- E2E tests pass
- Coverage >80%
- Bundle size within budget

---

### STEP 7: FINAL CHECKLIST
**Relevant Expertise:** Verification Coordination, Cross-Functional Review

**Description:**
Execute final pre-deploy verification checklist confirming all gates passed and deployment prerequisites met.

**Pre-Deploy Verification:**
| Check | Status |
|-------|--------|
| All previous steps approved | □ |
| Git history clean | □ |
| Environment variables set | □ |
| Database migrations run | □ |
| Feature flags configured | □ |
| Rollback command tested | □ |
| Team notified | □ |

**GATE:** ALL checks must pass before proceeding.

**Exit Criteria:**
- All previous steps approved
- Git history clean
- Environment variables configured
- Database migrations ready
- Feature flags set
- Rollback tested
- Team notified

---

### STEP 8: THE RELEASE
**Relevant Expertise:** Deployment Coordination, Release Management

**Description:**
Execute deployment sequence with staging smoke test, production deployment, and immediate health verification.

**Deployment Sequence:**
1. Await confirmation from ALL agents
2. Execute build: `npm run build`
3. Deploy to staging
4. Smoke test staging
5. Deploy to production
6. Verify production health

**Turbo:**
```bash
npm run build
```

**Post-Deploy:**
```bash
# Health check
curl -s https://[domain]/health | jq
```

**Output:**
```
🚀 RELEASE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version: [X.X.X]
Deployed: [timestamp]
Commit: [sha]
Status: HEALTHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Exit Criteria:**
- All confirmations received
- Staging deployed and smoke tested
- Production deployed
- Health checks passing

---

### STEP 9: POST-LAUNCH MONITORING (15 min)
**Relevant Expertise:** Operations Monitoring, Incident Response, Alerting

**Description:**
Monitor critical metrics post-deployment with defined alert thresholds and emergency rollback capability.

**Watch Dashboard For:**
- Error rate (should remain flat)
- Latency (should not spike)
- Conversion rate (should not drop)
- User complaints (support channels)

**Alert Thresholds:**
| Metric | Yellow | Red |
|--------|--------|-----|
| Error rate | +50% | +100% |
| Latency p95 | +200ms | +500ms |
| 5xx errors | >1% | >5% |

**EMERGENCY ROLLBACK:**
```bash
# If things go wrong
git revert HEAD --no-edit && git push
```

**Exit Criteria:**
- Error rate stable
- Latency within thresholds
- No user complaint spike
- 15-minute monitoring window complete

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| Architecture approved | ✅ |
| QA passed (>80% coverage) | ✅ |
| Security hardened | ✅ |
| Infrastructure ready | ✅ |
| A11y/SEO/Copy polished | ✅ |
| Production deployed | ✅ |
| Health check passing | ✅ |
| Monitoring active | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Architecture | 30 min |
| QA | 1 hour |
| Security | 30 min |
| Infrastructure | 20 min |
| Polish | 30 min |
| Final Check | 10 min |
| Deploy | 15 min |
| Monitoring | 15 min |
| **TOTAL** | **~4 hours** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Architectural Review | `@swarm-arch` | - | System architecture, scalability |
| 2: Destructive Testing | `@swarm-qa` | `@swarm-sec` (security tests) | QA, edge cases, load testing |
| 3: Security Hardening | `@swarm-sec` | - | Security architecture, auth |
| 4: Infrastructure | `@swarm-ops` | - | DevOps, capacity planning |
| 5: Polish Gauntlet | `@swarm-ux` | `@swarm-specifier` (copy) | UX, accessibility, SEO |
| 6: Zero-Defect | `@swarm-dev` | `@swarm-qa` | Build verification |
| 7: Final Checklist | `@swarm-verifier` | All agents | Cross-functional review |
| 8: Release | `@swarm-dev`, `@swarm-ops` | - | Deployment coordination |
| 9: Monitoring | `@swarm-ops` | - | Operations monitoring |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/epic-feature` → Phase 7 completion
- `/standard-feature` → Step 7 completion with production-ready status
- `/skill-feature` → Step 8 completion with production-ready status

**This Workflow Triggers:**
- `/feedback-ingestion` → After 24hr post-launch monitoring
- `/progressive-rollout` → If using feature flags for phased release

**Related Workflows:**
- Preceded by: Any feature implementation workflow
- Parallel to: None (this is a terminal workflow for launch)

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  LAUNCH PROTOCOL PROGRESS                               │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/9: Architectural Review   │
│  [░░░░░░░░░░░░░░░░░░] Step 2/9: Destructive Testing    │
│  [░░░░░░░░░░░░░░░░░░] Step 3/9: Security Hardening     │
│  [░░░░░░░░░░░░░░░░░░] Step 4/9: Infrastructure         │
│  [░░░░░░░░░░░░░░░░░░] Step 5/9: Polish Gauntlet        │
│  [░░░░░░░░░░░░░░░░░░] Step 6/9: Zero-Defect            │
│  [░░░░░░░░░░░░░░░░░░] Step 7/9: Final Checklist        │
│  [░░░░░░░░░░░░░░░░░░] Step 8/9: Release                │
│  [░░░░░░░░░░░░░░░░░░] Step 9/9: Monitoring             │
├─────────────────────────────────────────────────────────┤
│  Time Elapsed: [XX:XX]  │  Veto Gates: 5 Active       │
│  Current Phase: [Name]  │  Status: [In Progress]      │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Architecture | `@swarm-arch` identifies structural risks that cause outages at scale | Undetected circular dependencies cause cascading failures |
| 2: QA | `@swarm-qa` finds edge cases users will hit in production | Production bugs discovered by customers |
| 3: Security | `@swarm-sec` validates Iron Dome checklist protects against OWASP Top 10 | Security breaches, data leaks, compliance violations |
| 4: Infrastructure | `@swarm-ops` ensures capacity and SLOs are maintained | Production outages from capacity exhaustion |
| 5: Polish | `@swarm-ux` validates a11y compliance for legal/regulatory requirements | ADA lawsuits, poor UX, SEO penalties |
| 6: Verification | `@swarm-dev` ensures build integrity before production | Deploying broken code to production |
| 7: Final Check | `@swarm-verifier` coordinates cross-functional sign-off | Missing critical prerequisites for deploy |
| 8: Release | `@swarm-dev` + `@swarm-ops` execute deployment safely | Failed deployments, downtime |
| 9: Monitoring | `@swarm-ops` catches issues before users report them | Extended outages, reputation damage |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Architecture review started | T+0 | Designate `@swarm-arch` |
| Architecture complete | T+30min | Veto decision recorded |
| QA testing started | T+30min | Test plan confirmed |
| QA 50% complete | T+60min | Edge case coverage verified |
| Security audit started | T+90min | Checklist distributed |
| Infrastructure review started | T+90min | Capacity metrics pulled |
| Polish gauntlet started | T+110min | A11y audit initiated |
| Zero-defect check | T+140min | Build + lint + test running |
| Final checklist | T+150min | All gates confirmed |
| Deployment started | T+160min | Staging smoke test initiated |
| Production live | T+175min | Health check verified |
| Monitoring complete | T+190min | 15-min window closed |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Architecture → QA
- **Trigger:** Architecture `[APPROVED]`
- **Deliverable:** Architecture findings + approved status
- **Receiver Action:** Begin destructive testing

### Handoff 2: QA → Security
- **Trigger:** QA `[PASS]` with >80% coverage
- **Deliverable:** Test report + coverage metrics
- **Receiver Action:** Begin Iron Dome checklist

### Handoff 3: Security → Infrastructure
- **Trigger:** Security audit complete
- **Deliverable:** Security checklist + auth/validation status
- **Receiver Action:** Begin capacity planning

### Handoff 4: Infrastructure → Polish
- **Trigger:** Infrastructure `[APPROVED]`
- **Deliverable:** Capacity report + SPOF analysis
- **Receiver Action:** Begin a11y/SEO/copy review

### Handoff 5: Polish → Verification
- **Trigger:** Polish gauntlet complete
- **Deliverable:** A11y/SEO/copy status
- **Receiver Action:** Execute build + test verification

### Handoff 6: Verification → Final Check
- **Trigger:** All builds/tests pass
- **Deliverable:** Verification report
- **Receiver Action:** Run final pre-deploy checklist

### Handoff 7: Final Check → Release
- **Trigger:** Final checklist complete
- **Deliverable:** All confirmations received
- **Receiver Action:** Execute deployment sequence

### Handoff 8: Release → Monitoring
- **Trigger:** Production deployed + health checks pass
- **Deliverable:** Deployment confirmation
- **Receiver Action:** Begin 15-min monitoring window

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 5 Veto Gates | Production quality requires multiple safety checks | Prevents 80% of launch failures |
| Zero-Defect Verification Mandatory | No exceptions for production deploys | Eliminates broken production builds |
| 15-Min Post-Deploy Monitoring | Catch issues before users report | Reduces MTTR from hours to minutes |
| Sequential Gates (not parallel) | Each gate builds on previous validation | Catches compounding issues early |
| Staging → Production Sequence | Smoke test before exposing users | Prevents 100% user impact on failure |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
