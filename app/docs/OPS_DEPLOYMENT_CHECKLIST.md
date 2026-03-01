# OPS DEPLOYMENT CHECKLIST

**Security Modules (Phase 1 & 2)**
**Version:** 1.0 | **Date:** 2026-02-27

---

## PRE-DEPLOY

| Check | Command | Status |
|-------|---------|--------|
| TypeScript errors | `npm run type-check` | [ ] |
| Lint errors | `npm run lint` | [ ] |
| Build succeeds | `npm run build` | [ ] |
| Pre-commit hooks pass | `git commit` (test) | [ ] |
| Database backup | `pg_dump $DATABASE_URL > backup.sql` | [ ] |
| RLS_ENABLED=false | Verify in Vercel env | [ ] |

---

## DEPLOY CODE (Phase A)

```bash
# Deploy to production
vercel --prod

# Or merge to main (if auto-deploy)
git push origin main
```

### Immediate Verification (5 min)

| Check | Command | Status |
|-------|---------|--------|
| Health check | `curl https://reqflow.com/api/health` | [ ] |
| Login works | Manual test | [ ] |
| API responds | Test tRPC endpoint | [ ] |
| Sentry errors | Check dashboard | [ ] |

---

## ENABLE RLS CONTEXT (Phase B1)

```bash
# Set in Vercel environment variables
RLS_ENABLED=true

# Redeploy to apply
vercel --prod
```

### Verification (15 min)

- [ ] No error spike in Sentry
- [ ] No RLS context warnings in logs
- [ ] All API endpoints working
- [ ] Auth flows working

**Rollback:** Set `RLS_ENABLED=false` and redeploy

---

## RUN RLS MIGRATION (Phase B2)

### Prerequisites

- [ ] RLS_ENABLED=true verified working
- [ ] Database backup confirmed
- [ ] Maintenance window announced

### Execute

```bash
# Run migration
psql $DATABASE_URL < app/src/lib/db/migrations/rls-setup.sql

# Verify helper functions
psql $DATABASE_URL -c "SELECT app.current_tenant_id();"

# Verify RLS enabled
psql $DATABASE_URL -c "
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;
"
```

### Verification (30 min)

- [ ] All 24 tables have RLS enabled
- [ ] Login still works
- [ ] API queries work
- [ ] No cross-tenant data access (test with different tenant)

---

## ROLLBACK PROCEDURES

### Instant: Feature Flag

```bash
# In Vercel dashboard, set:
RLS_ENABLED=false

# Redeploy
vercel --prod
```

**Time:** < 2 minutes

### Database: Disable RLS

```sql
-- Run this SQL
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
```

**Time:** < 5 minutes

### Full: Restore Backup

```bash
psql $DATABASE_URL < backup.sql
```

**Time:** Depends on DB size

---

## MONITORING

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | > 1% | Rollback |
| Latency p99 | > 500ms | Investigate |
| Auth failures | > 10/min | Rollback |
| RLS errors | Any | Rollback |

### Dashboards

- Sentry: https://sentry.io
- Vercel: https://vercel.com/dashboard
- Axiom: https://axiom.co

---

## CONTACTS

| Role | Contact |
|------|---------|
| On-Call | PagerDuty |
| Slack | #deployments |

---

**Document:** `app/docs/OPS_DEPLOYMENT_CHECKLIST.md`
**Detailed Plan:** `app/docs/DEPLOYMENT_PLAN.md`
