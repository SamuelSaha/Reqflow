# SWARM TURBO ENGINE
# Ultra-Fast Execution Protocol
# Version: 5.0.0-OPTIMIZED

---

## 🚀 DESIGN PRINCIPLE

> **Zero latency between intent and execution.**
> Parse once. Decide instantly. Execute parallel. Verify binary.

---

## ⚡ TURBO DISPATCH TABLE (MEMORIZE THIS)

### Pattern → Agent → Action (< 100ms decision)

| USER SAYS (keyword) | DISPATCH NOW | PARALLEL SUPPORT |
|---------------------|--------------|------------------|
| `fix`, `bug`, `broken`, `error` | @swarm-dev | +@swarm-analyst |
| `build`, `create`, `add`, `implement` | @swarm-dev | +@swarm-pm +@swarm-qa |
| `design`, `ux`, `ui`, `visual` | @swarm-ux | +@swarm-frontend |
| `review`, `audit`, `check` | @swarm-analyst | +domain agents |
| `secure`, `auth`, `encrypt`, `pii` | @swarm-sec | +@swarm-arch |
| `scale`, `architecture`, `system` | @swarm-arch | +@swarm-ops |
| `deploy`, `ship`, `release` | @swarm-ops | +@swarm-qa |
| `test`, `qa`, `verify` | @swarm-qa | +@swarm-dev |
| `data`, `metrics`, `analytics` | @swarm-data | +@swarm-pm |
| `why`, `analyze`, `root cause` | @swarm-analyst | solo |
| `spec`, `plan`, `scope` | @swarm-pm | +@swarm-ux |
| `frontend`, `component`, `react` | @swarm-frontend | +@swarm-ux |
| `backend`, `api`, `database` | @swarm-backend | +@swarm-arch |

---

## 🧠 INSTANT SCOPE CLASSIFIER

```
SCOPE = f(keywords, files_mentioned, complexity_indicator)

INSTANT    → 1-2 agents, <30 min, no spec needed
SPRINT     → 3-5 agents, <1 day, lightweight spec
EPIC       → 5+ agents, multi-day, full spec lifecycle
DISCOVERY  → Unknown scope → @swarm-analyst first → then classify
```

### Scope Decision Tree (< 50ms)

```
INPUT: User request
  │
  ├── Contains "fix", "bug", single file? → INSTANT
  ├── Mentions 1-3 files + clear outcome? → SPRINT  
  ├── Ambiguous OR system-wide impact? → EPIC
  ├── "Should we...?", "What if...?" → DISCOVERY
  │
  └── DEFAULT: SPRINT (safe assumption)
```

---

## 🔥 TURBO RESPONSE TEMPLATES

### CT-MINIMAL (90% of responses)
```yaml
ref: "SPEC-ID | ADHOC"
acs: [AC-001]
done: true | false
changes: ["file.ts +10 -5"]
verified: build ✅ lint ✅ test ✅
```

### CT-FULL (Security/Arch/Ambiguous only)
```yaml
ref: "SPEC-YYYYMMDD-NNN"
ticket: "T-XXX"
acs: [AC-001, AC-002]
goal: "One sentence"
summary: "One sentence + recommendation"
assumptions: ["Listed"]
unknowns: ["What would change decision"]
options:
  - "A: pro | con"
  - "B: pro | con"
decision: "Chose A because X"
evidence: ["code:L42", "log:timestamp"]
verification: ["test:name", "metric:threshold"]
risks: ["risk: mitigation"]
confidence: 0.75
```

---

## ⏱️ EXECUTION TIMING TARGETS

| Phase | Target | Hard Limit |
|-------|--------|------------|
| Intent Parse | < 100ms | 500ms |
| Agent Dispatch | < 200ms | 1s |
| Parallel Sync | < 30s | 2 min |
| Verification | < 10s | 1 min |
| User Response | < 1 min | 5 min |

---

## 🎯 PRE-COMPUTED COMBINATIONS

### Bug Fix Flow
```
INSTANT: @swarm-dev (solo)
IF complex: + @swarm-analyst → 5 whys
IF security: + @swarm-sec → threat check
VERIFY: build + test + no regression
```

### Feature Build Flow
```
SPRINT: @swarm-pm → scope
PARALLEL:
  @swarm-ux → wireframe
  @swarm-arch → constraints
THEN:
  @swarm-dev → implement
  @swarm-qa → verify
```

### UI Review Flow
```
PARALLEL ALL:
  @swarm-ux → visual audit
  @swarm-frontend → feasibility
  @swarm-pm → benchmarks
COMPILE → ruthless verdict
```

### Security Audit Flow
```
@swarm-sec → threat model
+ @swarm-arch → attack surface
+ @swarm-qa → abuse cases
SYNC → risk matrix
```

---

## 🛡️ BINARY GATES (Pass/Fail Only)

| Gate | Pass Condition | On Fail |
|------|----------------|---------|
| BUILD | exit 0 | BLOCK |
| LINT | 0 errors, 0 warnings | BLOCK |
| TEST | all pass, coverage ≥ threshold | BLOCK |
| SECURITY | 0 critical, 0 high | BLOCK |
| SCOPE | ≤ ticket boundary | REJECT |

---

## 🚫 ANTI-PATTERN INSTANT REJECT

| Pattern | Tag | Auto-Response |
|---------|-----|---------------|
| "Should I...?" | PERMISSION_LOOP | Execute don't ask |
| "Which agents?" | ROUTING_LEAK | Auto-dispatch |
| "Looks good" | VIBES_GATE | Require binary pass/fail |
| "Almost there" | COMPLETION_LIE | Require verification |
| No AC reference | SPEC_GROUNDING | Require spec_ref |

---

## 📊 TURBO METRICS

| Metric | Target | Current |
|--------|--------|---------|
| First-parse dispatch | > 95% | -- |
| Parallel utilization | > 60% | -- |
| Verification coverage | 100% | -- |
| User wait reduction | -50% | -- |
| Rejection clarity | 100% | -- |

---

## 🎮 TRIGGER WORDS → INSTANT ACTION

```
"now" → Priority boost
"asap" → Skip ceremony
"ruthless" → Maximum candor
"quick" → INSTANT scope
"full" → EPIC scope
"audit" → Multi-agent parallel review
"ship" → Deploy pipeline
"rollback" → Emergency @swarm-ops
```

---

## ⚡ DELEGATION MICRO-FORMAT

```yaml
to: "@swarm-agent"
q: "Hypothesis question?"
ct: 1 | 2
pass: "Binary success"
fail: "Binary failure"
```

**MAXIMUM 5 LINES. No ceremony.**

---

## 🏆 SUCCESS = SPEED × ACCURACY × SIMPLICITY

**This engine exists to remove friction.**
**Every millisecond of latency is a bug.**
**Every unnecessary question is a failure.**

---

**Version:** 5.0.0-OPTIMIZED
**Status:** ACTIVE
**Philosophy:** Parse → Decide → Deploy → Report. No loops. No waiting.
