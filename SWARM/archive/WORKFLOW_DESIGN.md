# 🎯 SWARM WORKFLOW DESIGN PRINCIPLES

**Design Philosophy:** Workflows describe ROLES and ACTIONS, not AGENT NAMES. Each step routes to appropriate expertise dynamically.

---

## 🎯 AGENT-TO-ROLE MAPPINGS

### Analysis & Forensics
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **Forensics Investigation** | `@swarm-analyst` | Bug localization, root cause, evidence gathering |
| **Security Review** | `@swarm-sec` | Security vulnerability assessment, threat modeling |
| **Technical Planning** | `@swarm-arch` | System design, RFC creation, data model |

### Development & Engineering
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **Implementation** | `@swarm-dev` | Building, coding, unit tests, E2E tests |
| **Code Search & Refactoring** | `@swarm-dev` | Finding components, code tracing |
| **Performance Optimization** | `@swarm-ops` | Profiling, bundle optimization, latency optimization |
| **Security Fixes** | `@swarm-dev` + `@swarm-sec` | Vulnerability remediation |

### Design & UX
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **User Experience** | `@swarm-ux` | UI flows, component design, user research |
| **Accessibility** | `@swarm-ux` + `@swarm-sec` | A11y compliance testing |
| **Copywriting** | `@swarm-ux` | Clear messaging, documentation tone |
| **Prototyping** | `@swarm-ux` | Wireframing, mockups

### Quality & Testing
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **QA Testing** | `@swarm-qa` | Unit tests, E2E tests, edge case testing |
| **Regression Testing** | `@swarm-qa` | Verifying no regressions |
| **Bug Hunting** | `@swarm-qa` | Edge case gauntlets, stress testing |
| **Security Testing** | `@swarm-qa` | `@swarm-sec` | Security audit, penetration testing |

### Operations & Deployment
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **CI/CD** | `@swarm-ops` + `@swarm-ops` | Pipeline automation, deployments, rollbacks |
| **Monitoring** | `@swarm-ops` | Error tracking, metrics, alerting |
| **Infrastructure** | `@swarm-ops` | Capacity planning, SLO compliance |
| **Incident Management** | `@swarm-ops` | Post-mortem analysis, incident response |

### Growth & Strategy
| Role | Expertise | When Step Types |
|-------|-----------|-------------|
| **Growth Optimization** | `@swarm-growth` | Feature adoption, revenue optimization, growth loops |
| **Pricing** | `@swarm-growth` | Pricing strategy, revenue models |
| **Marketing** | `@swarm-growth` | Campaigns, content strategy |

### Architecture & Security
| Role | Expertise | When Step Types |
|-------|------------------------|
| **System Design** | `@swarm-arch` | Architecture, patterns, scalability |
| **Security Architecture** | `@swarm-arch` + `@swarm-sec` | Threat modeling, security design |
| **Database Design** | `@swarm-arch` + `@swarm-analyst` | Schema design, relationships, RLS policies |
| **API Design** | `@swarm-arch` + `@swarm-ux` + `@swarm-arch` | Contracts, endpoints, versioning |

---

## 🎯 WORKFLOW DESIGN PATTERN

### Header Structure
```markdown
# [Workflow Name]

> **TRIGGER:** `/command-name`
> **GOAL:** [Clear, actionable goal]
> **TIME ESTIMTE:** [X hours]

---

## 🎯 Quick Summary
[One paragraph describing what this workflow achieves]

---

## 📋 Workflow Steps

### Step 1: [Step Name]
**Relevant Expertise:** Analysis, Forensics (bug investigation), Security (if sensitive)

**Description:**
[Clear 1-2 sentence explanation of what this step does]

**Actions:**
- [Action 1]
- [Action 2]

**Exit Criteria:**
- [Success condition]

**Example Implementation:**
```bash
# Search for bug pattern
grep -r "ERROR:" src/
```
```

---

### Step 2: [Step Name]
**Relevant Expertise:** [Agents]

**Description:**
[What this step accomplishes]

**Actions:**
- [Action 1]
- [Action 2]
- [Action 3]

**Exit Criteria:**
- [Success condition]

**Example Implementation:**
```typescript
// Fix the bug
const fix = await patchIssue(bugDetails);
```
```
```

---

## 🔥 EXIT CRITERIA

| Check | Required |
|-------|----------|
| All steps completed | ✅ |
| Success metrics met | ✅ |
| No regressions introduced | ✅ |
| Documentation updated | ✅ |

---

## 🎯 AGENT REFERENCE

| Analysis | `@swarm-analyst` |
| Forensics & investigation |
| Engineering | `@swarm-dev` | Implementation & testing |
| QA | `@swarm-qa` | Testing & verification |
| Architecture | `@swarm-arch` | System design |
| Security | `@swarm-sec` | Security reviews |
| Operations | `@swarm-ops` | Deployment & monitoring |
| Growth | `@swarm-growth` | Revenue & pricing |
| Design/UX | `@swarm-ux` | User experience & interfaces |
| Orchestration | `@swarm-orch` | Routes to appropriate experts
| Verification | `@swarm-verifier` | Acceptance testing |

---

## ⏱️ EXAMPLE COMPARISON

### Agent-Agnostic vs Agent-Specific

**❌ BAD:**
```markdown
Step 1: Root Cause Analysis
Agent: `@swarm-analyst`

Analysis: Find root cause of bug
```

**✅ BETTER:**
```markdown
Step 1: Root Cause & Forensics
**Relevant Expertise:** Analysis (forensics investigation), Forensics (logs/data evidence gathering)

**Actions:**
- Search code for patterns
- Check recent changes
- Analyze system behavior
```
```

**❌ BETTER:**
```markdown
Step 2: Implementation
Agent: `@swarm-dev`

Engineering: Build the fix
```
```

---

### Agent-Agnostic Version (RECOMMENDED)

**🎯 WORKFLOW DESIGN PRINCIPLES**

This document defines how ALL workflows should be structured to be agent-agnostic:
1. Use role descriptions instead of agent names in step headers
2. Mention relevant agents in step descriptions
3. Provide role/action examples
4. Design workflow around processes, not agent identities

**For example, instead of:**
```
**Agent:** `@swarm-dev`
```

Use:
```
**Role:** Engineering
**Description:** Implement, build, and test the solution
**Actions:**
- Write code
- Run tests
- Deploy
- Monitor results
```
```

**Instead of:**
```
**Agent:** `@swarm-dev`
```

**Use:**
```
**Description:** Implement the bug fix
**Actions:**
- Read the file at line 45
- Apply the patch
- Run build and test
- Deploy
```
```

---

**This makes workflows:**
✅ Universally applicable (any project, any tech stack)
✅ Easier to update (roles change once, affects all workflows)
✅ More maintainable (agents come and go, workflows stay relevant)
✅ Clearer intent (focus on WHAT, not WHO)
✅ Better documentation (describes process, not agents)

**Key insight:**
"When you describe workflows by ROLES and ACTIONS instead of AGENTS, you make them **perpetual** and **system-agnostic**. A user with `@swarm-ux` skills can execute the same workflow as someone with `@swarm-dev` expertise."
