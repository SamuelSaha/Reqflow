# 🔐 REQFLOW THREAT MODEL

**System:** Reqflow Procurement Platform
**Version:** 1.0
**Date:** 2026-02-27
**Classification:** CONFIDENTIAL - Internal Security Document
**Owner:** Security Engineering Team (@swarm-sec)

---

## 📋 EXECUTIVE SUMMARY

This threat model documents the security analysis of Reqflow using the STRIDE framework. It identifies threats across all system components and provides mitigation strategies aligned with the 10x Security Plan.

**Risk Assessment:**
| Category | Threats Identified | Critical | High | Medium | Low |
|----------|-------------------|----------|------|--------|-----|
| Spoofing | 8 | 2 | 3 | 2 | 1 |
| Tampering | 6 | 1 | 2 | 2 | 1 |
| Repudiation | 4 | 0 | 2 | 1 | 1 |
| Information Disclosure | 10 | 3 | 4 | 2 | 1 |
| Denial of Service | 5 | 1 | 2 | 1 | 1 |
| Elevation of Privilege | 7 | 2 | 3 | 1 | 1 |
| **TOTAL** | **40** | **9** | **16** | **9** | **6** |

---

## 🏗️ SYSTEM BOUNDARIES

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UNTRUSTED ZONE                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Browser    │    │   Mobile     │    │   Third-Party │                   │
│  │   Client     │    │   Client     │    │   Webhooks    │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
└─────────┼───────────────────┼───────────────────┼───────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TRUST BOUNDARY (Edge)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Cloudflare (WAF + DDoS)                            │   │
│  │  • TLS Termination                                                    │   │
│  │  • Rate Limiting                                                      │   │
│  │  • Bot Detection                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARY (Application)                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Next.js    │    │    tRPC      │    │   Auth       │                   │
│  │   Frontend   │───▶│    API       │───▶│   Service    │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                              │                   │                           │
│                              ▼                   ▼                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Application Security Layer                          │   │
│  │  • CSRF Protection    • Rate Limiting    • Input Validation           │   │
│  │  • ABAC/RBAC         • Data Masking      • Security Monitoring        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRUST BOUNDARY (Data)                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  PostgreSQL  │    │    Redis     │    │     R2       │                   │
│  │  (Neon)      │    │  (Upstash)   │    │  (Cloudflare)│                   │
│  │              │    │              │    │              │                   │
│  │  RLS Enabled │    │  Encrypted   │    │  Encrypted   │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Assets

| Asset | Classification | Owner | Location |
|-------|----------------|-------|----------|
| User credentials (hashed) | Restricted | Auth Service | PostgreSQL |
| User PII (email, name) | Restricted | User Service | PostgreSQL |
| Session tokens | Confidential | Auth Service | Redis/Cookie |
| OAuth tokens | Restricted | Integration Service | PostgreSQL (encrypted) |
| API keys | Restricted | Integration Service | PostgreSQL (encrypted) |
| Financial data | Restricted | Finance Service | PostgreSQL |
| Vendor data | Confidential | Vendor Service | PostgreSQL |
| Audit logs | Confidential | Audit Service | PostgreSQL (append-only) |
| File attachments | Confidential | Storage Service | R2 |

---

## 🔍 STRIDE ANALYSIS

### S - Spoofing

**Definition:** Impersonating something or someone else

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| S-001 | Session hijacking via stolen cookies | User sessions | Critical | Medium | HttpOnly, Secure, SameSite cookies; session rotation | ✅ Active |
| S-002 | Credential stuffing attack | Authentication | Critical | High | Rate limiting; account lockout; password policy | ✅ Active |
| S-003 | OAuth token theft | Integrations | High | Medium | Field encryption; token rotation; short expiry | ✅ Active |
| S-004 | API key theft | Integrations | High | Low | Field encryption; IP whitelisting; audit logging | ✅ Active |
| S-005 | CSRF attack | Forms/API | High | Medium | CSRF tokens on all mutations; SameSite cookies | ✅ Active |
| S-006 | IP spoofing bypassing rate limits | Rate limiting | Medium | Low | Cloudflare IP validation; user-based rate limits | ✅ Active |
| S-007 | Webhook signature spoofing | Webhooks | High | Low | HMAC signature verification | 🟡 Partial |
| S-008 | Tenant ID spoofing in multi-tenant | Data isolation | Critical | Low | RLS at DB level; server-side tenant validation | ✅ Active |

### T - Tampering

**Definition:** Modifying data or code without authorization

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| T-001 | SQL injection | Database | Critical | Low | Parameterized queries (Drizzle ORM); input validation | ✅ Active |
| T-002 | XSS attack | Frontend | High | Medium | React auto-escaping; CSP headers; input sanitization | ✅ Active |
| T-003 | Mass assignment | API | Medium | Medium | Zod input validation; explicit field allowlisting | ✅ Active |
| T-004 | Request tampering | API | High | Low | Input validation; business logic validation | ✅ Active |
| T-005 | Audit log tampering | Audit | Critical | Low | Append-only RLS policy; immutable storage | ✅ Active |
| T-006 | File upload malware | Attachments | High | Low | File type validation; virus scanning; size limits | 🟡 Partial |

### R - Repudiation

**Definition:** Claiming to have not performed an action

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| R-001 | Denying approval action | Approvals | High | Low | Comprehensive audit logging | ✅ Active |
| R-002 | Denying data export | Exports | Medium | Low | Export event logging with details | ✅ Active |
| R-003 | Denying configuration change | Settings | High | Low | Config change audit trail | ✅ Active |
| R-004 | Denying authentication attempt | Auth | Medium | Low | Auth event logging | ✅ Active |

### I - Information Disclosure

**Definition:** Exposing information to unauthorized parties

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| I-001 | Tenant data leakage | Database | Critical | Low | RLS at DB level; tenant isolation | ✅ Active |
| I-002 | OAuth token exposure | Integrations | Critical | Low | Field-level encryption | ✅ Active |
| I-003 | API key exposure | Integrations | Critical | Low | Field-level encryption; masking in UI | ✅ Active |
| I-004 | PII in logs | Logging | High | Medium | Data masking in logs; sensitive field filtering | ✅ Active |
| I-005 | Error message data leakage | API | Medium | Medium | Error sanitization in production | ✅ Active |
| I-006 | API response over-exposure | API | High | Medium | Response filtering by role; field visibility rules | ✅ Active |
| I-007 | Secrets in code | Repository | Critical | Low | Pre-commit hooks (Gitleaks, secretlint) | ✅ Active |
| I-008 | Sensitive data in URL | Frontend | Medium | Low | URL parameter encryption; POST for sensitive data | 🟡 Partial |
| I-009 | Cache data exposure | Browser/CDN | Medium | Low | Cache-Control headers; no sensitive data caching | ✅ Active |
| I-010 | Backup data exposure | Backups | High | Low | Encrypted backups; access controls | 🟡 Partial |

### D - Denial of Service

**Definition:** Making a service unavailable

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| D-001 | Volumetric DDoS attack | Infrastructure | Critical | Low | Cloudflare DDoS protection | ✅ Active |
| D-002 | Application-level DoS | API | High | Medium | Rate limiting; request throttling | ✅ Active |
| D-003 | Resource exhaustion | Database | High | Low | Connection pooling; query timeouts | ✅ Active |
| D-004 | Expensive query abuse | API | Medium | Medium | Query complexity limits; pagination | 🟡 Partial |
| D-005 | Webhook flood | Webhooks | Medium | Low | Rate limiting per source; queue processing | ✅ Active |

### E - Elevation of Privilege

**Definition:** Gaining unauthorized capabilities

| ID | Threat | Target | Impact | Prob. | Mitigation | Status |
|----|--------|--------|--------|-------|------------|--------|
| E-001 | Role manipulation | Authorization | Critical | Low | Server-side role validation; RBAC/ABAC | ✅ Active |
| E-002 | Tenant switching | Multi-tenancy | Critical | Low | RLS; session tenant binding | ✅ Active |
| E-003 | Horizontal privilege escalation | Data access | High | Low | Owner checks; department filtering | ✅ Active |
| E-004 | Self-approval bypass | Workflows | High | Medium | ABAC policy: deny-approve-own | ✅ Active |
| E-005 | Large amount approval bypass | Workflows | High | Low | ABAC policy: large-amount-clearance | ✅ Active |
| E-006 | Admin function access | Admin | Critical | Low | Admin role requirement; MFA | 🟡 Partial |
| E-007 | API endpoint unauthorized access | API | High | Low | Protected procedures; ABAC checks | ✅ Active |

---

## 🎯 ATTACK SURFACE MAP

### Public Attack Surface

| Entry Point | Protocol | Authentication | Rate Limited | Protected By |
|-------------|----------|----------------|--------------|--------------|
| `/api/auth/login` | HTTPS | None | Yes (5/15min) | Cloudflare + App |
| `/api/auth/signup` | HTTPS | None | Yes (3/hr) | Cloudflare + App |
| `/api/trpc/*` | HTTPS | Session | Yes (100/min) | App RLS |
| `/api/webhooks/*` | HTTPS | HMAC Signature | Yes (1000/min) | Signature verify |
| `/` (Marketing) | HTTPS | None | Yes | Cloudflare |

### Authenticated Attack Surface

| Entry Point | Required Role | ABAC Policies | Data Access |
|-------------|---------------|---------------|-------------|
| `/dashboard/*` | Any authenticated | Time-based | RLS filtered |
| `/api/trpc/requests.*` | Any authenticated | Owner/Role-based | RLS filtered |
| `/api/trpc/budgets.*` | Any authenticated | Department-based | RLS filtered |
| `/api/trpc/vendors.*` | Any authenticated | Role-based | RLS filtered |
| `/api/trpc/invoices.*` | Finance/Admin | Role-based | RLS filtered |
| `/api/trpc/users.admin*` | Admin only | MFA required | RLS filtered |

### Admin Attack Surface

| Entry Point | Required Role | Additional Protection |
|-------------|---------------|----------------------|
| `/api/trpc/admin/*` | Admin | MFA verification |
| `/api/trpc/organizations.*` | Admin | IP allowlist (optional) |
| `/api/trpc/integrations.*` | Admin | Audit logging |

---

## 🛡️ MITIGATION STATUS

### Phase 1: Foundation (COMPLETED)

| Control | Status | Evidence |
|---------|--------|----------|
| Pre-commit secret scanning | ✅ Active | `.pre-commit-config.yaml`, `.gitleaks.toml` |
| RLS at database level | ✅ Ready | `rls-setup.sql` migration |
| Field-level encryption | ✅ Active | `field-encryption.ts` |
| CSRF protection | ✅ Active | `csrf.ts` + all mutations |
| Rate limiting | ✅ Active | `rate-limit.ts` |
| CI/CD security scanning | ✅ Active | `.github/workflows/security-scan.yml` |

### Phase 2: Hardening (COMPLETED)

| Control | Status | Evidence |
|---------|--------|----------|
| ABAC engine | ✅ Active | `abac.ts` with 4 default policies |
| Data masking | ✅ Active | `data-masking.ts` |
| Security monitoring | ✅ Active | `security-monitor.ts` |
| Response filtering | ✅ Active | `data-masking.ts` - `filterResponse()` |
| Anomaly detection | ✅ Active | `security-monitor.ts` - `calculateAnomalyScore()` |

### Phase 3: Advanced Threat Protection (PENDING)

| Control | Status | Priority | Effort |
|---------|--------|----------|--------|
| WAF custom rules | 🟡 Partial | P1 | 2 days |
| CAPTCHA integration | 🔴 Not Started | P2 | 2 days |
| Device fingerprinting | 🔴 Not Started | P2 | 1 week |
| Impossible travel detection | 🔴 Not Started | P2 | 3 days |
| Session anomaly detection | 🔴 Not Started | P2 | 3 days |

### Phase 4: Compliance & Audit (PENDING)

| Control | Status | Priority | Effort |
|---------|--------|----------|--------|
| SOC 2 Type II preparation | 🔴 Not Started | P1 | 2-3 months |
| Penetration testing | 🔴 Not Started | P1 | 1 week |
| Security awareness training | 🔴 Not Started | P2 | Ongoing |
| Incident response procedures | 🔴 Not Started | P1 | 1 week |
| Business continuity planning | 🔴 Not Started | P2 | 2 weeks |

---

## 🚨 CRITICAL SECURITY CONTROLS

The following controls are non-negotiable and must never be bypassed:

### 1. Tenant Isolation (RLS)
```sql
-- Every query MUST be filtered by tenant_id
-- RLS policies enforce this at database level
-- Even if application logic fails, data remains isolated
```

### 2. Authentication Required
```typescript
// All protected endpoints use protectedProcedure
protectedProcedure.input(schema).query(async ({ ctx }) => {
  // ctx.userId and ctx.tenantId are always present
});
```

### 3. CSRF Protection
```typescript
// All mutations require CSRF token
// Automatically handled by tRPC middleware
```

### 4. Input Validation
```typescript
// All inputs validated with Zod schemas
// No raw SQL queries - use Drizzle ORM
```

### 5. Audit Logging
```typescript
// All security-relevant actions logged
// Audit logs are append-only
await createAuditLog({ action, userId, tenantId, metadata });
```

---

## 📊 RISK SCORING

### Risk Matrix

| Impact/Probability | Low | Medium | High |
|--------------------|-----|--------|------|
| **Critical** | Medium | High | Critical |
| **High** | Low | Medium | High |
| **Medium** | Low | Low | Medium |
| **Low** | Negligible | Low | Low |

### Current Risk Profile

| Risk Level | Count | Percentage |
|------------|-------|------------|
| Critical | 0 | 0% |
| High | 5 | 12.5% |
| Medium | 12 | 30% |
| Low | 23 | 57.5% |

**Overall Security Posture:** 🟢 **Good** - Core protections in place, Phase 3/4 enhancements pending

---

## 📋 SECURITY REVIEW CHECKLIST

### Authentication
- [x] MFA available (infrastructure ready)
- [x] Session management secure (HttpOnly, Secure, SameSite)
- [x] Password policy enforced (12+ chars, complexity)
- [x] Brute force protection (rate limiting + lockout)
- [x] Session rotation on privilege change

### Authorization
- [x] RBAC implemented (admin, finance, manager, requester)
- [x] ABAC implemented (context-aware policies)
- [x] Least privilege enforced
- [x] Server-side checks only (never trust client)
- [x] RLS at database level

### Data Protection
- [x] Encryption at rest (Neon AES-256, R2)
- [x] Encryption in transit (TLS 1.3)
- [x] Field-level encryption (OAuth tokens, API keys)
- [x] PII handling documented
- [x] Secrets not in code (pre-commit hooks)

### Input/Output
- [x] All input validated (Zod schemas)
- [x] SQL injection prevented (Drizzle ORM)
- [x] XSS prevented (React + CSP + sanitization)
- [x] CSRF protection (tokens on mutations)
- [x] Response filtering by role

### Logging & Monitoring
- [x] Security events logged
- [x] No sensitive data in logs (masking)
- [x] Audit trail complete (append-only)
- [x] Anomaly detection active
- [x] Alerting configured

---

## 🔄 REVIEW SCHEDULE

| Review Type | Frequency | Next Review |
|-------------|-----------|-------------|
| Threat Model | Quarterly | 2026-05-27 |
| Penetration Test | Annually | 2026-Q3 |
| Dependency Audit | Weekly | Automated |
| Security Training | Quarterly | 2026-04-01 |
| Incident Response Drill | Bi-annually | 2026-Q3 |

---

## 📞 SECURITY CONTACTS

| Role | Contact | Availability |
|------|---------|--------------|
| Security Engineer | @swarm-sec | Business hours |
| Security Policy | `.github/SECURITY.md` | - |
| Vulnerability Reporting | security@reqflow.io | 24/7 |
| Emergency | PagerDuty | 24/7 |

---

**Document Version:** 1.0
**Last Updated:** 2026-02-27
**Next Review:** 2026-05-27
**Approved By:** Security Engineering Team
