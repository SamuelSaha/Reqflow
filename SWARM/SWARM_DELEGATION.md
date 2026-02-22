# SWARM DELEGATION PROTOCOLS
# How Main Agents Delegate to Subagents
# Version: 4.0.0

---

## 🎯 GOLDEN RULE

> Subagents propose. Main agents verify. The spec arbitrates. Reality decides.

No ego. No hierarchy games. Just correctness under pressure.

---

## 1️⃣ SPEC COMPILER MODEL

### Concept
Treat the spec as **source code**. Main agents **compile** subagent outputs against it.

### How It Works
Main agent owns a **Spec Contract**. Every subagent output is validated against:
- **Inputs** it was given
- **Outputs** it promised
- **Constraints** in the spec

### Required Response Format
Main agent MUST specify the **Critical Thinking level** per delegation:
- **CT1 (default):** simple, low-risk, well-defined work
- **CT2 (required):** security/auth/PII, architecture/data model changes, ambiguous requirements, performance-critical decisions

#### CT1 (Minimum)
```yaml
subagent_response:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  ac_refs: ["AC-001"]
  assumptions:
    - "User has authenticated session"
  decisions:
    - "Chose Option A because..."
  open_risks:
    - "Performance untested at >100 concurrent users"
```

#### CT2 (Critical Thinking Required)
```yaml
subagent_response:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  ticket_ref: "T-<spec>-<nnn>"
  ac_refs: ["AC-001", "AC-002"]
  goal_in_own_words: "Restate goal in one sentence"
  summary: "One sentence answer to the delegated question"
  assumptions:
    - "Data is already validated at API layer"
  unknowns:
    - "Unknown 1 (what would change the decision)"
  options_considered:
    - "Option A: why it could work / why it might fail"
    - "Option B: why it could work / why it might fail"
  decision:
    - "Choose Option A because..."
  evidence:
    - "Evidence used (code/logs/docs) OR 'None (pattern-based)'"
  verification:
    - "How we will prove it works (tests/metrics/checks)"
  open_risks:
    - "Residual risk + mitigation"
  confidence: 0.72
```

### Rejection Triggers
Main agent rejects outputs with:
- ❌ Undeclared assumptions
- ❌ Scope drift
- ❌ Missing constraints
- ❌ CT2 requested but unknowns/options/evidence/verification/confidence missing
- ❌ Spec misread or AC mismatch (`SPEC_GROUNDING_FAILURE`)
- ❌ One option presented when multiple are required (`PREMATURE_CONVERGENCE`)
- ❌ Claims presented as facts without evidence or labeling (`EVIDENCE_GAP`)

### Effect
- Silent errors die early
- No "looks fine to me" hand-waving

---

## 2️⃣ DELEGATION AS HYPOTHESIS TESTING

### Concept
Main agents don't delegate **work**. They delegate **questions**.

### Example: Frontend Lead

**❌ BAD (Task Delegation)**
```
"Design loading states"
```

**✅ GOOD (Hypothesis Delegation)**
```
"What loading states are required to avoid user confusion under 300ms / 1s / 5s latency?"
```

### Why This Matters
- Subagents **reason** instead of executing blindly
- Main agent compares **answers**, not artifacts

### Delegation Template

```yaml
delegation:
  spec_packet:
    spec_ref: "SPEC-YYYYMMDD-NNN"
    goal: "Single sentence objective"
    non_goals: ["Explicitly out of scope"]
    constraints: ["Hard constraint"]
    acceptance_criteria:
      - id: "AC-001"
        criterion: "Binary requirement"
        pass_threshold: "Binary pass threshold"
        priority: "P0"
  question: "What happens to the user experience when X occurs?"
  ct_level: "CT1 | CT2"
  context:
    - "Current flow: [description]"
    - "Constraints: [limitations]"
    - "Assumptions: [what we believe]"
  falsifier: "What result would prove your answer wrong?"
  success_condition: "Answer demonstrates understanding of impact on user"
  failure_condition: "Answer only describes implementation, not user impact"
```

### One-Shot Delegation Template (Minimum Input)

```yaml
delegation:
  mode: "one-shot-spec"
  seed:
    goal: "Single sentence objective"
    user: "Primary user (optional)"
    must_have: ["One non-negotiable capability"]
    constraints: ["Hard constraints (optional)"]
    non_goals: ["Out of scope (optional)"]

  expected_output:
    - "5-12 binary ACs (P0/P1)"
    - "Assumptions Ledger (E0 defaults + falsifiers)"
    - "Spec Context Packet"
    - "3-7 starter tickets"

  switch_rule: "Ask one precise question only if blocked by missing external constraint; otherwise proceed with E0 defaults."
```

---

## 3️⃣ CONTROLLED REDUNDANCY

### Concept
Critical parts of the spec are **intentionally reviewed by 2 subagents** with different lenses.

### Overlap Matrix

| Topic | Subagent A | Subagent B |
|-------|------------|------------|
| Performance | Frontend Performance Engineer | DevOps Runtime |
| Edge Cases | UX Edge-Case Reviewer | QA Sad-Path Designer |
| API Design | Frontend API Shape Reviewer | Backend API Designer |
| Metrics | Data Success Metrics | Product Acceptance Criteria |
| Accessibility | UX Accessibility Reviewer | Frontend Accessibility Specialist |

### Rule
Main agent MUST **diff the outputs**. Any disagreement must be resolved **in writing** in the spec.

### Effect
- Emergent bug detection
- No single-agent blind spots

---

## 4️⃣ INVERSION LOOPS (Error Detection)

### Concept
Every main agent runs an **inversion check** on subagent outputs.

### Standard Question
> "If this were wrong, how would it fail in production?"

### Application by Agent

| Agent | Inversion Question |
|-------|-------------------|
| Product Manager | "How could this metric lie?" |
| Frontend Lead | "How could this UI break under stress?" |
| Backend | "How could this data corrupt silently?" |
| QA | "What user behavior invalidates this test?" |
| Data | "What would falsify this conclusion?" |
| Architect | "What makes this impossible to maintain in 2 years?" |
| Security | "How would an attacker exploit this?" |

### Result
- Errors surface before implementation
- Spec becomes **defensive**, not optimistic

---

## 5️⃣ PROGRESSIVE DELEGATION

### Concept
Subagents start **broad**, then get **tighter** instructions.

### Three Phases

| Phase | Subagent Mode | Main Agent Mode |
|-------|---------------|-----------------|
| **Explore** | Propose options, risks, unknowns | Gather possibilities |
| **Constrain** | Refine within selected direction | Select direction, narrow scope |
| **Verify** | Validate correctness | Check, not create |

### Phase Details

**Phase 1: Explore**
- Subagent proposes multiple approaches
- Identifies risks and unknowns
- No commitment yet

**Phase 2: Constrain**
- Main agent selects direction
- Subagent refines within constraints
- Scope narrows

**Phase 3: Verify**
- Subagent validates correctness
- No creativity—just accuracy
- Final check

### Effect
- Creativity **early**
- Precision **late**
- No premature convergence

---

## 6️⃣ QUALITY GATES (Not Bottlenecks)

### Concept
Main agents do **lightweight verification**, not full rework.

### Rules

**Main Agent DOES NOT:**
- Redo subagent work
- "Fix it themselves"
- Accept partial compliance

**Main Agent DOES:**
- Flag violations
- Send back with specific rejection reason
- Track patterns

### Rejection Template

```markdown
## ❌ REJECTED

**What failed:** [Specific element that doesn't meet spec]
**Why it matters:** [Impact on user/system/business]
**What must change:** [Required modification]
**What must NOT change:** [Elements to preserve]

**Error Type:** [From taxonomy below]
```

### Effect
- Scales well
- Trains subagents over time
- Creates feedback loops

---

## 7️⃣ ERROR TAXONOMY

### Concept
Errors are **categorized**, not debated. Shared vocabulary prevents endless discussions.

### Categories

| Error Type | Description | Example |
|------------|-------------|---------|
| `SCOPE_VIOLATION` | Output exceeds ticket boundaries | Added feature not in spec |
| `ASSUMPTION_LEAK` | Undeclared assumption in output | "Assumes user is logged in" (not stated) |
| `EVIDENCE_GAP` | Claims not supported by evidence / unlabeled heuristics | "This is safe" with no proof |
| `PREMATURE_CONVERGENCE` | Only one option proposed where multiple are required | Chose architecture without alternatives |
| `SPEC_GROUNDING_FAILURE` | Misread spec goal/ACs/non-goals/constraints or failed to reference them | Conflicts with spec non-goals |
| `MISSING_EDGE_CASE` | Obvious failure mode not addressed | No handling for empty list |
| `INCONSISTENT_CONTRACT` | API/interface contradicts spec | Endpoint returns different shape |
| `UNMEASURABLE_OUTCOME` | No way to verify success | "Improve UX" with no metric |
| `PERFORMANCE_BLIND_SPOT` | No performance consideration | O(n²) algorithm unaddressed |
| `ACCESSIBILITY_GAP` | a11y requirement missing | No keyboard navigation |
| `SECURITY_HOLE` | Security constraint violated | Client-side auth check only |
| `COMPLEXITY_LEAK` | Unnecessary abstraction | 3 layers for simple CRUD |
| `USER_DISCONNECT` | No clear user benefit | Feature serves only code elegance |

### Mechanism
Main agents **tag rejections** with error type. Patterns emerge across specs.

### Effect
- Continuous improvement of the swarm
- Fewer repeated mistakes
- Objective rejection criteria

---

## 8️⃣ FRONTEND SPECIAL CONTROLS

### Concept
Frontend Lead has **elevated authority** because frontend is the gravity center.

### Blocking Authority
Frontend Lead can **block specs** without:
- [ ] Defined UI states (default, loading, error, empty)
- [ ] Defined error handling
- [ ] Defined performance budget

### Request Authority
Frontend Lead can **request**:
- API reshaping
- Additional backend guarantees
- Simplified domain models

### Verification Loop

```
UX Review → FE Feasibility Check
         ↓
FE Review → Backend Contract Validation
         ↓
FE Review → QA Edge Cases
         ↓
FE Review → DevOps Build/Runtime Constraints
```

### Effect
Frontend becomes a **constraint setter**, not a renderer.

---

## 9️⃣ SPEC HEALTH DASHBOARD (Meta-Agent)

### Concept
A lightweight meta-agent tracks swarm health.

### Tracked Metrics

| Metric | Purpose |
|--------|---------|
| Rejections per spec | Indicates spec quality |
| Error categories | Shows systemic issues |
| Agent disagreement | Finds process gaps |
| Verification loop time | Measures efficiency |

### Use
- Improve delegation quality
- Detect weak specs early
- Tune subagent activation

---

## 🔟 DELEGATION CHECKLIST

Before delegating to a subagent:

- [ ] Framed as a **question**, not a task
- [ ] Context provided (constraints, assumptions)
- [ ] Success condition defined
- [ ] Failure condition defined
- [ ] Required response format specified
- [ ] Error taxonomy understood

Before accepting subagent output:

- [ ] Assumptions explicitly stated
- [ ] Decisions documented with rationale
- [ ] Unknowns + options included when CT2 requested
- [ ] Evidence stated (or clearly labeled as pattern-based)
- [ ] Verification plan included when CT2 requested
- [ ] Open risks identified
- [ ] Inversion check passed
- [ ] No scope drift
- [ ] Error type assigned if rejecting

---

**Version:** 4.0.0
**Status:** Active
