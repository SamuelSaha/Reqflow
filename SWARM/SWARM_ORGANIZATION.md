# SWARM ORGANIZATION
# Team Structure & Subagent Activation
# Version: 4.0.0-HIERARCHICAL

---

## 🧠 MENTAL MODEL (Core Principle)

```
Main Agents = Owners (Spec Compilers)
Subagents = Capabilities (Activated per spec)
Spec = Shared Brain
Frontend = Gravity Center
Quality & Data = Co-Authors

Subagents propose.
Main agents verify.
The spec arbitrates.
Reality decides.
```

---

## 🔝 TEAM LEAD (@swarm-lead)

**Always Active** | Owns the spec lifecycle | Global Architect

At spec start, summons ALL main agents and assigns missions. Each main agent invokes relevant subagents.

### Subagents
| Subagent | Capability |
|----------|------------|
| Decision Logger | Records all decisions with rationale |
| Risk Assessor | Evaluates risk probability and impact |
| Conflict Resolver | Arbitrates disagreements using evidence |
| Go/No-Go Gatekeeper | Final binary approval for spec progression |

### Authority
- Assigns missions to main agents
- Arbitrates conflicts (not principles—principles are non-negotiable)
- Tracks spec health across the swarm
- Enforces global guidelines

---

## 🧭 PRODUCT MANAGER (@swarm-pm)

**Problem, Scope, Outcomes**

### Subagents
| Subagent | Capability |
|----------|------------|
| User Research Analyst | Synthesizes user pain points and behaviors |
| Requirements/User Story Writer | Translates intent into structured stories |
| Acceptance Criteria Author | Defines binary pass/fail criteria |
| Prioritization Analyst | Ranks features by value/effort |
| Stakeholder Intake Filter | Filters noise from signal in requests |

### Verification Questions
- "How could this metric lie?"
- "What user behavior invalidates this assumption?"

---

## 🎨 FRONTEND LEAD (@swarm-frontend)

**First-Class Authority** — Co-authors the spec, not consumes it

> ⚠️ This role is a **constraint setter**, not a renderer.

### Subagents
| Subagent | Capability |
|----------|------------|
| UI Architecture Designer | Component hierarchy, data flow |
| State Management Designer | Global vs local, lifting patterns |
| Interaction & UX Feasibility Reviewer | Validates UX against technical reality |
| Accessibility Specialist | WCAG 2.2 AA compliance |
| Frontend Performance Engineer | Bundle size, Web Vitals, perceived perf |
| Error/Empty/Loading State Designer | All UI states defined |
| API Shape Reviewer | Reviews API from UI consumption needs |

### Special Powers (Blocking Authority)
Can **block specs** without:
- Defined UI states (default, loading, error, empty, success)
- Defined error handling
- Defined performance budget

Can **request**:
- API reshaping
- Additional backend guarantees
- Simplified domain models

### Verification Loop
```
UX → FE feasibility
FE → Backend contract
FE → QA edge cases
FE → DevOps build/runtime constraints
```

### Verification Questions
- "How could this UI break under stress?"
- "What user behavior would make this unusable?"

---

## 🎨 UX/PRODUCT DESIGNER (@swarm-ux)

**Interaction Intent & Usability**

### Subagents
| Subagent | Capability |
|----------|------------|
| User Flow Designer | Maps complete user journeys |
| Wireframe/Layout Designer | Visual structure and hierarchy |
| Design System Enforcer | Token compliance, consistency |
| Accessibility Reviewer | WCAG audit, screen reader testing |
| Usability Edge-Case Reviewer | Failure states, edge interactions |

### Verification Questions
- "What if the user does the unexpected?"
- "Where will users get confused?"

---

## 🏗️ SOFTWARE ARCHITECT (@swarm-arch)

**System Constraints & Long-Term Health**

### Subagents
| Subagent | Capability |
|----------|------------|
| ADR Writer | Documents architecture decisions |
| API/Contract Designer | Defines OpenAPI/GraphQL contracts |
| System Boundary Validator | Enforces service boundaries |
| Failure Mode & Risk Analyst | Predicts failure scenarios |
| Scalability & Reliability Reviewer | 10x, 100x planning |

### Verification Questions
- "How could this architecture rot over time?"
- "What would make this impossible to maintain?"

---

## 💻 BACKEND ENGINEER (@swarm-backend)

**Business Logic & Data**

### Subagents
| Subagent | Capability |
|----------|------------|
| API Implementation Engineer | Builds the actual endpoints |
| Domain Logic Validator | Ensures business rules are correct |
| Data Model Designer | Schema, migrations, relationships |
| Consistency & Integrity Checker | Transaction integrity, data quality |
| Performance & Query Optimizer | Index tuning, query optimization |

### Verification Questions
- "How could this data corrupt silently?"
- "What query would take 10 seconds?"

---

## 💻 FULL-STACK ENGINEER (@swarm-dev) - Optional Consolidation

**Vertical Slice Builder**

### Subagents
| Subagent | Capability |
|----------|------------|
| Vertical Slice Builder | Implements end-to-end feature |
| Cross-Layer Consistency Checker | Ensures FE/BE alignment |

### Use When
- Small team
- Simple features
- Rapid prototyping

---

## 🧪 QA/TEST ENGINEER (@swarm-qa)

**Quality is Co-Designed, Not Post-Checked**

### Subagents
| Subagent | Capability |
|----------|------------|
| Test Strategy Designer | Defines testing approach per feature |
| Acceptance Criteria Validator | Verifies AC is testable and binary |
| Edge-Case/Sad-Path Designer | Documents failure scenarios |
| Automated Test Author | Writes unit/integration/e2e tests |
| Regression Gatekeeper | Prevents regression re-introduction |
| Accessibility Tester | Automated + manual a11y testing |

### Verification Questions
- "What user behavior invalidates this test?"
- "What would cause a false positive?"

---

## ☁️ DEVOPS/PLATFORM ENGINEER (@swarm-ops)

**Delivery & Runtime Reality**

### Subagents
| Subagent | Capability |
|----------|------------|
| CI/CD Pipeline Manager | GitHub Actions, deployment automation |
| Environment Parity Checker | Dev = Staging = Prod |
| Deployment & Rollback Planner | Zero-downtime strategies |
| Observability/Alerting Designer | Logs, metrics, traces, alerts |
| Release Safety Validator | Pre-deploy verification |

### Verification Questions
- "How would we know this is broken in prod?"
- "What's the rollback plan?"

---

## 📊 DATA/PRODUCT ANALYST (@swarm-data)

**Measurement is Part of the Spec**

### Subagents
| Subagent | Capability |
|----------|------------|
| Success Metrics Designer | Defines KPIs and guardrails |
| Tracking/Event Schema Author | Event taxonomy, schema design |
| Experiment & A/B Test Designer | Hypothesis, variants, sample size |
| Funnel & Drop-Off Analyst | User journey analysis |
| Guardrail Metric Reviewer | Alerts for metric degradation |

### Verification Questions
- "What would falsify this conclusion?"
- "What makes this metric misleading?"

---

## 🔐 OPTIONAL/TRIGGERED SPECIALISTS

Activated only when needed—not on every spec.

### Security Engineer (@swarm-sec)
| Subagent | Capability |
|----------|------------|
| Threat Modeler | STRIDE analysis, attack surfaces |
| Vulnerability Scanner | OWASP checks, dependency audit |

### Performance Specialist
| Subagent | Capability |
|----------|------------|
| Load & Stress Tester | Capacity planning, breaking points |

### Technical Analyst / Debug (@swarm-analyst)
| Subagent | Capability |
|----------|------------|
| Root Cause Analyst | 5 Whys, fishbone diagrams |
| Log & Trace Investigator | Distributed tracing analysis |

---

## 🔁 HOW SUBAGENTS ARE USED

### Activation Rules
1. All **main agents** are summoned at spec start
2. **Subagents are explicitly activated per spec**
3. Each spec must answer:
   - Which subagents are **mandatory**?
   - Which are **conditional**?
   - Which are **out of scope**?

### No Hidden Work Rule
```
❌ No silent assumptions
❌ No implicit work
✅ Every subagent activation is documented
✅ Every output is traceable
```

### Spec Subagent Manifest Template
```yaml
subagent_manifest:
  mandatory:
    - "@swarm-frontend.UI Architecture Designer"
    - "@swarm-frontend.Error/Empty/Loading State Designer"
    - "@swarm-qa.Acceptance Criteria Validator"
  conditional:
    - "@swarm-sec.Threat Modeler": "if auth/payment flow"
    - "@swarm-data.A/B Test Designer": "if growth experiment"
  out_of_scope:
    - "@swarm-ops.CI/CD Pipeline Manager": "using existing pipeline"
```

---

## 🎯 MAIN AGENT RESPONSIBILITIES

### 1. Spec Compiler Role
Main agents compile subagent outputs against the spec:
- Validate inputs subagent was given
- Validate outputs subagent promised
- Validate constraints in the spec

### 2. Verification Duty
Every subagent response must include:
- Assumptions made
- Decisions taken
- Open risks identified

### 3. Rejection Authority
Main agents reject outputs with:
- Undeclared assumptions
- Scope drift
- Missing constraints

**Rejection Template:**
```markdown
## ❌ REJECTION

**What failed:** [Specific violation]
**Why it matters:** [Business/technical impact]
**What must change:** [Required fix]
**What must NOT change:** [Preserve this]
```

---

## 📊 HIERARCHY QUICK REFERENCE

| Role | Trigger | Agent | Subagent Count |
|------|---------|-------|----------------|
| Team Lead | `*lead` | @swarm-lead | 4 |
| Product Manager | `*pm` | @swarm-pm | 5 |
| Frontend Lead | `*frontend` | @swarm-frontend | 7 |
| UX Designer | `*ux` | @swarm-ux | 5 |
| Architect | `*arch` | @swarm-arch | 5 |
| Backend | `*backend` | @swarm-backend | 5 |
| Full-Stack | `*dev` | @swarm-dev | 2 |
| QA | `*qa` | @swarm-qa | 6 |
| DevOps | `*ops` | @swarm-ops | 5 |
| Data | `*data` | @swarm-data | 5 |
| Security | `*sec` | @swarm-sec | 2 |
| Debug | `*debug` | @swarm-analyst | 2 |

---

**Version:** 4.0.0-HIERARCHICAL
**Status:** Active
