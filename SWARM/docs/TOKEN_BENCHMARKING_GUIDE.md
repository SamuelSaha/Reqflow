---
type: guide
title: "Token Benchmarking & Optimization Guide"
date: 2026-02-02
version: 1.0.0
---

# 📊 Token Benchmarking & Optimization Guide

> **Purpose:** Measure, benchmark, and optimize token consumption across all Swarm workflows

---

## 🎯 Token Economics 101

### Understanding Token Costs

```
Token = Unit of text processed by LLM
Input tokens = Skills + Context + Prompt
Output tokens = Generated response

Cost drivers:
- Large context windows (skills, history)
- Verbose outputs (prose vs bullets)
- Redundant reasoning (explaining decisions)
- Loading unnecessary skills
```

### Token Budget Framework

| Task Type | Budget | Max | Typical Waste |
|-----------|--------|-----|---------------|
| **Quick fix** | 1k | 2k | 50% (loading all skills) |
| **Bug fix** | 1.5k | 3k | 40% (verbose output) |
| **Feature (simple)** | 3k | 5k | 35% (unnecessary context) |
| **Feature (complex)** | 6k | 10k | 30% (poor parallelization) |
| **Architecture** | 5k | 8k | 25% (lack of compression) |
| **Refactor** | 4k | 6k | 30% (carrying old patterns) |

---

## 📈 Benchmarking Your Workflows

### Step 1: Establish Baseline

```markdown
## Token Baseline Template

**Workflow:** [Name]
**Task:** [Description]
**Date:** [YYYY-MM-DD]

### Execution Log
| Phase | Agent | Input Tokens | Output Tokens | Total | Time |
|---|---|---|---|---|---|
| 1 | @swarm-X | [X]k | [Y]k | [Z]k | [M] min |
| 2 | @swarm-Y | [X]k | [Y]k | [Z]k | [M] min |
| 3 | @swarm-Z | [X]k | [Y]k | [Z]k | [M] min |
| **TOTAL** | - | [X]k | [Y]k | **[Z]k** | **[M] min** |

### Analysis
- Over budget? [Y/N] by [X]%
- Most expensive phase: [Phase X]
- Biggest waste: [Context/Output/Skills]

### Optimization Actions
1. [Action 1]
2. [Action 2]
3. [Action 3]
```

### Step 2: Track Metrics

**Key Metrics to Track:**

```bash
# After each workflow execution, capture:
1. Total tokens consumed
2. Tokens per agent
3. Context size (skills + history)
4. Output size
5. Time-to-completion
6. Quality score (0-100%)
```

**Token Tracking Spreadsheet:**

| Date | Workflow | Task | Budget | Actual | Variance | Time | Quality |
|---|---|---|---|---|---|---|---|
| 2026-02-02 | /standard-feature | Auth | 5k | 7k | +40% | 80 min | 75% |
| 2026-02-02 | /parallel-sprint | Profile | 8k | 7.9k | -1% | 20 min | 90% |

---

## 🔧 Optimization Techniques (With Benchmarks)

### Technique 1: Shallow Skill Loading

**Before:** Load all 25 skills
```
Tokens: 2,000
Time: 0 min (just context loading)
Result: Wasteful
```

**After:** Load 2-3 relevant skills
```
Tokens: 500
Savings: 1,500 tokens (75%)
Time: Same
Result: Optimal
```

**Benchmark:**
```markdown
## Skill Loading Benchmark

**Task:** UI Component Design

**Full Library:**
- Tokens: 2,000
- Skills loaded: 25
- Relevant: 3
- Waste: 88%

**Shallow Loading:**
- Tokens: 500
- Skills loaded: 3 (ux, a11y, next15)
- Relevant: 3
- Waste: 0%
- **Savings: 1,500 tokens (75%)**
```

---

### Technique 2: Context Pruning

**Before:** Keep full conversation history
```
Tokens: 3,000 (phases 1-3 complete discussion)
Result: Context bloat
```

**After:** Keep summaries only
```
Tokens: 500 (phase summaries)
Savings: 2,500 tokens (83%)
Result: Lean context
```

**Benchmark:**
```markdown
## Context Pruning Benchmark

**Workflow:** 4-Phase Feature

**Full History:**
- Phase 1: 800 tokens
- Phase 2: 1,200 tokens  
- Phase 3: 900 tokens
- Phase 4: 100 tokens (active)
- **Total: 3,000 tokens**

**Pruned (summaries only):**
- Phase 1: "Complete - API designed" (10 tokens)
- Phase 2: "Complete - DB migrated" (10 tokens)
- Phase 3: "Complete - Logic done" (10 tokens)
- Phase 4: Active details (470 tokens)
- **Total: 500 tokens**
- **Savings: 2,500 tokens (83%)**
```

---

### Technique 3: Output Compression

**Before:** Verbose prose
```markdown
After careful consideration of the requirements and consultation with best practices, 
I believe we should implement a RESTful API that uses JWT authentication via Supabase. 
This approach provides several benefits including security, scalability, and ease of implementation...
[500 words]
```
**Tokens: 2,000**

**After:** Compressed bullets
```markdown
## API Design

**Architecture:** REST + JWT (Supabase)

**Benefits:**
- Security: Built-in auth
- Scalability: Stateless
- DX: Easy to implement

**Endpoints:**
- POST /auth/login
- POST /auth/logout
- GET /user/profile
```
**Tokens: 500**

**Savings: 1,500 tokens (75%)**

---

### Technique 4: Parallel Execution

**Sequential (Single Agent):**
```
Phase 1: Plan (2k tokens)
Phase 2: Design UI (2k tokens)
Phase 3: Design API (2k tokens) [wait]
Phase 4: Implement (3k tokens) [wait]
Phase 5: Test (1k tokens) [wait]
Total: 10k tokens, 75 min
```

**Parallel (4 Agents):**
```
Phase 1: Plan (1k tokens) - 5 min
Phase 2: Parallel (2k × 4 = 8k tokens) - 10 min
Phase 3: Integration (1.5k tokens) - 3 min
Phase 4: Verify (0.5k tokens) - 2 min
Total: 11k tokens? 

WITH COMPRESSION:
Phase 2: (1.5k × 4 = 6k tokens)
Phase 3: (1k tokens)
Total: 8.5k tokens, 20 min

Savings: 1.5k tokens (15%)
Time savings: 55 min (73%)
```

**Note:** Parallel saves time; token savings require compression.

---

## 📊 Benchmarking Workflows

### /standard-feature Benchmark

**Baseline (Before Optimization):**
```
Workflow: /standard-feature
Task: User authentication
Date: 2026-02-01

Phase 1 (Scope): 1.5k tokens
Phase 2 (UX): 2.5k tokens  
Phase 3 (Blueprint): 1.8k tokens
Phase 4 (Build): 4.2k tokens
Phase 5 (QA): 1.2k tokens
Phase 6 (Verify): 0.8k tokens
Total: 12k tokens
Budget: 5k
Over budget: +140% ❌
Time: 85 min
```

**Optimized (After Token Optimization):**
```
Workflow: /standard-feature
Task: User authentication
Date: 2026-02-02

Phase 1: 0.8k (shallow skills)
Phase 2: 1.2k (compressed wireframes)
Phase 3: 0.9k (bullet points only)
Phase 4: 2.5k (surgical diff, no prose)
Phase 5: 0.8k (compressed QA)
Phase 6: 0.5k (minimal verification)
Total: 6.7k tokens
Budget: 5k
Over budget: +34% ⚠️
Time: 70 min

Improvement: 44% token reduction
```

### /parallel-sprint Benchmark

**Optimal Execution:**
```
Workflow: /parallel-sprint
Task: User profile dashboard
Date: 2026-02-02

Phase 1 (Decompose): 0.8k tokens
Phase 2a (UI): 1.8k tokens
Phase 2b (API): 1.9k tokens
Phase 2c (Backend): 1.7k tokens
Phase 2d (Tests): 1.5k tokens
Phase 3 (Integrate): 0.8k tokens
Phase 4 (Verify): 0.4k tokens
Total: 7.9k tokens
Budget: 8k
Under budget: -1% ✅
Time: 20 min
Quality: 90%

Status: OPTIMAL ✅
```

---

## 🎯 Token Budget Templates

### By Workflow Type

```markdown
## Token Budget: /standard-feature

**Total Budget:** 5k tokens
**Buffer:** 1k (20%)
**Hard Limit:** 6k

Phase Allocation:
- Phase 1 (Scope): 800 tokens (16%)
- Phase 2 (UX): 1,200 tokens (24%)
- Phase 3 (Blueprint): 800 tokens (16%)
- Phase 4 (Build): 2,000 tokens (40%)
- Phase 5 (QA): 800 tokens (16%)
- Phase 6 (Verify): 400 tokens (8%)

Optimization Techniques:
- [ ] Shallow skill loading (<3 skills per phase)
- [ ] Compressed outputs (bullets not prose)
- [ ] Context pruning (drop completed phases)
```

```markdown
## Token Budget: /parallel-sprint

**Total Budget:** 8k tokens
**Buffer:** 2k (25%)
**Hard Limit:** 10k

Phase Allocation:
- Phase 1 (Decompose): 1,000 tokens (12.5%)
- Phase 2 (Parallel): 6,000 tokens (75%)
  - Per agent: 1,500 tokens
  - 4 agents max
- Phase 3 (Integrate): 1,000 tokens (12.5%)
- Phase 4 (Verify): 1,000 tokens (12.5%)

Optimization Techniques:
- [ ] Shallow skills (2 per agent)
- [ ] Compressed outputs (500 tokens max)
- [ ] No reasoning in outputs (conclusions only)
- [ ] Context pruning after each phase
```

---

## 📈 Setting Your Baseline

### Week 1: Measure Everything

```bash
# Track every workflow execution
for each workflow:
  1. Record start time
  2. Record start token count (if available)
  3. Execute workflow
  4. Record end time
  5. Record end token count
  6. Calculate: tokens used, time taken
  7. Log to spreadsheet
```

### Week 2: Identify Biggest Waste

```markdown
## Token Waste Analysis

Top 3 waste sources:
1. Loading full skill library (2k waste per execution)
   - Fix: Shallow skill loading
   - Savings: 75%
   
2. Verbose outputs (1.5k waste per agent)
   - Fix: Output compression
   - Savings: 75%
   
3. Context bloat (2k waste per multi-phase)
   - Fix: Context pruning
   - Savings: 83%
```

### Week 3: Implement Optimizations

```markdown
## Implementation Priority

Priority 1: Shallow skill loading
- Effort: Low (change skill loading)
- Impact: High (75% of 2k = 1.5k savings)
- Do first

Priority 2: Output compression
- Effort: Medium (change output format)
- Impact: High (75% of 2k = 1.5k savings)
- Do second

Priority 3: Context pruning
- Effort: Medium (manual pruning)
- Impact: Very High (83% of 3k = 2.5k savings)
- Do third
```

### Week 4: Verify Improvements

```markdown
## Before/After Comparison

Metric | Before | After | Improvement
---|---|---|---
Avg tokens / feature | 10k | 5.5k | 45%
Avg time / feature | 80 min | 60 min | 25%
Budget compliance | 30% | 85% | +55%
Quality score | 75% | 85% | +10%
```

---

## 🚨 Token Waste Red Flags

### Warning Signs

```markdown
🚩 RED FLAGS (Immediate Action Required)

1. **Over 10k tokens for simple feature**
   - Problem: Massive waste somewhere
   - Action: Audit skill loading + output compression

2. **Context window over 4k**
   - Problem: Carrying too much history
   - Action: Prune completed phases immediately

3. **Single agent over 3k tokens**
   - Problem: Agent doing too much
   - Action: Split into parallel workstreams

4. **Output over 2k per agent**
   - Problem: Verbose prose
   - Action: Enforce bullet point format

5. **Loading >5 skills**
   - Problem: Kitchen sink approach
   - Action: Select 2-3 relevant skills only
```

---

## 🛠️ Tools & Scripts

### Token Estimation

```bash
# Estimate tokens in a file
wc -w file.md | awk '{print $1/0.75}'  # Rough estimate: words / 0.75

# Estimate tokens in output
# Typical: 1 token ≈ 0.75 words
# Code: 1 token ≈ 1 character

# Quick check: Is output too long?
if [ $(wc -w < output.md) -gt 1000 ]; then
  echo "⚠️ Output likely over 1.3k tokens - compress"
fi
```

### Token Tracking

```markdown
## Daily Token Log

Date: 2026-02-02

Workflow | Task | Budget | Actual | Status
---|---|---|---|---
/quick-fix | Bug #123 | 1k | 0.8k | ✅
/standard-feature | Auth | 5k | 6.2k | ⚠️ +24%
/parallel-sprint | Profile | 8k | 7.9k | ✅

Daily Total: 14.9k tokens
Target: <15k ✅
```

---

## 🎓 Advanced Optimization

### Dynamic Budget Adjustment

```markdown
## Smart Budget Scaling

IF task_complexity == "high":
  budget = base_budget * 1.5
  max_tokens = 10k
  
IF parallel_eligible == True:
  budget = base_budget * 1.2  # Parallel overhead
  but time = time / 3
  
IF urgency == "critical":
  budget = base_budget * 0.8  # Accept lower quality
  max_time = time / 2
```

### Predictive Token Management

```markdown
## Token Prediction

Before starting, estimate:

**Simple Task Checklist:**
- [ ] <5 files touched
- [ ] No new dependencies
- [ ] Standard patterns
- [ ] Clear requirements

IF all checked:
  predicted_tokens = 3k
  confidence = 90%
ELSE:
  predicted_tokens = 6k
  confidence = 70%
```

---

## ✅ Optimization Checklist

### Pre-Execution
- [ ] Token budget calculated
- [ ] 2-3 skills selected (not entire library)
- [ ] Output format defined (bullets)
- [ ] Context pruning strategy planned

### During Execution
- [ ] Token tracker open
- [ ] Check per-phase usage
- [ ] Alert if >80% of phase budget
- [ ] Compress outputs immediately

### Post-Execution
- [ ] Compare actual vs budget
- [ ] Log to tracking spreadsheet
- [ ] Identify waste sources
- [ ] Plan optimizations for next time

---

## 📚 Reference

### Token Density by Content Type

| Content Type | Tokens / 1000 chars | Example |
|---|---|---|
| English prose | 250-300 | Documentation |
| Technical spec | 200-250 | API contracts |
| Code (TypeScript) | 150-200 | Implementation |
| Compressed bullets | 100-150 | Optimized output |
| SQL/Schemas | 100-150 | Database code |

### Quick Reference Card

```
╔══════════════════════════════════════════════════════════════╗
║                    TOKEN OPTIMIZATION                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  BUDGET:     <2k per agent, <8k per workflow                ║
║  SKILLS:     Load 2-3 max                                   ║
║  CONTEXT:    Prune completed work                           ║
║  OUTPUT:     Bullets, no prose                              ║
║  COMPRESS:   Delete reasoning, keep conclusions             ║
║                                                              ║
║  TARGET:     60-70% savings vs baseline                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

**Guide Version:** 1.0.0  
**Last Updated:** 2026-02-02  
**Status:** Production-ready  
**Target Savings:** 60-70%
