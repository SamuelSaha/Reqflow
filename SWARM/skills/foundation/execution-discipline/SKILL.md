---
name: Execution Discipline
description: Production-grade distributed execution system standards - deterministic, auditable, replayable, trustworthy
version: 1.0.0
primary_agents: [ALL]
authority: FOUNDATIONAL
---

# ⚙️ Execution Discipline Skill

> **THE STANDARD:** This system operates as a production-grade distributed execution system, not a conversational or heuristic system.

---

## 🔒 BASELINE EXPECTATION (NON-NEGOTIABLE)

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   AT ALL TIMES, IT MUST BE POSSIBLE TO:                         ║
║                                                                  ║
║   1. EXPLAIN why a decision was taken                           ║
║   2. REPLAY exactly the same execution                          ║
║   3. PROVE correctness via evidence                             ║
║   4. RESUME safely after interruption                           ║
║                                                                  ║
║   ANYTHING LESS IS A FAILURE OF SKILL.                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. Planning & Decomposition

### Requirements

The system MUST:

- Translate vague intent into fully explicit task graphs
- Eliminate ambiguity at planning time, not during execution
- Encode assumptions as explicit constraints
- Reject intents that cannot be deterministically decomposed

### 10× Bar

```
NO task enters execution without:
  ├── Acceptance criteria (explicit, measurable)
  ├── Schema (input/output types defined)
  └── Dependencies (ordered, explicit)

Planning errors are surfaced IMMEDIATELY, not "handled later".
```

### Implementation

Before any task execution:

```yaml
# Task Contract (MANDATORY)
task_id: "TASK-001"
intent: "Implement login form"
acceptance_criteria:
  - "Form renders with email and password fields"
  - "Validation errors display on invalid input"
  - "Successful submission calls auth API"
input_schema:
  type: object
  properties:
    design_spec: { type: string, required: true }
output_schema:
  type: object
  properties:
    files_created: { type: array, items: string }
    tests_passing: { type: boolean }
dependencies:
  - "AUTH-API-001" # Must be complete first
assumptions:
  - "Auth API returns JWT on success"
  - "Design uses standard form patterns"
```

### Rejection Protocol

```markdown
⛔ TASK REJECTED: Cannot Decompose

**Intent:** "Make the app better"
**Reason:** Ambiguous, no measurable acceptance criteria
**Required:** Specific, testable outcomes

Ask: "What specific behavior change indicates success?"
```

---

## 2. Deterministic Decision-Making

### Requirements

The system MUST:

- Make routing, retry, and branching decisions as pure functions
- Produce the same execution path for identical inputs and state
- Avoid hidden randomness, probabilistic shortcuts, or LLM "intuition"

### 10× Bar

```
Any decision can be RE-DERIVED offline from logs alone.
Two replays of the same run are BIT-FOR-BIT EQUIVALENT in control flow.
```

### Decision Function Pattern

```python
# Pure decision function - no side effects, no randomness
def decide_agent(task: Task, state: SystemState) -> AgentId:
    """
    Deterministic agent selection.
    Same inputs ALWAYS produce same output.
    """
    if task.type == "bug":
        return "@swarm-analyst"
    elif task.type == "implementation":
        return "@swarm-dev"
    elif task.type == "verification":
        return "@swarm-qa"
    else:
        raise UnroutableTask(task.type)

# FORBIDDEN: Non-deterministic patterns
def decide_agent_BAD(task):
    if random.random() > 0.5:  # ❌ RANDOM
        return "@swarm-dev"
    if "seems like" in intuition:  # ❌ HEURISTIC
        return "@swarm-analyst"
```

### Decision Log Format

```json
{
  "decision_id": "D-001",
  "timestamp": "2026-01-22T20:45:00Z",
  "input": {
    "task_type": "bug",
    "task_id": "TASK-001"
  },
  "output": {
    "selected_agent": "@swarm-analyst"
  },
  "derivation": "task.type == 'bug' → @swarm-analyst",
  "reproducible": true
}
```

---

## 3. Execution Discipline

### Requirements

The system MUST demonstrate:

- Strict separation between planning, execution, and verification
- Zero cross-contamination of responsibilities
- No implicit retries, no silent fallbacks, no side effects without keys

### 10× Bar

```
Execution units behave like SYSCALLS:
  ├── Bounded (clear start/end)
  ├── Stateless (no hidden memory)
  └── Observable (logged completely)

Side effects are IMPOSSIBLE to duplicate accidentally.
```

### Execution Unit Contract

```typescript
interface ExecutionUnit {
  // Identity
  id: string;           // Unique, immutable
  idempotency_key: string; // Prevents duplicate execution
  
  // Boundaries
  started_at: ISO8601;
  completed_at: ISO8601 | null;
  status: 'pending' | 'running' | 'success' | 'failure';
  
  // State
  input: Record<string, unknown>;  // Immutable after start
  output: Record<string, unknown>; // Set only on completion
  
  // Observability
  trace_id: string;
  log_entries: LogEntry[];
}
```

### Side Effect Keys

```python
# Every side effect has a unique key
def create_file(path: str, content: str, effect_key: str):
    """
    Side effect with idempotency key.
    Re-running with same key is a NO-OP.
    """
    if effect_already_applied(effect_key):
        log(f"Effect {effect_key} already applied, skipping")
        return
    
    write_file(path, content)
    mark_effect_applied(effect_key)
```

---

## 4. Verification & Judgment

### Requirements

The system MUST:

- Evaluate outputs ONLY against pre-declared acceptance criteria
- Detect partial correctness and reject it
- Explain failures in structured, machine-readable form

### 10× Bar

```
"Looks correct" is NOT a valid outcome.

Every PASS is defensible with explicit evidence.
Every FAILURE points to a precise violated criterion.
```

### Verification Protocol

```yaml
# Verification Result (MANDATORY)
task_id: "TASK-001"
verification_type: "acceptance"
criteria_evaluated:
  - criterion: "Form renders with email and password fields"
    status: PASS
    evidence:
      - "DOM contains input[type='email']"
      - "DOM contains input[type='password']"
    
  - criterion: "Validation errors display on invalid input"
    status: FAIL
    evidence:
      - "Submitted empty form"
      - "Expected: Error message visible"
      - "Actual: No error message rendered"
    violated_at: "components/LoginForm.tsx:45"

overall_status: FAIL
reason: "1 of 3 criteria failed"
```

### Partial Correctness Rejection

```markdown
⛔ VERIFICATION FAILED: Partial Correctness Detected

**Criteria Met:** 2/3
**Criteria Failed:** 1/3

This is NOT acceptable. Partial is a FAILURE.

**Failed Criterion:**
"Validation errors display on invalid input"

**Evidence:**
- Submitted empty form at 20:45:00Z
- Expected error message not found in DOM
- Selector `.error-message` returned null

**Action Required:** Fix before proceeding
```

---

## 5. State & Persistence Mastery

### Requirements

The system MUST demonstrate:

- Full explicit state modeling
- Crash-safe persistence at every boundary
- Append-only, replayable execution history

### 10× Bar

```
Killing the process at ANY instruction boundary must NOT corrupt state.
Recovery must NOT require human interpretation or cleanup.
```

### State Model

```typescript
interface SystemState {
  // Immutable history
  execution_log: ExecutionEntry[];  // Append-only
  
  // Current state (derived from log)
  active_tasks: Map<TaskId, TaskState>;
  completed_tasks: Set<TaskId>;
  
  // Recovery metadata
  last_checkpoint: ISO8601;
  recovery_cursor: number;  // Log entry index
}

// Every state change is logged
function apply_state_change(state: SystemState, change: StateChange): SystemState {
  const entry = {
    timestamp: now(),
    change_type: change.type,
    before: snapshot(state),
    after: null,  // Filled after apply
  };
  
  const newState = apply(state, change);
  entry.after = snapshot(newState);
  
  // Persist BEFORE returning
  persist_entry(entry);
  
  return newState;
}
```

### Crash Recovery Protocol

```python
def recover_from_crash():
    """
    Recovery requires NO human interpretation.
    State is reconstructed from logs.
    """
    log = load_execution_log()
    state = initial_state()
    
    for entry in log:
        state = apply_entry(state, entry)
    
    # Find incomplete tasks
    for task in state.active_tasks:
        if task.status == 'running':
            # Mark as interrupted, not failed
            task.status = 'interrupted'
            task.requires_retry = True
    
    return state
```

---

## 6. Observability as Core Skill

### Requirements

The system MUST exhibit:

- Structured, high-fidelity telemetry
- Traceable causality across all steps
- Metrics that reflect correctness, not just throughput

### 10× Bar

```
Every action has a TRACE, a REASON, and a DURATION.
Post-mortems can be written from logs alone, without memory or guesswork.
```

### Telemetry Format

```json
{
  "trace_id": "T-001",
  "span_id": "S-001",
  "parent_span_id": null,
  "operation": "execute_task",
  "task_id": "TASK-001",
  "agent": "@swarm-dev",
  
  "timing": {
    "started_at": "2026-01-22T20:45:00.000Z",
    "ended_at": "2026-01-22T20:47:30.000Z",
    "duration_ms": 150000
  },
  
  "causality": {
    "triggered_by": "user_request",
    "reason": "Task TASK-001 entered execution queue",
    "decision_id": "D-001"
  },
  
  "outcome": {
    "status": "success",
    "evidence": ["build_passed", "tests_passed", "verification_passed"]
  },
  
  "metrics": {
    "files_modified": 3,
    "lines_added": 145,
    "lines_removed": 20,
    "correctness_score": 1.0
  }
}
```

### Required Metrics

| Metric | Type | Purpose |
|--------|------|---------|
| `task_correctness_rate` | Ratio | % of tasks passing verification first time |
| `determinism_score` | Ratio | % of decisions reproducible from logs |
| `mttr` (Mean Time to Recovery) | Duration | Average crash recovery time |
| `state_corruption_events` | Count | Must be 0 |

---

## 7. Error Handling & Failure Intelligence

### Requirements

The system MUST:

- Classify failures as transient, permanent, or logical
- Retry only when justified
- Escalate deterministically when recovery is impossible

### 10× Bar

```
No failure is "unexpected".
Every failure mode is either HANDLED or explicitly FATAL.
Silent degradation is FORBIDDEN.
```

### Failure Classification

```python
class FailureType(Enum):
    TRANSIENT = "transient"    # Network timeout, rate limit
    PERMANENT = "permanent"    # Resource not found, auth failed
    LOGICAL = "logical"        # Invalid state, constraint violation

def classify_failure(error: Exception) -> FailureType:
    """
    Deterministic failure classification.
    No guessing.
    """
    if isinstance(error, TimeoutError):
        return FailureType.TRANSIENT
    elif isinstance(error, NotFoundError):
        return FailureType.PERMANENT
    elif isinstance(error, ValidationError):
        return FailureType.LOGICAL
    else:
        # Unknown errors are FATAL, not ignored
        raise UnclassifiedFailure(error)
```

### Retry Policy

```yaml
# Retry only for TRANSIENT failures
retry_policy:
  transient:
    max_attempts: 3
    backoff: exponential
    base_delay_ms: 1000
  permanent:
    max_attempts: 0  # Never retry
    action: fail_immediately
  logical:
    max_attempts: 0  # Never retry
    action: escalate_to_human
```

### Escalation Protocol

```markdown
🚨 ESCALATION REQUIRED

**Task:** TASK-001
**Failure Type:** LOGICAL
**Error:** ValidationError: Schema mismatch
**Attempts:** 1 (no retry for logical failures)

**Recovery Impossible Because:**
- Input violates schema constraint
- Constraint: `priority` must be 1-4
- Actual: `priority` = 99

**Human Action Required:**
1. Fix input data
2. Re-submit task

**System State:** HALTED (safe)
```

---

## 8. Evaluation & Self-Measurement

### Requirements

The system MUST demonstrate:

- Continuous self-evaluation via real task scenarios
- Determinism checks as first-class metrics
- Quantified correctness, not anecdotal success

### 10× Bar

```
Any regression is detectable AUTOMATICALLY.
Shipping without metrics is IMPOSSIBLE.
```

### Self-Evaluation Protocol

```yaml
# Run on every significant change
evaluation_suite:
  determinism_check:
    method: "replay_last_100_tasks"
    assertion: "control_flow_identical"
    threshold: 1.0  # 100% required
    
  correctness_check:
    method: "run_golden_dataset"
    assertion: "all_pass"
    threshold: 1.0  # 100% required
    
  recovery_check:
    method: "simulate_crash_at_each_boundary"
    assertion: "state_not_corrupted"
    threshold: 1.0  # 100% required
```

### Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                   SYSTEM HEALTH METRICS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Determinism Score:     100.0% ✅ (target: 100%)           │
│  Correctness Rate:       98.5% ⚠️  (target: 100%)          │
│  Recovery Success:      100.0% ✅ (target: 100%)           │
│  State Corruptions:          0 ✅ (target: 0)              │
│                                                             │
│  ⚠️ REGRESSION DETECTED: Correctness dropped from 100%     │
│     Last passing commit: abc123                             │
│     Failing tests: [test_validation_error_handling]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Boundary Discipline

### Requirements

The system MUST show mastery of boundaries:

- No free-text crossing control layers
- No implicit memory usage
- No hidden coupling between components

### 10× Bar

```
All interfaces are SCHEMA-BOUND.
Violations fail LOUDLY and IMMEDIATELY.
```

### Interface Contract

```typescript
// Every interface has a schema
interface AgentInterface {
  // Input schema (validated)
  input: z.infer<typeof InputSchema>;
  
  // Output schema (validated)
  output: z.infer<typeof OutputSchema>;
  
  // No free-text passing
  // No "context" blobs
  // No implicit state
}

// Schema enforcement
function call_agent(agent: Agent, input: unknown): Output {
  // Validate input BEFORE calling
  const validInput = InputSchema.parse(input);
  
  const rawOutput = agent.execute(validInput);
  
  // Validate output BEFORE returning
  const validOutput = OutputSchema.parse(rawOutput);
  
  return validOutput;
}
```

### Violation Detection

```python
# Immediate failure on boundary violation
def validate_boundary(data: Any, schema: Schema) -> None:
    result = schema.validate(data)
    
    if not result.valid:
        # LOUD failure
        raise BoundaryViolation(
            schema=schema.name,
            violations=result.errors,
            data=sanitize(data)  # No PII in errors
        )
        # No silent fallback
        # No "best effort" parsing
        # No guessing
```

---

## 10. Engineering Judgment

### Requirements

Above all, the system MUST demonstrate engineering judgment, not cleverness.

This includes the ability to:

- Say "this cannot be executed safely"
- Halt instead of guessing
- Prefer correctness over completion
- Prefer boring reliability over impressive demos

### 10× Bar

```
The system FAILS EARLY, LOUDLY, and SAFELY.
Success is RARE but MEANINGFUL.
Every completed run is TRUSTWORTHY.
```

### Judgment Protocol

```python
def execute_task(task: Task) -> Result:
    # Check preconditions
    if not can_execute_safely(task):
        return halt_with_reason(
            "Cannot execute safely",
            missing_preconditions=get_missing(task)
        )
    
    # Check for ambiguity
    if is_ambiguous(task):
        return halt_with_reason(
            "Task is ambiguous",
            ambiguous_elements=get_ambiguous(task)
        )
    
    # Execute only when safe
    result = execute(task)
    
    # Verify before returning
    if not verify_result(result, task.acceptance_criteria):
        return fail_with_evidence(
            "Verification failed",
            evidence=get_verification_evidence()
        )
    
    return result
```

### Judgment Examples

```markdown
✅ CORRECT JUDGMENT:

Task: "Implement feature X"
Response: "Cannot execute: acceptance criteria undefined"
Action: HALT

✅ CORRECT JUDGMENT:

Task: "Fix the bug"
Response: "Cannot execute: bug location unknown"
Action: Request clarification via /bug-localize

✅ CORRECT JUDGMENT:

Task: "Make it faster"
Response: "Cannot execute: no baseline metric defined"
Action: Request measurement criteria

❌ WRONG JUDGMENT:

Task: "Fix the bug"
Response: "I'll try changing some code and see if it works"
Action: NEVER DO THIS
```

---

## 🏁 FINAL EXPECTATION

After applying this skill, the system feels:

| Attribute | Meaning |
|-----------|---------|
| **Predictable** | Same inputs → Same outputs |
| **Auditable** | Every decision is logged and justified |
| **Replayable** | Any run can be reproduced exactly |
| **Boring** | No surprises, no cleverness |
| **Trustworthy** | Every success is verifiable |

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   If it feels "smart" but cannot be proven correct,             ║
║   it is WORSE than before.                                       ║
║                                                                  ║
║   THIS IS THE STANDARD.                                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## ✅ EXECUTION DISCIPLINE CHECKLIST

Before any task execution:

```markdown
□ Acceptance criteria defined (explicit, measurable)
□ Input/output schemas defined
□ Dependencies explicit and ordered
□ Assumptions encoded as constraints
□ Idempotency keys assigned to side effects
□ Verification criteria pre-declared
```

Before declaring success:

```markdown
□ All acceptance criteria evaluated with evidence
□ No partial correctness accepted
□ Decision log is complete and replayable
□ State is persisted and crash-safe
□ Metrics updated
```

Before deploying changes:

```markdown
□ Determinism score = 100%
□ Correctness rate = 100%
□ Recovery tests pass
□ No state corruption detected
□ All regressions addressed
```

---

## 🔒 SKILL VERSION

```
Skill: Execution Discipline
Version: 1.0.0
Last Updated: 2026-01-22
Authority: FOUNDATIONAL (inherited by all agents)
Standard: Production-grade distributed execution
```
