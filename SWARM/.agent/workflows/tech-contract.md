---
description: "Tech Contract - Freeze interfaces before coding (Layer B)"
---

# 📜 TECH CONTRACT WORKFLOW

> **TRIGGER:** `/tech-contract`
> **PURPOSE:** Freeze interfaces before coding. Contracts are testable without implementation.
> **TIME ESTIMATE:** 2-3 hours
> **MODE:** Interface Definition with Product Validation

---

## 🎯 Quick Summary
This workflow creates comprehensive technical contracts—API definitions, schema designs, and event specifications—before any implementation begins. Contracts are validated by product and proven testable before coding starts, preventing expensive rework from interface mismatches.

---

## 🚨 PRE-FLIGHT CHECKS

- [ ] Solution design complete
- [ ] User flows mapped to components
- [ ] Data ownership defined

**Required Input:** `/discovery-protocol` (solution-design) output

---

## 📋 Workflow Steps

### STEP 1: LOAD SOLUTION CONTEXT (15 min)
**Relevant Expertise:** Solution Review, Technical Translation, Context Synthesis

**Description:**
Review the solution design to understand user flows, system responsibilities, data ownership, and failure modes before defining contracts.

**Review Checklist:**
- User flows
- System responsibilities
- Data ownership
- Failure modes

**Skill:** `saas-workflows`

**Output:** Solution context summary

**Exit Criteria:**
- Solution design reviewed
- Flows understood
- Responsibilities mapped
- Failure modes identified

---

### STEP 2: API CONTRACT DEFINITION (30 min)
**Relevant Expertise:** API Design, Interface Definition, Type Safety

**Description:**
Define all API contracts with TypeScript interfaces including method, path, request/response types, error codes, and auth requirements.

**Contract Template:**

```typescript
// Template for each endpoint
interface EndpointContract {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  request: TypeDefinition;
  response: TypeDefinition;
  errors: ErrorCode[];
  auth: 'none' | 'required' | 'optional';
}
```

**Output:** TypeScript interfaces for all endpoints

**Exit Criteria:**
- All endpoints typed
- Request/response types defined
- Error codes enumerated
- Auth requirements specified

---

### STEP 3: SCHEMA DEFINITION (30 min)
**Relevant Expertise:** Database Design, SQL Modeling, Migration Planning

**Description:**
Define database changes with CREATE/ALTER statements, constraints, indexes, and rollback scripts.

**Schema Requirements:**

```sql
-- For each new table or change
-- Include: CREATE, ALTER, constraints, indexes
-- Document: migration strategy, reversibility
```

**Skill:** `supabase-mastery` (if Supabase)

**Output:** Migration SQL with rollback scripts

**Exit Criteria:**
- Tables/columns defined
- Constraints specified
- Indexes identified
- Rollback scripts written

---

### STEP 4: EVENT DEFINITION (20 min)
**Relevant Expertise:** Event-Driven Architecture, System Integration, Idempotency Design

**Description:**
Define system events including payload structure, producers, consumers, and idempotency requirements.

**Event Template:**

```typescript
interface EventContract {
  name: string;           // e.g., 'user.logged_in'
  payload: TypeDefinition;
  producer: string;       // Component that emits
  consumers: string[];    // Components that listen
  idempotency: boolean;   // Can be safely replayed?
}
```

**Output:** Event catalog

**Exit Criteria:**
- All events named
- Payload types defined
- Producers/consumers identified
- Idempotency specified

---

### STEP 5: PRODUCT VALIDATION (30 min)
**Relevant Expertise:** Stakeholder Communication, Requirements Validation, Product Alignment

**Description:**
Product team validates that contracts support all user flows, error states are user-friendly, and data model is understandable.

**Validation Checklist:**
- Do contracts support all user flows?
- Are error states user-friendly?
- Is the data model understandable?

**Gate:** Product sign-off

**Output:** Product validation approval

**Exit Criteria:**
- All user flows covered
- Error states reviewed
- Data model approved
- Product sign-off received

---

### STEP 6: CONTRACT TESTABILITY (30 min)
**Relevant Expertise:** Type Systems, Contract Testing, Validation Automation

**Description:**
Verify contracts are testable: types compile without implementation, error cases enumerated, migrations reversible.

**Testability Checks:**
- Types compile without implementation
- Error cases are enumerated
- Migrations are reversible

**Skill:** `typescript-precision`

**Gate:** ✅ Contract compiles and validates OR 🚫 Revision needed

**Output:** Testability verification

**Exit Criteria:**
- Types compile
- Errors enumerated
- Rollbacks tested
- Validation passed

---

## 📤 DELIVERABLE

```markdown
# Tech Contract: [Feature Name]

## Solution Reference
[Link to solution-design]

## API Contracts

### Endpoint: POST /api/[resource]

**Request:**
```typescript
interface CreateResourceRequest {
  field: string;
}
```

**Response:**
```typescript
interface CreateResourceResponse {
  id: string;
  createdAt: string;
}
```

**Errors:**
| Code | Meaning |
|------|---------|
| 400 | Validation failed |
| 401 | Unauthorized |
| 409 | Conflict |

---

## Schema Changes

```sql
-- Migration: 20260121_add_resource_table.sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rollback
-- DROP TABLE resources;
```

---

## Events

| Event | Payload | Producer | Consumers |
|-------|---------|----------|-----------|
| resource.created | `{id, name}` | api | analytics, notifications |

---

## Validation

- [ ] Types compile: `tsc --noEmit`
- [ ] Migrations reversible: rollback tested
- [ ] Error codes documented
- [ ] Product sign-off: ✅
```

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| All endpoints typed | ✅ |
| All schemas defined with rollback | ✅ |
| Events documented | ✅ |
| Product signed off | ✅ |
| Types compile cleanly | ✅ |

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Load Context | 15 min |
| API Contracts | 30 min |
| Schema Definition | 30 min |
| Event Definition | 20 min |
| Product Validation | 30 min |
| Testability | 30 min |
| **TOTAL** | **2.5 hours** |

---

## 🎯 RELEVANT AGENTS BY STEP

| Step | Primary Agents | Secondary Agents | Expertise Needed |
|------|---------------|------------------|------------------|
| 1: Load Context | `@swarm-arch` | `@swarm-specifier` | Solution translation |
| 2: API Contracts | `@swarm-arch` | `@swarm-dev` | API design |
| 3: Schema | `@swarm-arch` | `@swarm-sec` | Database design |
| 4: Events | `@swarm-arch` | `@swarm-ops` | Event architecture |
| 5: Product Validation | `@swarm-specifier` | `@swarm-ux` | Stakeholder alignment |
| 6: Testability | `@swarm-qa` | `@swarm-dev` | Contract validation |

---

## 🔄 WORKFLOW RELATIONSHIPS

**Triggers This Workflow:**
- `/discovery-protocol` → After solution design
- `/wedge-definition` → For API-heavy features
- `/epic-feature` → Phase 1 architecture

**This Workflow Triggers:**
- `/standard-feature` → To implement contracts
- `/skill-feature` → If specialized skills needed
- `/epic-feature` → Phase 4 implementation

**Related Workflows:**
- Preceded by: `/discovery-protocol` or `/wedge-definition`
- Leads to: Implementation workflows
- Parallel: Can inform `/problem-framing` if gaps found

---

## 📊 EXECUTION DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  TECH CONTRACT PROGRESS                                 │
├─────────────────────────────────────────────────────────┤
│  [░░░░░░░░░░░░░░░░░░] Step 1/6: Load Solution Context  │
│  [░░░░░░░░░░░░░░░░░░] Step 2/6: API Contract Definition│
│  [░░░░░░░░░░░░░░░░░░] Step 3/6: Schema Definition      │
│  [░░░░░░░░░░░░░░░░░░] Step 4/6: Event Definition       │
│  [░░░░░░░░░░░░░░░░░░] Step 5/6: Product Validation     │
│  [░░░░░░░░░░░░░░░░░░] Step 6/6: Contract Testability   │
├─────────────────────────────────────────────────────────┤
│  APIs Defined: [N]        │  Types Compile: [Y/N]       │
│  Schemas: [N]             │  Product Sign-off: [Y/N]    │
│  Events: [N]              │  Status: [In Progress]      │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 WHY THESE AGENTS

| Step | Why These Agents? | What Happens Without Them? |
|------|-------------------|---------------------------|
| 1: Load Context | `@swarm-arch` translates solution design into technical requirements | Contracts that don't match user needs |
| 2: API Contracts | `@swarm-arch` designs interfaces that are clear and maintainable | API confusion, integration failures |
| 3: Schema | `@swarm-arch` designs database structures with foresight | Schema changes requiring migrations |
| 4: Events | `@swarm-arch` defines event contracts for system communication | Event-driven bugs, message mismatches |
| 5: Product Validation | `@swarm-specifier` ensures contracts meet actual user flows | Engineering builds wrong thing |
| 6: Testability | `@swarm-qa` validates contracts can be tested | Contracts that can't be verified |

---

## ⏱️ MICRO-CHECKPOINTS

| Checkpoint | Time | Verification |
|------------|------|--------------|
| Solution context loaded | T+0 | Design document reviewed |
| API design started | T+15min | Endpoint list created |
| API contracts complete | T+45min | All endpoints typed |
| Schema design started | T+45min | Table structure drafted |
| Schema complete | T+75min | SQL with rollbacks written |
| Event design started | T+75min | Event list created |
| Events complete | T+95min | All events defined |
| Product validation | T+125min | Sign-off received |
| Testability check | T+155min | Types compile |
| Contract complete | T+170min | All gates passed |

---

## 🔄 AGENT HANDOFFS

### Handoff 1: Arch → Arch (Internal)
- **Trigger:** Solution context loaded
- **Deliverable:** Technical requirements from solution design
- **Receiver Action:** Begin API contract definition

### Handoff 2: Arch → Arch (Internal)
- **Trigger:** API contracts defined
- **Deliverable:** TypeScript interfaces
- **Receiver Action:** Begin schema definition

### Handoff 3: Arch → Arch (Internal)
- **Trigger:** Schemas defined
- **Deliverable:** Migration SQL
- **Receiver Action:** Begin event definition

### Handoff 4: Arch → Specifier
- **Trigger:** Events defined
- **Deliverable:** Complete contract draft
- **Receiver Action:** Validate with product requirements

### Handoff 5: Specifier → QA
- **Trigger:** Product validation passed
- **Deliverable:** Approved contracts
- **Receiver Action:** Verify contract testability

### Handoff 6: QA → Dev
- **Trigger:** Testability verified
- **Deliverable:** Testable contracts
- **Receiver Action:** Begin implementation

---

## 📋 DECISION LOG

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Contracts Before Code | Interface mismatches are expensive to fix later | 70% reduction in integration rework |
| TypeScript Interfaces | Type safety catches errors at compile time | Fewer runtime errors |
| Rollback Scripts Required | Database changes must be reversible | Safe deployment, easy rollback |
| Product Validation Gate | Engineering builds what product actually needs | No "that's not what I meant" |
| Testability Verification | Contracts must be provably correct | Validated interfaces |
| Event Catalog | All system events documented | Clear system boundaries |

---

**Workflow Version:** 2.0.0-Transparent
**Last Updated:** 2026-02-02
