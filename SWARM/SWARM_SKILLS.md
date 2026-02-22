# SWARM SKILLS TAXONOMY
# Capabilities Required by Agents
# Version: 4.0.0

---

## 🧠 CORE COGNITIVE & SYSTEM SKILLS

**Required for ALL agents**

| Skill | Description |
|-------|-------------|
| Problem Framing | Defining the real problem before solving |
| One-Shot Spec Synthesis | Converting minimal user input into build-ready specs |
| First-Principles Reasoning | Breaking down to fundamental truths |
| Constraint Reasoning | Working within defined boundaries |
| Trade-off Analysis | Evaluating competing options objectively |
| Assumption Management | Explicitly stating and validating assumptions |
| Assumptions Ledgering | Recording E0 defaults, falsifiers, and default actions |
| Risk Identification | Proactively finding what could go wrong |
| Inversion Thinking | "How would this fail?" reasoning |
| Clear Written Communication | Precise, unambiguous documentation |
| Structured Thinking | Logical organization of complex ideas |
| Decision Justification | Documenting WHY, not just WHAT |

---

## 🔐 SECURITY BY DESIGN SKILLS

| Skill | Description |
|-------|-------------|
| Threat Modeling | STRIDE analysis, attack surface mapping |
| Data Classification | PII, sensitive, public categorization |
| Authentication Patterns | OAuth, JWT, session management |
| Authorization Models | RBAC, ABAC, policy-based access |
| Secure API Design | Input validation, rate limiting |
| Input Validation & Sanitization | Preventing injection attacks |
| Client-Server Trust Boundaries | Never trust the client |
| Secrets Management | Vault, environment separation |
| Secure Error Handling | No information leakage |
| Abuse Case Analysis | Thinking like an attacker |
| Privacy-by-Design Thinking | GDPR, data minimization |
| Security Testing Mindset | Pen testing awareness |

---

## 🧱 SIMPLICITY BY DESIGN SKILLS

| Skill | Description |
|-------|-------------|
| Complexity Reduction | Actively removing unnecessary parts |
| Abstraction Discipline | Right level, not over-abstraction |
| Deletion & Scope Trimming | Removing features that don't earn their place |
| Minimal Viable Design | Just enough, no more |
| Explicit Over Implicit | No magic, no hidden behavior |
| Avoiding Premature Generalization | Solve today's problem, not tomorrow's |
| Readability-First Implementation | Code for humans, then machines |
| Cognitive Load Minimization | Easy to understand at a glance |
| System Explainability | Can explain to a new team member |
| Refactor-for-Clarity | Improve understanding, not cleverness |

---

## ❤️ USER-OBSESSED SKILLS

| Skill | Description |
|-------|-------------|
| User Intent Analysis | Understanding what they really want |
| Jobs-to-be-Done Reasoning | What job is the user hiring the product for? |
| UX Empathy | Feeling the user's frustration |
| Failure-Path Design | What happens when things go wrong |
| Error Recovery Design | How users get back on track |
| Accessibility Awareness | WCAG, screen readers, motor impairments |
| Perceived Performance Thinking | Feels fast > is fast |
| Usability Testing Mindset | Watch users, don't assume |
| Friction Detection | Finding unnecessary obstacles |
| User Feedback Synthesis | Extracting signal from noise |

---

## 🎨 FRONTEND & USER INTERFACE SKILLS

| Skill | Description |
|-------|-------------|
| UI Architecture Design | Component hierarchy, composition |
| State Management Design | Global vs local, lifting, contexts |
| Component Design Systems | Tokens, variants, consistency |
| Responsive Design | Mobile-first, breakpoints |
| Accessibility (WCAG) | 2.2 AA compliance |
| Client-Side Performance | Bundle size, lazy loading, memoization |
| Browser Behavior Knowledge | Event loop, paint cycles, layout thrash |
| Error/Empty/Loading State Design | All UI states covered |
| Event Instrumentation | Click tracking, user journey |
| API Consumption Design | Frontend-first API shaping |

---

## 🏗️ BACKEND & SYSTEM SKILLS

| Skill | Description |
|-------|-------------|
| API Design | REST, GraphQL, gRPC patterns |
| Domain Modeling | Business concepts as code |
| Data Modeling | Schemas, relationships, normalization |
| Business Logic Design | Rules, validations, workflows |
| Consistency & Integrity | Transactions, constraints |
| Performance Optimization | Indexing, caching, query tuning |
| Error Handling Strategies | Retry, fallback, circuit breaker |
| Idempotency & Retries | Safe re-execution |
| Backend Security Enforcement | Server-side validation, authZ |
| Service Boundary Definition | What belongs where |

---

## ☁️ DELIVERY & RELIABILITY SKILLS

| Skill | Description |
|-------|-------------|
| CI/CD Pipeline Design | Build, test, deploy automation |
| Environment Parity | Dev = Staging = Prod |
| Observability | Logs, metrics, traces |
| Deployment Strategies | Blue-green, canary, rolling |
| Rollback Planning | How to undo |
| Incident Response Thinking | What if this breaks at 3am? |
| Runtime Performance Awareness | Memory, CPU, connections |
| Operational Risk Assessment | What could take down the system? |

---

## 🧪 QUALITY & VERIFICATION SKILLS

| Skill | Description |
|-------|-------------|
| Test Strategy Design | What to test, how, when |
| Acceptance Criteria Validation | Is this testable and binary? |
| Edge-Case Identification | Finding the weird scenarios |
| Regression Prevention | Not breaking what worked |
| Exploratory Testing | Finding what tests don't cover |
| Accessibility Testing | Automated + manual a11y |
| Testability Analysis | Is this code easy to test? |
| Quality Gate Definition | What must pass before ship |

---

## 📊 DATA & MEASUREMENT SKILLS

| Skill | Description |
|-------|-------------|
| Metric Definition | What to measure and why |
| KPI Design | Leading vs lagging indicators |
| Guardrail Metrics | What must NOT regress |
| Event Schema Design | Taxonomy, structure, versioning |
| Experiment Design | A/B, hypothesis, sample size |
| Funnel Analysis | User journey measurement |
| Behavioral Analysis | What users actually do |
| Bias Detection | When data lies |
| Decision-Oriented Analytics | Insights that drive action |

---

## 🤝 COLLABORATION & SWARM SKILLS

| Skill | Description |
|-------|-------------|
| Delegation Framing | Questions, not tasks |
| Cross-Agent Dependency | Managing handoffs |
| Conflict Resolution | Evidence-based decisions |
| Spec Co-Authoring | Multiple agents writing together |
| Explicit Disagreement Handling | Documenting different views |
| Feedback Incorporation | Learning from rejections |
| Review & Verification Discipline | Systematic checking |
| Documentation Clarity | Write for the next agent |

---

## 🧠 META / CONTROL SKILLS (Main Agents Only)

| Skill | Description |
|-------|-------------|
| Subagent Evaluation | Assessing output quality |
| Output Verification | Checking against spec |
| Error Categorization | Using the taxonomy |
| Rejection with Rationale | Clear, actionable feedback |
| Progressive Constraint Tightening | Narrow scope over time |
| Learning from Failures | Pattern recognition |
| System-Level Optimization | Improving the whole swarm |

---

## 🔥 KILL LIST (Top 3 Skill Failures)

| Failure | Detection | Intervention |
|---------|-----------|--------------|
| **Overconfidence** | Missing explicit assumptions | Require assumption section |
| **Overengineering** | >3 core concepts per feature | Mandatory "what can we delete" pass |
| **User Abstraction** | No user success/failure statement | Re-anchor to user intent |

---

## 📋 SKILL MAPPING BY AGENT

| Agent | Primary Skills | Secondary Skills |
|-------|---------------|------------------|
| @swarm-lead | Conflict Resolution, Decision Justification | All Meta Skills |
| @swarm-pm | User Intent Analysis, Assumption Management | Trade-off Analysis |
| @swarm-frontend | UI Architecture, State Management, a11y | API Consumption, Performance |
| @swarm-ux | UX Empathy, User Flow, Accessibility | Usability Testing |
| @swarm-arch | System Design, API Design, Trade-offs | Performance, Security |
| @swarm-backend | Domain Modeling, API Design, Data Modeling | Performance, Security |
| @swarm-dev | Full-Stack Implementation | Testing, CI/CD |
| @swarm-qa | Test Strategy, Edge Cases, a11y Testing | Regression Prevention |
| @swarm-ops | CI/CD, Observability, Deployment | Incident Response |
| @swarm-data | Metric Definition, Experiment Design | Behavioral Analysis |
| @swarm-sec | Threat Modeling, Security Testing | Privacy, Compliance |

---

**Version:** 4.0.0
**Status:** Active
