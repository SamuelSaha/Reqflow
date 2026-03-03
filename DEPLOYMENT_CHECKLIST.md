# 🚀 Reqflow Production Deployment Checklist

**Version:** 1.0.0
**Last Updated:** 2026-03-03
**Target:** First Production Launch

---

## ⚠️ PRE-FLIGHT: Critical Blockers

**DO NOT DEPLOY** until these are resolved:

- [ ] **CRITICAL:** Fix Edge Runtime crypto import in `src/lib/auth/simple-auth.ts:25`
  - Replace Node.js `crypto` with Web Crypto API
  - Test in Edge Runtime context
  - Verify middleware doesn't crash on first authenticated request

---

## 📋 Phase 1: Pre-Deployment (T-24 hours)

### 1.1 Code Quality & Build

- [ ] All tests passing: `npm run test --workspace=app`
  - Target: 100% pass rate (currently 51/51 ✅)
- [ ] Type-check passes: `npm run type-check --workspace=app`
- [ ] Linting clean: `npm run lint --workspace=app`
  - Fix 5 `@typescript-eslint/no-explicit-any` errors
  - Fix 12 unused variable warnings
- [ ] Production build succeeds: `npm run build --workspace=app`
  - Verify no Turbopack errors
  - Check bundle sizes (target: <500KB initial)
- [ ] No console.log statements in production code
  - Found: 26 occurrences across 13 files
  - Replace with proper logger (`lib/monitoring/logger.ts`)

### 1.2 Security Audit

- [ ] **Rate Limiting Configured**
  - `/api/auth/login` (prevent brute force: 5 attempts/15min)
  - `/api/auth/signup` (prevent abuse: 3 signups/hour/IP)
  - `/api/auth/mfa/verify` (prevent brute force: 5 attempts/15min)
- [ ] **Environment Variables Validated**
  - All required vars present (see `.env.example`)
  - No default/example values in production
  - Secrets rotated from dev/staging
  - `AUTH_SECRET` minimum 32 chars (cryptographically random)
  - `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` configured (RS256)
  - `FIELD_ENCRYPTION_KEY` minimum 32 chars
- [ ] **CSP Headers Active**
  - Nonce generation working in middleware
  - No CSP violations in browser console
  - Inline styles properly handled (Tailwind/Radix)
- [ ] **Security Headers Verified**
  - HSTS enabled with preload
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
- [ ] **Dependencies Audit**
  - Run `npm audit --workspace=app`
  - No critical vulnerabilities
  - Update if needed

### 1.3 Database Preparation

- [ ] **Backup Current Production DB** (if applicable)
  - Full dump with timestamp
  - Store in secure location (S3, offsite backup)
  - Verify backup can be restored
- [ ] **Migration Validation**
  - All migrations tested in staging
  - Migrations run in order (0000 → 0007)
  - Rollback plan documented for each migration
  - Check for data loss risks:
    - [ ] Migration 0000: Initial schema
    - [ ] Migration 0001: Accounting integrations
    - [ ] Migration 0002: Request→Subscription conversion
    - [ ] Migration 0003: Refresh tokens (security #126)
    - [ ] Migration 0004: MFA fields (#121)
    - [ ] Migration 0005: Organization indexes
    - [ ] Migration 0006: AI API key
    - [ ] Migration 0007: AI multi-provider
- [ ] **Database Configuration**
  - Connection pool size: 20-50 connections
  - Connection timeout: 30s
  - Statement timeout: 60s (prevent long-running queries)
  - Idle connection timeout: 10min
  - SSL enabled for production database
  - RLS_ENABLED=true (Row-Level Security)
- [ ] **Seed Data** (if first deployment)
  - Create initial organization
  - Create admin user
  - Set up default categories/departments
  - Verify seed script: `npm run db:seed` (if exists)

### 1.4 Redis & Queue Configuration

- [ ] **Redis Connection**
  - REDIS_URL configured and accessible
  - Redis version ≥ 6.0
  - Memory limit configured (recommend: 1GB minimum)
  - Eviction policy: `allkeys-lru` or `volatile-lru`
  - Persistence: RDB + AOF enabled
- [ ] **BullMQ Worker**
  - Worker process separate from web server
  - Worker starts automatically (systemd/supervisor/Docker)
  - Worker health check endpoint functional
  - Queue job retention: 7 days completed, 30 days failed
  - Retry strategy configured:
    - Max retries: 3
    - Backoff: exponential (1min, 5min, 15min)
- [ ] **Queue Jobs Validated**
  - Test approval reminders job
  - Test renewal reminders job
  - Test notification delivery job
  - Verify failed jobs appear in dashboard/logs

### 1.5 External Integrations

- [ ] **Email (Resend)**
  - RESEND_API_KEY configured
  - EMAIL_FROM domain verified
  - Test email delivery to real address
  - SPF/DKIM/DMARC records configured
- [ ] **File Storage (Cloudflare R2)**
  - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY configured
  - R2_BUCKET_NAME created
  - CORS policy configured for web uploads
  - Lifecycle policy: delete unattached files after 30 days
  - Test file upload and retrieval
- [ ] **Slack Integration** (optional)
  - SLACK_CLIENT_ID, SLACK_CLIENT_SECRET configured
  - SLACK_SIGNING_SECRET verified
  - OAuth redirect URL whitelisted
  - Test notification delivery
- [ ] **QuickBooks Integration** (optional)
  - QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET configured
  - QUICKBOOKS_REDIRECT_URI whitelisted
  - OAuth flow tested end-to-end
- [ ] **Xero Integration** (optional)
  - XERO_CLIENT_ID, XERO_CLIENT_SECRET configured
  - XERO_REDIRECT_URI whitelisted
  - OAuth flow tested end-to-end
- [ ] **AI (Anthropic Claude)** (optional)
  - ANTHROPIC_API_KEY configured
  - API quota sufficient for launch traffic
  - Test AI classification endpoint

### 1.6 Monitoring & Observability

- [ ] **Sentry Configuration**
  - SENTRY_DSN configured
  - SENTRY_ORG, SENTRY_PROJECT set
  - SENTRY_AUTH_TOKEN for source maps
  - Test error capture (trigger test error)
  - Alert rules configured:
    - Error rate > 5% for 5 minutes
    - New error types
    - Performance degradation (p95 > 2s)
- [ ] **Axiom Logging**
  - AXIOM_API_TOKEN configured
  - AXIOM_DATASET created
  - Log retention: 30 days minimum
  - Test log ingestion
- [ ] **Health Checks**
  - `/api/health/ping` returns 200
  - `/api/health/database` verifies DB connection
  - `/api/health/queues` checks Redis connection
  - `/api/health/integrations` tests external APIs
- [ ] **Uptime Monitoring**
  - External monitor configured (UptimeRobot, Pingdom, etc.)
  - Check frequency: 1 minute
  - Alert channels: email, Slack, PagerDuty
  - Regions to monitor from: US, EU, Asia

### 1.7 Performance & Load Testing

- [ ] **Lighthouse Audit (5 viewports)**
  - Desktop 1440px: LCP <2.5s, CLS <0.1
  - Desktop 1280px: LCP <2.5s, CLS <0.1
  - Tablet 1024px: LCP <2.5s, CLS <0.1
  - Mobile 768px: LCP <3s, CLS <0.1
  - Mobile 390px: LCP <3s, CLS <0.1
- [ ] **Load Test Results**
  - 100 concurrent users: p95 <500ms
  - 1000 requests/min: no errors
  - Database connections: <50% pool used
  - Redis memory: <50% limit used
- [ ] **Bundle Size Check**
  - Initial JS bundle: <500KB gzipped
  - Vendor chunks properly split
  - Code splitting working (lazy load charts)

---

## 🚀 Phase 2: Deployment (T-0)

### 2.1 Pre-Deployment Snapshot

- [ ] **Create Deployment Tag**
  ```bash
  git tag -a v1.0.0 -m "Production launch"
  git push origin v1.0.0
  ```
- [ ] **Document Current State**
  - Database row counts (users, orgs, requests, etc.)
  - Redis key count
  - Active sessions count
  - Queue job counts (pending, completed, failed)

### 2.2 Database Migration

- [ ] **Run Migrations** (in transaction if possible)
  ```bash
  npm run db:migrate --workspace=app
  ```
- [ ] **Verify Migration Success**
  - Check migration log for errors
  - Verify schema matches expected state
  - Run smoke test queries
- [ ] **Create Post-Migration Backup**
  - Full database dump with timestamp
  - Keep for 30 days minimum

### 2.3 Application Deployment

- [ ] **Set Environment Variables**
  - Copy from `.env.production` (DO NOT commit this file)
  - Verify all required variables present
  - Double-check NODE_ENV=production
- [ ] **Build Application**
  ```bash
  npm run build --workspace=app
  ```
- [ ] **Start Application** (deployment platform specific)
  - Vercel: `vercel --prod`
  - Railway: `railway up`
  - Docker: `docker-compose up -d`
  - Manual: `npm run start --workspace=app`
- [ ] **Start Worker Process**
  ```bash
  npm run worker --workspace=app
  ```
  - Verify worker is consuming jobs
  - Check worker logs for errors

### 2.4 Smoke Tests (First 5 Minutes)

- [ ] **Basic Functionality**
  - [ ] Homepage loads (<2s)
  - [ ] Signup flow works (create test user)
  - [ ] Email verification received
  - [ ] Login works
  - [ ] Onboarding wizard completes
  - [ ] Dashboard loads with empty state
  - [ ] Create request works
  - [ ] File upload works
  - [ ] Logout works
- [ ] **API Health**
  - [ ] `/api/health/ping` returns 200
  - [ ] `/api/health/database` returns 200
  - [ ] `/api/health/queues` returns 200
  - [ ] `/api/trpc/health.check` works
- [ ] **Authentication**
  - [ ] JWT tokens issued correctly
  - [ ] Refresh token rotation works
  - [ ] Session persistence works (reload page)
  - [ ] MFA setup works (if enabled)
- [ ] **Monitoring Active**
  - [ ] Logs flowing to Axiom
  - [ ] Errors captured in Sentry
  - [ ] Metrics appearing in monitoring dashboard

---

## 📊 Phase 3: Post-Deployment (T+1 hour to T+24 hours)

### 3.1 Immediate Verification (T+1 hour)

- [ ] **Error Rate Check**
  - Sentry: <1% error rate
  - No new error types
  - No critical errors
- [ ] **Performance Metrics**
  - p50 response time: <200ms
  - p95 response time: <500ms
  - p99 response time: <1s
- [ ] **Database Health**
  - Connection pool: <50% utilization
  - Active queries: <20
  - Long-running queries: none >30s
  - Lock waits: minimal
- [ ] **Queue Health**
  - Jobs processing successfully
  - Failed job rate: <5%
  - Queue depth: <100 pending
- [ ] **User Activity**
  - Signups working (if any)
  - Logins working
  - Core flows completing

### 3.2 First Day Monitoring (T+24 hours)

- [ ] **Traffic Analysis**
  - Unique visitors count
  - Page views per session
  - Bounce rate (<40% target)
  - Time on site (>2min target)
- [ ] **Conversion Funnels**
  - Signup → Verification: >80%
  - Verification → Onboarding: >90%
  - Onboarding → First Request: >60%
- [ ] **Error Analysis**
  - Group errors by type
  - Prioritize fixes for >1% occurrence
  - Create GitHub issues for top 5 errors
- [ ] **Performance Trends**
  - Response times stable or improving
  - No memory leaks (memory usage stable)
  - No connection pool exhaustion
  - No Redis memory growth
- [ ] **User Feedback**
  - Monitor support channels (email, Slack)
  - Watch for common complaints
  - Document UX friction points

### 3.3 Cost Optimization (T+7 days)

- [ ] **Infrastructure Costs**
  - Database: actual usage vs provisioned
  - Redis: memory usage vs plan
  - R2: storage + bandwidth costs
  - CDN: bandwidth costs
  - Monitoring: log volume vs plan
- [ ] **Optimization Opportunities**
  - Unused indexes (query plan analysis)
  - Oversized connection pools
  - Unnecessary API calls
  - Large bundle sizes

---

## 🔥 Rollback Plan

**If critical issues occur, follow this sequence:**

### Immediate Rollback (< 5 minutes)

1. **Revert Application Code**
   ```bash
   # Vercel
   vercel rollback

   # Railway
   railway rollback

   # Docker
   docker-compose down
   docker-compose up -d --build <previous-tag>
   ```

2. **Verify Rollback Success**
   - Check health endpoints
   - Test critical user flows
   - Monitor error rates

### Database Rollback (use with EXTREME caution)

1. **Stop Application** (prevent new writes)
2. **Restore from Backup**
   ```bash
   pg_restore -d reqflow backup-YYYYMMDD-HHMMSS.dump
   ```
3. **Verify Data Integrity**
4. **Restart Application on Previous Version**

### Post-Rollback Actions

- [ ] Post-mortem document created
- [ ] Root cause identified
- [ ] Fix implemented and tested in staging
- [ ] Re-deployment plan created

---

## 📞 Emergency Contacts

**On-Call Engineer:** [Name] - [Phone] - [Email]
**Database Admin:** [Name] - [Phone] - [Email]
**DevOps Lead:** [Name] - [Phone] - [Email]
**CTO/Technical Lead:** [Name] - [Phone] - [Email]

**Escalation Path:**
1. On-Call Engineer (0-15 min)
2. Database Admin (15-30 min)
3. DevOps Lead (30-60 min)
4. CTO/Technical Lead (60+ min)

---

## 📚 References

- [Environment Variables](.env.example)
- [Database Schema](app/src/lib/db/schema.ts)
- [Migration Files](app/drizzle/)
- [Security Checklist](SECURITY.md) - if exists
- [API Documentation](app/src/app/api-reference/page.tsx)
- [Monitoring Dashboard](https://app.axiom.co) - if configured
- [Error Tracking](https://sentry.io) - if configured

---

## ✅ Final Sign-Off

**Deployment Lead:** _________________ Date: _________

**Database Admin:** _________________ Date: _________

**Security Review:** _________________ Date: _________

**Business Approval:** _________________ Date: _________

---

**Notes:**
- This checklist is a living document - update after each deployment
- Mark items N/A if not applicable to your infrastructure
- Add platform-specific steps for your deployment target (Vercel, Railway, AWS, etc.)
- Keep a deployment log with timestamps and observations
