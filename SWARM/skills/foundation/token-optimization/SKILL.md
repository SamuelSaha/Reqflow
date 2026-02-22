---
name: Token Optimization
description: Minimize token consumption while maintaining quality - shallow context, pruning, compression
version: 1.0.0
primary_agents: [swarm-orch, swarm-arch, swarm-dev, swarm-qa]
---

# 💰 Token Optimization Skill

> **ACTIVATION:** Every token is a cost. Optimize ruthlessly.

---

## 🎯 The Token Economy

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   TOKEN MATH                                                   ║
║                                                                ║
║   Context Window = Skills + History + Reasoning               ║
║   Total Cost = Input tokens + Output tokens                    ║
║                                                                ║
║   OPTIMIZATION GOAL:                                          ║
║   - Keep context <2k tokens per agent                         ║
║   - Compress outputs to 500-1k tokens                        ║
║   - Prune completed work from context                        ║
║                                                                ║
║   RESULT: 25-40% token savings                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📊 Token Usage by Activity

| Activity | Typical Tokens | Optimized | Savings |
|----------|----------------|-----------|---------|
| **Skill loading** | 2k (full library) | 500 (1-2 skills) | 75% |
| **Context history** | 3k (all previous work) | 500 (relevant only) | 83% |
| **Reasoning** | 4k (verbose) | 1.5k (concise) | 63% |
| **Output generation** | 2k (prose) | 500 (bullets) | 75% |
| **TOTAL** | 11k | 3k | **73%** |

---

## 🛠️ Optimization Techniques

### Technique 1: Shallow Skill Loading

**❌ Wasteful (2k tokens):**
```markdown
Loaded skills:
- execution-discipline
- typescript-precision
- next15-patterns
- supabase-mastery
- frontend-engineering
- react-state-patterns
- api-design
- database-schema
- microservices-patterns
- zero-trust
- testing-patterns
- e2e-testing
```

**✅ Optimized (500 tokens):**
```markdown
Loaded for UI task:
- next15-patterns (App Router)
- accessibility-wcag (A11Y)

Skipped: backend, testing, ops skills (not relevant)
```

**Rule:** Load only skills directly relevant to current subtask.

---

### Technique 2: Context Pruning

**❌ Wasteful (3k tokens of history):**
```markdown
Context includes:
- Phase 1 discussion (complete)
- Phase 2 implementation (complete)
- Phase 3 testing (complete)
- Phase 4 integration (in progress)
- Current task details
```

**✅ Optimized (500 tokens):**
```markdown
Pruned context:
- Summary: Phases 1-3 complete ✅
- Relevant: Phase 4 integration (active)
- Current: Detail work here

Removed: Full Phase 1-3 discussions (not needed)
```

**Rule:** Drop completed phases. Keep only active workstream context.

---

### Technique 3: Output Compression

**❌ Verbose (2k tokens):**
```markdown
For the API design, I carefully considered multiple approaches to ensure we have a scalable and maintainable solution. After extensive analysis of the requirements and consultation of best practices, I've determined that a RESTful architecture would be most appropriate for this use case. The endpoints should be designed with clear naming conventions that follow industry standards...

[500 more words]

Therefore, the final recommendation is to implement a REST API with the following characteristics...
```

**✅ Compressed (500 tokens):**
```markdown
## API Design Recommendation

**Architecture:** RESTful API

**Endpoints:**
- GET /api/users - List users
- POST /api/users - Create user
- GET /api/users/:id - Get user
- PATCH /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

**Key Decisions:**
- Auth: JWT via Supabase (zero-trust skill)
- Pagination: Cursor-based (not offset)
- Rate limiting: 100 req/min per user
- Error format: RFC 7807 (Problem Details)

**Trade-offs:**
- Chose simplicity over GraphQL (faster to implement)
- Cursor pagination > offset (better performance)
```

**Compression Rules:**
- Use bullet points, not prose
- Delete reasoning, keep conclusions
- Delete "I think", "We should", filler words
- Delete transition words ("Therefore", "However")
- Keep only actionable specifications

---

### Technique 4: Structured Output Templates

**Use templates to force brevity:**

```markdown
## Output Template (forces compression)

**Decision:** [one line]
**Rationale:** [one bullet per reason, max 3]
**Implementation:** [specific files/functions]
**Trade-offs:** [what we gave up]
**Next steps:** [action items]

Max length: 500 tokens
```

---

## 🎯 Context Window Management

### The 2k Token Rule

**Per agent, per task:**
- Skills: 500 tokens (2-3 skills max)
- Context: 500 tokens (active work only)
- Reasoning space: 1k tokens (for generation)

**Total: 2k tokens per agent workstream**

### Phased Context Loading

```
Phase 1: Planning
├─ Load: execution-discipline, saas-workflows
├─ Context: 500 tokens
└─ After phase: DROP planning context

Phase 2: Parallel Execution
├─ Agent 1: Load 2 skills (500 tokens)
├─ Agent 2: Load 2 skills (500 tokens)
├─ Agent 3: Load 2 skills (500 tokens)
└─ After phase: DROP all workstream details, keep summaries only

Phase 3: Integration
├─ Load: typescript-precision (for type checking)
├─ Context: 500 tokens (summaries only)
└─ After phase: Keep integration result only

Phase 4: Verification
├─ Load: testing-patterns (for QA)
├─ Context: 300 tokens (final spec)
└─ Complete: All context dropped
```

---

## 🚀 Parallel Execution Token Savings

### Sequential vs Parallel

**Sequential (Single Agent):**
```
Agent does everything:
- Skills: 2k (loads everything)
- Context: 6k (accumulates all work)
- Reasoning: 4k (complex reasoning)
- Output: 2k (verbose prose)
TOTAL: 14k tokens
```

**Parallel (4 Agents):**
```
Each agent:
- Skills: 500 (specialized only)
- Context: 500 (shallow)
- Reasoning: 1k (focused)
- Output: 500 (compressed)
Per agent: 2.5k × 4 = 10k

Integration:
- Skills: 500
- Context: 1k (4 summaries)
- Reasoning: 500
- Output: 500
Subtotal: 2.5k

TOTAL: 12.5k tokens (11% savings)

WITH COMPRESSION:
Per agent: 2k × 4 = 8k
Integration: 2k
TOTAL: 10k tokens (29% savings!)
```

**Best case:** 40% savings with aggressive compression

---

## 📋 Token Budgeting

### Per Task Type

| Task | Token Budget | Technique |
|------|--------------|-----------|
| **Bug fix** | 1k | Minimal context, quick fix |
| **Feature (simple)** | 3k | Shallow skills, compressed output |
| **Feature (complex)** | 6k | Parallel agents, compressed |
| **Architecture** | 5k | MoA pattern, compressed |
| **Refactor** | 4k | Shallow context, parity focus |
| **Code review** | 2k | Diff only, no full context |

### Budget Enforcement

```markdown
## Token Budget Tracker

**Task:** [Feature name]
**Budget:** 6k tokens
**Current:** [X]k tokens
**Remaining:** [Y]k tokens

| Phase | Agent | Budget | Used | Status |
|---|---|---|---|---|
| 1 | @swarm-orch | 1k | 0.8k | ✅ |
| 2a | @swarm-ux | 1.5k | 1.2k | ✅ |
| 2b | @swarm-arch | 1.5k | 1.4k | ⚠️ |
| 2c | @swarm-dev | 1.5k | 1.0k | ✅ |
| 3 | @swarm-dev | 1k | - | pending |

⚠️ ALERT: @swarm-arch at 93% budget
ACTION: Compress output or extend budget
```

---

## 🎓 Real Examples

### Example 1: UI Component (Before vs After)

**BEFORE (Wasteful - 8k tokens):**
```markdown
## Button Component Design

I have analyzed the requirements for the button component based on the user story and acceptance criteria provided. After careful consideration of various design systems and best practices in the industry, I believe we should implement a flexible button component that can handle multiple variants and states...

[2000 words of design philosophy and reasoning]

The component should use Tailwind CSS for styling, which will allow us to maintain consistency with our design system. I've reviewed our existing components and determined that we need the following variants:

1. Primary button - Used for main actions
   - Background: bg-primary-600
   - Text: text-white
   - Hover: bg-primary-700
   - Active: bg-primary-800
   - Disabled: bg-primary-300
   
2. Secondary button - Used for secondary actions
   - Background: bg-white
   - Border: border-gray-300
   - Text: text-gray-700
   - Hover: bg-gray-50
   - Active: bg-gray-100
   - Disabled: bg-gray-100 text-gray-400

3. Danger button - Used for destructive actions
   - Background: bg-red-600
   - Text: text-white
   - Hover: bg-red-700
   [continues for 1000 more words]

[Additional 3000 words on implementation details, accessibility considerations, testing strategy, etc.]

In conclusion, this button component design balances flexibility, usability, and maintainability while adhering to our design system principles.

**Time:** 15 min | **Tokens:** 8k | **Quality:** Good
```

**AFTER (Optimized - 1.5k tokens):**
```markdown
## Button Component

**Variants:**
| Variant | Classes | Usage |
|---|---|---|
| Primary | `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300` | Main CTAs |
| Secondary | `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50` | Secondary actions |
| Danger | `bg-red-600 text-white hover:bg-red-700` | Destructive |
| Ghost | `bg-transparent hover:bg-gray-100` | Low emphasis |

**Sizes:**
- sm: `px-3 py-1.5 text-sm`
- md: `px-4 py-2 text-base` (default)
- lg: `px-6 py-3 text-lg`

**Props:**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

**A11Y:**
- `aria-label` for icon-only
- Focus ring: `focus:ring-2 focus:ring-primary-500`
- Keyboard: Space/Enter activation

**Test:** 3 variants × 3 sizes × 4 states = 36 cases

**Time:** 5 min | **Tokens:** 1.5k | **Quality:** Same
```

**Result:** 5× faster, 81% fewer tokens, same quality

---

### Example 2: Parallel Sprint Token Tracking

**Project:** User Dashboard Feature
**Budget:** 8k tokens

```markdown
## Token Usage Report

### Phase 1: Decomposition
- Agent: @swarm-orch
- Skills: execution-discipline, saas-workflows
- Context: 800 tokens
- Output: Workstream assignments (400 tokens)
- **Total: 1.2k** ✅

### Phase 2: Parallel Execution
- Agent 1 (@swarm-ux): 1.8k (UI design) ✅
- Agent 2 (@swarm-arch): 1.9k (API contracts) ✅
- Agent 3 (@swarm-dev): 1.7k (backend logic) ✅
- Agent 4 (@swarm-qa): 1.5k (test scaffolding) ✅
- **Subtotal: 6.9k** ✅

### Phase 3: Integration
- Agent: @swarm-dev
- Context: 1k (4 workstream summaries)
- Integration work: 800 tokens
- **Total: 1.8k** ✅

### Phase 4: Verification
- Agent: @swarm-qa
- Context: 300 tokens
- Verification: 400 tokens
- **Total: 0.7k** ✅

### GRAND TOTAL: 10.6k
**Over budget by 2.6k (33%)**

### Optimization Actions:
1. ✅ Phase 2 outputs were 200 tokens over each
2. ✅ Next time: Enforce 500 token output limit
3. ✅ Savings: 4 × 200 = 800 tokens
4. ✅ Revised estimate: 9.8k (closer to budget)
```

---

## 🔧 Implementation Checklist

### Before Starting Work
- [ ] Calculate token budget for task
- [ ] Identify 2-3 most relevant skills
- [ ] Plan context pruning strategy
- [ ] Set output format (bullet points)
- [ ] Define compression rules

### During Execution
- [ ] Load only required skills
- [ ] Prune completed work from context
- [ ] Use structured templates
- [ ] Write bullet points, not prose
- [ ] Delete reasoning, keep conclusions
- [ ] Track token usage per phase

### After Completion
- [ ] Compare actual vs budget
- [ ] Identify overspend areas
- [ ] Document lessons learned
- [ ] Update templates for next time

---

## 📈 Token Efficiency Targets

### By Workflow Type

| Workflow | Target Tokens | Max Tokens | Current Baseline |
|----------|---------------|------------|------------------|
| `/standard-feature` | 5k | 7k | 10k |
| `/parallel-sprint` | 7k | 10k | 12k |
| `/quick-fix` | 1k | 2k | 3k |
| `/discovery-protocol` | 4k | 6k | 8k |
| `/skill-feature` | 6k | 9k | 11k |

### Efficiency Metrics

```
Target improvements:
- Skill loading: 75% reduction (2k → 500)
- Context pruning: 80% reduction (3k → 500)
- Output compression: 75% reduction (2k → 500)
- Total: 60-70% token savings
```

---

## 🚨 Anti-Patterns (Token Waste)

### ❌ Never Do These

1. **Loading entire skill library**
   - Waste: 2k tokens
   - Fix: Load 2-3 relevant skills

2. **Keeping full conversation history**
   - Waste: 3k tokens
   - Fix: Keep summaries only

3. **Writing prose instead of bullets**
   - Waste: 1.5k tokens
   - Fix: Structured output templates

4. **Including reasoning in outputs**
   - Waste: 1k tokens
   - Fix: Conclusions only

5. **One agent doing everything**
   - Waste: 6k tokens
   - Fix: Parallel specialized agents

---

## 🔒 SKILL VERSION

```
Skill: Token Optimization
Version: 1.0.0
Last Updated: 2026-02-02
Target: <2k tokens per agent, 60-70% savings
Key Techniques: Shallow loading, pruning, compression
Use On: Every agent execution
```

---

**See Also:**
- `/parallel-sprint` workflow - Parallel execution
- `moa-architecture` skill - Multi-agent patterns
