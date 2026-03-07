# Home Page Declutter Implementation Plan

**Goal:** Reduce the home page from 10 content sections to 5 by removing sections that already live on dedicated pages.

**Architecture:** Single-file edit to `app/src/app/page.tsx`. Removed sections already exist on `/features`, `/integrations`, and `/pricing` — no migration needed.

**Tech Stack:** Next.js App Router, TypeScript, React 19

---

## Sections to keep

`Hero → TrustBar → ProblemSection → ProductFlow → FinalCTA`

## Sections to remove from home page

| Section | Lives at |
|---------|---------|
| PersonasSection | /features (PersonaSection) |
| FeatureGrid | /features (FeaturesGrid) |
| MetricsSection | /features (CoreFeatures) |
| IntegrationsSection | /integrations (Integrations) |
| PricingSection | /pricing (Pricing) |
| FAQSection | /pricing (FAQ) |

---

## Task 1: Edit `app/src/app/page.tsx`

1. Remove unused imports: PersonasSection, FeatureGrid, MetricsSection, IntegrationsSection, PricingSection, FAQSection
2. Remove `faqs` array (only used for FAQPage JSON-LD + FAQSection)
3. Remove FAQPage JSON-LD structured data block
4. Remove the 6 section components from JSX render

## Task 2: Verify and commit

- Open localhost:3000, confirm 5-section funnel renders correctly
- Commit with descriptive message
- Push to main
