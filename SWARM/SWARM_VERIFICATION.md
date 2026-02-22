# SWARM VERIFICATION ENGINE
# Binary Gates - Pass or Block
# Version: 5.0.0-OPTIMIZED

---

## 🎯 PRINCIPLE

> **Verified or blocked. No gray zone.**

Every output must pass through binary verification. "Looks good" is not a result.

---

## ⚡ VERIFICATION MATRIX

### Gate 1: BUILD (10s timeout)
```bash
npm run build
```
| Result | Action |
|--------|--------|
| exit 0 | ✅ PASS → Next gate |
| exit ≠ 0 | ❌ BLOCK → Fix + retry |

### Gate 2: LINT (10s timeout)
```bash
npm run lint
```
| Result | Action |
|--------|--------|
| 0 errors, 0 warnings | ✅ PASS → Next gate |
| any error | ❌ BLOCK → Fix + retry |
| warnings only | ⚠️ WARN → Log + proceed |

### Gate 3: TEST (60s timeout)
```bash
npm run test
```
| Result | Action |
|--------|--------|
| all pass | ✅ PASS → Next gate |
| any fail | ❌ BLOCK → Fix + retry |
| coverage < threshold | ⚠️ WARN → Log + proceed |

### Gate 4: SECURITY (30s timeout)
```bash
npm audit --audit-level=high
```
| Result | Action |
|--------|--------|
| 0 critical, 0 high | ✅ PASS → Next gate |
| any critical/high | ❌ BLOCK → @swarm-sec required |
| moderate/low only | ⚠️ WARN → Log + proceed |

### Gate 5: SCOPE (instant)
```yaml
check:
  - All changes within ticket boundary
  - No undeclared assumptions
  - AC references present
```
| Result | Action |
|--------|--------|
| within scope | ✅ PASS → Deliver |
| scope drift | ❌ REJECT → Error taxonomy |

---

## 📋 VERIFICATION RESPONSE FORMAT

### PASS Template
```yaml
verification:
  gates:
    build: PASS
    lint: PASS
    test: PASS (42/42)
    security: PASS
    scope: PASS
  result: READY_TO_SHIP
  verified_at: "2024-01-01T12:00:00Z"
```

### BLOCK Template
```yaml
verification:
  gates:
    build: PASS
    lint: PASS
    test: FAIL
    security: SKIP
    scope: SKIP
  result: BLOCKED
  blocker:
    gate: test
    error: "UserAuth.test.ts: Expected 200, received 401"
    fix_required: "Auth token not refreshed in test setup"
  verified_at: "2024-01-01T12:00:00Z"
```

---

## 🛡️ GATE DEPENDENCIES

```
     BUILD
       │
       ▼
     LINT
       │
       ▼
     TEST ←── Can run parallel with SECURITY
       │
       ▼
   SECURITY
       │
       ▼
     SCOPE
       │
       ▼
    DELIVER
```

**Optimization:** TEST and SECURITY can run in parallel after LINT passes.

---

## 🚫 VERIFICATION ANTI-PATTERNS

| Pattern | Tag | Action |
|---------|-----|--------|
| "Should be fixed" | UNVERIFIED_CLAIM | Require gate pass |
| "Tested manually" | MANUAL_ONLY | Require automated test |
| "Works on my machine" | ENV_LEAK | Require CI pass |
| No error output | SILENT_FAIL | Require error log |
| Skipped gate | GATE_BYPASS | Require justification |

---

## ⚡ FAST-TRACK MODES

### Hotfix Mode (Critical production bug)
```yaml
gates_required: [BUILD, TEST] only
justification: "Production P0 incident"
post_deploy: Full gate check required within 24h
```

### Typo-Fix Mode (Documentation/copy only)
```yaml
gates_required: [BUILD] only
justification: "Non-code change"
scope: ".md files only"
```

---

## 📊 GATE METRICS

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Gate pass rate | > 95% | < 90% |
| Build time | < 60s | > 120s |
| Test time | < 120s | > 300s |
| Retry rate | < 10% | > 20% |
| Block→Fix→Pass time | < 15m | > 30m |

---

## 🔄 RETRY PROTOCOL

On any gate failure:
1. **Log** the failure with full error output
2. **Analyze** root cause (< 2 min)
3. **Fix** the specific issue
4. **Re-run** from failed gate (not from start)
5. **Max retries:** 3 before escalation

---

## 🏆 VERIFICATION CHECKLIST

Before marking "VERIFIED":

- [ ] BUILD gate passed with exit 0
- [ ] LINT gate passed with 0 errors
- [ ] TEST gate passed with all tests green
- [ ] SECURITY gate passed with 0 critical/high
- [ ] SCOPE gate passed (within ticket boundary)
- [ ] All gates have timestamps
- [ ] Evidence attached (command output or CI link)

---

**Version:** 5.0.0-OPTIMIZED  
**Status:** MANDATORY  
**Rule:** No ship without green gates.
