# CI/CD Pipeline Documentation

**Status:** ✅ Production Ready
**Last Updated:** 2026-03-04

---

## Overview

Reqflow uses GitHub Actions for continuous integration and deployment. The pipeline includes automated testing, security scanning, performance monitoring, and deployment to Vercel.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Actions                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pull Request → PR Checks → Preview Deploy → Code Review  │
│                                                             │
│  Push to Main → Full Tests → Migrations → Production      │
│                                                             │
│  Schedule    → Security Scan → Weekly Audits              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflows

### 1. PR Checks (Fast Feedback)
**File:** `.github/workflows/pr-checks-simple.yml`
**Trigger:** Every pull request
**Duration:** ~3-5 minutes

**Jobs:**
- ✅ ESLint with zero warnings enforcement
- ✅ TypeScript type checking
- ✅ Unit tests with coverage
- ✅ Production build verification

**Purpose:** Quick validation before full test suite runs.

---

### 2. PR Preview Deployments
**File:** `.github/workflows/pr-preview.yml`
**Trigger:** PR opened/synchronized
**Duration:** ~5-7 minutes

**Jobs:**
- ✅ Fast validation (lint + type check)
- ✅ Deploy to Vercel preview environment
- ✅ Comment preview URL on PR
- 🔄 Visual regression testing (optional)

**Preview URL Format:**
`https://reqflow-{branch}-{team}.vercel.app`

**Features:**
- Automatic cleanup on PR close
- Unique URL per PR
- Comments updated on each push

---

### 3. Full Test Suite
**File:** `.github/workflows/test.yml`
**Trigger:** Push to main, pull requests, workflow_call
**Duration:** ~10-15 minutes

**Jobs:**
1. **Unit Tests**
   - Vitest with coverage reports
   - Upload to Codecov
   - Fail if coverage drops

2. **E2E Tests**
   - Playwright with PostgreSQL service
   - Chromium browser only (performance)
   - Screenshot artifacts on failure

3. **Type Check**
   - Full TypeScript compilation
   - No errors allowed

4. **Build Check**
   - Production build with Next.js
   - Platform-specific binaries for Linux
   - Verifies all imports resolve

---

### 4. Security Scanning
**File:** `.github/workflows/security-scan.yml`
**Trigger:** Push to main, PRs, weekly schedule
**Duration:** ~15-20 minutes

**Scans:**
- **NPM Audit:** Dependency vulnerabilities
- **Gitleaks:** Secret detection
- **CodeQL:** Static analysis (SAST)
- **Semgrep:** Security patterns
- **Dependency Review:** License compliance
- **ESLint Security:** Code quality + security rules

**Fail Conditions:**
- Critical vulnerabilities in production dependencies
- Secrets detected in codebase
- Prohibited licenses (GPL, AGPL)

**Reports:**
- Security summary in job output
- SARIF upload for CodeQL/Semgrep
- Artifact retention: 30 days

---

### 5. Production Deployment
**File:** `.github/workflows/deploy.yml`
**Trigger:** Push to main, manual dispatch
**Duration:** ~15-20 minutes

**Stages:**
1. **Test** (reuses test.yml)
   - All tests must pass

2. **Migrate** (optional)
   - Run Drizzle migrations on production DB
   - Can be skipped with `skip_migrations` input
   - Uses `scripts/migrate-prod.ts`

3. **Deploy**
   - Build with Vercel CLI
   - Deploy to production
   - Output deployment URL

4. **Verify**
   - Smoke tests with `scripts/smoke-test.sh`
   - Health check endpoints
   - Critical path validation

5. **Notify**
   - Deployment summary in GitHub
   - Success/failure status

**Concurrency Control:**
Only one production deployment at a time. In-progress deployments are not cancelled.

---

### 6. Lighthouse Performance Audit
**File:** `.github/workflows/lighthouse.yml`
**Trigger:** Push to main, PRs (app/ changes)
**Duration:** ~5-8 minutes

**Pages Audited:**
- `/` (Landing page)
- `/dashboard` (Main app)
- `/dashboard/requests` (List page)

**Budgets (from `app/lighthouserc.json`):**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

**Web Vitals Budgets:**
- CLS < 0.1
- FCP < 1.8s
- LCP < 2.5s
- TTFB < 600ms
- INP < 200ms

**Artifacts:**
- Full HTML reports
- JSON results for trend analysis
- PR comments with scores

---

### 7. Emergency Rollback
**File:** `.github/workflows/rollback.yml`
**Trigger:** Manual dispatch only
**Duration:** ~2-3 minutes

**Inputs:**
- `deployment_id`: Specific Vercel deployment or "previous"
- `reason`: Required incident description

**Actions:**
1. Fetch previous deployment ID if needed
2. Promote deployment to production
3. Verify with health checks
4. Create incident issue for tracking

**Use Cases:**
- Critical bug in production
- Performance degradation
- Security incident response

---

## Branch Protection Rules

### Main Branch Requirements

**Required Status Checks:**
- ✅ PR Checks: quick-checks
- ✅ Security Scan: npm-audit, gitleaks, typecheck
- ✅ Lighthouse: performance audit

**Merge Settings:**
- Require pull request reviews: 1
- Dismiss stale reviews: enabled
- Require review from code owners: enabled
- Require linear history: enabled
- Require deployments to succeed: preview
- Require conversation resolution: enabled

**Setup via GitHub CLI:**
```bash
gh api repos/SamuelSaha/Reqflow/branches/main/protection \
  -X PUT \
  -F required_status_checks[strict]=true \
  -F required_status_checks[contexts][]=quick-checks \
  -F required_status_checks[contexts][]=npm-audit \
  -F required_status_checks[contexts][]=gitleaks \
  -F required_pull_request_reviews[required_approving_review_count]=1
```

---

## Secrets Management

### Required GitHub Secrets

| Secret | Purpose | How to Obtain |
|--------|---------|---------------|
| `VERCEL_TOKEN` | Deploy to Vercel | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `DATABASE_URL` | Production DB connection | Neon/Supabase console |
| `PRODUCTION_URL` | Smoke test target | `https://reqflow.app` |
| `CODECOV_TOKEN` | Coverage uploads | [Codecov Dashboard](https://codecov.io) |

### Setting Secrets
```bash
gh secret set VERCEL_TOKEN --body "your_token_here"
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set PRODUCTION_URL --body "https://reqflow.app"
```

---

## Caching Strategy

### NPM Dependencies
- **Key:** `package-lock.json` hash
- **Path:** `~/.npm`
- **Retention:** 7 days
- **Restore:** `setup-node@v4` handles automatically

### Vercel Build Cache
- **Managed by:** Vercel CLI
- **Includes:** Next.js build cache, node_modules
- **Cleanup:** Automatic by Vercel

### Playwright Browsers
- **Not cached** - Installed on-demand in E2E job
- **Reason:** Infrequent E2E runs, cache invalidation complexity

---

## Performance Optimizations

### 1. Parallel Job Execution
```yaml
jobs:
  lint:     # Runs in parallel
  typecheck:# Runs in parallel
  test:     # Runs in parallel
  build:    # Runs in parallel
```

### 2. Conditional Execution
- Security scan only on `app/` changes
- Lighthouse only on `app/` changes
- Skip migrations with manual override

### 3. Concurrency Groups
- Cancel in-progress PR checks on new push
- Never cancel production deployments

### 4. Fast Failure
- Lint fails fast before running expensive tests
- Type check before full build
- Unit tests before E2E tests

---

## Monitoring & Observability

### Deployment Tracking
- GitHub Actions annotations
- Vercel deployment dashboard
- Commit status checks

### Test Results
- Codecov trend graphs
- Playwright HTML reports (artifacts)
- Lighthouse score history

### Security Alerts
- GitHub Security tab
- Dependabot alerts
- CodeQL findings

---

## Troubleshooting

### Build Failures

**Platform-specific binaries missing:**
```bash
npm install --no-save \
  @tailwindcss/oxide-linux-x64-gnu@4.2.0 \
  lightningcss-linux-x64-gnu@1.31.1 \
  @unrs/resolver-binding-linux-x64-gnu@1.11.1
```

**Database connection errors:**
- Check `DATABASE_URL` secret is set
- Verify PostgreSQL service in workflow
- Ensure migrations are applied

**E2E test flakiness:**
- Check for race conditions in tests
- Verify seed data is deterministic
- Review Playwright timeouts

### Deployment Failures

**Vercel token expired:**
```bash
# Regenerate token at vercel.com/account/tokens
gh secret set VERCEL_TOKEN --body "new_token"
```

**Migration errors:**
```bash
# Skip migrations for emergency deploy
gh workflow run deploy.yml -f skip_migrations=true
```

**Smoke tests fail:**
- Check `PRODUCTION_URL` secret
- Verify health endpoint is accessible
- Review `app/scripts/smoke-test.sh` logic

---

## Best Practices

### Commit Messages
Follow conventional commits for automatic changelog generation:
```
feat(auth): Add two-factor authentication
fix(api): Handle rate limit errors gracefully
docs(readme): Update deployment instructions
perf(dashboard): Reduce bundle size by 30%
```

### PR Size
- Keep PRs under 500 lines changed
- Split large features into smaller PRs
- Use feature flags for incremental rollout

### Testing Strategy
- Unit tests for business logic (fast)
- E2E tests for critical paths only (slow)
- Visual regression for UI changes (optional)

### Security
- Never commit secrets
- Use environment variables
- Rotate tokens quarterly
- Review security scan results weekly

---

## Cost Optimization

### GitHub Actions Minutes
- **Current usage:** ~50 hours/month
- **Plan:** Free tier (2,000 minutes/month)
- **Cost:** $0/month

**Optimizations:**
- Skip E2E tests on docs-only PRs
- Use concurrency groups to cancel old runs
- Run expensive scans on schedule, not every PR

### Vercel Deployments
- **Preview deployments:** Unlimited
- **Production deployments:** ~120/month
- **Plan:** Pro ($20/month)

---

## Future Enhancements

### Planned (Q2 2026)
- [ ] Automated changelog generation
- [ ] Release tagging workflow
- [ ] Performance regression detection
- [ ] Visual regression with Percy/Chromatic
- [ ] Database rollback workflow
- [ ] Canary deployments

### Under Consideration
- [ ] Multi-region deployments
- [ ] A/B testing infrastructure
- [ ] Blue-green deployment strategy
- [ ] Feature flag management
- [ ] Automated dependency updates (Renovate)

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Strategy](../testing/TESTING_STRATEGY.md)
- [Security Best Practices](../security/SECURITY.md)
- [Performance Budgets](../performance/WEB_VITALS.md)

---

**Maintained by:** DevOps Team
**Support:** File an issue in `Reqflow/issues` with label `ci/cd`
