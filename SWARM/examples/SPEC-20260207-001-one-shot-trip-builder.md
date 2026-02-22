---
specification:
  metadata:
    id: "SPEC-20260207-001"
    version: "1.0.0"
    status: "approved"
    created: "2026-02-07T09:00:00Z"
    author: "@swarm-lead"

  seed:
    goal: "Make the trip builder minimal and intuitive from search bar to vertical plan"
    user: "Traveler planning a trip quickly"
    must_have:
      - "Search submit creates a renderable plan instantly"
    constraints:
      - "No crowded dashboard on first interaction"
      - "Must preserve keyboard accessibility"
    non_goals:
      - "Complex multi-panel analytics on first screen"

  intent:
    goal: "Users can start from one search bar and immediately see a usable vertical plan"
    problem_statement: "Current builder feels crowded and forces users to process too many controls at once"
    user_benefit: "Faster start with lower cognitive load and clearer next action"
    business_impact: "Higher activation and lower drop-off during trip creation"

  boundaries:
    non_goals:
      - "Advanced diagnostics visible by default"
      - "Multi-step wizard before first plan render"
    constraints:
      technical:
        - "Render first spine in <500ms after valid submit"
        - "Trip must always have at least origin and destination nodes"
      business:
        - "Preserve deterministic behavior and revision-safe updates"
      legal:
        - "No PII leakage in UI telemetry"

  acceptance_criteria:
    - id: "AC-001"
      criterion: "Valid search renders a 2-node vertical spine (origin -> destination) without route change"
      test_method: "Submit 'Tokyo' from builder search"
      pass_threshold: "Spine visible in current page with exactly two location nodes within 500ms"
      priority: "P0"
    - id: "AC-002"
      criterion: "Ambiguous destination does not create trip"
      test_method: "Submit ambiguous query"
      pass_threshold: "Inline clarification prompt shown; no trip ID created"
      priority: "P0"
    - id: "AC-003"
      criterion: "User edits are revision-safe"
      test_method: "Submit destination update during enrichment"
      pass_threshold: "No stale update mutates visible state; stale drops tracked"
      priority: "P0"
    - id: "AC-004"
      criterion: "Focus styles remain visible and branded"
      test_method: "Tab through control plane and actions"
      pass_threshold: "Each interactive element has visible focus-visible state"
      priority: "P1"
    - id: "AC-005"
      criterion: "Default screen is minimal"
      test_method: "Open builder without query"
      pass_threshold: "Primary surface shows control plane and one clear call to action only"
      priority: "P0"

  assumptions_ledger:
    - id: "A-001"
      assumption: "Origin can be inferred automatically for most users"
      evidence_level: "E0"
      falsifier: "Origin resolution fails or confidence low"
      impact_if_wrong: "First render blocks or incorrect plan context"
      default_action: "Render placeholder origin + ask inline for start city"
    - id: "A-002"
      assumption: "Minimal first screen increases completion rate"
      evidence_level: "E0"
      falsifier: "Activation rate drops after simplification"
      impact_if_wrong: "Lower conversion despite cleaner UI"
      default_action: "Keep minimal default but reintroduce one secondary cue"
    - id: "A-003"
      assumption: "Users understand 'Build spine' as first action"
      evidence_level: "E1"
      falsifier: "High hesitation / low first submit rate"
      impact_if_wrong: "Users stall before trip creation"
      default_action: "Tighten CTA copy and placeholder examples"

  open_questions:
    - id: "Q-001"
      question: "Preferred fallback origin label if geo fails?"
      blocking: false
      default_if_unanswered: "Use 'Set start city' inline chip"

  risks:
    - risk: "Over-minimization hides needed controls for power users"
      probability: "Medium"
      impact: "Medium"
      mitigation: "Progressive disclosure for advanced panels"
    - risk: "Aggressive optimism causes UI mismatch"
      probability: "Low"
      impact: "High"
      mitigation: "Strict trip revision gates + 409 rebase"

  tickets:
    - ticket_id: "T-20260207-001-001"
      title: "Control-plane submit creates immediate 2-node spine"
      status: "open"
    - ticket_id: "T-20260207-001-002"
      title: "Clarification branch for ambiguous destination"
      status: "open"
    - ticket_id: "T-20260207-001-003"
      title: "Revision-safe patch loop and stale-drop telemetry"
      status: "open"
    - ticket_id: "T-20260207-001-004"
      title: "A11y focus-visible audit for builder controls"
      status: "open"

frozen: true
immutable_elements:
  - goal
  - acceptance_criteria
  - constraints
  - non_goals
---

# One-Shot Spec Example: Trip Builder (Search -> Spine)

This example demonstrates one-shot spec behavior with minimal seed input, explicit E0 assumptions, binary ACs, and immediate ticketization.
