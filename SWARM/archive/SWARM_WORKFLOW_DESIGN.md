# 🎯 SWARM WORKFLOW DESIGN PRINCIPLES

**Design Philosophy:** Workflows are **agent-agnostic** - they describe ROLES and ACTIONS, not specific agent implementations. Each step can be handled by the best swarm agent for that task.

---

## 📋 AGENT-AGENT MAPPINGS

| Phase/Task Type | Primary Agents | Secondary Agents | Notes |
|-------------|-----------------|-------------------|---------|
| **Bug Localization** | `@swarm-analyst` (forensics), `@swarm-sec` (if sensitive) | `@swarm-dev` (code search) | `@swarm-qa` (verify fix) |
| **Root Cause** | `@swarm-analyst` | `@swarm-dev` | `@swarm-qa` |
| **Implementation** | `@swarm-dev` | `@swarm-qa` | `@swarm-ops` |
| **QA/Testing** | `@swarm-qa` | `@swarm-sec` (security review) |
| **Verification** | `@swarm-dev` (build/test) | `@swarm-verifier` (acceptance) |
| **Architecture** | `@swarm-arch` | `@swarm-sec` | `@swarm-ops` |
| **Design & UX** | `@swarm-ux` | `@swarm-analyst` (UX patterns) | `@swarm-sec` (accessibility) |
| **Security** | `@swarm-sec` | `@swarm-ops` (deploy constraints) |
| **Operations** | `@swarm-ops` | `@swarm-ops` (monitoring) | `@swarm-growth` (growth features) |
| **Spec Creation** | `@swarm-specifier` | `@swarm-analyst` (research) | `@swarm-growth` (revenue) |
| **Ticket Creation** | `@swarm-ticketizer` | `@swarm-specifier` |
| **Orchestration** | `@swarm-orch` | `@swarm-orch` (routes to best agent) |

---

## 🎯 WORKFLOW DESIGN PATTERN

Every workflow should follow this structure:

```markdown
# [Workflow Name]

> **TRIGGER:** `/workflow-command`
> **GOAL:** [Clear, actionable goal]
> **SQUAD:** [Relevant expertises for this task type]

---

## 📋 Workflow Steps

### Step 1: [Step Name]
**Relevant Expertise:** `@swarm-xxx`, `@swarm-yyy`

**Description:**
[Clear 1-2 sentence explanation of what this step does]

**Inputs:**
- [What we need before starting]
- [User request or trigger]

**Process:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Output:**
[Deliverable artifact]

**Turbo:**
```bash
[Optional command if applicable]
```
```

---

## 🚪 Exit Gate

**Complete when:**
- [ ] All steps executed
- [ ] Outputs delivered
- [ ] No regressions introduced

**Next:** [Follow-up workflow or completion action]
```

---

## 📋 Example: Bug Fix Workflow

### Step 1: Bug Localization
**Relevant Expertise:** `@swarm-analyst` (forensics investigation), `@swarm-sec` (security review if sensitive)

**Description:**
Pinpoint the exact file and line range where a bug lives before fixing.

**Process:**
1. Search for unique text from bug report
2. Identify page type (static HTML vs React route)
3. Trace component structure
4. Confirm location matches symptoms

**Output:**
- Bug location: `path/to/file.tsx:[L123-L145]`
- Confidence: HIGH/MEDIUM/LOW

**Turbo:**
```bash
grep -r "unique text" --include="*.tsx,*.html" src/
```
```
```

### Step 2: Root Cause
**Relevant Expertise:** `@swarm-analyst`, `@swarm-dev`

**Process:**
1. 5 Whys to trace causality
2. Request logs and evidence
3. Side effect analysis

**Output:**
- Root cause statement
- Evidence summary

**Turbo:**
```bash
git log --oneline -10
```
```

---

## 🎯 KEY DESIGN RULES

1. **Agent-Agnostic:** Never hardcode agent names like `@swarm-dev` in step titles
2. **Role-First:** Describe what expertise is needed (e.g., "Forensics investigation", "Security review")
3. **Flexible Routing:** Allow orchstrator to route dynamically to best agent
4. **Context Dependent:** Different agents handle same step based on context
5. **Skill Loading:** Mention which domain skills to load (`@swarm-sec` for auth workflows)

---

## 📋 WORKFLOW EXECUTION ENGINE

When user triggers a workflow:

1. **Parse** trigger to identify workflow
2. **Load** workflow definition
3. **Route** steps to appropriate swarm agents
4. **Execute** each step with relevant expertises
5. **Orchestrate** transitions between agents
6. **Verify** completion at each gate

**Workflow never explicitly says "call @swarm-dev"** - it says "Implementation" or "Engineering" or "Coding"

---

## 🚀 BENEFITS OF AGENT-AGNOSTIC WORKFLOWS

✅ **Universal Applicability:** One workflow can handle multiple use cases
✅ **Flexibility:** Easy to add new agents or expertises
✅ **Clarity:** Focus on process and actions, not agent identities
✅ **Maintainability:** Agents can be updated/retired without touching workflows
✅ **Documentation**: Self-documenting through role/action descriptions
✅ **Learning Transfer**: Expertise captured in workflow definitions

---

## 📚 MAINTENANCE

**File Location:** `SWARM_WORKFLOW_DESIGN.md`

**Updates:**
- Modify workflows: Reference this doc for design patterns
- Agent definitions: Update `@swarm-xxx` to use role/action descriptions
- Workflow creation: Follow this pattern when adding new workflows

**Verification:**
- No explicit `@swarm-xxx` tags in step headers
- Roles mentioned, not agent names
- Workflow focuses on process, not agents

---

**Version:** 1.0.0
**Last Updated:** 2026-02-02
