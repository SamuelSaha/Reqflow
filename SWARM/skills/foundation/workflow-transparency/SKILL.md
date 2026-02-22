---
name: Workflow Transparency
description: Agent visibility, assumption validation, and progress tracking for all Swarm workflows
version: 1.1.0
primary_agents: [swarm-orch, swarm-analyst, swarm-ux, swarm-dev, swarm-qa, swarm-arch, swarm-growth, swarm-sec]
---

# 🔍 Workflow Transparency

> **ACTIVATION:** Every workflow must show its work — agents, skills, assumptions, and progress.

---

## 🎯 Core Principle

**User MUST know:**
1. Which agents are involved
2. What skills are loaded
3. What assumptions are being made
4. How much time/tokens are being used (estimate OK)
5. Current progress at any moment

**Why:** Prevents blind trust, enables course correction, improves outcomes.

### Sovereign Lead Compatibility (Non-Negotiable)
- **No approval checkpoints.** We disclose assumptions; we do not ask the user to “approve”.
- **User consulted only if blocked.** If an external constraint is missing and work cannot proceed, ask **one precise question**. Otherwise proceed.
- **No decision dumping.** Present a recommendation and execute; do not ask the user to choose between options.

---

## 📋 Required Transparency Elements

### 1. Agent Roster (Before Work Starts)

**Every workflow MUST display:**

```markdown
## 🤖 ACTIVE AGENT ROSTER

| Step | Agent | Role | Skills | Task | Est. Time |
|------|-------|------|--------|------|-----------|
| 1 | @swarm-X | Role | skill-1, skill-2 | What they'll do | X min |
| 2 | @swarm-Y | Role | skill-3, skill-4 | What they'll do | Y min |

**Summary:**
- Total Agents: [N]
- Total Skills: [N]
- Estimated Tokens: [X]k
- Estimated Time: [X] min
- Execution Mode: [Sequential/Parallel]
```

**Purpose:**
- User knows who's working
- Can question if wrong agents selected
- Understands resource allocation

---

### 2. Assumptions Ledger (Disclose + Proceed)

**Before analysis begins, disclose assumptions and proceed with defaults:**

```markdown
## ⚠️ ASSUMPTIONS LEDGER (AUTO)

Assumptions I'm using (will proceed unless you change constraints):

1. **[Assumption Category]:** [Specific assumption]
   - Default: [what we will do]

2. **[Assumption Category]:** [Specific assumption]
   - Default: [what we will do]

**Blocker rule:** Only ask you a question if we cannot proceed without your input.
```

**Purpose:**
- Prevents wrong assumptions driving work
- Catches misalignment early
- Saves rework time
- Preserves sovereign execution (no approval loops)

---

### 3. Real-Time Progress Tracker

**During execution:**

```markdown
## 🛤️ REAL-TIME PROGRESS

```
Progress: 40% | Tokens: 3.2k | Time: 8 min

Step 1: [Name] ✅ [X min, Yk tokens]
Step 2: [Name] ⏳ [Current: @swarm-X]
Step 3: [Name] ⏸️ [Pending]
Step 4: [Name] ⏸️ [Pending]
```
```

**Purpose:**
- User knows where work stands
- Can estimate remaining time
- Spot if stuck or slow

---

### 4. Agent Performance Report

**After completion:**

```markdown
## 📊 AGENT PERFORMANCE

| Agent | Time | Tokens | Output Quality |
|-------|------|--------|----------------|
| @swarm-X | 3 min | 1.2k | 9/10 |
| @swarm-Y | 4 min | 1.8k | 8/10 |
| @swarm-Z | 2 min | 0.9k | 9/10 |

**Efficiency:**
- On-time delivery: [X]%
- Token budget: [Under/Over] by [X]%
- Quality score: [X]/10
```

**Purpose:**
- Track agent effectiveness
- Identify optimization opportunities
- Build performance history

---

## 🎓 Implementation Guide

### For Workflow Authors

**Add to every workflow header:**

```yaml
---
name: Workflow Name
description: Description with transparency requirements
agents: [agent-1, agent-2, agent-3]  # Explicit agent list
skills: [skill-1, skill-2]          # Required skills
assumptions:                         # Key assumptions made
  - "Users want X"
  - "Tech stack is Y"
  - "Complexity is Z"
transparency_level: full            # full | partial | minimal
---
```

**Add to workflow body (first section):**

```markdown
## 🤖 ACTIVE AGENT ROSTER

[Table of agents]

## ⚠️ ASSUMPTIONS LEDGER (AUTO)

[Assumptions + defaults + (optional) 1 blocking question]
```

**Add to each step:**

```markdown
**Progress Update:**
```
✅ Step [N]: [Name] ([X] min, [Y]k tokens)
[Summary of what was done]
⏳ Step [N+1]: Starting [Next Step]...
```
```

---

### For Agent Developers

**When building agents:**

1. **Declare skills explicitly**
   ```typescript
   // At start of work
   console.log("🧰 Skills loaded: [skill-1, skill-2, skill-3]")
   ```

2. **Log assumptions made**
   ```typescript
   // When making decisions
   console.log("⚠️ Assumption: [what you assumed]")
   ```

3. **Report progress regularly**
   ```typescript
   // Every 2-3 minutes
   console.log("📊 Progress: [X]% | Tokens: [Y]k | Time: [Z] min")
   ```

4. **Summarize output concisely**
   ```typescript
   // At completion
   console.log("✅ Complete: [1-sentence summary]")
   console.log("📈 Metrics: [Time] min, [Tokens]k tokens")
   ```

---

## 🔧 Transparency Templates

### Template 1: Simple Workflow (1-2 Agents)

```markdown
## 🤖 AGENT ROSTER

**Agent:** @swarm-dev
**Skills:** typescript-precision, supabase-mastery
**Task:** [Brief description]
**Est. Time:** 5 min | **Est. Tokens:** 2k

## ⚠️ ASSUMPTIONS

- This is a standard CRUD operation
- No complex business logic required

Proceeding with these defaults.

---

## 🛤️ PROGRESS

```
⏳ Analyzing... [2 min elapsed]
```
```

### Template 2: Complex Workflow (4+ Agents)

```markdown
## 🤖 AGENT ROSTER

| Step | Agent | Skills | Task | Est. |
|------|-------|--------|------|------|
| 1 | @swarm-orch | execution-discipline | Decompose | 3 min |
| 2 | @swarm-ux | accessibility-wcag | Design UI | 5 min |
| 3 | @swarm-arch | api-design | Design API | 5 min |
| 4 | @swarm-dev | supabase-mastery | Implement | 10 min |
| 5 | @swarm-qa | testing-patterns | Test | 5 min |

**Total:** 5 agents, 10 skills, ~8k tokens, 28 min

## ⚠️ ASSUMPTIONS LEDGER (AUTO)

1. **Animation level:** Subtle (not cinematic)
   - Default: subtle motion, reduced-motion respected

2. **Scope:** Global component (not page-specific)
   - Default: global component unless spec restricts scope

3. **Priority:** Visual polish (not performance)
   - Default: balance polish with performance budgets

**Blocking question rule:** Only ask if we cannot proceed without your input.

---

## 🛤️ PROGRESS

```
Progress: 0% | Tokens: 0k | Time: 0 min

Step 1: Decomposition ⏳ [Current: @swarm-orch]
Step 2: UI Design ⏸️ [Pending: @swarm-ux]
Step 3: API Design ⏸️ [Pending: @swarm-arch]
Step 4: Implementation ⏸️ [Pending: @swarm-dev]
Step 5: Testing ⏸️ [Pending: @swarm-qa]
```
```

---

## 📊 Transparency Metrics

### Track These For Every Workflow

| Metric | Target | Why |
|--------|--------|-----|
| **Agent visibility** | 100% | User always knows who's working |
| **Skill disclosure** | 100% | All loaded skills listed |
| **Assumptions disclosed** | 100% | No hidden defaults driving work |
| **Progress updates** | Every 2 min | User knows current status |
| **Token reporting** | Real-time | Budget awareness |
| **Time tracking** | Real-time | Deadline awareness |

### Dashboard View

```
╔════════════════════════════════════════════════════════════╗
║              WORKFLOW TRANSPARENCY DASHBOARD               ║
╠════════════════════════════════════════════════════════════╣
║  Workflow: [Name]                                          ║
║  Status: ⏳ In Progress (60% complete)                     ║
║                                                            ║
║  AGENTS: 3 active                                          ║
║  ├── @swarm-ux ✅ Done (4 min)                            ║
║  ├── @swarm-dev ⏳ Working (8 min elapsed)                ║
║  └── @swarm-qa ⏸️ Waiting                                  ║
║                                                            ║
║  RESOURCES:                                                ║
║  ├── Tokens: 4.2k / 8k budget (53%)                        ║
║  ├── Time: 12 min / 20 min budget (60%)                    ║
║  └── Skills: 6 loaded                                      ║
║                                                            ║
║  ASSUMPTIONS: 3/3 validated ✅                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## ✅ Transparency Checklist

Before releasing any workflow:

- [ ] Agent roster displayed before work starts
- [ ] All skills listed with purposes
- [ ] Key assumptions identified
- [ ] Assumptions ledger disclosed (defaults stated)
- [ ] Progress tracker shows current step
- [ ] Time estimate provided
- [ ] Token budget provided
- [ ] Real-time updates every 2-3 minutes
- [ ] Agent performance summary at end
- [ ] Resource usage reported (time/tokens)

---

## 🚫 Anti-Patterns (Don't Do These)

### ❌ Hidden Agents
```
[Bad - User doesn't know who's working]
"I'll analyze this for you..."
[No agent roster shown]
```

### ❌ Hidden Skills
```
[Bad - Skills loaded without disclosure]
"Processing..."
[No skill list shown]
```

### ❌ Silent Assumptions
```
[Bad - Assumptions not validated]
"I'll assume you want animations..."
[No validation checkpoint]
```

### ❌ No Progress Updates
```
[Bad - User waits blindly]
[15 minutes of silence]
"Done!"
```

### ✅ Correct Approach
```
[Good - Full transparency]
"🤖 Agent roster: @swarm-ux, @swarm-dev"
"🧰 Skills: accessibility-wcag, next15-patterns"
"⚠️ Assumption: subtle animations (default); will adjust if constraints change"
"⏳ Step 2/5: UI Design in progress (40%)"
"📊 5 min elapsed, 1.8k tokens used"
```

---

## 🔒 SKILL VERSION

```
Skill: Workflow Transparency
Version: 1.1.0
Last Updated: 2026-02-07
Requirement: ALL workflows must implement
Purpose: User visibility and trust
Coverage: Agent roster, skills, assumptions, progress
```

---

**See Also:**
- `/parallel-sprint` workflow - Example with full transparency
- `token-optimization` skill - Resource tracking
