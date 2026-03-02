# Performance Baselines

**Last Updated:** 2026-03-02
**Measurement Status:** 🟡 Infrastructure deployed, awaiting first metrics
**Issue:** #114 (blocks #89 completion)

## Overview

This document tracks Core Web Vitals and performance metrics for the Reqflow dashboard. All metrics are measured in production using Lighthouse CI and Real User Monitoring (RUM).

## Target Metrics (Issue #89)

| Metric | Target | Status | Notes |
|--------|--------|--------|-------|
| Lighthouse Score | 95+ | ⏳ Pending | First run in CI |
| FCP (First Contentful Paint) | <500ms | ⏳ Pending | P75, desktop |
| LCP (Largest Contentful Paint) | <2.5s | ⏳ Pending | P75, desktop |
| TTI (Time to Interactive) | <1s | ⏳ Pending | Cached load |
| CLS (Cumulative Layout Shift) | <0.1 | ⏳ Pending | P75 |
| Dashboard Load (cached) | <200ms | ⏳ Pending | Repeat visit |
| Search Response | <100ms | ⏳ Pending | Client-side filter |
| Zero Spinners | ✅ | ⏳ Pending | Cached navigation |

## Measurement Infrastructure

### Lighthouse CI
- **Workflow:** `.github/workflows/lighthouse.yml`
- **Budget:** `app/lighthouserc.json`
- **Runs on:** Every PR + push to main
- **Pages tested:**
  - Homepage (`/`)
  - Dashboard (`/dashboard`)
  - Requests List (`/dashboard/requests`)

### Web Vitals (RUM)
- **Instrumentation:** `app/src/app/instrumentation.ts`
- **Endpoint:** `POST /api/analytics/vitals`
- **Storage:** Axiom dataset `web-vitals`
- **Metrics tracked:**
  - CLS (Cumulative Layout Shift)
  - FCP (First Contentful Paint)
  - LCP (Largest Contentful Paint)
  - TTFB (Time to First Byte)
  - INP (Interaction to Next Paint)

### E2E Performance Tests
- **Location:** `app/tests/e2e/performance.spec.ts`
- **Framework:** Playwright
- **Run:** `npm run test:e2e`
- **Tests:**
  - FCP <500ms
  - Dashboard cached load <200ms
  - LCP <2.5s
  - CLS <0.1
  - TTI <1s
  - Zero spinners on repeat visits
  - Search response <100ms
  - No console errors

## Baseline Data

### Initial Lighthouse Audit (TBD)

Run first audit:
```bash
cd app
npm run build
npm start
npx lighthouse http://localhost:3000/dashboard --view
```

**Results:** ⏳ Awaiting first run

| Category | Score | Details |
|----------|-------|---------|
| Performance | TBD | |
| Accessibility | TBD | |
| Best Practices | TBD | |
| SEO | TBD | |

### Core Web Vitals (RUM - 7 Day Avg)

**Data Collection Period:** ⏳ Starting 2026-03-02

| Metric | P50 | P75 | P90 | P95 | P99 |
|--------|-----|-----|-----|-----|-----|
| FCP | TBD | TBD | TBD | TBD | TBD |
| LCP | TBD | TBD | TBD | TBD | TBD |
| CLS | TBD | TBD | TBD | TBD | TBD |
| TTFB | TBD | TBD | TBD | TBD | TBD |
| INP | TBD | TBD | TBD | TBD | TBD |

### E2E Test Results

**Last Run:** ⏳ Awaiting first run

```bash
cd app
npm run test:e2e -- tests/e2e/performance.spec.ts
```

**Results:** ⏳ Pending

## Performance Budget

Defined in `app/lighthouserc.json`:

| Metric | Budget | Error Threshold | Warn Threshold |
|--------|--------|-----------------|----------------|
| Performance Score | 95+ | <95 | <90 |
| FCP | 500ms | >500ms | >400ms |
| LCP | 2.5s | >2.5s | >2.0s |
| CLS | 0.1 | >0.1 | >0.08 |
| TBT | 300ms | >300ms | >250ms |
| Speed Index | 1.5s | >1.5s | >1.2s |

## Alert Thresholds

Configured in `app/src/app/api/analytics/vitals/route.ts`:

| Metric | Threshold | Action |
|--------|-----------|--------|
| FCP | >500ms | Log warning |
| LCP | >2500ms | Log warning |
| CLS | >0.1 | Log warning |
| INP | >200ms | Log warning |
| TTFB | >800ms | Log warning |

## Historical Data

### March 2026 (Baseline Month)

**Week 1 (Mar 2-8):**
- 🟡 Infrastructure deployed
- ⏳ Collecting initial RUM data
- ⏳ Running first Lighthouse CI audits

**Target Completion Date:** March 9, 2026 (7 days of data)

## Issue Status

### Blocking Items
- [ ] Run first Lighthouse CI audit
- [ ] Collect 7 days of RUM data
- [ ] Run E2E performance test suite
- [ ] Document baseline results in this file
- [ ] Validate all metrics meet targets from #89

### Related Issues
- #89 - Dashboard Performance & UX Audit (blocked)
- #114 - Add measurement & validation infrastructure (in progress)

## Next Steps

1. **Merge this PR** - Deploy measurement infrastructure
2. **Wait 7 days** - Collect representative RUM data
3. **Run full audit** - Lighthouse + E2E tests + RUM analysis
4. **Update this document** - Replace "TBD" with actual metrics
5. **Verify targets met** - Check against #89 success criteria
6. **Close #89** - With measurement evidence

## Maintenance

- **Update frequency:** Weekly
- **Owner:** Engineering team
- **Review cycle:** Monthly
- **Regression alerts:** Automatic via Axiom

---

**Note:** Performance is a feature. This document is the source of truth for performance metrics and serves as evidence for #89 completion.
