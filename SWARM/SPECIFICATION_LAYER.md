# SPECIFICATION_LAYER.md
# Swarm Spec-Driven Development - Specification Layer
# Version: 1.1.0

---

## 1. PURPOSE

The Specification Layer externalizes intent, requirements, and acceptance criteria into immutable contracts that survive model swaps, enable resume-after-days reliability, and eliminate "AI misunderstood intent" regressions.

**Core Principle:** Specifications define "what" and "why" before any agent determines "how."

---

## 2. SPECIFICATION CONTRACT

### 2.0 Evidence Levels (E0–E3)

Specs created from minimal input must make uncertainty **explicit**, not implicit.

**Evidence levels:**
- **E0 (Assumed):** Pattern-based default. Not confirmed by user or system.
- **E1 (User-Provided):** Explicitly stated by the user (intent/constraints/ACs).
- **E2 (Verified):** Confirmed by code/config/logs, reproducible steps, or docs.
- **E3 (Measured):** Confirmed by production metrics, experiments, or monitored reality.

**Rule:** E0 is allowed for one-shot specs, but must be written down as an assumption with a falsifier and risk.

### 2.1 Immutable Elements

Once created, these elements CANNOT be modified by any agent:

```yaml
specification_contract:
  immutable_elements:
    - goal: "Primary objective - what we are solving"
    - non_goals: "Explicitly out of scope"
    - constraints: "Technical, business, or legal limitations"
    - acceptance_criteria: "Binary pass/fail criteria"
    - version: "Semantic versioning for tracking"
    
  mutable_elements:
    - implementation_notes: "Agent execution details"
    - ticket_ids: "Linked tickets (appended, not modified)"
    - status: "draft|approved|in_progress|completed|deprecated"
```

### 2.2 Specification Schema

```yaml
specification:
  metadata:
    id: "SPEC-{YYYYMMDD}-{NNN}"  # Unique identifier
    version: "1.0.0"
    created: "ISO8601 timestamp"
    author: "agent or user"
    status: "draft|approved|in_progress|completed|deprecated"
    
  intent:
    goal: "Single sentence objective"
    problem_statement: "What pain are we solving?"
    user_benefit: "Who benefits and how?"
    business_impact: "Revenue, efficiency, or strategic value"
    
  boundaries:
    non_goals:
      - "What we are explicitly NOT doing"
      - "Scope limitations"
    constraints:
      technical: ["Tech stack requirements", "API contracts"]
      business: ["Compliance requirements", "Budget limits"]
      legal: ["Privacy requirements", "Regulatory constraints"]

  glossary:
    - term: "Domain term that could be misunderstood"
      definition: "Precise meaning for this spec"
      examples: ["Example 1", "Example 2"]
      
  success_criteria:
    metrics:
      - name: "Metric name"
        current: "Baseline value"
        target: "Target value"
        measurement: "How measured"
        
  acceptance_criteria:
    - id: "AC-001"
      criterion: "Specific, testable requirement"
      test_method: "How to verify"
      pass_threshold: "Binary condition for pass"
      priority: "P0|P1|P2"
      
  user_stories:
    - as_a: "User type"
      i_want: "Action"
      so_that: "Benefit"
      acceptance_criteria: ["AC-001", "AC-002"]
      
  functional_requirements:
    must_have:
      - id: "FR-001"
        description: "..."
        linked_ac: ["AC-001"]
    should_have:
      - id: "FR-002"
        description: "..."
    nice_to_have:
      - id: "FR-003"
        description: "..."
        
  non_functional_requirements:
    performance: "Page load < 2s"
    security: "Zero Trust principles"
    accessibility: "WCAG 2.1 AA minimum"
    scalability: "10x traffic handling"

  assumptions_ledger:
    - id: "A-001"
      assumption: "Statement we are defaulting to"
      evidence_level: "E0|E1|E2|E3"
      falsifier: "What would prove this wrong?"
      impact_if_wrong: "User/system impact"
      default_action: "What we will do unless constraints change"

  open_questions:
    - id: "Q-001"
      question: "Only ask if execution is blocked"
      blocking: true|false
      default_if_unanswered: "Fallback behavior"
      
  risks:
    - risk: "Description"
    probability: "High|Medium|Low"
      impact: "High|Medium|Low"
      mitigation: "Strategy"
      
  tickets:
    - ticket_id: "T-001"
      status: "open|in_progress|completed"
      
  timeline:
    phases:
      - name: "Design"
        duration: "X days"
      - name: "Development"
        duration: "Y days"
      - name: "Testing"
        duration: "Z days"
```

---

## 2.3 SPEC CONTEXT PACKET (Delegation-Ready)

Agents misunderstand specs when they’re forced to read a long document under token/time pressure.

**Rule:** Every spec must support creation of a compact **Spec Context Packet** that contains only the immutable elements + relevant ACs.

**Packet Template (copy/paste into tickets and delegations):**
```yaml
spec_packet:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  version: "1.0.0"
  status: "approved|frozen"

  goal: "Single sentence objective"
  user_benefit: "Who benefits and how?"

  non_goals:
    - "Explicitly out of scope"

  constraints:
    - "Hard constraints only"

  acceptance_criteria:
    - id: "AC-001"
      criterion: "Binary requirement"
      pass_threshold: "Binary pass threshold"
      priority: "P0"

  assumptions:
    - "Key assumption (only include the highest-impact E0 defaults)"

  glossary:
    - term: "Ambiguous term"
      definition: "Precise meaning"
      examples: ["Example 1"]
```

---

## 3. SPECIFICATION MANDATE RULES

### 3.1 When Specifications Are Required

```yaml
spec_mandate_triggers:
  automatic_required:
    - condition: ">2 files touched"
    - condition: ">1 agent required"
    - condition: ">30 min lifespan"
    - condition: "security changes"
    - condition: "auth system changes"
    - condition: "data model changes"
    - condition: "API contract changes"
    
  optional_but_recommended:
    - condition: "UI/UX changes"
    - condition: "configuration changes"
    - condition: "documentation updates"
```

### 3.2 Specification Switch Rule

```
DEFAULT: All work follows Spec → Ticket → Agent → Verification loop

SWITCH TO SPEC-DRIVEN (Mandatory if ANY trigger met):
├── Create specification first
├── Decompose into tickets
├── Execute tickets
└── Verify against acceptance criteria

FREE-FORM EXECUTION (Allowed only if NO triggers met):
├── Direct agent execution
├── No specification required
└── Standard verification applies
```

---

## 4. SPECIFICATION CREATION WORKFLOW

### 4.0 One-Shot Spec Mode (Default)

**Goal:** Produce a build-ready spec in **one pass** from minimal user input, without making the user re-explain.

**Inputs (minimum viable):**
- A single sentence goal OR a short paragraph

**Default behavior (unless constraints conflict):**
- Generate draft spec + Spec Context Packet + initial tickets
- Use an **Assumptions Ledger** for missing info (E0 defaults)
- Ask **one** precise question only if execution is blocked

**One-shot quality bar:**
- 5–12 binary ACs (P0/P1), not 40 vague bullets
- Explicit non-goals
- Constraints listed (even if E0 defaults)
- Verification plan exists (how we prove ACs)

### 4.1 Phase 1: Intent Capture (/specify)

**Trigger:** User provides natural language requirement

**Process:**
1. User describes what they want to build
2. @swarm-lead (Team Lead) interprets intent
3. Delegates to @swarm-pm for problem framing
4. Applies organizational principles and guardrails
5. Generates structured specification
6. Defines binary acceptance criteria

**Output:** Draft specification with:
- Goal statement
- Non-goals (what we're NOT doing)
- Constraints
- User stories
- Initial acceptance criteria

### 4.2 Phase 2: Ambiguity Check (/clarify) - Optional

**Trigger:** Specification contains E0/E1 evidence or unclear requirements

**Process:**
1. @swarm-specifier identifies underspecified areas
2. Converts missing info into **Assumptions Ledger (E0)** by default
3. Asks **one precise question** only if blocked by an external constraint
4. Updates specification via **new version** if immutable elements change

**Goal:** Prevent "AI misunderstood intent" regressions

### 4.3 Phase 3: Technical Planning (/plan)

**Trigger:** Specification approved, ready for implementation planning

**Process:**
1. Define tech stack
2. Architecture decisions
3. Technical constraints
4. Integration points
5. Update specification with technical context

**Output:** Technical specification with:
- Architecture overview
- Tech stack
- Data models
- API contracts
- Integration points

### 4.4 Phase 4: Freeze (Internal Gate)

**Before proceeding to ticketization/implementation:**
- [ ] Goal is clear and specific
- [ ] Non-goals explicitly defined
- [ ] Acceptance criteria are binary (pass/fail)
- [ ] All ACs are measurable/testable
- [ ] Constraints documented
- [ ] Assumptions Ledger exists for any E0 defaults
- [ ] Risks identified with mitigations
- [ ] Specification version locked

---

## 5. SPECIFICATION IMMUTABILITY PROTOCOL

### 5.1 The Immutable Contract Rule

```
╔══════════════════════════════════════════════════════════════════╗
║                    IMMUTABILITY PROTOCOL                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ONCE A SPECIFICATION IS CREATED AND APPROVED:                  ║
║                                                                  ║
║  1. Agents CANNOT modify the specification intent               ║
║  2. Agents CANNOT reinterpret goals                             ║
║  3. Agents CANNOT change acceptance criteria                    ║
║  4. Agents CANNOT add/remove non-goals                          ║
║  5. Agents CANNOT modify constraints                            ║
║                                                                  ║
║  VIOLATION ACTION: HALT and route to @swarm-specifier           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### 5.2 Change Process

If specification needs changes:

1. **Create New Version:**
   - New spec ID with incremented version
   - Copy immutable elements (for reference)
   - Modify required elements
   - Document reason for change

2. **Migrate Tickets:**
   - Close tickets linked to old version
   - Create new tickets for new version
   - Update references

3. **Deprecate Old Version:**
   - Mark old spec as "deprecated"
   - Add link to new version
   - Archive after completion

### 5.3 Agent Constraint

```yaml
agent_spec_constraint:
  allowed_actions:
    - "Read specification"
    - "Reference specification by ID"
    - "Execute against specification"
    - "Report completion against acceptance criteria"
    
  forbidden_actions:
    - "Modify specification"
    - "Reinterpret goals"
    - "Change acceptance criteria"
    - "Add/remove requirements"
    - "Update constraints"
    
  violation_response: |
    🛑 **SPECIFICATION VIOLATION DETECTED**
    Agent attempted to modify immutable specification.
    
    Action: HALT execution
    Next Step: Route to @swarm-specifier for spec revision
    
    Note: All changes require new spec version creation.
```

---

## 6. ACCEPTANCE CRITERIA SPECIFICATION

### 6.1 Binary Criteria Format

All acceptance criteria MUST be binary pass/fail:

```yaml
acceptance_criteria:
  id: "AC-001"
  criterion: "Specific, unambiguous requirement"
  test_method: "Exact procedure to verify"
  pass_threshold: "Binary condition (yes/no, true/false, ≤X, etc.)"
  priority: "P0|P1|P2"
  evidence_required: true
```

### 6.2 Examples

**GOOD (Binary):**
```yaml
- id: "AC-001"
  criterion: "User can upload images up to 10MB"
  test_method: "Upload 10MB JPEG file via drag-and-drop"
  pass_threshold: "Upload succeeds with 200 status"
  priority: "P0"
```

**BAD (Subjective):**
```yaml
- id: "AC-001"
  criterion: "Upload should work well"
  test_method: "Try uploading some files"
  pass_threshold: "It feels responsive"
  priority: "P0"
```

### 6.3 Priority Levels

- **P0 (Must Have):** Feature incomplete without this. Blocks release.
- **P1 (Should Have):** Important but not blocking. Can ship without.
- **P2 (Nice to Have):** Enhancement. Can defer to future release.

---

## 7. SPECIFICATION STORAGE

### 7.1 Directory Structure

```
specifications/
├── active/
│   ├── SPEC-20260201-001-feature-auth.md
│   ├── SPEC-20260201-002-feature-api.md
│   └── ...
├── archived/
│   ├── SPEC-20260115-001-deprecated.md
│   └── ...
├── templates/
│   ├── 00-specification-template.md
│   └── 01-technical-spec-template.md
└── index.yaml  # Registry of all specs
```

### 7.2 File Naming Convention

```
SPEC-{YYYYMMDD}-{NNN}-{short-description}.md

Example: SPEC-20260201-001-user-authentication.md
```

### 7.3 Index Registry

```yaml
specification_index:
  version: "1.0.0"
  last_updated: "ISO8601"
  
  specifications:
    - id: "SPEC-20260201-001"
      file: "specifications/active/SPEC-20260201-001-feature-auth.md"
      status: "in_progress"
      title: "User Authentication System"
      tickets: ["T-001", "T-002", "T-003"]
      completion_percentage: 65
      
    - id: "SPEC-20260201-002"
      file: "specifications/active/SPEC-20260201-002-feature-api.md"
      status: "draft"
      title: "API Rate Limiting"
      tickets: []
      completion_percentage: 0
```

---

## 8. INTEGRATION WITH SWARM ECOSYSTEM

### 8.1 Specification → Ticketization

```
Specification (Intent)
    ↓
@swarm-ticketizer decomposes
    ↓
Tickets (Atomic work units)
    ↓
Each ticket references spec ID + AC IDs
```

### 8.2 Specification → Execution

```
Ticket with spec_ref
    ↓
@swarm-{agent} executes
    ↓
References acceptance criteria
    ↓
Produces output satisfying constraints
```

### 8.3 Specification → Verification

```
Agent output
    ↓
@swarm-verifier validates
    ↓
Checks against binary AC
    ↓
Pass/Fail per criterion
```

---

## 9. SPECIFICATION COMMANDS

### 9.1 Core Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/specify` | Create specification from requirements | @swarm-specifier |
| `/spec-freeze` | Lock specification as immutable | @swarm-specifier |
| `/spec-clarify` | Resolve ambiguities | @swarm-specifier |
| `/spec-version` | Create new spec version | @swarm-specifier |
| `/spec-validate` | Validate spec completeness | @swarm-specifier |

### 9.2 Query Commands

| Command | Description | Output |
|---------|-------------|--------|
| `/spec-list` | List active specifications | Index with statuses |
| `/spec-show {id}` | Display specification | Full spec document |
| `/spec-deps {id}` | Show dependencies | Ticket list with ACs |

---

## 10. SUCCESS METRICS

### 10.1 Specification Quality

| Metric | Target | Measurement |
|--------|--------|-------------|
| Binary AC Rate | 100% | % of ACs with pass/fail criteria |
| Ambiguity Detection | ≥95% | % of specs with E0/E1 flagged |
| Rewrite Rate | <1 per feature | Count of version changes |

### 10.2 Specification Impact

| Metric | Target | Measurement |
|--------|--------|-------------|
| Intent Drift Reduction | -70% | % reduction in "misunderstood" regressions |
| First-Pass QA Rate | ≥90% | % of tickets passing QA on first attempt |
| Resume Reliability | 100% | Can resume work after N days using spec only |

---

## 11. FAILURE MODE PREVENTION

### 11.1 Specification Anti-Patterns

| Anti-Pattern | Prevention | Detection |
|--------------|------------|-----------|
| **Vague goals** | Require specific, measurable objectives | Check for "improve", "better", "enhance" |
| **Implementation details** | Keep specs focused on intent | Check for code, UI, tech decisions |
| **Subjective criteria** | Enforce binary pass/fail | Check for "looks good", "feels right" |
| **Scope creep** | Lock non-goals early | Monitor additions to requirements |
| **Missing constraints** | Require constraint documentation | Check for empty constraints section |

### 11.2 Recovery Protocols

**Spec Too Vague:**
- Action: Route to @swarm-specifier for clarification
- Output: Updated spec with binary criteria
- Threshold: <90% first-pass rate triggers rewrite

**Spec Ambiguous:**
- Action: Run `/clarify` workflow
- Output: Resolved ambiguities
- Prevention: Run `/clarify` before ticketization

**Spec Violated:**
- Action: HALT execution, route to @swarm-specifier
- Output: New spec version
- Prevention: Enforce immutability checks

---

## 12. VERIFICATION

### 12.1 Specification Completeness Checklist

Before ticketization, verify:

- [ ] Goal is single, clear sentence
- [ ] Problem statement explains pain
- [ ] Non-goals explicitly listed
- [ ] Constraints documented (technical, business, legal)
- [ ] Glossary covers ambiguous domain terms (with examples)
- [ ] All acceptance criteria are binary (pass/fail)
- [ ] All ACs are measurable/testable
- [ ] User stories linked to ACs
- [ ] Risks identified with mitigations
- [ ] Version locked and immutable
- [ ] Specification ID assigned

### 12.2 Specification Quality Gate

```yaml
quality_gate:
  name: "Specification Completeness"
  checks:
    - id: "QG-SPEC-001"
      check: "Goal clarity"
      pass_condition: "Single sentence, no conjunctions"
      
    - id: "QG-SPEC-002"
      check: "Binary criteria"
      pass_condition: "100% of ACs have pass_threshold defined"
      
    - id: "QG-SPEC-003"
      check: "Constraint coverage"
      pass_condition: "At least one constraint in each category"
      
    - id: "QG-SPEC-004"
      check: "Non-goal clarity"
      pass_condition: "≥3 non-goals explicitly stated"
      
  threshold: "All checks must pass"
  failure_action: "Return to @swarm-specifier for revision"
```

---

## 13. PROTOCOL VERSION

```yaml
protocol:
  name: "Swarm Specification Layer"
  version: "1.0.0"
  last_updated: "2026-02-01"
  compatibility: "Swarm Agent Ecosystem v2.0+"
  
changelog:
  - version: "1.0.0"
    date: "2026-02-01"
    changes:
      - "Initial specification layer protocol"
      - "Immutable contract system"
      - "Binary acceptance criteria"
      - "Spec mandate rules"
      - "Integration with ticketization engine"
```

---

**Next:** See TICKETIZATION_ENGINE.md for atomic decomposition protocols.
