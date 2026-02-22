---
description: Close Issue - Auto-sync Plane issue on task completion
---

# 🏁 Close Issue Protocol

> **TRIGGER:** Feature complete, bug fixed, or before `notify_user` with "complete" message  
> **GOAL:** Sync Plane issue state immediately after work completion  
> **TIME:** 30 seconds

---

// turbo-all

## 📋 Workflow Steps

### Step 1: Identify Issue ID

**Involves:** `@swarm-orch` (orchestration), `@swarm-ops` (Plane integration)

Extract the Plane issue ID from context:

```markdown
## Issue Identification
- **Issue ID:** [PROJECT-123]
- **Source:** [From task.md / user request / commit message]
```

### Step 2: Determine Target State

| Work Outcome | Target State |
|--------------|--------------|
| Bug fixed & verified | `Done` |
| Feature complete & verified | `Done` |
| Blocked on external | `Backlog` (with comment) |
| Needs more info | `Backlog` (with question) |
| Cancelled | `Cancelled` |

### Step 3: Update Plane Issue

**Involves:** `@swarm-ops` (Plane automation)

```bash
# Mark issue as Done
python3 swarm-mode/skills/ops/plane-management/scripts/plane_client.py \
  -w samsam \
  update_issue \
  -p PROJECT_NAME \
  -i PROJECT-123 \
  --state "Done"
```

### Step 4: Log Completion

```markdown
## ✅ Issue Synced
- **Issue:** PROJECT-123
- **New State:** Done
- **Timestamp:** [ISO timestamp]
```

---

## 🔗 Auto-Trigger Points

This workflow is automatically triggered by:

1. **`/quick-fix` Step 6:** After verification passes
2. **`/standard-feature` final step:** After all acceptance criteria met
3. **`notify_user` with "complete":** Before exiting to user

---

## 📋 Batch Closure

If multiple issues completed in session:

```bash
# Close multiple issues
for issue in PROJECT-1 PROJECT-2 PROJECT-3; do
  python3 plane_client.py update_issue -p PROJECT -i $issue --state "Done"
done
```

---

## 🔐 Security Note

Always verify that issue ID matches the work done:
- Don't close issues you didn't work on
- Verify issue belongs to correct project

---

## 🚪 Exit

**Complete when:**
- [ ] Plane issue state updated
- [ ] Log entry created
- [ ] No orphan work (all deliverables traced to issues)

