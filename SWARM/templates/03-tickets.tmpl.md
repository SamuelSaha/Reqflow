# Ticket Template
# File: tickets/T-{SPEC-ID}-{NNN}.md

---
id: "T-{spec_id}-{nnn}"
spec_ref: "{spec_id}"
version: "1.0.0"
status: "open|in_progress|completed|blocked"
priority: "P0|P1|P2"
created: "{date}"
---

# 🎫 Ticket: {Ticket Title}

## 📋 Metadata
| Field | Value |
|-------|-------|
| **ID** | T-{spec_id}-{nnn} |
| **Spec** | {spec_id} |
| **Agent** | @swarm-{type} |
| **Status** | open |
| **Priority** | P0 |

---

## 🎯 Objective
<!-- Single sentence describing what this ticket accomplishes -->

**Objective:** {Single clear objective}

---

## 📖 Why
<!-- Reference to specification goal and acceptance criteria -->

This ticket implements:
- **Spec Goal:** {Reference to spec.goal}
- **Acceptance Criteria:** AC-{XXX}, AC-{YYY}

---

## 📦 Spec Context Packet (Required)
<!-- Paste the compact spec packet here so agents never have to “guess” the spec. -->

```yaml
spec_packet:
  spec_ref: "{spec_id}"
  version: "{spec_version}"
  status: "approved|frozen"

  goal: "{spec.goal}"
  user_benefit: "{spec.user_benefit}"

  non_goals:
    - "{spec.non_goals[0]}"

  constraints:
    - "{spec.constraints.technical[0]}"

  acceptance_criteria:
    - id: "AC-{XXX}"
      criterion: "{AC text}"
      pass_threshold: "{Binary threshold}"
      priority: "P0|P1|P2"

  assumptions:
    - "{Key E0 default (only highest-impact assumptions)}"

  glossary:
    - term: "{Ambiguous term}"
      definition: "{Precise meaning}"
      examples: ["{Example 1}"]
```

---

## 🚧 Constraints

### Must Satisfy
<!-- What the agent MUST implement (from spec ACs) -->
- [ ] AC-{XXX}: {Acceptance criterion text}
- [ ] {Additional constraint}

### Must Not
<!-- What the agent MUST NOT do -->
- [ ] Add new dependencies
- [ ] Modify {unrelated_component}
- [ ] Change {protected_resource}

### Technical Boundaries
<!-- Where this ticket operates -->
- **Files:** `src/components/{file}.tsx`
- **APIs:** `/api/{endpoint}`
- **Dependencies:** react, zod, {existing_deps}

---

## ✅ Acceptance Criteria

| AC ID | Criterion | Test Method | Pass Threshold | Status |
|-------|-----------|-------------|----------------|--------|
| AC-{XXX} | {Specific requirement} | {How to test} | {Binary condition} | ☐ |
| AC-{YYY} | {Specific requirement} | {How to test} | {Binary condition} | ☐ |

---

## 📦 Artifact

**Output:** {Single artifact description}

**Location:** `path/to/output`

**Format:** {File type, component structure, etc.}

---

## 🔗 Dependencies

### Blocks
<!-- Tickets waiting on this one -->
- T-{XXX}: {Ticket title}

### Blocked By
<!-- Tickets this one waits on -->
- T-{YYY}: {Ticket title}

### Related
<!-- Related but not blocking -->
- T-{ZZZ}: {Ticket title}

---

## ⏱️ Effort

**Estimated:** {X} hours

**Complexity:** low|medium|high

---

## ✅ Done When

- [ ] All acceptance criteria pass
- [ ] Code builds without errors (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] No console.logs or debug code
- [ ] QA gate passes (`/ac-validate`)

---

## 📝 Execution Log

| Date | Action | Agent | Notes |
|------|--------|-------|-------|
| {date} | Created | @swarm-ticketizer | Initial ticket |
| {date} | Started | @swarm-{type} | |
| {date} | Completed | @swarm-{type} | |
| {date} | Verified | @swarm-verifier | PASS/FAIL |

---

**Next:** Execute this ticket following the Execution Engine protocol.
