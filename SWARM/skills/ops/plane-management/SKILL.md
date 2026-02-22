---
name: Plane Project Management Mastery
description: Complete Plane API integration, issue tracking, module management, and project automation
version: 1.0.0
primary_agents: [swarm-orch, swarm-ops, swarm-dev, swarm-qa]
---

# 🚀 Plane Project Management Mastery Skill

> **ACTIVATION:** Track everything. Automate transitions. Never lose a work item.

---

## 🎯 Core Principles

1. **Single Source of Truth** — All work items live in Plane
2. **Identifier-First** — Use `PROJECT-NUMBER` format, never raw UUIDs
3. **State-Driven Workflow** — Issues flow: Backlog → Todo → In Progress → Done
4. **Automated Transitions** — Agent actions trigger state updates

---

## 📡 CONNECTION CONFIG

```python
# Configuration constants
BASE_URL = "http://49.13.87.235/api/v1"
API_KEY = "plane_api_cc1356ba88fe404ba9b953140d3b2fe5"
DEFAULT_WORKSPACE = "samsam"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}
```

### Endpoint Reference

| Resource | Endpoint Pattern |
|----------|------------------|
| **Projects** | `GET /workspaces/{ws}/projects/` |
| **Issues** | `GET/POST /workspaces/{ws}/projects/{pid}/issues/` |
| **Issue Detail** | `PATCH /workspaces/{ws}/projects/{pid}/issues/{iid}/` |
| **Modules** | `GET/POST /workspaces/{ws}/projects/{pid}/modules/` |
| **Module Detail** | `PATCH /workspaces/{ws}/projects/{pid}/modules/{mid}/` |
| **Module Issues** | `POST /workspaces/{ws}/projects/{pid}/modules/{mid}/module-issues/` |
| **Labels** | `GET/POST /workspaces/{ws}/projects/{pid}/labels/` |
| **States** | `GET /workspaces/{ws}/projects/{pid}/states/` |
| **Members** | `GET /workspaces/{ws}/projects/{pid}/members/` |

---

## 🔧 API OPERATIONS

### Issue Creation

```python
def create_issue(ws, proj, title, desc="", priority=None, state=None, 
                 assignees=None, labels=None, start_date=None, due_date=None):
    """
    Create a new issue with full metadata.
    
    Args:
        ws: Workspace slug (default: "samsam")
        proj: Project name or ID (e.g., "Couplance")
        title: Issue title
        desc: Description text
        priority: 0-4 (none, urgent, high, medium, low)
        state: State name (e.g., "Todo")
        assignees: Comma-separated emails
        labels: Comma-separated label names
        start_date: YYYY-MM-DD format
        due_date: YYYY-MM-DD format
    
    Returns:
        Created issue JSON with id, sequence_id, etc.
    """
    pid = resolve_project(ws, proj)
    payload = {
        "name": title,
        "description_html": f"<p>{desc}</p>"
    }
    if priority: payload["priority"] = _map_priority(priority)
    if state: payload["state"] = resolve_state(ws, pid, state)
    if assignees: 
        payload["assignees"] = [resolve_member(ws, pid, a.strip()) 
                                for a in assignees.split(',')]
    if labels: 
        payload["labels"] = [resolve_label(ws, pid, l.strip()) 
                             for l in labels.split(',')]
    if start_date: payload["start_date"] = start_date
    if due_date: payload["target_date"] = due_date
    
    return _post(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/", payload)
```

### Issue Update

```python
def update_issue(ws, proj, issue_ref, **kwargs):
    """
    Update an existing issue.
    
    Args:
        issue_ref: Identifier (COUPLANCE-1) or UUID
        **kwargs: Fields to update (title, description, priority, 
                  state, assignees, labels, start_date, due_date)
    """
    pid = resolve_project(ws, proj)
    iid = resolve_issue(ws, pid, issue_ref)
    payload = {}
    
    if kwargs.get('title'): payload['name'] = kwargs['title']
    if kwargs.get('state'): payload['state'] = resolve_state(ws, pid, kwargs['state'])
    # ... additional fields
    
    return _patch(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/{iid}/", payload)
```

### Module Creation

```python
def create_module(ws, proj, name, desc="", start_date=None, 
                  target_date=None, lead=None, members=None):
    """
    Create a module (sprint/phase) for issue grouping.
    
    Args:
        name: Module name (e.g., "Sprint 1")
        start_date: YYYY-MM-DD
        target_date: YYYY-MM-DD
        lead: Lead member email
        members: Comma-separated member emails
    """
    pid = resolve_project(ws, proj)
    payload = {"name": name, "description": desc}
    if start_date: payload["start_date"] = start_date
    if target_date: payload["target_date"] = target_date
    if lead: payload["lead"] = resolve_member(ws, pid, lead)
    if members: 
        payload["members"] = [resolve_member(ws, pid, m.strip()) 
                              for m in members.split(',')]
    
    return _post(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/", payload)
```

### Link Issues to Modules

```python
def add_issue_to_module(ws, proj, module_ref, issue_ref):
    """
    Add an issue to a module for sprint tracking.
    
    Args:
        module_ref: Module name or UUID
        issue_ref: Issue identifier (COUPLANCE-1) or UUID
    """
    pid = resolve_project(ws, proj)
    mid = resolve_module(ws, pid, module_ref)
    iid = resolve_issue(ws, pid, issue_ref)
    
    return _post(
        f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/{mid}/module-issues/",
        {"issues": [iid]}
    )
```

### Advanced Operations

```python
def create_sub_issue(ws, proj, parent_ref, title, **kwargs):
    """Create sub-issue."""
    # ... calls create_issue with parent_id ...

def add_relation(ws, proj, source, target, type="related"):
    """
    Add relation:
    - blocking: source blocks target
    - blocked_by: source is blocked by target
    - duplicate: source duplicates target
    - related: loose connection
    """
    
def add_link(ws, proj, issue, url, title):
    """Attach external URL (PR, Figma, Doc)."""
    
def upload_attachment(ws, proj, issue, file_path):
    """Upload file asset to issue."""
```

---

## 🔄 RESOLUTION HELPERS

### Identifier Resolution

```python
def resolve_issue(ws, pid, ref):
    """
    Convert PROJECT-NUMBER to UUID.
    
    Examples:
        "COUPLANCE-1" → "605d23fb-eb07-48d5-aa75-179a313ab112"
        "605d23fb-..." → "605d23fb-..." (passthrough)
    """
    if len(ref) == 36 and '-' in ref: 
        return ref  # Already UUID
    
    match = re.match(r'^([A-Z0-9]+)-(\d+)$', ref)
    if match:
        seq = int(match.group(2))
        for issue in list_issues(ws, pid):
            if issue.get('sequence_id') == seq:
                return issue['id']
    
    sys.exit(f"Issue not found: {ref}")
```

### Name Resolution

```python
def resolve_state(ws, pid, ref):
    """Convert state name to UUID."""
    if len(ref) == 36 and '-' in ref: return ref
    for s in list_states(ws, pid):
        if s['name'].lower() == ref.lower():
            return s['id']
    sys.exit(f"State not found: {ref}")

def resolve_member(ws, pid, ref):
    """Convert email to member UUID."""
    if len(ref) == 36 and '-' in ref: return ref
    for m in list_members(ws, pid):
        if m.get('email') == ref or m.get('display_name') == ref:
            return m['id']
    sys.exit(f"Member not found: {ref}")

def resolve_label(ws, pid, ref):
    """Convert label name to UUID."""
    if len(ref) == 36 and '-' in ref: return ref
    for l in list_labels(ws, pid):
        if l['name'].lower() == ref.lower():
            return l['id']
    sys.exit(f"Label not found: {ref}")
```

---

## 📊 DATA MODELS

### Priority Mapping

```python
PRIORITY_MAP = {
    "0": "none",
    "1": "urgent",
    "2": "high",
    "3": "medium",
    "4": "low"
}

def _map_priority(p):
    return PRIORITY_MAP.get(str(p), str(p).lower())
```

### State Workflow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│ Backlog  │ ──▶ │   Todo   │ ──▶ │ In Progress │ ──▶ │   Done   │
└──────────┘     └──────────┘     └─────────────┘     └──────────┘
      │                                                      │
      └──────────────────▶ Cancelled ◀───────────────────────┘
```

### Issue Response Schema

```json
{
  "id": "605d23fb-eb07-48d5-aa75-179a313ab112",
  "sequence_id": 5,
  "name": "Issue Title",
  "description_html": "<p>Description</p>",
  "priority": "high",
  "state": "e09268db-3433-4c03-b2bb-b8661d91fabc",
  "assignees": ["3983e8eb-8535-4669-bf82-28bc0741413b"],
  "labels": ["label-uuid"],
  "start_date": "2026-01-22",
  "target_date": "2026-01-29",
  "created_at": "2026-01-21T18:00:00Z",
  "updated_at": "2026-01-21T18:00:00Z"
}
```

---

## 🛡️ ERROR HANDLING

### Common Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| `Project not found` | Invalid project name/ID | Use `list_projects` to verify |
| `State not found` | Invalid state name | Use `list_states` to get valid states |
| `Member not found` | Invalid email | Use `list_members` to verify |
| `Issue not found` | Invalid identifier | Check format is `PROJECT-NUMBER` |
| `401 Unauthorized` | Invalid API key | Verify API key in config |
| `404 Not Found` | Resource doesn't exist | Check resource IDs |

### Error Response Format

```python
try:
    result = create_issue(...)
except requests.exceptions.RequestException as e:
    print(f"API Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(e.response.text)
    sys.exit(1)
```

---

## 🔄 BULK OPERATIONS

### Create Multiple Issues

```python
def bulk_create_issues(ws, proj, issues):
    """
    Create multiple issues at once.
    
    Args:
        issues: List of dicts with issue data
    """
    results = []
    for issue in issues:
        result = create_issue(
            ws, proj,
            title=issue['title'],
            desc=issue.get('description', ''),
            priority=issue.get('priority'),
            state=issue.get('state'),
            labels=issue.get('labels'),
            assignees=issue.get('assignees')
        )
        results.append(result)
    return results
```

### Sprint Setup Workflow

```bash
#!/bin/bash
# Sprint setup automation

PROJECT="Couplance"
SPRINT="Sprint 2 - Authentication"
START="2026-01-22"
END="2026-02-05"

# 1. Create sprint module
python3 plane_integration/scripts/plane_client.py -w samsam create_module \
  -p "$PROJECT" -n "$SPRINT" --start_date "$START" --target_date "$END"

# 2. Create sprint issues
for issue in "Login page" "Registration form" "Password reset"; do
  python3 plane_integration/scripts/plane_client.py -w samsam create_issue \
    -p "$PROJECT" -t "$issue" --state "Todo" --labels "Frontend"
done

# 3. Link issues to module
for i in 1 2 3; do
  python3 plane_integration/scripts/plane_client.py -w samsam add_issue_to_module \
    -p "$PROJECT" -m "$SPRINT" -i "COUPLANCE-$i"
done
```

---

## 🔌 AGENT INTEGRATION PATTERNS

### From @swarm-dev (PR Merged)

```python
def on_pr_merged(issue_identifier, pr_url):
    """Called when a PR is merged to update issue state."""
    update_issue(
        DEFAULT_WORKSPACE,
        "Couplance",
        issue_identifier,
        state="Done",
        description=f"Completed via {pr_url}"
    )
```

### From @swarm-qa (Test Results)

```python
def on_test_failure(issue_identifier, test_report):
    """Called when tests fail to update issue."""
    update_issue(
        DEFAULT_WORKSPACE,
        "Couplance", 
        issue_identifier,
        labels="Bug,Regression",
        priority=2  # High
    )
```

### From @swarm-orch (Feature Planned)

```python
def on_feature_planned(feature_name, stories):
    """Called when PM completes feature planning."""
    # Create module
    module = create_module(
        DEFAULT_WORKSPACE,
        "Couplance",
        feature_name,
        target_date="2026-02-15"
    )
    
    # Create and link stories
    for story in stories:
        issue = create_issue(
            DEFAULT_WORKSPACE,
            "Couplance",
            title=story['title'],
            desc=story['description'],
            state="Backlog"
        )
        add_issue_to_module(
            DEFAULT_WORKSPACE,
            "Couplance",
            module['id'],
            issue['id']
        )
```

---

## 🤖 AUTOMATION HOOKS

> **GOAL:** Automatically sync Plane state when work is completed.

### on_feature_complete

```python
def on_feature_complete(feature_name, issue_id, files_changed):
    """
    Called by @swarm-dev when a feature is verified complete.
    Triggered at end of /standard-feature or /skill-feature.
    
    Actions:
        1. Update issue state to Done
        2. Add completion comment with files changed
    """
    update_issue(
        DEFAULT_WORKSPACE,
        DEFAULT_PROJECT,
        issue_id,
        state="Done",
        comment=f"✅ Feature complete: {feature_name}\nFiles: {', '.join(files_changed)}"
    )
```

### on_bug_fixed

```python
def on_bug_fixed(bug_summary, issue_id, files_changed, root_cause):
    """
    Called by @swarm-qa after verification passes in /quick-fix.
    
    Actions:
        1. Update issue state to Done
        2. Add fix details as comment
    """
    update_issue(
        DEFAULT_WORKSPACE,
        DEFAULT_PROJECT,
        issue_id,
        state="Done",
        comment=f"🐛 Bug fixed: {bug_summary}\nRoot cause: {root_cause}\nFiles: {', '.join(files_changed)}"
    )
```

### on_work_started

```python
def on_work_started(issue_id):
    """
    Called when agent begins work on an issue.
    Triggered at start of any workflow with issue context.
    """
    update_issue(
        DEFAULT_WORKSPACE,
        DEFAULT_PROJECT,
        issue_id,
        state="In Progress"
    )
```

### Workflow Integration Points

| Workflow | Hook | Trigger Point |
|----------|------|---------------|
| `/quick-fix` | `on_work_started` | Step 0.5 (localization) |
| `/quick-fix` | `on_bug_fixed` | Step 6 (deploy complete) |
| `/standard-feature` | `on_work_started` | Step 1 (implementation start) |
| `/standard-feature` | `on_feature_complete` | Final step (verification passed) |
| `/close-issue` | `update_issue` | Direct call |

### CLI Usage

```bash
# Manually trigger state update (turbo command)
python3 plane_client.py -w samsam update_issue \
  -p Couplance \
  -i COUPLANCE-5 \
  --state "Done"
```

---

## ✅ PLANE OPERATIONS CHECKLIST

Before executing Plane operations:

- [ ] Workspace exists and is accessible
- [ ] Project name matches exactly (case-sensitive)
- [ ] State name is valid for the project
- [ ] Assignee email is a project member
- [ ] Label exists (create if needed)
- [ ] Date format is YYYY-MM-DD
- [ ] Identifier format is PROJECT-NUMBER

---

## 📁 FILE LOCATIONS

| File | Path | Purpose |
|------|------|---------|
| **Client Script** | `plane_integration/scripts/plane_client.py` | CLI and API wrapper |
| **Agent** | `agents/ops/plane-pm.md` | Agent instructions |
| **Skill** | `skills/ops/plane-management/SKILL.md` | Deep knowledge |

---

## 🔒 SKILL VERSION

```
Skill: Plane Project Management Mastery
Version: 1.0.0
Last Updated: 2026-01-21
Compatible Agents: swarm-orch, swarm-ops, swarm-dev, swarm-qa
```
