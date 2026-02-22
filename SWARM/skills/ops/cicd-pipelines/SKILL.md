---
name: CI/CD Pipeline Mastery
description: GitHub Actions, Vercel, and deployment automation patterns
version: 1.0.0
primary_agents: [swarm-ops, swarm-ops, swarm-dev]
---

# 🚀 CI/CD Pipeline Mastery Skill

> **ACTIVATION:** Automate everything. If it can fail silently, it will. Make failures loud and obvious.

---

## 🎯 Core Principles

1. **Fail Fast** — Catch errors early in the pipeline
2. **Reproducible Builds** — Same input = Same output
3. **Trunk-Based Development** — Short-lived branches, frequent merges
4. **Zero-Downtime Deploys** — Never break production

---

## 📦 GITHUB ACTIONS BASELINE

### Standard CI Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci
      
      - uses: codecov/codecov-action@v3
        if: always()
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next
          retention-days: 1
```

---

## 🔄 VERCEL DEPLOYMENT

### Project Configuration
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.example.com"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Preview Deployments
```yaml
# .github/workflows/preview.yml
name: Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed: ${process.env.VERCEL_URL}`
            })
```

---

## 🧪 E2E TESTING IN CI

### Playwright Setup
```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    name: Playwright
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      
      - name: Start server
        run: pnpm build && pnpm start &
        env:
          NODE_ENV: production
          
      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 60000
        
      - run: pnpm test:e2e
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
```

---

## 🗄️ DATABASE MIGRATIONS

### Migration Workflow
```yaml
# .github/workflows/migrate.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    name: Apply Migrations
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Link Supabase Project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Apply Migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 🔐 SECRETS MANAGEMENT

### Required Secrets
```bash
# GitHub Repository Secrets
VERCEL_TOKEN              # From Vercel Account Settings
VERCEL_ORG_ID             # From Vercel Project Settings
VERCEL_PROJECT_ID         # From Vercel Project Settings
SUPABASE_ACCESS_TOKEN     # From Supabase Dashboard
SUPABASE_PROJECT_REF      # Project reference ID
CODECOV_TOKEN             # From Codecov
```

### Environment Protection
```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: 
      name: production
      url: https://app.example.com
    steps:
      # Protected environment requires approval
```

---

## 📊 PERFORMANCE BUDGETS

### Lighthouse CI
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          configPath: './lighthouserc.json'
```

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 🔄 ROLLBACK STRATEGY

### Vercel Instant Rollback
```bash
# List all deployments
vercel ls

# Promote previous deployment to production
vercel promote <deployment-url>

# Or via GitHub Actions
```

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      deployment_url:
        description: 'Deployment URL to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - run: npm i -g vercel
      
      - name: Promote Deployment
        run: vercel promote ${{ github.event.inputs.deployment_url }} --token=${{ secrets.VERCEL_TOKEN }}
```

---

## ✅ CI/CD CHECKLIST

Before merging:

- [ ] All checks pass (lint, types, tests, build)
- [ ] Coverage doesn't decrease
- [ ] Bundle size within budget
- [ ] Lighthouse scores pass
- [ ] Preview deployment works
- [ ] Migrations are backwards compatible
- [ ] Rollback tested for risky changes
- [ ] Environment secrets configured
- [ ] Protected branch rules active
