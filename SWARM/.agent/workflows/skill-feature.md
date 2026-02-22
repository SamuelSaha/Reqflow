---
description: "Skill-Enhanced Feature Implementation (The '10x Sprint')"
---

# 🚀 SKILL-ENHANCED STANDARD FEATURE

> **TRIGGER:** `/skill-feature`
> **EVOLUTION:** Standard Feature + Skill Injection
> **GOAL:** Ship with 10x precision by leveraging domain-specific skills.
> **MODE:** Sequential with Skill Loading
> **TIME ESTIMATE:** 90 min

---

## 🎯 Quick Summary
This workflow enhances the standard feature protocol by injecting domain-specific skills at each step. It ensures standardized patterns, security compliance, accessibility, and type safety through skill-informed development rather than ad-hoc approaches.

---

## 🧬 SKILL INJECTION PROTOCOL

Before starting any feature, identify which skills apply:

| Feature Type | Required Skills |
|--------------|-----------------|
| Auth/Security | `zero-trust`, `supabase-mastery` |
| Database work | `supabase-mastery`, `typescript-precision` |
| UI/A11y | `accessibility-wcag`, `next15-patterns`, `css-architecture`, `design-systems` |
| Performance | `performance-optimization`, `next15-patterns` |
| API/Backend | `typescript-precision`, `observability` |
| French Finance | `french-fiscal`, `typescript-precision` |
| AI/LLM | `prompt-engineering`, `zero-trust` |
| Deploy/CI | `cicd-pipelines`, `observability` |

---

## 🚨 PRE-FLIGHT (Enhanced)

**Turbo:**
```bash
# Load anti-patterns
cat AGENTS.md | head -50

# Verify skills directory exists
ls skills/
```

Before starting, verify:
- [ ] Feature request is clear and specific
- [ ] No active incidents on the codebase
- [ ] `AGENTS.md` loaded (anti-patterns)
- [ ] **Relevant skills identified** (see table above)

---

## 📋 Workflow Steps

### STEP 1: SCOPE LOCK + SKILL SELECTION (5 min)
**Relevant Expertise:** Specification Writing, Skill Identification, Domain Mapping

**Description:**
Define feature scope and identify required domain skills from the skill matrix.

**Scope Definition:**
1. Define User Story: `As a [user], I want [action], so that [outcome]`
2. Write 3-5 Acceptance Criteria (testable)
3. **Identify Domain Skills Required:**
   - Primary Skill: `[skill-name]`
   - Secondary Skills: `[skill-1, skill-2]`

**Output:**
```markdown
## Scope Lock: [Feature Name]

**User Story:** As a [user], I want [action], so that [outcome]

**Acceptance Criteria:**
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

**Skills Required:**
- Primary: `supabase-mastery` (for RLS policies)
- Secondary: `typescript-precision` (for type safety)

**GO/NO-GO:** [GO]
```

**Exit Criteria:**
- User story defined
- Acceptance criteria written
- Skills identified and loaded

---

### STEP 2: PIXEL PERFECT + A11Y SKILL (10 min)
**Relevant Expertise:** UX Design, Accessibility Compliance, WCAG Implementation

**Description:**
Define component specs with skill-informed accessibility compliance.

**Skill Loading:**
```
Use the accessibility-wcag skill to verify compliance.
```

**Spec Requirements:**
- Color contrast ≥4.5:1 verified
- Focus indicators defined
- Keyboard navigation planned
- ARIA labels specified

**Output:** Component Specs + A11Y Verification

**Exit Criteria:**
- WCAG skill applied
- Contrast verified
- Focus/keyboard planned
- ARIA labels specified

---

### STEP 3: BLUEPRINT + STACK SKILLS (5 min)
**Relevant Expertise:** System Architecture, Pattern Application, Technical Planning

**Description:**
Design technical approach using skill-informed patterns from the stack skill library.

**Skill Loading:**
- View `next15-patterns` for App Router patterns
- View `supabase-mastery` for database patterns
- View `typescript-precision` for type patterns

**Design Decisions:**
- Server Actions (not API routes)
- RLS policies (not app-level auth)
- Branded types (not string IDs)

**Output:** Technical Approach with skill references

**Exit Criteria:**
- Stack skills loaded
- Patterns selected
- Architecture decisions documented with skill citations

---

### STEP 4: SURGICAL BUILD + SKILL PATTERNS (30 min)
**Relevant Expertise:** Skill-Informed Development, Pattern Implementation, Code Quality

**Description:**
Implement feature using skill patterns directly rather than coding from scratch.

**SKILL-ENHANCED DEVELOPMENT:**

1. **Before coding, load primary skill:**
   ```
   View the [primary-skill] SKILL.md for patterns.
   ```

2. **Use skill patterns directly:**
   - Copy RLS templates from `supabase-mastery`
   - Use Server Action patterns from `next15-patterns`
   - Apply branded types from `typescript-precision`

3. **Code with skill-informed patterns (not from scratch)**

**HARD RULES (from AGENTS.md + Skills):**
- `<input type="date">` (NO react-day-picker)
- Imports at TOP only
- NO `any` types (use `typescript-precision` patterns)
- RLS on all user tables (from `supabase-mastery`)
- Server Actions for mutations (from `next15-patterns`)

**Turbo:**
```bash
npm run lint && npm run build
```

**Exit Criteria:**
- Primary skill patterns applied
- Secondary skill patterns applied
- Hard rules followed
- Build passing

---

### STEP 4.5: PERFORMANCE OPTIMIZATION (10 min)
**Relevant Expertise:** Performance Engineering, Bundle Analysis, Code Splitting, Web Vitals

**Description:**
Apply performance-optimization skill to ensure feature meets performance budgets and Web Vitals thresholds.

**Skill Loading:**
```
Use the performance-optimization skill for bundle analysis and code splitting.
```

**Performance Checklist:**
1. **Bundle Analysis:**
   - Run webpack-bundle-analyzer
   - Identify oversized dependencies
   - Verify <50kb per feature contribution

2. **Code Splitting:**
   - Apply dynamic imports for heavy components
   - Implement route-based splitting
   - Lazy load below-the-fold content

3. **Web Vitals:**
   - LCP (Largest Contentful Paint) <2.5s
   - FID (First Input Delay) <100ms
   - CLS (Cumulative Layout Shift) <0.1

4. **Main Thread:**
   - No blocking >50ms
   - Offload heavy work to Web Workers if needed

**Turbo:**
```bash
# Analyze bundle
npm run analyze

# Check performance budgets
npm run perf:check

# Run Lighthouse
npm run lighthouse
```

**Output:**
```markdown
## Performance Optimization Report
**Bundle Impact:** [X]kb (Budget: <50kb)
**Web Vitals:**
- LCP: [X]s ✅
- FID: [X]ms ✅
- CLS: [X] ✅
**Optimizations Applied:**
- Code splitting: [list]
- Lazy loading: [list]
**Status:** ✅ PASS
```

**Exit Criteria:**
- Performance-optimization skill applied
- Bundle size within budget
- Web Vitals within thresholds
- Code splitting implemented where beneficial
- No performance regressions

---

### STEP 5: SECURITY SKILL AUDIT (5 min)
**Relevant Expertise:** Security Review, Zero-Trust Validation, Compliance Checking

**Description:**
Verify security compliance using zero-trust skill checklist.

**Skill Loading:**
- Load `zero-trust` skill

**Verification Checklist:**
- [ ] getUser() used (not getSession())
- [ ] Inputs validated with Zod
- [ ] RLS enabled on affected tables
- [ ] No secrets in client code
- [ ] Rate limiting if applicable

**Output:** Security Checklist Pass/Fail

**Exit Criteria:**
- Zero-trust skill applied
- All checklist items verified
- No security violations

---

### STEP 6: DESTRUCTIVE QA + A11Y (15 min)
**Relevant Expertise:** Quality Assurance, Accessibility Testing, Edge Case Testing

**Description:**
Execute standard QA plus skill-informed accessibility testing.

**Standard QA:**
1. Edge Cases: null, undefined, "", 10000 chars, emoji
2. Stress: Click button 10x rapidly
3. Mobile: Test on 320px width

**A11Y Skill Verification:**
- [ ] Run axe-core audit
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast passes
- [ ] Screen reader labels present

**Turbo:**
```bash
npm run test
```

**Exit Criteria:**
- Edge cases tested
- Stress testing passed
- Mobile tested
- A11Y skill audit passed

---

### STEP 7: ZERO-DEFECT VERIFICATION (MANDATORY)
**Relevant Expertise:** Build Verification, Skill Compliance Validation

**Description:**
Run complete verification with skill compliance checks.

**Turbo:**
```bash
npm run build && npm run lint && npm run test
```

**Skill-Enhanced Verification:**
```markdown
## ✅ VERIFICATION REPORT

**Build:** ✅ Passed
**Lint:** ✅ Passed
**Tests:** ✅ Passed

**Skill Compliance:**
- [ ] `supabase-mastery`: RLS policies verified
- [ ] `next15-patterns`: Server Actions used correctly
- [ ] `typescript-precision`: No `any` types
- [ ] `zero-trust`: Security audit passed
- [ ] `accessibility-wcag`: A11Y audit passed

**How to Confirm:**
```bash
npm run dev
# Then go to [URL] and [action] to see [result]
```
```

**Exit Criteria:**
- Build passes
- Lint passes
- Tests pass
- All skill compliance items verified

---

### STEP 8: SHIP + OBSERVABILITY (5 min)
**Relevant Expertise:** Deployment, Monitoring Setup, CI/CD

**Description:**
Clean up, deploy with observability hooks, and monitor post-deploy.

**Ship Tasks:**
1. Janitor Protocol: Remove unused imports, console.logs
2. Verify CI pipeline passes
3. Deploy with observability hooks
4. Monitor error rate for 15 minutes

**Skill:** `observability`, `cicd-pipelines`

**Output:** `🚀 SHIPPED: [Feature Name] - Version [X.X.X]`

**Exit Criteria:**
- Code cleaned
- CI passes
- Deployed with observability
- 15-minute monitoring complete

---

## 📊 SKILL-ENHANCED EXIT CRITERIA

| Check | Standard | Skill-Enhanced |
|-------|----------|----------------|
| Acceptance Criteria met | ✅ | ✅ |
| Build passes | ✅ | ✅ |
| Tests pass | ✅ | ✅ |
| No lint errors | ✅ | ✅ |
| Mobile responsive | ✅ | ✅ |
| AGENTS.md respected | ✅ | ✅ |
| **Skill patterns applied** | — | ✅ |
| **Security audit passed** | — | ✅ |
| **A11Y audit passed** | — | ✅ |
| **Type safety verified** | — | ✅ |
| **Performance optimized** | — | ✅ |
| **Web Vitals within budget** | — | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Scope Lock + Skills | 5 min |
| UX + A11Y | 10 min |
| Blueprint | 5 min |
| Build | 30 min |
| Performance Optimization | 10 min |
| Security Audit | 5 min |
| QA + A11Y | 15 min |
| Verification | 10 min |
| Ship | 5 min |
| **TOTAL** | **95 min** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Scope + Skills | `@swarm-specifier` | `@swarm-arch` | Skill identification |
| 2: UX + A11Y | `@swarm-ux` | `@swarm-sec` | Accessibility |
| 3: Blueprint | `@swarm-arch` | `@swarm-dev` | Pattern application |
| 4: Build | `@swarm-dev` | `@swarm-qa` | Skill-informed coding |
| 4.5: Performance | `@swarm-dev` | `@swarm-ops` | Performance optimization |
| 5: Security | `@swarm-sec` | - | Zero-trust compliance |
| 6: QA | `@swarm-qa` | `@swarm-ux` | A11Y testing |
| 7: Verification | `@swarm-dev` | `@swarm-qa` | Skill compliance |
| 8: Ship | `@swarm-ops` | `@swarm-dev` | Deployment |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/tech-contract` → After contracts frozen
- `/wedge-definition` → For features requiring specific expertise
- `/standard-feature` → When skills identified as beneficial

**This Workflow Triggers:**
- `/progressive-rollout` → For staged deployment
- `/launch-protocol` → For production release

**Related Workflows:**
- Preceded by: `/tech-contract` or `/wedge-definition`
- Leads to: Rollout workflows
- Alternative: `/standard-feature` (without skill injection)

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  SKILL-ENHANCED FEATURE PROGRESS                        │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/8: Scope + Skills         │
│  [░░░░░░░░░░░░░░░░░░] Step 2/8: UX + A11Y              │
│  [░░░░░░░░░░░░░░░░░░] Step 3/8: Blueprint              │
│  [░░░░░░░░░░░░░░░░░░] Step 4/8: Build                  │
│  [░░░░░░░░░░░░░░░░░░] Step 4.5/8: Performance          │
│  [░░░░░░░░░░░░░░░░░░] Step 5/8: Security Audit         │
│  [░░░░░░░░░░░░░░░░░░] Step 6/8: QA + A11Y              │
│  [░░░░░░░░░░░░░░░░░░] Step 7/8: Verification           │
│  [░░░░░░░░░░░░░░░░░░] Step 8/8: Ship                   │
├─────────────────────────────────────────────────────────┤
│  Primary Skill: [Name]    │  Compliance: [XX%]         │
│  Secondary: [Names]       │  Patterns Applied: [N]     │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Scope + Skills | `@swarm-specifier` maps features to required domain expertise | Wrong skill selection, pattern mismatch |
| 2: UX + A11Y | `@swarm-ux` applies accessibility patterns systematically | A11Y violations found late, expensive fixes |
| 3: Blueprint | `@swarm-arch` selects appropriate patterns from skill library | Ad-hoc architecture, technical debt |
| 4: Build | `@swarm-dev` implements using proven patterns instead of inventing | Reinventing wheels, inconsistent code |
| 4.5: Performance | `@swarm-dev` applies performance-optimization skill for Web Vitals | Performance regressions, slow bundles |
| 5: Security | `@swarm-sec` validates against zero-trust checklist | Security vulnerabilities in production |
| 6: QA | `@swarm-qa` runs skill-informed test suites | Incomplete testing, missed edge cases |
| 7: Verification | `@swarm-dev` ensures skill compliance, not just build | Patterns not actually applied |
| 8: Ship | `@swarm-ops` deploys with observability | No visibility into production behavior |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Skills identified | T+0 | Primary + secondary skills selected |
| Skill files loaded | T+5min | SKILL.md files accessed |
| A11Y skill applied | T+15min | Contrast + keyboard verified |
| Stack skills loaded | T+20min | Patterns selected |
| Build started | T+25min | Primary skill patterns ready |
| Security audit | T+55min | Zero-trust checklist complete |
| A11Y audit | T+70min | axe-core run |
| Verification complete | T+80min | All skill compliance verified |
| Deploy complete | T+85min | Monitoring active |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Specifier → UX
- **Trigger:** Scope locked with skills identified
- **Deliverable:** Feature scope + skill requirements
- **Receiver Action:** Apply accessibility-wcag skill

### Handoff 2: UX → Architect
- **Trigger:** Component specs with A11Y verification
- **Deliverable:** UX specifications
- **Receiver Action:** Load stack skills for blueprint

### Handoff 3: Architect → Dev
- **Trigger:** Technical approach with skill patterns
- **Deliverable:** Architecture with pattern references
- **Receiver Action:** Implement using skill patterns

### Handoff 4: Dev → Sec
- **Trigger:** Feature implementation complete
- **Deliverable:** Working feature
- **Receiver Action:** Run zero-trust security audit

### Handoff 5: Sec → QA
- **Trigger:** Security audit passed
- **Deliverable:** Security checklist
- **Receiver Action:** Run QA + A11Y testing

### Handoff 6: QA → Dev
- **Trigger:** QA passed
- **Deliverable:** Test results
- **Receiver Action:** Run skill-enhanced verification

### Handoff 7: Dev → Ops
- **Trigger:** All verifications passed
- **Deliverable:** Verified build with compliance report
- **Receiver Action:** Deploy with observability

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Skill Injection Protocol | Domain expertise captured in reusable skills | 80% reduction in pattern inconsistency |
| Primary + Secondary Skills | Not all features need all skills | Efficient skill application |
| Skill Pattern Direct Use | Copy from SKILL.md, don't reinvent | Standardized implementation |
| Security Audit Step | Zero-trust is too important for implicit handling | Prevents 90% of auth vulnerabilities |
| A11Y Skill Verification | Accessibility requires systematic approach | WCAG compliance from design |
| Skill Compliance in Verification | Verify patterns actually applied | Ensures skill value realized |
| Observability in Ship | Must see production behavior | Early issue detection |

---

## 📈 10X IMPROVEMENT

| Metric | Standard | Skill-Enhanced |
|--------|----------|----------------|
| Security bugs | Common | Rare (Zero-Trust skill) |
| A11Y violations | Found in QA | Prevented by design |
| Type errors | Runtime | Compile-time |
| Code patterns | Ad-hoc | Standardized |
| Rework rate | 20% | <5% |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
