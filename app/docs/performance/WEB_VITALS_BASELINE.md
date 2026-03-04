# Web Vitals Baseline & Performance Budgets

**Issue:** #133 (P2 UX)
**Established:** 2026-03-04
**Review Frequency:** Monthly

---

## Executive Summary

This document establishes performance baselines and budgets for Reqflow's Core Web Vitals metrics. These thresholds align with Google's Web Vitals recommendations and ensure a high-quality user experience.

**Target:** 75th percentile (p75) of all measurements should meet "good" thresholds.

---

## Performance Budgets

Performance budgets are defined based on Google's Core Web Vitals recommendations. We measure the **75th percentile (p75)** to align with how Google evaluates sites in Search Console and PageSpeed Insights.

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor | Unit | Description |
|--------|------|-------------------|------|------|-------------|
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s | seconds | Largest Contentful Paint - Loading performance |
| **FCP** | ≤ 1.8s | 1.8s - 3.0s | > 3.0s | seconds | First Contentful Paint - Initial render time |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | unitless | Cumulative Layout Shift - Visual stability |
| **INP** | ≤ 200ms | 200ms - 500ms | > 500ms | milliseconds | Interaction to Next Paint - Responsiveness |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms | milliseconds | Time to First Byte - Server response time |

**Goal:** Achieve "good" rating on all metrics for at least **75% of page loads**.

---

## Page-Specific Budgets

Different pages have different complexity and performance expectations:

### Marketing Pages (Public)
- **Target Audience:** Prospective customers, high visibility
- **LCP Budget:** ≤ 2.0s (stricter than standard)
- **FCP Budget:** ≤ 1.5s (stricter than standard)
- **CLS Budget:** ≤ 0.05 (stricter than standard)
- **Priority:** CRITICAL - impacts SEO and conversion

**Applies to:**
- `/` (Homepage)
- `/pricing`
- `/features`
- `/about`

### Dashboard Pages (Authenticated)
- **Target Audience:** Logged-in users, interactive apps
- **LCP Budget:** ≤ 2.5s (standard)
- **FCP Budget:** ≤ 1.8s (standard)
- **INP Budget:** ≤ 150ms (stricter - highly interactive)
- **Priority:** HIGH - impacts daily user experience

**Applies to:**
- `/dashboard/*`
- `/requests/*`
- `/settings/*`

### Admin Pages (Internal)
- **Target Audience:** Internal users, complex data views
- **LCP Budget:** ≤ 3.0s (relaxed - acceptable for admin tools)
- **FCP Budget:** ≤ 2.0s (relaxed)
- **INP Budget:** ≤ 200ms (standard)
- **Priority:** MEDIUM - internal tools, lower visibility

**Applies to:**
- `/dashboard/admin/*`

---

## Baseline Metrics (Initial Target)

Before establishing actual baselines, these are our **target baselines** to achieve within the first month of monitoring:

### Overall Site (p75 targets)
- **LCP:** 2.5s
- **FCP:** 1.8s
- **CLS:** 0.1
- **INP:** 200ms
- **TTFB:** 800ms

### Key Pages Breakdown

| Page | LCP Target | FCP Target | CLS Target | Priority |
|------|------------|------------|------------|----------|
| `/` (Homepage) | 2.0s | 1.5s | 0.05 | CRITICAL |
| `/pricing` | 2.0s | 1.5s | 0.05 | CRITICAL |
| `/features` | 2.0s | 1.5s | 0.1 | HIGH |
| `/dashboard` | 2.5s | 1.8s | 0.1 | HIGH |
| `/dashboard/requests` | 2.5s | 1.8s | 0.1 | HIGH |
| `/dashboard/admin/*` | 3.0s | 2.0s | 0.15 | MEDIUM |

---

## Monitoring & Alerting

### Dashboard Location
- **URL:** `/dashboard/admin/web-vitals`
- **Access:** Admin users only
- **Refresh:** Real-time with manual refresh

### Alert Thresholds (Axiom)

Alerts trigger when **p75 values** exceed these thresholds:

- **LCP > 2.5s** → Warning alert
- **LCP > 4.0s** → Critical alert
- **FCP > 500ms** → Warning (aggressive threshold for fast sites)
- **CLS > 0.1** → Warning alert
- **INP > 200ms** → Warning alert
- **TTFB > 800ms** → Warning alert

### Alert Channels
- **Development:** Console logs only
- **Production:** Axiom alerts (can integrate Slack/PagerDuty later)

---

## Data Collection

### Client-Side Instrumentation
- **Library:** `web-vitals` (Google's official library)
- **Location:** `src/app/instrumentation.ts`
- **Transport:** `navigator.sendBeacon()` (fallback to `fetch()`)
- **Endpoint:** `/api/analytics/vitals`

### Storage
- **Primary:** PostgreSQL (`web_vitals` table)
  - Use: Historical analysis, dashboard queries, trend analysis
  - Retention: 90 days (configurable)
- **Secondary:** Axiom (`web-vitals` dataset)
  - Use: Real-time monitoring, alerting, advanced analytics
  - Retention: 30 days (configurable)

### Metrics Collected
Each sample includes:
- Metric name (CLS, FCP, LCP, TTFB, INP)
- Value (numeric)
- Rating (good, needs-improvement, poor)
- Delta (change since last measurement)
- URL and page pathname
- User agent
- Navigation type (navigate, reload, back-forward, prerender)
- Timestamp (captured at)

---

## Performance Budget Enforcement

### Pre-deployment Checks
1. **Lighthouse CI:** Run on PR builds
   - Block merge if LCP > 3.0s
   - Block merge if CLS > 0.15
   - Warn if FCP > 2.0s

2. **Bundle Size Monitoring**
   - Alert if JavaScript bundle increases by > 10%
   - Alert if total page weight increases by > 20%

### Continuous Monitoring
- **Daily Review:** Check dashboard for regressions
- **Weekly Analysis:** Review p75 trends per page
- **Monthly Review:** Update baselines and budgets

---

## Optimization Priorities

When metrics exceed budgets, prioritize fixes in this order:

### Priority 1: CLS (Visual Stability)
- **Impact:** Directly affects UX and SEO ranking
- **Common Causes:**
  - Images without width/height attributes
  - Ads, embeds, iframes without reserved space
  - FOIT/FOUT (Flash of Invisible/Unstyled Text)
  - Dynamically injected content above viewport
- **Fix Strategy:**
  - Add explicit dimensions to all images
  - Reserve space for dynamic content
  - Use `font-display: swap` with fallback fonts
  - Avoid inserting content above existing content

### Priority 2: LCP (Loading Performance)
- **Impact:** Primary loading metric, affects SEO
- **Common Causes:**
  - Large images without optimization
  - Render-blocking resources (CSS, JS)
  - Slow server response times
  - Client-side rendering delays
- **Fix Strategy:**
  - Optimize and compress images (WebP, AVIF)
  - Use `priority` on LCP image in Next.js
  - Minimize critical CSS
  - Use CDN for static assets
  - Implement code splitting

### Priority 3: INP (Interactivity)
- **Impact:** User responsiveness, especially for dashboards
- **Common Causes:**
  - Long-running JavaScript tasks
  - Heavy event handlers
  - Large DOM updates
  - Unoptimized React re-renders
- **Fix Strategy:**
  - Break up long tasks with `setTimeout`
  - Debounce/throttle expensive operations
  - Use React.memo and useMemo for optimization
  - Implement virtualized lists for large datasets
  - Use Web Workers for heavy computation

### Priority 4: FCP (Initial Paint)
- **Impact:** Perceived loading speed
- **Common Causes:**
  - Render-blocking resources
  - Large CSS bundles
  - Slow TTFB
- **Fix Strategy:**
  - Inline critical CSS
  - Defer non-critical CSS
  - Optimize server response
  - Use server-side rendering (SSR)

### Priority 5: TTFB (Server Response)
- **Impact:** Foundational for all other metrics
- **Common Causes:**
  - Slow database queries
  - Cold starts (serverless)
  - Network latency
  - Unoptimized API calls
- **Fix Strategy:**
  - Implement database query caching
  - Use CDN for static assets
  - Optimize database indexes
  - Use connection pooling
  - Implement edge caching

---

## Reporting

### Weekly Report (Automated)
- Summary of p75 metrics vs. budgets
- Top 5 slowest pages
- Regression alerts (> 10% increase in any metric)

### Monthly Review (Manual)
- Trend analysis (month-over-month)
- Budget compliance rate
- Recommendations for optimization
- Updated baseline targets (if improvements achieved)

---

## Success Criteria

**Target by End of Month 1 (March 2026):**
- ✅ Web Vitals monitoring infrastructure operational
- ✅ Dashboard showing real-time metrics
- ⬜ 75% of page loads meet "good" thresholds for all metrics
- ⬜ All marketing pages (/, /pricing, /features) meet stricter budgets
- ⬜ Zero CLS violations on marketing pages

**Target by End of Month 3 (May 2026):**
- ⬜ 90% of page loads meet "good" thresholds
- ⬜ All pages consistently under budget
- ⬜ Automated alerting and regression detection operational
- ⬜ Performance budgets integrated into CI/CD pipeline

---

## References

- [Web Vitals](https://web.dev/vitals/) - Google's Core Web Vitals guide
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/) - How metrics are weighted
- [PageSpeed Insights](https://pagespeed.web.dev/) - Test your pages
- [Chrome UX Report (CrUX)](https://developer.chrome.com/docs/crux/) - Real user monitoring data
- [web-vitals library](https://github.com/GoogleChrome/web-vitals) - Official measurement library

---

**Last Updated:** 2026-03-04
**Next Review:** 2026-04-04
**Owner:** Engineering Team
**Status:** ACTIVE - Monitoring in place, baseline data collection in progress
