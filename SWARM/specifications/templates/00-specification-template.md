---
specification:
  metadata:
    id: "SPEC-YYYYMMDD-NNN"
    version: "1.0.0"
    status: "draft|approved|frozen"
    created: "ISO8601 timestamp"
    author: "@swarm-lead|@swarm-pm|user"

  intent:
    goal: "Single sentence objective"
    problem_statement: "What pain are we solving?"
    user_benefit: "Who benefits and how?"
    business_impact: "Revenue, efficiency, or strategic value"

  boundaries:
    non_goals:
      - "Explicitly out of scope (be specific)"
    constraints:
      technical:
        - "Hard technical constraint"
      business:
        - "Hard business constraint"
      legal:
        - "Hard legal/privacy constraint"

  glossary:
    - term: "Ambiguous term"
      definition: "Precise meaning in this spec"
      examples: ["Example 1", "Example 2"]

  success_criteria:
    metrics:
      - name: "Metric name"
        current: "Baseline value"
        target: "Target value"
        measurement: "How measured"

  acceptance_criteria:
    - id: "AC-001"
      criterion: "Binary requirement"
      test_method: "How to verify"
      pass_threshold: "Binary pass threshold"
      priority: "P0|P1|P2"

  user_stories:
    - as_a: "User type"
      i_want: "Action"
      so_that: "Benefit"
      acceptance_criteria: ["AC-001"]

  functional_requirements:
    must_have:
      - id: "FR-001"
        description: "..."
        linked_ac: ["AC-001"]
    should_have: []
    nice_to_have: []

  non_functional_requirements:
    performance: "State target (e.g., LCP < 2.5s)"
    security: "State target (e.g., Zero Trust; server-side authZ)"
    accessibility: "State target (e.g., WCAG 2.2 AA)"
    scalability: "State target (e.g., 10x traffic)"

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

frozen: false
immutable_elements:
  - goal
  - acceptance_criteria
  - constraints
  - non_goals
---

# 📋 SPECIFICATION: {Title}

**ID:** SPEC-YYYYMMDD-NNN  
**Version:** 1.0.0  
**Status:** draft|approved|frozen  
**Created:** {YYYY-MM-DD}

## 📦 Spec Context Packet (Copy into tickets/delegations)
```yaml
spec_packet:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  version: "1.0.0"
  status: "approved|frozen"

  goal: "..."
  user_benefit: "..."

  non_goals:
    - "..."

  constraints:
    - "..."

  acceptance_criteria:
    - id: "AC-001"
      criterion: "..."
      pass_threshold: "..."
      priority: "P0"

  assumptions:
    - "Key assumption (only include the highest-impact defaults)"

  glossary:
    - term: "..."
      definition: "..."
      examples: ["..."]
```

## 🎯 Executive Summary
1–3 sentences. No implementation detail. State user outcome.

## 🚫 Non-Goals (Out of Scope)
- ❌ ...

## ⚠️ Constraints
- Technical: ...
- Business: ...
- Legal: ...

## 📚 Glossary (Definitions + Examples)
- **{Term}:** {Definition} (e.g., {Example})

## ✅ Acceptance Criteria (Binary)
| ID | Criterion | Test Method | Pass Threshold | Priority |
|----|----------|-------------|----------------|----------|
| AC-001 | ... | ... | ... | P0 |

## 👤 User Stories
- **As a** ... **I want** ... **so that** ...

## 🧩 Requirements
### Must Have (P0)
- FR-001: ...

### Should Have (P1)
- ...

### Nice to Have (P2)
- ...

## ⚙️ Non-Functional Requirements
- Performance: ...
- Security: ...
- Accessibility: ...
- Scalability: ...

## ⚠️ Assumptions Ledger (AUTO)
List E0 defaults explicitly so agents don’t guess. Keep it short (3–8).

| ID | Assumption | Evidence | Falsifier | Default Action |
|----|------------|----------|-----------|----------------|
| A-001 | ... | E0 | ... | ... |

## ❓ Open Questions (Only if Blocking)
- Q-001 (blocking?): ... (Default: ...)

## 🧨 Risks
- Risk: ... (Probability: ..., Impact: ..., Mitigation: ...)

## 🧾 Notes (Mutable)
Implementation notes, link-outs, ticket IDs. Do not modify immutable elements after freeze.
