---
technical_spec:
  spec_ref: "SPEC-YYYYMMDD-NNN"
  version: "1.0.0"
  status: "draft|approved|frozen"
  created: "ISO8601 timestamp"
  author: "@swarm-arch|@swarm-frontend|@swarm-backend"

  scope:
    in_scope: ["What this technical spec covers"]
    out_of_scope: ["What it explicitly does not cover"]

  contracts:
    apis: []
    data_models: []
    events: []

  performance_budget:
    frontend: ["Bundle/LCP/INP/CLS targets"]
    backend: ["p95 latency targets, QPS targets"]

  security:
    data_classification: "Public|Internal|Confidential|Restricted"
    auth: "AuthN/AuthZ model"
    abuse_cases: []
---

# 🧱 TECHNICAL SPEC: {Title}

**Spec Ref:** SPEC-YYYYMMDD-NNN  
**Version:** 1.0.0  
**Status:** draft|approved|frozen

## 🎯 Goal (Technical)
Restate the product goal in technical terms (still outcome-focused).

## 🧭 Boundaries
### In Scope
- ...

### Out of Scope
- ...

## 🏗️ Architecture Overview
Describe the system at a high level. Include failure modes and ownership boundaries.

## 🔌 API Contracts
Document endpoints/events with request/response schemas and error contracts.

## 🗄️ Data Model
Entities, relationships, invariants, migrations, and constraints.

## ♿ UX/Frontend Contract (if applicable)
UI states (default/loading/error/empty/success), required API shapes, and accessibility constraints.

## ⚡ Performance Budget
- Frontend: ...
- Backend: ...

## 🔐 Security & Abuse Cases
- Data classification: ...
- Abuse cases: ...
- Mitigations: ...

## ✅ Verification Plan
How we will prove correctness against ACs (tests, metrics, rollbacks).

