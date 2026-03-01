# 🚀 SECURITY DEPLOYMENT PLAN

**Version:** 1.0
**Date:** 2026-02-27
**Owner:** DevOps + Security Engineering (@swarm-ops + @swarm-sec)
**Status:** Ready for Staged Rollout

---

## 📋 EXECUTIVE SUMMARY

This document outlines the safe deployment strategy for Reqflow security enhancements (Phase 1 & 2). The deployment is designed to be **zero-downtime** with **instant rollback capability**.

### Risk Assessment

| Component | Risk Level | Rollback Time | Blast Radius |
|-----------|------------|---------------|--------------|
| RLS Migration | Medium | 5 min | Database queries |
| RLS Middleware | Low | Instant (feature flag) | None (disabled by default) |
| Field Encryption | Low | N/A (new feature) | None (optional) |
| ABAC Engine | Low | N/A (new feature) | None (additive) |
| Data Masking | Low | N/A (new feature) | None (additive) |
| Security Monitor | Low | N/A (new feature) | None (additive) |

---

## 🔄 CI/CD PIPELINE

### Current Pipeline Status

| Stage | Status | Notes |
|-------|--------|-------|
| Pre-commit Hooks | ✅ Active | Gitleaks, secretlint, lint-staged |
| TypeScript Check | ✅ Active | `npm run type-check` |
| ESLint | ✅ Active | `npm run lint` |
| Security Scan | ✅ Active | `.github/workflows/security-scan.yml` |
| Build | ✅ Active | `npm run build` |

### Pipeline Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Commit    │────▶│ Pre-commit  │────▶│    Build    │
│             │     │   Hooks     │     │    Check    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Gitleaks   │     │   Deploy    │
                    │  Secretlint │     │  (Vercel)   │
                    └─────────────┘     └─────────────┘
```

---

## 🚀 DEPLOYMENT STRATEGY

### Strategy: Feature Flag + Staged Migration

**Rationale:** Feature flags allow instant rollback without redeployment. Database migrations are run separately from code deploys.

### Phase A: Code Deployment (No Risk)

Deploy all security modules with RLS **disabled** by default.

```bash
# Environment: Production
RLS_ENABLED=false
```

**What Deploys:**
- `rls-context.ts` (inactive - feature flag off)
- `field-encryption.ts` (ready - needs FIELD_ENCRYPTION_KEY)
- `abac.ts` (ready - additive)
- `data-masking.ts` (ready - additive)
- `security-monitor.ts` (ready - additive)

**Risk:** None - all features are opt-in via environment variables.

### Phase B: Feature Activation (Staged)

Enable features one at a time, monitoring for issues.

#### B1: Enable Field Encryption

```bash
# Generate key
openssl rand -base64 32

# Set environment variable
FIELD_ENCRYPTION_KEY=<generated-key>
```

**Verification:**
```sql
-- Test encryption works
SELECT encode(encrypt('test'::bytea, '<key>'::bytea, 'aes'), 'hex');
```

**Rollback:**
```bash
# Remove key (encryption becomes no-op)
FIELD_ENCRYPTION_KEY=
```

#### B2: Enable RLS Context (No DB Changes Yet)

```bash
RLS_ENABLED=true
```

**What Happens:**
- Session variables are set before queries
- **RLS policies are NOT active** (migration not run)
- Queries work normally, just with extra session context

**Verification:**
```bash
# Check logs for RLS context warnings
# Should see no errors - just silent session variable setting
```

**Rollback:**
```bash
RLS_ENABLED=false
# Instant rollback - no code changes needed
```

#### B3: Run RLS Migration (Database Change)

**Prerequisites:**
- RLS_ENABLED=true verified working
- Database backup taken
- Maintenance window scheduled (5 min recommended)

```bash
# Step 1: Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Step 2: Run migration
psql $DATABASE_URL < app/src/lib/db/migrations/rls-setup.sql

# Step 3: Verify helper functions exist
psql $DATABASE_URL -c "SELECT app.current_tenant_id();"

# Step 4: Verify RLS is enabled
psql $DATABASE_URL -c "
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;
"
```

**Verification:**
```bash
# Test that queries still work
curl https://reqflow.com/api/health/database

# Test tenant isolation (should fail for cross-tenant)
# Run as tenant A, try to access tenant B's data
```

**Rollback:**
```sql
-- Emergency: Disable RLS (keeps policies, just bypasses them)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Or: Drop all policies (more destructive)
DROP POLICY IF EXISTS tenant_isolation_policy ON users;
-- ... repeat for all tables
```

---

## 📊 OBSERVABILITY

### Metrics to Monitor

| Metric | Source | Alert Threshold | During Deployment |
|--------|--------|-----------------|-------------------|
| API Error Rate | Sentry | >1% for 5min | Watch closely |
| API Latency p99 | Vercel | >500ms | Should be unchanged |
| Database Query Time | Neon | >100ms avg | May increase slightly |
| Auth Failures | App logs | >10/min | Should be unchanged |
| RLS Policy Violations | App logs | Any | Watch for new errors |

### Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Vercel Analytics | vercel.com/dashboard | Deployment health |
| Sentry | sentry.io | Error tracking |
| Axiom | axiom.co | Log aggregation |
| Neon Console | console.neon.tech | Database health |

### Alerts

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| High Error Rate | >1% for 5min | Critical | Slack + Email |
| RLS Context Error | Any occurrence | Warning | Slack |
| Database Connection Fail | Any | Critical | Slack + PagerDuty |
| Auth Failure Spike | >20 in 5min | Warning | Slack |

---

## 🔄 ROLLBACK PROCEDURES

### Instant Rollback (Feature Flags)

```bash
# Disable RLS instantly
RLS_ENABLED=false

# Disable field encryption
FIELD_ENCRYPTION_KEY=

# Redeploy with env change
vercel --prod
```

**Time to Rollback:** <2 minutes

### Database Rollback

```sql
-- Option 1: Disable RLS (recommended - keeps policies for re-enable)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Option 2: Restore from backup (nuclear option)
-- psql $DATABASE_URL < backup_20260227.sql
```

**Time to Rollback:** <5 minutes

### Full Rollback Procedure

1. **Identify Issue:** Error spike in Sentry/Axiom
2. **Disable Feature Flag:** `RLS_ENABLED=false`
3. **Verify Recovery:** Check error rates normalize
4. **Notify Team:** Post in #incidents Slack channel
5. **Post-Mortem:** Document what happened

---

## ✅ PRE-DEPLOY CHECKLIST

### Code Deployment

- [ ] All TypeScript errors resolved
- [ ] All lint errors resolved
- [ ] Build succeeds locally
- [ ] Pre-commit hooks pass
- [ ] Security scan passes

### Environment

- [ ] `RLS_ENABLED=false` set in production
- [ ] `FIELD_ENCRYPTION_KEY` generated (optional)
- [ ] Database backup taken
- [ ] Rollback procedure documented

### Monitoring

- [ ] Sentry dashboard accessible
- [ ] Axiom logs streaming
- [ ] Vercel analytics available
- [ ] Alert channels configured

### Team

- [ ] Deployment announced in Slack
- [ ] On-call engineer available
- [ ] Rollback contacts identified

---

## ✅ POST-DEPLOY VERIFICATION

### Immediate (5 min after deploy)

- [ ] Health check passes: `/api/health`
- [ ] Login works: Test user login
- [ ] API responds: Test tRPC endpoint
- [ ] No error spike in Sentry
- [ ] No alerts triggered

### Short-term (1 hour after deploy)

- [ ] Error rate <0.1%
- [ ] Latency p99 <500ms
- [ ] No RLS context warnings in logs
- [ ] All features accessible

### Medium-term (24 hours after deploy)

- [ ] Security events being logged
- [ ] No tenant isolation issues reported
- [ ] Performance metrics stable

---

## 📅 DEPLOYMENT TIMELINE

| Time | Action | Owner |
|------|--------|-------|
| T-1h | Announce deployment | @swarm-ops |
| T-30m | Take database backup | @swarm-ops |
| T-15m | Verify staging works | @swarm-qa |
| T-0 | Deploy code (RLS disabled) | @swarm-ops |
| T+5m | Verify health checks | @swarm-ops |
| T+15m | Enable RLS_ENABLED=true | @swarm-ops |
| T+20m | Verify no errors | @swarm-sec |
| T+1h | Run RLS migration | @swarm-sec |
| T+1h+5m | Verify tenant isolation | @swarm-sec |
| T+24h | Monitor and verify | @swarm-ops |

---

## 📞 CONTACTS

| Role | Contact | Availability |
|------|---------|--------------|
| DevOps Lead | @swarm-ops | During deployment |
| Security Lead | @swarm-sec | During migration |
| On-Call | PagerDuty | 24/7 |
| Slack Channel | #deployments | Always |

---

## 📝 DECISION LOG

| Date | Decision | Rationale | Confidence |
|------|----------|-----------|------------|
| 2026-02-27 | Feature flag for RLS | Instant rollback, safe rollout | 0.95 |
| 2026-02-27 | Separate migration from code deploy | Isolate DB changes from app changes | 0.90 |
| 2026-02-27 | RLS disabled by default | Safe default, explicit opt-in | 0.95 |
| 2026-02-27 | Error handling in RLS context | Graceful degradation | 0.90 |

---

## 🔒 SECURITY CONSIDERATIONS

### During Deployment

- RLS is **disabled** until migration runs
- App-level tenant isolation **remains active**
- No security gap during rollout

### After Migration

- RLS provides **defense-in-depth**
- Even if app logic fails, DB enforces isolation
- Audit logging captures all access attempts

### Rollback Safety

- Disabling RLS via feature flag is **instant**
- App-level isolation **remains** as fallback
- No data exposure during rollback

---

**Document Version:** 1.0
**Last Updated:** 2026-02-27
**Approved By:** @swarm-ops, @swarm-sec
