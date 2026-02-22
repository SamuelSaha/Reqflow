# SWARM_PLANE_INTEGRATION.md
# Plane + Swarm Integration Guide
# Version: 3.0.0-EXTREME

---

## 🎯 Overview

**Dual Workflow Support:**
- **Plane-First:** Create specs in Plane, agents execute
- **Swarm-First:** Create specs in Swarm, sync to Plane
- **Hybrid:** Work wherever, sync automatically

**Key Principle:** Plane is your source of truth. Swarm agents update Plane automatically.

---

## 📋 Integration Architecture

```
Plane App (Source of Truth)
    ↕️
Swarm Agents (Execution Layer)
    ↕️
Specifications (Immutability Layer)
```

**Sync Direction:**
- **Plane → Swarm:** Tickets trigger agent execution
- **Swarm → Plane:** Agents update ticket status
- **Bi-directional:** Status, comments, attachments

---

## 🚀 Two Workflows

### Workflow 1: Plane-First (Recommended)

**For:** Project management visibility, team coordination

**Steps:**
1. **Create in Plane:**
   - Create Plane issue (ticket)
   - Write spec in issue description
   - Assign to @swarm-{agent}
   - Status: "Todo"

2. **Agent Execution:**
   ```bash
   @swarm-plane /sync  # Agent reads Plane ticket
   → Loads spec from Plane
   → Executes work
   → Updates Plane status
   ```

3. **Plane Updates:**
   - Status: "Todo" → "In Progress" → "Done"
   - Comments: Progress updates
   - Attachments: Code, specs, verification

**Example Plane Issue:**
```markdown
# SPEC-001: User Authentication

## Goal
Enable email/password authentication

## Acceptance Criteria
- [ ] AC-001: User can signup
- [ ] AC-002: User can login
- [ ] AC-003: Password reset works

## Status
Assignee: @swarm-dev
Priority: P0
State: Todo
```

---

### Workflow 2: Swarm-First

**For:** Quick specs, complex decomposition, external docs

**Steps:**
1. **Create in Swarm:**
   ```bash
   @swarm-specifier /specify "User auth system"
   → Creates SPEC-001.md locally
   ```

2. **Sync to Plane:**
   ```bash
   @swarm-plane /create-ticket SPEC-001
   → Creates Plane issue from spec
   → Links spec to ticket
   → Sets initial status
   ```

3. **Work in Plane:**
   - Track in Plane
   - Comments, updates
   - Team visibility

4. **Agent Execution:**
   ```bash
   @swarm-plane /execute PLANE-123
   → Reads from Plane
   → Executes
   → Updates Plane
   ```

---

## 🤖 Plane Agent

### @swarm-plane (Integration Layer)

**Purpose:** Bridge between Plane and Swarm execution

**Commands:**

| Command | Purpose |
|---------|---------|
| `/sync` | Sync Plane tickets → Swarm |
| `/create-ticket {spec}` | Create Plane issue from spec |
| `/execute {plane-id}` | Execute Plane ticket |
| `/update-status {id} {status}` | Update Plane status |
| `/link-spec {plane-id} {spec-id}` | Link spec to Plane |
| `/comment {id} {message}` | Add Plane comment |

---

## 🔄 Status Mapping

| Swarm Status | Plane State | Action |
|--------------|-------------|--------|
| Spec Created | Todo | Initial creation |
| In Progress | In Progress | Agent starts work |
| Code Complete | In Review | Build/test passed |
| QA Pass | Done | Verification complete |
| QA Fail | Todo | Return to agent |
| Blocked | Blocked | Dependency issue |

---

## 📝 Spec Formats

### Format 1: Plane Native (In-Issue)

Write spec directly in Plane issue description:

```markdown
# SPEC Metadata
- **ID:** SPEC-001
- **Goal:** [One sentence]
- **Priority:** P0

## Non-Goals
- [ ] [What's NOT included]

## Acceptance Criteria
- [ ] AC-001: [Criterion] | Test: [Method] | Pass: [Condition]
- [ ] AC-002: [Criterion] | Test: [Method] | Pass: [Condition]

## Constraints
- Technical: [Stack requirements]
- Business: [Compliance needs]

## Attachments
- [Link to detailed spec if external]
```

### Format 2: External Spec (Linked)

Store detailed spec in repo, link from Plane:

```markdown
# SPEC-001: User Authentication

## Overview
See full spec: [specs/SPEC-001-user-auth.md](link)

## Quick Reference
- Goal: [Summary]
- AC-001: [Key criterion]
- AC-002: [Key criterion]

## Status
Tracked in Plane issue #123
```

---

## 🎮 Usage Examples

### Example 1: Create Spec in Plane

**In Plane:**
```
Issue #456
Title: [SPEC-002] API Rate Limiting
Description:
  Goal: Implement rate limiting 100 req/min
  AC-001: API returns 429 after limit
  AC-002: Headers show remaining requests
Assignee: @swarm-dev
State: Todo
```

**In Chat:**
```bash
@swarm-plane /execute PLANE-456
→ Reads spec from Plane
→ @swarm-dev executes
→ Updates Plane status: In Progress
→ Work completed
→ Updates Plane: Done + comment
```

---

### Example 2: Create Spec in Swarm, Sync to Plane

**In Chat:**
```bash
@swarm-specifier /specify "Payment integration with Stripe"
→ Creates SPEC-003.md

@swarm-plane /create-ticket SPEC-003
→ Creates Plane issue #789
→ Title: [SPEC-003] Payment Integration
→ Description: [Spec summary + link]
→ Assignee: [Auto-assigned]
```

**In Plane:**
- Track progress
- Team comments
- Status updates

---

### Example 3: Hybrid Workflow

**External Spec (Complex):**
```bash
@swarm-specifier /specify "Microservices migration"
→ Creates complex SPEC-004.md (20+ ACs)
→ Saved in specs/SPEC-004.md
```

**Plane Tickets (Atomic):**
```bash
@swarm-ticketizer /decompose SPEC-004
→ Creates 12 atomic tickets

@swarm-plane /create-tickets SPEC-004
→ Creates 12 Plane issues
→ Each linked to parent SPEC-004
→ Distributed to different agents
```

**Execution:**
- Each ticket executed by assigned agent
- Plane status updated automatically
- SPEC-004 remains immutable reference

---

## 🔧 Configuration

### Plane API Setup

```yaml
plane_integration:
  api_key: ${PLANE_API_KEY}
  workspace: ${PLANE_WORKSPACE}
  project: ${PLANE_PROJECT}
  
  sync:
    bidirectional: true
    interval: 30s
    
  status_mapping:
    todo: "backlog"
    in_progress: "in_progress"
    done: "done"
    blocked: "blocked"
```

### Auto-Sync Rules

```yaml
auto_sync:
  on_spec_create: true      # Create Plane ticket
  on_ticket_complete: true  # Update Plane status
  on_status_change: true    # Sync both directions
  on_comment_add: true      # Sync comments
```

---

## 📊 Plane + Swarm Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    PLANE APP                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Issue #123: User Auth                                  │
│  Status: Todo → In Progress → Done                      │
│  Assignee: @swarm-dev                                   │
│  Spec: [In description or linked]                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ↕️
┌─────────────────────────────────────────────────────────┐
│                    SWARM LAYER                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  @swarm-plane /execute PLANE-123                        │
│    ↓                                                    │
│  @swarm-dev (loads spec, executes)                      │
│    ↓                                                    │
│  @swarm-verifier (binary QA)                            │
│    ↓                                                    │
│  @swarm-plane /update-status PLANE-123 done             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Best Practices

### For Plane-First:
- Write concise specs in Plane (5-8 ACs)
- Use Plane for team visibility
- Let agents handle complexity
- Plane = Project management

### For Swarm-First:
- Use for complex specs (20+ ACs)
- Keep detailed specs in repo
- Link to Plane for tracking
- Swarm = Execution detail

### For Hybrid:
- Complex specs in repo
- Atomic tickets in Plane
- Link them together
- Best of both worlds

---

## 🚨 Rules

1. **Plane is source of truth** for status
2. **Specs are immutable** once work starts
3. **Agents update Plane** automatically
4. **Comments sync both ways**
5. **Attachments in Plane** for visibility

---

## 📚 Integration with Other Agents

**@swarm-specifier:**
- Can create specs in Plane directly
- Or create locally then sync

**@swarm-ticketizer:**
- Decomposes specs into Plane tickets
- Links child tickets to parent spec

**@swarm-dev/ux/qa:**
- Read specs from Plane or local
- Update Plane status on completion
- Add verification reports to Plane

**@swarm-orch:**
- Routes based on Plane assignments
- Monitors Plane for new tickets
- Triggers execution automatically

---

## 🔥 Extreme Features

### Auto-Execution
```yaml
auto_execute:
  enabled: true
  trigger: plane_status_change_to_todo
  action: route_to_assigned_agent
```

### Spec Sync
```bash
@swarm-plane /sync-all
→ Sync all Plane tickets to Swarm
→ Update status both directions
→ Generate missing specs
```

### Plane Analytics
```bash
@swarm-plane /metrics
→ 90% pass rate per agent
→ Cycle time analysis
→ Bottleneck identification
```

---

## ✅ Zero-Defect Checklist

- [ ] Plane API connected
- [ ] Status mapping configured
- [ ] Auto-sync enabled
- [ ] Agent assignments working
- [ ] Spec linking functional
- [ ] Comment sync active
- [ ] Verification reports posted to Plane

---

**Version:** 3.0.0-EXTREME  
**Integration:** Plane + Swarm  
**Status:** Active

**PLANE + SWARM: Spec-driven, team-visible, ruthlessly effective.**
