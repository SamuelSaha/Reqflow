#!/usr/bin/env python3
"""
Plane API Client - Ultimate Edition
Supports: Issues, Modules, Labels, States, Members, Sub-issues, Relations, Links, Attachments
Workspace: samsam

Usage:
    python3 plane_client.py -w samsam list_projects
    python3 plane_client.py -w samsam create_issue -p Couplance -t "Title" --priority 2
    python3 plane_client.py -w samsam update_issue -p Couplance -i COUPLANCE-1 --state "Done"
"""
import requests
import argparse
import sys
import json
import re

# ============ CONFIGURATION ============
BASE_URL = "http://49.13.87.235/api/v1"
API_KEY = "plane_api_cc1356ba88fe404ba9b953140d3b2fe5"
DEFAULT_WORKSPACE = "samsam"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}


# ============ CORE HTTP HELPERS ============
def _get(url):
    """Execute GET request and return JSON data."""
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    data = r.json()
    return data.get('results', data) if isinstance(data, dict) else data


def _post(url, payload):
    """Execute POST request with JSON payload."""
    r = requests.post(url, headers=HEADERS, json=payload)
    r.raise_for_status()
    return r.json()


def _patch(url, payload):
    """Execute PATCH request with JSON payload."""
    r = requests.patch(url, headers=HEADERS, json=payload)
    r.raise_for_status()
    return r.json()


def _delete(url):
    """Execute DELETE request."""
    r = requests.delete(url, headers=HEADERS)
    r.raise_for_status()
    return {"deleted": True}


# ============ PROJECTS ============
def list_projects(ws):
    """List all projects in a workspace."""
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/")


def resolve_project(ws, ref):
    """Resolve project name/identifier to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    for p in list_projects(ws):
        if p['name'] == ref or p.get('identifier') == ref:
            return p['id']
    sys.exit(f"Project not found: {ref}")


# ============ ISSUES ============
def list_issues(ws, proj):
    """List all issues in a project."""
    pid = resolve_project(ws, proj)
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/")


def create_issue(ws, proj, title, desc="", priority=None, state=None,
                 assignees=None, labels=None, start_date=None, due_date=None):
    """Create a new issue with full metadata."""
    pid = resolve_project(ws, proj)
    payload = {"name": title, "description_html": f"<p>{desc}</p>"}
    
    if priority:
        payload["priority"] = _map_priority(priority)
    if state:
        payload["state"] = resolve_state(ws, pid, state)
    if assignees:
        payload["assignees"] = [resolve_member(ws, pid, a.strip()) 
                                for a in assignees.split(',')]
    if labels:
        payload["labels"] = [resolve_label(ws, pid, l.strip()) 
                             for l in labels.split(',')]
    if start_date:
        payload["start_date"] = start_date
    if due_date:
        payload["target_date"] = due_date
    
    return _post(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/", payload)


def update_issue(ws, proj, issue_ref, **kwargs):
    """Update an existing issue."""
    pid = resolve_project(ws, proj)
    iid = resolve_issue(ws, pid, issue_ref)
    payload = {}
    
    if kwargs.get('title'):
        payload['name'] = kwargs['title']
    if kwargs.get('description'):
        payload['description_html'] = f"<p>{kwargs['description']}</p>"
    if kwargs.get('priority'):
        payload['priority'] = _map_priority(kwargs['priority'])
    if kwargs.get('state'):
        payload['state'] = resolve_state(ws, pid, kwargs['state'])
    if kwargs.get('assignees'):
        payload['assignees'] = [resolve_member(ws, pid, a.strip()) 
                                for a in kwargs['assignees'].split(',')]
    if kwargs.get('labels'):
        payload['labels'] = [resolve_label(ws, pid, l.strip()) 
                             for l in kwargs['labels'].split(',')]
    if kwargs.get('start_date'):
        payload['start_date'] = kwargs['start_date']
    if kwargs.get('due_date'):
        payload['target_date'] = kwargs['due_date']
    
    if kwargs.get('parent'):
        payload['parent'] = resolve_issue(ws, pid, kwargs['parent'])
    
    return _patch(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/{iid}/", payload)


def create_sub_issue(ws, proj, parent_ref, title, **kwargs):
    """Create a sub-issue under a parent issue."""
    pid = resolve_project(ws, proj)
    parent_id = resolve_issue(ws, pid, parent_ref)
    
    # Create issue with parent_id
    payload = {
        "name": title,
        "parent": parent_id,
        "description_html": f"<p>{kwargs.get('description', '')}</p>"
    }
    if kwargs.get('priority'): payload["priority"] = _map_priority(kwargs['priority'])
    if kwargs.get('state'): payload["state"] = resolve_state(ws, pid, kwargs['state'])
    if kwargs.get('assignees'): 
        payload["assignees"] = [resolve_member(ws, pid, a.strip()) for a in kwargs['assignees'].split(',')]
    
    return _post(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/", payload)


def add_relation(ws, proj, issue_ref, target_ref, relation_type="related"):
    """
    Add a relation between two issues.
    relation_type: 'related', 'blocking', 'blocked_by', 'duplicate'
    """
    pid = resolve_project(ws, proj)
    iid = resolve_issue(ws, pid, issue_ref)
    tid = resolve_issue(ws, pid, target_ref)
    
    return _post(
        f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/{iid}/relations/",
        {"issue": iid, "related_issue": tid, "relation_type": relation_type}
    )


def add_link(ws, proj, issue_ref, url, title):
    """Add an external link to an issue."""
    pid = resolve_project(ws, proj)
    iid = resolve_issue(ws, pid, issue_ref)
    
    return _post(
        f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/{iid}/links/",
        {"url": url, "title": title}
    )


def upload_attachment(ws, proj, issue_ref, file_path):
    """Upload a file attachment to an issue."""
    import os
    pid = resolve_project(ws, proj)
    iid = resolve_issue(ws, pid, issue_ref)
    
    if not os.path.exists(file_path):
        sys.exit(f"File not found: {file_path}")
        
    with open(file_path, 'rb') as f:
        files = {'asset': f}
        r = requests.post(
            f"{BASE_URL}/workspaces/{ws}/projects/{pid}/issues/{iid}/attachments/",
            headers={"x-api-key": API_KEY},
            files=files
        )
        r.raise_for_status()
        return r.json()


def _map_priority(p):
    """Map priority number/string to API value."""
    m = {"1": "urgent", "2": "high", "3": "medium", "4": "low", "0": "none"}
    return m.get(str(p), str(p).lower())


# ============ MODULES ============
def list_modules(ws, proj):
    """List all modules in a project."""
    pid = resolve_project(ws, proj)
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/")


def create_module(ws, proj, name, desc="", start_date=None, target_date=None,
                  lead=None, members=None):
    """Create a new module (sprint/phase)."""
    pid = resolve_project(ws, proj)
    payload = {"name": name, "description": desc}
    
    if start_date:
        payload["start_date"] = start_date
    if target_date:
        payload["target_date"] = target_date
    if lead:
        payload["lead"] = resolve_member(ws, pid, lead)
    if members:
        payload["members"] = [resolve_member(ws, pid, m.strip()) 
                              for m in members.split(',')]
    
    return _post(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/", payload)


def update_module(ws, proj, module_ref, **kwargs):
    """Update an existing module."""
    pid = resolve_project(ws, proj)
    mid = resolve_module(ws, pid, module_ref)
    payload = {}
    
    if kwargs.get('name'):
        payload['name'] = kwargs['name']
    if kwargs.get('description'):
        payload['description'] = kwargs['description']
    if kwargs.get('start_date'):
        payload['start_date'] = kwargs['start_date']
    if kwargs.get('target_date'):
        payload['target_date'] = kwargs['target_date']
    if kwargs.get('status'):
        payload['status'] = kwargs['status']
    
    return _patch(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/{mid}/", payload)


def add_issue_to_module(ws, proj, module_ref, issue_ref):
    """Add an issue to a module."""
    pid = resolve_project(ws, proj)
    mid = resolve_module(ws, pid, module_ref)
    iid = resolve_issue(ws, pid, issue_ref)
    
    return _post(
        f"{BASE_URL}/workspaces/{ws}/projects/{pid}/modules/{mid}/module-issues/",
        {"issues": [iid]}
    )


# ============ LABELS ============
def list_labels(ws, proj):
    """List all labels in a project."""
    pid = resolve_project(ws, proj)
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/labels/")


def create_label(ws, proj, name, color="#3498db", desc=""):
    """Create a new label."""
    pid = resolve_project(ws, proj)
    return _post(
        f"{BASE_URL}/workspaces/{ws}/projects/{pid}/labels/",
        {"name": name, "color": color, "description": desc}
    )


# ============ STATES & MEMBERS ============
def list_states(ws, proj):
    """List all states in a project."""
    pid = resolve_project(ws, proj)
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/states/")


def list_members(ws, proj):
    """List all members in a project."""
    pid = resolve_project(ws, proj)
    return _get(f"{BASE_URL}/workspaces/{ws}/projects/{pid}/members/")


# ============ RESOLVERS ============
def resolve_state(ws, pid, ref):
    """Resolve state name to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    for s in list_states(ws, pid):
        if s['name'].lower() == ref.lower():
            return s['id']
    sys.exit(f"State not found: {ref}")


def resolve_member(ws, pid, ref):
    """Resolve member email/name to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    for m in list_members(ws, pid):
        if m.get('email') == ref or m.get('display_name') == ref:
            return m['id']
    sys.exit(f"Member not found: {ref}")


def resolve_label(ws, pid, ref):
    """Resolve label name to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    for l in list_labels(ws, pid):
        if l['name'].lower() == ref.lower():
            return l['id']
    sys.exit(f"Label not found: {ref}")


def resolve_issue(ws, pid, ref):
    """Resolve issue identifier (PROJECT-NUMBER) to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    match = re.match(r'^([A-Z0-9]+)-(\d+)$', ref)
    if match:
        seq = int(match.group(2))
        for i in list_issues(ws, pid):
            if i.get('sequence_id') == seq:
                return i['id']
    sys.exit(f"Issue not found: {ref}")


def resolve_module(ws, pid, ref):
    """Resolve module name to UUID."""
    if len(ref) == 36 and '-' in ref:
        return ref
    for m in list_modules(ws, pid):
        if m['name'].lower() == ref.lower():
            return m['id']
    sys.exit(f"Module not found: {ref}")


# ============ CLI ============
def main():
    p = argparse.ArgumentParser(
        description="Plane API Client - Ultimate Edition",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  List projects:
    %(prog)s -w samsam list_projects
  
  Create issue:
    %(prog)s -w samsam create_issue -p Couplance -t "Bug: Login fails" --priority 1 --state Todo
  
  Update issue state:
    %(prog)s -w samsam update_issue -p Couplance -i COUPLANCE-1 --state "In Progress"
        """
    )
    p.add_argument("--workspace", "-w", default=DEFAULT_WORKSPACE,
                   help=f"Workspace slug (default: {DEFAULT_WORKSPACE})")
    
    sub = p.add_subparsers(dest="cmd", required=True)
    
    # List commands
    for cmd in ["list_projects", "list_issues", "list_modules", 
                "list_states", "list_members", "list_labels"]:
        s = sub.add_parser(cmd, help=f"List all {cmd.split('_')[1]}")
        if cmd != "list_projects":
            s.add_argument("--project", "-p", required=True, 
                          help="Project name or ID")
    
    # Create issue
    ci = sub.add_parser("create_issue", help="Create a new issue")
    ci.add_argument("--project", "-p", required=True, help="Project name")
    ci.add_argument("--title", "-t", required=True, help="Issue title")
    ci.add_argument("--description", "-d", default="", help="Description")
    ci.add_argument("--priority", help="Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low")
    ci.add_argument("--state", help="State name (e.g., Todo, In Progress)")
    ci.add_argument("--assignees", help="Comma-separated emails")
    ci.add_argument("--labels", help="Comma-separated label names")
    ci.add_argument("--start_date", help="Start date (YYYY-MM-DD)")
    ci.add_argument("--due_date", help="Due date (YYYY-MM-DD)")
    
    # Update issue
    ui = sub.add_parser("update_issue", help="Update an existing issue")
    ui.add_argument("--project", "-p", required=True, help="Project name")
    ui.add_argument("--issue", "-i", required=True, 
                   help="Issue identifier (e.g., COUPLANCE-1)")
    ui.add_argument("--title", help="New title")
    ui.add_argument("--description", help="New description")
    ui.add_argument("--priority", help="New priority")
    ui.add_argument("--state", help="New state")
    ui.add_argument("--assignees", help="New assignees (comma-separated)")
    ui.add_argument("--labels", help="New labels (comma-separated)")
    ui.add_argument("--start_date", help="New start date")
    ui.add_argument("--due_date", help="New due date")
    ui.add_argument("--parent", help="New parent issue")
    
    # Create sub-issue
    cs = sub.add_parser("create_sub_issue", help="Create a sub-issue")
    cs.add_argument("--project", "-p", required=True)
    cs.add_argument("--parent", required=True, help="Parent issue identifier")
    cs.add_argument("--title", "-t", required=True)
    cs.add_argument("--description", "-d", default="")
    cs.add_argument("--priority")
    cs.add_argument("--state")
    cs.add_argument("--assignees")

    # Add relation
    ar = sub.add_parser("add_relation", help="Add relation between issues")
    ar.add_argument("--project", "-p", required=True)
    ar.add_argument("--issue", "-i", required=True, help="Source issue")
    ar.add_argument("--target", required=True, help="Target issue")
    ar.add_argument("--type", default="related", choices=['related', 'blocking', 'blocked_by', 'duplicate'])

    # Add link
    al = sub.add_parser("add_link", help="Add external link")
    al.add_argument("--project", "-p", required=True)
    al.add_argument("--issue", "-i", required=True)
    al.add_argument("--url", required=True)
    al.add_argument("--title", required=True)

    # Add attachment
    aa = sub.add_parser("upload_attachment", help="Upload file")
    aa.add_argument("--project", "-p", required=True)
    aa.add_argument("--issue", "-i", required=True)
    aa.add_argument("--file", "-f", required=True, help="Path to file")

    # Create module
    cm = sub.add_parser("create_module", help="Create a new module (sprint)")
    cm.add_argument("--project", "-p", required=True, help="Project name")
    cm.add_argument("--name", "-n", required=True, help="Module name")
    cm.add_argument("--description", "-d", default="", help="Description")
    cm.add_argument("--start_date", help="Start date (YYYY-MM-DD)")
    cm.add_argument("--target_date", help="Target date (YYYY-MM-DD)")
    cm.add_argument("--lead", help="Lead member email")
    cm.add_argument("--members", help="Comma-separated member emails")
    
    # Update module
    um = sub.add_parser("update_module", help="Update a module")
    um.add_argument("--project", "-p", required=True)
    um.add_argument("--module", "-m", required=True, help="Module name")
    um.add_argument("--name", help="New name")
    um.add_argument("--description", help="New description")
    um.add_argument("--start_date", help="New start date")
    um.add_argument("--target_date", help="New target date")
    um.add_argument("--status", help="New status")
    
    # Add issue to module
    aim = sub.add_parser("add_issue_to_module", help="Add an issue to a module")
    aim.add_argument("--project", "-p", required=True)
    aim.add_argument("--module", "-m", required=True, help="Module name")
    aim.add_argument("--issue", "-i", required=True, help="Issue identifier")
    
    # Create label
    cl = sub.add_parser("create_label", help="Create a new label")
    cl.add_argument("--project", "-p", required=True)
    cl.add_argument("--name", "-n", required=True, help="Label name")
    cl.add_argument("--color", "-c", default="#3498db", help="Hex color")
    cl.add_argument("--description", "-d", default="", help="Description")
    
    args = p.parse_args()
    ws = args.workspace
    
    try:
        if args.cmd == "list_projects":
            print(json.dumps(list_projects(ws), indent=2))
        elif args.cmd == "list_issues":
            print(json.dumps(list_issues(ws, args.project), indent=2))
        elif args.cmd == "list_modules":
            print(json.dumps(list_modules(ws, args.project), indent=2))
        elif args.cmd == "list_states":
            print(json.dumps(list_states(ws, args.project), indent=2))
        elif args.cmd == "list_members":
            print(json.dumps(list_members(ws, args.project), indent=2))
        elif args.cmd == "list_labels":
            print(json.dumps(list_labels(ws, args.project), indent=2))
        elif args.cmd == "create_issue":
            result = create_issue(
                ws, args.project, args.title, args.description,
                args.priority, args.state, args.assignees, args.labels,
                args.start_date, args.due_date
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "update_issue":
            result = update_issue(
                ws, args.project, args.issue,
                title=args.title, description=args.description,
                priority=args.priority, state=args.state,
                assignees=args.assignees, labels=args.labels,
                start_date=args.start_date, due_date=args.due_date,
                parent=args.parent
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "create_sub_issue":
            result = create_sub_issue(
                ws, args.project, args.parent, args.title,
                description=args.description, priority=args.priority,
                state=args.state, assignees=args.assignees
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "add_relation":
            result = add_relation(
                ws, args.project, args.issue, args.target, args.type
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "add_link":
            result = add_link(
                ws, args.project, args.issue, args.url, args.title
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "upload_attachment":
            result = upload_attachment(
                ws, args.project, args.issue, args.file
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "create_module":
            result = create_module(
                ws, args.project, args.name, args.description,
                args.start_date, args.target_date, args.lead, args.members
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "update_module":
            result = update_module(
                ws, args.project, args.module,
                name=args.name, description=args.description,
                start_date=args.start_date, target_date=args.target_date,
                status=args.status
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "add_issue_to_module":
            result = add_issue_to_module(
                ws, args.project, args.module, args.issue
            )
            print(json.dumps(result, indent=2))
        elif args.cmd == "create_label":
            result = create_label(
                ws, args.project, args.name, args.color, args.description
            )
            print(json.dumps(result, indent=2))
            
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}", file=sys.stderr)
        if hasattr(e, 'response') and e.response:
            print(e.response.text, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
