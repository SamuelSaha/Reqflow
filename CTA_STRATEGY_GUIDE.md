# CTA Strategy & Conversion Optimization Guide

## 🎯 Philosophy

This CTA system follows conversion psychology principles:
- **3-tier hierarchy:** Primary > Secondary > Tertiary (visual weight decreases)
- **Strategic placement:** At decision moments (after value prop, social proof, pricing)
- **Friction reduction:** "No credit card required" copy near CTAs
- **Persistent visibility:** Sticky bar keeps action top-of-mind during scroll
- **Social proof integration:** Trust signals near CTAs increase conversion

---

## 🏗️ Component Architecture

### 1. Primary CTA - Main Conversion Action

High-contrast button for primary conversion goal (trial signup).

```tsx
import { PrimaryCta } from "@/components/ui/cta-button";

<PrimaryCta
  href="/signup"
  icon="arrow" // or "sparkle" or "none"
  size="large" // or "default"
  analyticsEvent="hero_cta_click"
>
  Start Free Trial
</PrimaryCta>
```

**Visual Design:**
- Color: `bg-blue-600` → `hover:bg-blue-700`
- Size: `px-8 py-4` (large), `px-6 py-3` (default)
- Typography: Manrope 600, 16px (large), 14px (default)
- Icon: Optional arrow → or sparkle ✨
- Effects: Scale 105% on hover, shadow-lg
- Touch target: 44px minimum (WCAG compliant)

**Usage:**
```tsx
// Hero section
<PrimaryCta href="/signup" size="large" icon="arrow">
  Start Free Trial
</PrimaryCta>

// After features section
<PrimaryCta href="/signup" analyticsEvent="features_cta_click">
  Get Started
</PrimaryCta>

// After pricing table
<PrimaryCta href="/signup" analyticsEvent="pricing_cta_click">
  Start Your Free Trial
</PrimaryCta>
```

---

### 2. Secondary CTA - Lower Commitment Action

Outline button for exploratory actions (book demo, contact sales).

```tsx
import { SecondaryCta } from "@/components/ui/cta-button";

<SecondaryCta
  href="/contact"
  size="default"
  analyticsEvent="hero_demo_click"
>
  Book a Demo
</SecondaryCta>
```

**Visual Design:**
- Color: `border-2 border-slate-300` → `hover:bg-slate-50`
- Typography: Manrope 600
- Effects: Scale 105% on hover, shadow-md

**Usage:**
```tsx
// Hero (next to primary)
<CtaGroup alignment="center">
  <PrimaryCta href="/signup">Start Free Trial</PrimaryCta>
  <SecondaryCta href="/contact">Book a Demo</SecondaryCta>
</CtaGroup>

// Pricing page (Enterprise tier)
<SecondaryCta href="/contact">Contact Sales</SecondaryCta>

// Footer
<SecondaryCta href="/contact">Get in Touch</SecondaryCta>
```

---

### 3. Tertiary CTA - Text Link Action

Low-friction text link for exploration (view demo, read case study).

```tsx
import { TertiaryCta } from "@/components/ui/cta-button";

<TertiaryCta
  href="/case-studies"
  analyticsEvent="hero_case_study_click"
>
  Read Case Studies
</TertiaryCta>
```

**Visual Design:**
- Color: `text-slate-600` → `hover:text-blue-600`
- Typography: Manrope 500, 14px
- Effects: Underline animation on hover

**Usage:**
```tsx
// Below hero CTAs
<TertiaryCta href="/demo">View Product Demo</TertiaryCta>

// Features section
<TertiaryCta href="/features">Explore All Features</TertiaryCta>

// Testimonials section
<TertiaryCta href="/case-studies">Read Customer Stories</TertiaryCta>
```

---

### 4. CTA Group - Multiple CTAs Side by Side

Container for grouping primary + secondary CTAs.

```tsx
import { CtaGroup } from "@/components/ui/cta-button";

<CtaGroup alignment="center">
  <PrimaryCta href="/signup">Start Free Trial</PrimaryCta>
  <SecondaryCta href="/contact">Book a Demo</SecondaryCta>
</CtaGroup>
```

**Props:**
- `alignment`: "left" | "center" | "right"
- `stack`: Boolean (stack vertically on mobile)

**Responsive Behavior:**
- Mobile: Stacks vertically (flex-col)
- Desktop: Side by side (flex-row)

---

## 📍 Strategic Placement

### 1. Hero Section (Above the Fold)

**Goal:** Capture immediate conversions

```tsx
<Section background="warm">
  <Container size="narrow" className="text-center">
    <h1 className="text-hero text-slate-900 mb-4">
      The connected procurement workflow for small teams
    </h1>
    <p className="text-body-lg text-slate-600 mb-8">
      Streamline from request to renewal. Never miss a deadline.
    </p>

    {/* Primary + Secondary CTAs */}
    <CtaGroup alignment="center">
      <PrimaryCta
        href="/signup"
        size="large"
        icon="arrow"
        analyticsEvent="hero_primary_click"
      >
        Start Free Trial
      </PrimaryCta>
      <SecondaryCta
        href="/contact"
        size="large"
        analyticsEvent="hero_secondary_click"
      >
        Book a Demo
      </SecondaryCta>
    </CtaGroup>

    {/* Social proof */}
    <div className="mt-6">
      <SocialProofGroup
        userCount={500}
        rating={{ rating: 4.9, reviews: 127 }}
        showNoCreditCard
        alignment="center"
      />
    </div>
  </Container>
</Section>
```

---

### 2. After Features Section

**Goal:** Convert after value demonstration

```tsx
<Section background="white">
  <Container>
    {/* Feature grid... */}
    <FeatureGrid>
      {/* 6 feature cards... */}
    </FeatureGrid>

    {/* CTA after features */}
    <div className="mt-12 text-center">
      <h3 className="text-h3 text-slate-900 mb-4">
        Ready to streamline your workflow?
      </h3>
      <CtaGroup alignment="center">
        <PrimaryCta
          href="/signup"
          size="large"
          analyticsEvent="features_cta_click"
        >
          Get Started Free
        </PrimaryCta>
        <TertiaryCta href="/demo">Watch Demo</TertiaryCta>
      </CtaGroup>
      <div className="mt-4">
        <NoCreditCard />
      </div>
    </div>
  </Container>
</Section>
```

---

### 3. After Pricing Table

**Goal:** Convert after price evaluation

```tsx
<Section background="slate">
  <Container>
    {/* Pricing grid... */}
    <PricingGrid>
      {/* 3 pricing cards... */}
    </PricingGrid>

    {/* CTA after pricing */}
    <div className="mt-12 text-center">
      <p className="text-body-lg text-slate-600 mb-6">
        Not sure which plan is right? Start with a free trial.
      </p>
      <CtaGroup alignment="center">
        <PrimaryCta
          href="/signup"
          size="large"
          analyticsEvent="pricing_cta_click"
        >
          Start Free Trial
        </PrimaryCta>
        <SecondaryCta
          href="/contact"
          analyticsEvent="pricing_demo_click"
        >
          Talk to Sales
        </SecondaryCta>
      </CtaGroup>
      <div className="mt-4">
        <UserCount count={500} size="md" />
      </div>
    </div>
  </Container>
</Section>
```

---

### 4. Sticky CTA Bar (Appears on Scroll)

**Goal:** Maintain conversion opportunity during scroll

```tsx
import { StickyCta } from "@/components/marketing/StickyCta";

export default function MarketingLayout({ children }) {
  return (
    <>
      {children}
      <StickyCta
        primaryText="Start Free Trial"
        primaryHref="/signup"
        secondaryText="Book a Demo"
        secondaryHref="/contact"
        showAfterScroll={600} // Show after 600px scroll
        dismissible // User can dismiss
      />
    </>
  );
}
```

**Behavior:**
- Hidden initially
- Appears after scrolling 600px (past hero)
- Fixed to bottom of viewport
- Dismissible (stored in sessionStorage)
- Backdrop blur + shadow for elevation
- Mobile-responsive (hides secondary CTA on small screens)

---

## 🛡️ Social Proof Components

### User Count

```tsx
import { UserCount } from "@/components/marketing/SocialProof";

<UserCount count={500} label="teams" size="md" />
// Output: "Join 500+ teams"
```

### Rating

```tsx
import { Rating } from "@/components/marketing/SocialProof";

<Rating rating={4.9} reviews={127} size="md" />
// Output: ⭐⭐⭐⭐⭐ 4.9 (127 reviews)
```

### No Credit Card Required

```tsx
import { NoCreditCard } from "@/components/marketing/SocialProof";

<NoCreditCard additionalText="Free 14-day trial" size="md" />
// Output: ✓ No credit card required • Free 14-day trial
```

### Trust Badges

```tsx
import { TrustBadges } from "@/components/marketing/SocialProof";

<TrustBadges badges={["ssl", "gdpr", "soc2", "uptime"]} size="md" />
// Output: ✓ 256-bit SSL  ✓ GDPR Compliant  ✓ SOC 2 Type II  ✓ 99.9% Uptime
```

### Combined Social Proof Group

```tsx
import { SocialProofGroup } from "@/components/marketing/SocialProof";

<SocialProofGroup
  userCount={500}
  rating={{ rating: 4.9, reviews: 127 }}
  showNoCreditCard
  showTrustBadges
  alignment="center"
  size="md"
/>
```

---

## 📊 Analytics Tracking

### Using Built-in Analytics Events

All CTA components support `analyticsEvent` prop:

```tsx
<PrimaryCta
  href="/signup"
  analyticsEvent="hero_cta_click" // Tracked automatically
>
  Start Free Trial
</PrimaryCta>
```

**Event Format:**
- Category: "CTA"
- Action: Event name (e.g., "hero_cta_click")
- Label: Button text

### Using the Analytics Hook

```tsx
"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

export function CustomCta() {
  const { trackCtaClick } = useAnalytics();

  const handleClick = () => {
    trackCtaClick("primary", "Start Free Trial", "hero");
    // Navigate or perform action
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

**Available Tracking Functions:**
- `trackCtaClick(type, label, location)` - Track CTA clicks
- `trackFormSubmission(formName, success)` - Track form submissions
- `trackSectionView(sectionName)` - Track scroll-based views
- `trackVideoPlay(videoName)` - Track demo/video plays
- `trackPricingTierClick(tierName, action)` - Track pricing interactions

### Google Analytics Setup

Add to `app/layout.tsx`:

```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

---

## 🎨 Complete Example: Hero Section

```tsx
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrimaryCta, SecondaryCta, CtaGroup } from "@/components/ui/cta-button";
import { SocialProofGroup } from "@/components/marketing/SocialProof";

export function HeroSection() {
  return (
    <Section background="warm" className="min-h-[80vh] flex items-center">
      <Container size="narrow">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-hero text-slate-900 mb-6">
            The connected procurement workflow for small teams
          </h1>

          {/* Subheadline */}
          <p className="text-body-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Streamline vendor management, budget tracking, and renewals in one place.
            Never miss a deadline. Never overspend.
          </p>

          {/* CTAs */}
          <CtaGroup alignment="center" className="mb-8">
            <PrimaryCta
              href="/signup"
              size="large"
              icon="arrow"
              analyticsEvent="hero_primary_click"
            >
              Start Free Trial
            </PrimaryCta>
            <SecondaryCta
              href="/contact"
              size="large"
              analyticsEvent="hero_secondary_click"
            >
              Book a Demo
            </SecondaryCta>
          </CtaGroup>

          {/* Social Proof */}
          <SocialProofGroup
            userCount={500}
            rating={{ rating: 4.9, reviews: 127 }}
            showNoCreditCard
            alignment="center"
            size="md"
          />
        </div>
      </Container>
    </Section>
  );
}
```

---

## ✅ Checklist

### Primary CTA Placement
- [ ] Hero section (above the fold)
- [ ] After features section
- [ ] After pricing table
- [ ] Sticky footer bar (appears on scroll)

### Secondary CTA Placement
- [ ] Hero (next to primary)
- [ ] Pricing page (Enterprise tier)
- [ ] Footer

### Social Proof Integration
- [ ] User count near hero CTA ("Join 500+ teams")
- [ ] "No credit card required" copy near CTAs
- [ ] Trust badges in footer or pricing section

### Mobile Optimization
- [ ] All CTAs have 44px minimum touch target
- [ ] CTAs stack vertically on mobile (< 640px)
- [ ] Sticky bar is mobile-friendly (hides secondary CTA)

### Analytics Tracking
- [ ] All CTAs have unique `analyticsEvent` props
- [ ] Google Analytics or Plausible configured
- [ ] Test events in browser console (dev mode)

---

## 🚫 Common Pitfalls

### ❌ Don't overwhelm with too many CTAs
```tsx
// Bad - too many CTAs compete for attention
<div>
  <PrimaryCta>Start Trial</PrimaryCta>
  <PrimaryCta>Book Demo</PrimaryCta>
  <PrimaryCta>Contact Sales</PrimaryCta>
</div>

// Good - clear hierarchy
<CtaGroup>
  <PrimaryCta>Start Trial</PrimaryCta>
  <SecondaryCta>Book Demo</SecondaryCta>
</CtaGroup>
```

### ❌ Don't forget social proof
```tsx
// Bad - CTA without trust signals
<PrimaryCta>Start Trial</PrimaryCta>

// Good - CTA with friction reducers
<div>
  <PrimaryCta>Start Trial</PrimaryCta>
  <NoCreditCard />
  <UserCount count={500} />
</div>
```

### ❌ Don't use vague copy
```tsx
// Bad - unclear value
<PrimaryCta>Get Started</PrimaryCta>

// Good - clear benefit
<PrimaryCta>Start Free Trial</PrimaryCta>
```

---

## 📚 Resources

- **Conversion Optimization:** https://cxl.com/blog/cta-best-practices/
- **Button Psychology:** https://www.nngroup.com/articles/ok-cancel-or-cancel-ok/
- **Social Proof:** https://www.nngroup.com/articles/social-proof-ux/

---

**Last Updated:** 2026-02-26
**Maintained by:** @swarm-frontend + @swarm-ux + @swarm-data
