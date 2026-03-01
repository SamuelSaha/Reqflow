# Security Review - Reqflow

**Last Updated:** 2026-02-27
**Version:** 1.0
**Status:** Phase 1 & Phase 2 Completed

---

## Executive Summary

This document outlines the comprehensive security controls implemented in Reqflow following the 10x Security Plan. The implementation follows a Zero Trust Architecture with Defense in Depth principles.

### Security Posture Overview

| Layer | Controls | Status |
|-------|----------|--------|
| Edge | WAF, Rate Limiting, IP Detection | Active |
| Application | CSRF, Input Validation, ABAC | Active |
| Data | RLS, Field Encryption, Data Masking | Active |
| Monitoring | Security Events, Anomaly Detection | Active |
| CI/CD | Secret Scanning, Dependency Audit | Active |

---

## Phase 1: Security Foundation (Completed)

### 1.1 Pre-commit Hooks

**Location:** `.husky/`, `.pre-commit-config.yaml`

Pre-commit hooks prevent secrets and security issues from entering the codebase.

| Hook | Tool | Purpose |
|------|------|---------|
| pre-commit | lint-staged | Run linters on staged files |
| pre-commit | Gitleaks | Detect hardcoded secrets |
| pre-commit | secretlint | Additional secret detection |
| commit-msg | Gitleaks | Scan commit messages for secrets |
| pre-push | npm audit | Check for vulnerable dependencies |
| pre-push | type-check | Ensure TypeScript compilation |

**Custom Secret Detection Rules:**
- Neon database URLs
- Upstash Redis tokens
- Slack tokens (bot, user, app)
- Xero OAuth tokens
- QuickBooks OAuth tokens

### 1.2 Row-Level Security (RLS)

**Location:** `app/src/lib/db/migrations/rls-setup.sql`

Database-level tenant isolation ensuring data protection even if application logic fails.

**Helper Functions:**
- `app.current_tenant_id()` - Returns current user's tenant
- `app.is_admin()` - Checks admin role
- `app.is_finance()` - Checks finance role
- `app.is_manager()` - Checks manager role

**Tables Protected (24 total):**
- Core: `users`, `organizations`, `requests`, `budgets`, `approvals`
- Vendors: `vendors`, `invoices`, `contracts`
- Integrations: `integrations`, `slack_workspaces`, `accounting_integrations`
- Tracking: `subscriptions`, `trials`, `renewal_events`
- System: `audit_logs`, `auth_events`, `verification_tokens`

**Access Patterns:**
- All tables: Tenant isolation (users can only see their tenant's data)
- Admin role: Full access within tenant
- Finance role: Access to financial tables
- Manager role: Access to team-level data
- Requester role: Own data only

**Audit Logs:** Append-only (no UPDATE/DELETE operations allowed)

**TypeScript Integration:** `app/src/lib/security/rls-context.ts`
```typescript
// Set RLS context before queries
await setRLSContext(db, {
  tenantId: ctx.tenantId,
  userId: ctx.userId,
  userRole: ctx.userRole,
});
```

### 1.3 Field-Level Encryption

**Location:** `app/src/lib/security/field-encryption.ts`

AES-256-GCM encryption for sensitive data at rest.

**Protected Fields:**
- OAuth access tokens
- OAuth refresh tokens
- API keys
- PII (SSN, tax IDs)

**Features:**
- Authenticated encryption (AES-256-GCM)
- Random IV per encryption
- Constant-time comparison
- Key rotation support

**Environment Variable Required:**
```bash
FIELD_ENCRYPTION_KEY=your-32-byte-base64-key
```

**Generate Key:**
```bash
openssl rand -base64 32
```

### 1.4 CI/CD Security Scanning

**Location:** `.github/workflows/security-scan.yml`

Automated security scanning on every push and pull request.

| Scan | Tool | Frequency |
|------|------|-----------|
| Dependency Audit | npm audit | Every push |
| Secret Detection | Gitleaks | Every push |
| Code Analysis | CodeQL | Main branch, weekly |
| SAST | Semgrep | Every PR |
| Dependency Review | GitHub | Every PR |

**Dependabot Configuration:**
- Weekly npm dependency updates
- Weekly GitHub Actions updates
- Grouped updates for minor/patch versions

---

## Phase 2: Security Hardening (Completed)

### 2.1 Attribute-Based Access Control (ABAC)

**Location:** `app/src/lib/security/abac.ts`

Fine-grained authorization beyond role-based access control.

**Policy Engine Features:**
- Dynamic policy evaluation
- Time-based conditions
- Amount-based conditions
- Attribute-based conditions

**Default Policies:**
| Policy | Condition | Effect |
|--------|-----------|--------|
| deny-approve-own | Requester == Approver | Deny |
| large-amount-clearance | Amount > $50,000 | Require senior role |
| restricted-after-hours | Time outside 6am-10pm | Require MFA |
| export-requires-mfa | Data export action | Require MFA |

**Usage:**
```typescript
const decision = await checkABAC({
  subject: createABACSubject(user),
  action: "approve",
  resource: { type: "request", amount: 75000 },
  environment: createABACEnvironment(request),
});

if (!decision.allowed) {
  throw new Error(decision.reason);
}
```

### 2.2 Data Masking

**Location:** `app/src/lib/security/data-masking.ts`

Protect sensitive data in logs, exports, and API responses.

**Masking Functions:**
| Function | Input | Output |
|----------|-------|--------|
| `maskEmail` | john@example.com | j***@example.com |
| `maskPhone` | +1-555-123-4567 | +1-555-***-4567 |
| `maskApiKey` | sk_live_abc123... | sk_live_***...***xyz |
| `maskCardNumber` | 4111111111111111 | ************1111 |
| `maskAmount` | $12,345.67 | $**,***.67 |
| `maskUrl` | https://api.example.com/token?secret=abc | https://api.example.com/*** |

**Role-Based Field Filtering:**
```typescript
const filtered = filterResponse(data, userRole, {
  accessToken: { excludeFor: ["requester", "viewer"] },
  apiKey: { maskFor: ["manager"], type: "apiKey" },
  email: { maskFor: ["viewer"], type: "email" },
});
```

**Safe Logging:**
```typescript
logger.info("User action", sanitizeForLogging({
  email: "sensitive@example.com",
  apiKey: "sk_live_abc123",
  name: "John Doe",
}));
// Logs: { email: "s***@example.com", apiKey: "[REDACTED]", name: "J***" }
```

### 2.3 Security Monitoring

**Location:** `app/src/lib/security/security-monitor.ts`

Real-time security event monitoring and anomaly detection.

**Event Types Tracked:**
- `auth_failure` / `auth_success`
- `rate_limit_exceeded`
- `permission_denied`
- `suspicious_activity`
- `data_access` / `data_export`
- `brute_force_detected`
- `anomaly_detected`

**Anomaly Detection Scoring:**
| Factor | Score Impact |
|--------|--------------|
| Unusual access time (outside 6am-10pm) | +10 |
| New IP address | +15 |
| High request rate (>100/min) | +25 |
| Unusual geographic location | +20 |
| Multiple auth failures (>3) | +15 |
| High sensitive data access (>50/hour) | +20 |

**Alert Thresholds:**
| Metric | Threshold | Severity |
|--------|-----------|----------|
| Auth failures per hour | 5 | Medium |
| Auth failures per IP/hour | 10 | High |
| Rate limit violations/hour | 20 | Medium |
| Export requests per day | 10 | High |
| Anomaly score | 70+ | High |

**Usage:**
```typescript
await securityMonitor.recordEvent({
  type: "suspicious_activity",
  severity: "medium",
  tenantId: ctx.tenantId,
  userId: ctx.userId,
  ipAddress: request.ip,
  details: { isNewIp: true, requestRate: 150 },
});
```

---

## Security Controls Checklist

### Authentication & Authorization
- [x] Session-based authentication with secure cookies
- [x] Rate limiting on auth endpoints
- [x] Progressive account lockout
- [x] CSRF protection on all mutations
- [x] Role-based access control (RBAC)
- [x] Attribute-based access control (ABAC)
- [x] Row-level security at database level

### Data Protection
- [x] Tenant isolation (multi-tenancy)
- [x] Field-level encryption for sensitive data
- [x] Data masking for logs and exports
- [x] Role-based response filtering
- [x] Append-only audit logs

### Input Validation
- [x] Zod schema validation on all API inputs
- [x] Input sanitization (XSS prevention)
- [x] SQL injection prevention via parameterized queries
- [x] File upload validation

### Monitoring & Detection
- [x] Security event logging
- [x] Anomaly detection
- [x] Brute force detection
- [x] Data exfiltration detection
- [x] Sentry error tracking
- [x] Axiom log aggregation

### CI/CD Security
- [x] Pre-commit secret scanning
- [x] Dependency vulnerability scanning
- [x] Static analysis (CodeQL, Semgrep)
- [x] Automated dependency updates (Dependabot)

---

## Environment Variables

### Required for Security Features

```bash
# Field Encryption (generate with: openssl rand -base64 32)
FIELD_ENCRYPTION_KEY=your-32-byte-base64-key

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
AXIOM_DATASET=your-dataset
AXIOM_TOKEN=your-token
```

---

## Remaining Tasks (Phase 3 & 4)

### Phase 3: Advanced Threat Protection
- [ ] Web Application Firewall (WAF) rules
- [ ] CAPTCHA integration for high-risk actions
- [ ] Device fingerprinting
- [ ] Impossible travel detection
- [ ] Session anomaly detection

### Phase 4: Compliance & Audit
- [ ] SOC 2 Type II preparation
- [ ] Penetration testing
- [ ] Security awareness training
- [ ] Incident response procedures
- [ ] Business continuity planning

---

## Security Contacts

- **Security Engineer:** @swarm-sec
- **Security Policy:** `.github/SECURITY.md`
- **Vulnerability Reporting:** security@reqflow.io

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-27 | 1.0 | Initial security review - Phase 1 & 2 completed |
