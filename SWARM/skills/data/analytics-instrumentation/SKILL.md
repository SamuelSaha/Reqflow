---
name: Analytics Instrumentation
description: Event tracking and product analytics implementation
version: 1.0.0
primary_agents: [swarm-growth, swarm-analyst]
---

# 📈 Analytics Instrumentation Skill

> **ACTIVATION:** If you don't measure it, you can't improve it.

---

## 🎯 Core Principles

1. **Track Events, Not Pageviews** — User actions matter
2. **Server-Side First** — Reliable, tamper-proof
3. **Consistent Naming** — One source of truth
4. **Privacy First** — Collect only what you need

---

## 📊 Event Tracking

### Standard Events

```typescript
// User lifecycle
track('user_signed_up', {
  method: 'email', // 'google', 'github', etc.
  hasReferrer: true,
})

track('user_onboarding_completed', {
  stepCount: 5,
  timeSpent: 120, // seconds
})

// Engagement
track('feature_used', {
  feature: 'ai_summarize',
  context: 'document_view',
})

// Conversion
track('subscription_started', {
  plan: 'pro',
  billingCycle: 'annual',
  amount: 99,
  currency: 'USD',
})
```

### Server-Side Tracking

```typescript
// More reliable than client-side
export async function trackEvent(
  event: string,
  userId: string,
  properties: Record<string, any>
) {
  await analytics.track({
    event,
    userId,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      source: 'server',
    },
  })
}
```

---

## 📈 Key Metrics

### North Star Metric

```typescript
// The one metric that matters
const northStarMetrics = {
  'saas': 'Weekly Active Users',
  'ecommerce': 'Gross Merchandise Value',
  'social': 'Daily Active Users',
  'marketplace': 'Transactions per Week',
}
```

### Funnel Metrics

```typescript
const funnelStages = [
  { name: 'Visited', event: 'page_viewed' },
  { name: 'Signed Up', event: 'user_signed_up' },
  { name: 'Activated', event: 'feature_used' },
  { name: 'Paid', event: 'subscription_started' },
]

// Calculate conversion rates between stages
```

---

## ✅ Checklist

- [ ] Server-side tracking for critical events
- [ ] User identification strategy
- [ ] Event naming convention documented
- [ ] Privacy compliance (GDPR, CCPA)
- [ ] Data retention policy
- [ ] Real-time dashboards

---

## 🔒 Skill Version

```
Skill: Analytics Instrumentation
Version: 1.0.0
Last Updated: 2026-02-02
```
