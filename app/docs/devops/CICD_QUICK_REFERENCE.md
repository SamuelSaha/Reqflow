# CI/CD Quick Reference

Fast lookup for common CI/CD tasks.

---

## 🚀 Common Commands

### Deploy to Production
```bash
git push origin main  # Automatic deployment
```

### Create Preview Deployment
```bash
# Just open a PR - automatic preview deployment
```

### Emergency Rollback
```bash
gh workflow run rollback.yml \
  -f deployment_id=previous \
  -f reason="Critical bug: X breaks Y"
```

### Manual Production Deploy
```bash
gh workflow run deploy.yml
```

### Skip Migrations on Deploy
```bash
gh workflow run deploy.yml -f skip_migrations=true
```

---

## 📊 Check Workflow Status

```bash
# List recent runs
gh run list --limit 10

# Watch specific run
gh run watch <run-id>

# View run logs
gh run view <run-id> --log

# List failed runs
gh run list --status failure --limit 5
```

---

## 🔍 Debugging Failed Workflows

### Re-run Failed Jobs
```bash
gh run rerun <run-id> --failed
```

### Re-run All Jobs
```bash
gh run rerun <run-id>
```

### Download Artifacts
```bash
gh run download <run-id>
```

### View Specific Job Logs
```bash
gh run view <run-id> --job <job-id> --log
```

---

## 🔐 Secrets Management

### List Secrets
```bash
gh secret list
```

### Set Secret
```bash
gh secret set SECRET_NAME --body "value"
```

### Delete Secret
```bash
gh secret delete SECRET_NAME
```

---

## ✅ Required Secrets

| Secret | Get From |
|--------|----------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `DATABASE_URL` | Your database provider |
| `PRODUCTION_URL` | Your production domain |
| `CODECOV_TOKEN` | [codecov.io](https://codecov.io) |

---

## 📈 View Test Results

### Coverage Report
```bash
# Local
npm run test:coverage --workspace=app

# CI: Check Codecov dashboard
open https://codecov.io/gh/SamuelSaha/Reqflow
```

### E2E Test Report
```bash
# Download artifact
gh run download <run-id> --name playwright-report

# View locally
cd playwright-report && python3 -m http.server 8000
open http://localhost:8000
```

### Lighthouse Report
```bash
# Download artifact
gh run download <run-id> --name lighthouse-reports

# View locally
cd .lighthouseci && python3 -m http.server 8000
```

---

## 🛡️ Security Scans

### Run Security Scan Manually
```bash
gh workflow run security-scan.yml
```

### View Security Alerts
```bash
# GitHub Security tab
open https://github.com/SamuelSaha/Reqflow/security

# Or via CLI
gh api repos/SamuelSaha/Reqflow/vulnerability-alerts
```

### Fix Vulnerabilities
```bash
# Check for fixes
npm audit fix --workspace=app

# Force updates (may break things)
npm audit fix --force --workspace=app
```

---

## 🔄 Workflow Triggers

| Workflow | Trigger | Duration |
|----------|---------|----------|
| PR Checks | Every PR | ~3-5 min |
| PR Preview | Every PR | ~5-7 min |
| Full Tests | Push to main, PRs | ~10-15 min |
| Security Scan | Push to main, PRs, Weekly | ~15-20 min |
| Production Deploy | Push to main | ~15-20 min |
| Lighthouse | Push to main, PRs (app/ changes) | ~5-8 min |
| Rollback | Manual only | ~2-3 min |

---

## 🚨 Emergency Procedures

### Rollback Production
```bash
# Rollback to previous deployment
gh workflow run rollback.yml \
  -f deployment_id=previous \
  -f reason="Describe issue here"

# Rollback to specific deployment
gh workflow run rollback.yml \
  -f deployment_id=dpl_abc123xyz \
  -f reason="Describe issue here"
```

### Skip Failing Tests
```bash
# DON'T DO THIS - Fix the tests instead
# But if absolutely necessary:
git commit --no-verify
git push --no-verify
```

### Force Deployment
```bash
# Skip migrations (use cautiously)
gh workflow run deploy.yml -f skip_migrations=true
```

---

## 📝 Workflow Files

| File | Purpose |
|------|---------|
| `.github/workflows/pr-checks-simple.yml` | Fast PR validation |
| `.github/workflows/pr-preview.yml` | Preview deployments |
| `.github/workflows/test.yml` | Full test suite |
| `.github/workflows/security-scan.yml` | Security scanning |
| `.github/workflows/deploy.yml` | Production deployment |
| `.github/workflows/lighthouse.yml` | Performance audits |
| `.github/workflows/rollback.yml` | Emergency rollback |

---

## 🔧 Local Testing

### Run What CI Runs
```bash
# Lint
npm run lint --workspace=app -- --max-warnings 0

# Type check
npm run type-check --workspace=app

# Unit tests
npm test --workspace=app

# E2E tests
npm run test:e2e --workspace=app

# Build
npm run build --workspace=app
```

### Verify Before Pushing
```bash
# Run all checks locally
npm run lint --workspace=app && \
npm run type-check --workspace=app && \
npm test --workspace=app && \
npm run build --workspace=app
```

---

## 🎯 Common Issues

### "Platform-specific binaries missing"
```bash
npm install --no-save \
  @tailwindcss/oxide-linux-x64-gnu@4.2.0 \
  lightningcss-linux-x64-gnu@1.31.1
```

### "Database connection failed"
- Check `DATABASE_URL` secret is set
- Verify database is accessible from GitHub Actions IPs
- Check migrations are applied

### "Vercel token expired"
```bash
# Regenerate at vercel.com/account/tokens
gh secret set VERCEL_TOKEN
```

### "E2E tests flaky"
- Add `test.retry(2)` to flaky tests
- Check for race conditions
- Increase timeouts if needed

---

## 📚 More Info

Full documentation: [`app/docs/devops/CICD.md`](./CICD.md)

---

**Last Updated:** 2026-03-04
