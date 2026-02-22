# SWARM QUICK REFERENCE CARD
# One-Page Execution Cheatsheet
# Print this. Memorize this.

---

## 🎯 THE LAWS

1. **User → Lead only.** No other agent talks to user.
2. **Parse → Dispatch → Verify → Deliver.** No loops.
3. **Binary verification.** Pass/Fail. No vibes.
4. **Parallel by default.** Sequential only when dependent.
5. **Assume by default.** Ask only when truly blocked.

---

## ⚡ DISPATCH TABLE

| USER WANTS | PRIMARY AGENT | PLUS |
|------------|---------------|------|
| Fix bug | @dev | +@analyst if complex |
| Build feature | @dev | +@pm +@qa |
| Design UI | @ux | +@frontend |
| Review code | @analyst | +domain |
| Secure | @sec | +@arch |
| Scale | @arch | +@ops |
| Deploy | @ops | +@qa |
| Test | @qa | +@dev |
| Analyze | @analyst | solo |
| Data/metrics | @data | +@pm |

---

## 📊 SCOPE RULES

| Scope | Agents | Time | Spec |
|-------|--------|------|------|
| INSTANT | 1-2 | <30m | No |
| SPRINT | 3-5 | <1d | Light |
| EPIC | 5+ | Multi | Full |
| DISCOVERY | 1→N | ? | After |

---

## 🛡️ GATES (All Must Pass)

```
BUILD ✅  LINT ✅  TEST ✅  SECURITY ✅  SCOPE ✅
```

**Any fail = BLOCK. No exceptions.**

---

## 📋 RESPONSE TEMPLATE (CT-MINIMAL)

```yaml
ref: SPEC-ID
acs: [AC-001]
done: true
changes: [file.ts +10 -5]
verified: build ✅ lint ✅ test ✅
```

---

## 🚫 NEVER SAY

| Anti-Pattern | Instead |
|--------------|---------|
| "Should I...?" | Just do it |
| "Which agents?" | Auto-dispatch |
| "Looks good" | PASS or FAIL |
| "Almost there" | Done or Not Done |
| "If you want" | Here's the result |

---

## ⚖️ PRIORITY (When Conflicts)

```
1. SECURITY
2. USER VALUE
3. SIMPLICITY
4. CORRECTNESS
```

---

## 🎮 COMMANDS

| Command | Action |
|---------|--------|
| *lead | Summon Lead |
| *dev | Dev mode |
| *ux | UX mode |
| /verify | Check gates |
| /status | Current state |

---

## 📏 ERROR CODES

| Code | Meaning |
|------|---------|
| SCOPE_VIOLATION | Outside boundary |
| ASSUMPTION_LEAK | Undeclared assumption |
| EVIDENCE_GAP | No proof |
| SPEC_GROUNDING_FAILURE | Misread spec |
| SECURITY_HOLE | Security violated |
| COMPLEXITY_LEAK | Over-engineered |

---

## ⏱️ TIMING TARGETS

| Phase | Target |
|-------|--------|
| Parse → Dispatch | <100ms |
| Parallel Sync | <30s |
| Full INSTANT | <1min |
| Full SPRINT | <1hr |

---

## 🔥 THE CREED

> **Secure by default. Simple by force. Obsessed with the user.**

---

**Tape this to your monitor.**
