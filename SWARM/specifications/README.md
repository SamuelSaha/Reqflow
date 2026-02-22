# Specifications

This folder holds frozen, versioned specifications and the templates used to create them.

**Structure (recommended):**
```
specifications/
  index.yaml
  active/
  archived/
  templates/
```

**Rule:** Specs are immutable once frozen. If you need changes, create a new version (new `SPEC-*` ID or bumped version) and migrate tickets.

## One-Shot Specs (Minimum Info → Maximum Impact)

When the user gives only a short goal statement, use the one-shot template:
- `specifications/templates/02-one-shot-spec-template.md`

**Rule:** Missing info becomes an **Assumptions Ledger (E0)** by default. Ask **one** precise question only if execution is blocked by a missing external constraint.
