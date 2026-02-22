---
description: Bug Localization - Pinpoint exact source of a bug before fixing
---

# 🔍 Bug Localization Protocol

> **TRIGGER:** `/bug-localize`  
> **GOAL:** Pinpoint exact file and line range for a bug  
> **TIME:** 5 minutes max  
> **GATE:** Must complete before `/quick-fix`

---

## 🚦 Pre-Flight Check

- [ ] Bug report received (user description or error message)
- [ ] Some symptom identified (text, behavior, or error)

**Required Input:** User describes bug behavior

---

## 📋 Workflow Steps

### Step 1: Symptom Analysis (1 min)

**Involves:** `@swarm-analyst` (investigation, debugging)

Extract key information:

```markdown
## Bug Symptom
- **What's broken:** [UI element, behavior, error message]
- **Where reported:** [Page URL, component name, or "unknown"]
- **Trigger action:** [What user did to cause it]
```

### Step 2: Route Identification (1 min)

**Involves:** `@swarm-dev` (code navigation), `@swarm-analyst` (component analysis)

Determine the page type:

| Pattern | Location | Example |
|---------|----------|---------|
| Static HTML | `public/*.html` | `public/start.html` |
| React Route | `app/**/*.tsx` | `app/planner/page.tsx` |
| Shared Component | `components/**/*.tsx` | `components/Sidebar.tsx` |

**Check:**

```bash
# Search for unique text from bug report
grep -r "unique text" --include="*.tsx,*.html" src/
```

### Step 3: Multi-Source Search (2 min)

**Involves:** `@swarm-dev` (code search)

Search for bug location using multiple strategies:

```bash
# Strategy 1: Search for UI text
grep_search --query "button text or error message"

# Strategy 2: Search for component name
grep_search --query "ComponentName" --includes "*.tsx"

# Strategy 3: Search for CSS class
grep_search --query "className='specific-class'"
```

### Step 4: Verification (1 min)

**Involves:** `@swarm-dev` (code verification), `@swarm-analyst` (confirmation)

Confirm the location:

1. Open the candidate file(s)
2. Verify component renders at reported URL
3. Check if symptom matches the code

### Step 5: Output Confirmation

```markdown
## 📍 Bug Location Confirmed

**File:** `[path/to/file.tsx]`
**Component:** `[ComponentName]`
**Route:** `[/url/path]`
**Line Range:** `[L123-L145]`
**Confidence:** [HIGH/MEDIUM/LOW]

**🔐 Security Check:**
- [ ] Bug involves auth/data exposure? [YES/NO]
- [ ] If YES → Flag for `@swarm-sec` review
```

---

## 🚨 Ambiguity Protocol

If multiple candidates found:

```markdown
## ⚠️ Multiple Candidates Found

| # | File | Route | Match Reason |
|---|------|-------|--------------|
| 1 | `public/start.html` | /start | Contains similar text |
| 2 | `app/planner/page.tsx` | /planner | Contains component |

**Question:** Which exact URL shows this issue?
```

**STOP and ask user for clarification.**

---

## 🚪 Exit Gate

**Ready for `/quick-fix` when:**
- [ ] Single file identified
- [ ] Confidence is HIGH
- [ ] Security flag addressed (if applicable)

**If LOW confidence:**
- Ask user for more context
- Request screenshot or exact URL

---

## 🔌 Integration

This workflow is called by:
- `/quick-fix` Step 0.5 (with location confirmed)
- Direct invocation: `/bug-localize`

**Next:** `/quick-fix` (with location confirmed)

