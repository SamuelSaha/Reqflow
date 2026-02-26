# Responsive Grid System - Mobile-First Design Guide

## 📱 Philosophy

This system implements mobile-first responsive design with:
- **Fluid typography** that scales automatically across breakpoints
- **Responsive spacing** using CSS custom properties
- **Grid transformations** optimized for each screen size
- **Touch-friendly targets** (44px minimum)
- **Zero horizontal scroll** on any device

---

## 🎯 Breakpoints

```
Mobile:  < 768px  (375px minimum - iPhone SE)
Tablet:  768px+   (iPad)
Desktop: 1024px+  (Standard desktop)
Large:   1280px+  (Wide desktop)
XL:      1536px+  (Extra wide)
```

**Strategy:** Start with mobile styles (base), then add complexity at larger breakpoints.

---

## 📏 Typography Scale

Typography automatically adapts using CSS custom properties:

| Element | Mobile | Tablet | Desktop | Large |
|---------|--------|--------|---------|-------|
| Hero/H1 | 36px   | 48px   | 60px    | 72px  |
| H2      | 28px   | 36px   | 48px    | 48px  |
| H3      | 24px   | 28px   | 36px    | 36px  |
| H4      | 20px   | 24px   | 24px    | 24px  |
| H5      | 18px   | 20px   | 20px    | 20px  |
| Body Large | 18px | 18px  | 18px    | 18px  |
| Body    | 16px   | 16px   | 16px    | 16px  |
| Body Small | 14px | 14px  | 14px    | 14px  |
| Caption | 12px   | 12px   | 12px    | 12px  |

### Usage

```tsx
<h1 className="text-hero text-slate-900">
  The connected procurement workflow
</h1>

<h2 className="text-h2 text-slate-800">
  Key Features
</h2>

<p className="text-body text-slate-600">
  Manage vendors, budgets, and subscriptions in one place.
</p>

<span className="text-caption text-slate-500">
  Premium Feature
</span>
```

---

## 📐 Spacing Scale

Spacing adapts automatically:

| Token | Mobile | Tablet | Desktop | Large |
|-------|--------|--------|---------|-------|
| Section Padding | 48px (py-12) | 64px (py-16) | 96px (py-24) | 128px (py-32) |
| Container Padding | 16px (px-4) | 24px (px-6) | 32px (px-8) | 32px |
| Card Padding | 24px (p-6) | 32px (p-8) | 32px | 32px |
| Grid Gap | 24px (gap-6) | 24px | 24px | 24px |

### Usage

```tsx
// Automatic section padding
<section className="section-padding">
  {/* Content */}
</section>

// Automatic container padding
<div className="container-padding">
  {/* Content */}
</div>

// Card padding
<div className="card-padding bg-white rounded-lg">
  {/* Card content */}
</div>

// Grid gap
<div className="grid grid-cols-3 grid-gap">
  {/* Grid items */}
</div>
```

---

## 🏗️ Layout Components

### Container

Max-width wrapper with responsive padding:

```tsx
import { Container } from "@/components/layout/Container";

// Standard container (1280px max-width)
<Container>
  <h1>Content</h1>
</Container>

// Narrow container (768px - for text-heavy content)
<Container size="narrow">
  <article>Long form content...</article>
</Container>

// Wide container (1536px)
<Container size="wide">
  <div>Wide content...</div>
</Container>

// Full width (no constraint)
<Container size="full">
  <div>Full width...</div>
</Container>

// No padding (for nested containers)
<Container noPadding>
  <div>No padding...</div>
</Container>
```

### Section

Full-width section with background + container:

```tsx
import { Section } from "@/components/layout/Section";

// White background section
<Section background="white">
  <h2>Section Title</h2>
</Section>

// Warm background (cream/beige)
<Section background="warm">
  <h2>Warm Section</h2>
</Section>

// Dark background
<Section background="dark">
  <h2 className="text-white">Dark Section</h2>
</Section>

// Custom container size
<Section containerSize="narrow" background="slate">
  <article>Narrow content...</article>
</Section>

// No padding (custom spacing)
<Section noPadding background="white" className="py-6">
  <h2>Custom spacing...</h2>
</Section>
```

---

## 🎨 Grid Patterns

### Feature Grid (1 → 2 → 3 columns)

```tsx
import { FeatureGrid } from "@/components/layout/GridExamples";

<FeatureGrid>
  <FeatureCard icon={Workflow} title="Connected Records" />
  <FeatureCard icon={CheckCircle} title="Smart Approvals" />
  <FeatureCard icon={PieChart} title="Budget Intelligence" />
  <FeatureCard icon={Building} title="Vendor Management" />
  <FeatureCard icon={Bell} title="Renewal Tracking" />
  <FeatureCard icon={Sparkles} title="AI Categorization" />
</FeatureGrid>
```

**Behavior:**
- Mobile: 1 column (stacked)
- Tablet (768px+): 2 columns
- Desktop (1024px+): 3 columns

### Logo Grid (2 → 4 → 6 columns)

```tsx
import { LogoGrid } from "@/components/layout/GridExamples";

<LogoGrid>
  <img src="/logos/company1.svg" alt="Company 1" />
  <img src="/logos/company2.svg" alt="Company 2" />
  {/* 6-8 logos total */}
</LogoGrid>
```

**Behavior:**
- Mobile: 2 columns
- Tablet (768px+): 4 columns
- Desktop (1024px+): 6 columns
- Items are centered and aligned

### Pricing Grid (Stack → 3 columns)

```tsx
import { PricingGrid } from "@/components/layout/GridExamples";

<PricingGrid>
  <PricingCard tier="Starter" price="$49" />
  <PricingCard tier="Business" price="$199" featured />
  <PricingCard tier="Enterprise" price="Custom" />
</PricingGrid>
```

**Behavior:**
- Mobile: Stacked vertically (1 column)
- Tablet (768px+): 3 columns side-by-side

### Asymmetric Grid (1 col → 60/40 split)

```tsx
import { AsymmetricGrid } from "@/components/layout/GridExamples";

// Content left, image right (default)
<AsymmetricGrid>
  <div>
    <h2>Content Section</h2>
    <p>Detailed description...</p>
  </div>
  <img src="/screenshot.png" alt="Product" />
</AsymmetricGrid>

// Image left, content right (reverse)
<AsymmetricGrid reverse>
  <img src="/screenshot.png" alt="Product" />
  <div>
    <h2>Content Section</h2>
  </div>
</AsymmetricGrid>
```

**Behavior:**
- Mobile: Stacked vertically
- Desktop (1024px+): 60/40 split (or 40/60 if reversed)

### Footer Grid (1 → 2 → 4 columns)

```tsx
import { FooterGrid } from "@/components/layout/GridExamples";

<FooterGrid>
  <div>
    <h3>Product</h3>
    <ul>{/* Links */}</ul>
  </div>
  <div>
    <h3>Resources</h3>
    <ul>{/* Links */}</ul>
  </div>
  <div>
    <h3>Company</h3>
    <ul>{/* Links */}</ul>
  </div>
  <div>
    <h3>Connect</h3>
    <ul>{/* Links */}</ul>
  </div>
</FooterGrid>
```

**Behavior:**
- Mobile: 1 column (stacked)
- Tablet (768px+): 2 columns
- Desktop (1024px+): 4 columns

### Flexible Grid (Custom)

```tsx
import { FlexibleGrid } from "@/components/layout/GridExamples";

// Custom columns per breakpoint
<FlexibleGrid
  cols={{ mobile: 1, tablet: 2, desktop: 4 }}
  gap="lg"
>
  <Card />
  <Card />
  <Card />
  <Card />
</FlexibleGrid>

// Small gap
<FlexibleGrid cols={{ mobile: 2, tablet: 3, desktop: 6 }} gap="sm">
  {/* Items */}
</FlexibleGrid>
```

---

## 👆 Touch Target Optimization

All interactive elements have a minimum 44px height for thumb-friendly tapping:

```tsx
// Buttons (automatic)
<button className="bg-blue-600 text-white px-8">
  Start Free Trial
</button>
// ✅ min-height: 44px applied automatically

// Custom touch targets
<a href="/pricing" className="touch-target inline-flex items-center">
  View Pricing
</a>
// ✅ min-height: 44px + min-width: 44px

// Link with sufficient padding (alternative)
<a href="/docs" className="py-3 px-4">
  Documentation
</a>
// ✅ Padding creates 48px tap target
```

---

## 🎨 Example: Complete Marketing Section

```tsx
import { Section } from "@/components/layout/Section";
import { FeatureGrid } from "@/components/layout/GridExamples";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <Section background="warm">
      <div className="text-center mb-12">
        <h2 className="text-h2 text-slate-900 mb-4">
          Everything you need
        </h2>
        <p className="text-body-lg text-slate-600 max-w-2xl mx-auto">
          Streamline procurement from request to renewal
        </p>
      </div>

      <FeatureGrid>
        <Card className="card-padding">
          <div className="text-blue-600 mb-4">
            <Workflow className="w-8 h-8" />
          </div>
          <h3 className="text-h4 text-slate-900 mb-2">
            Connected Records
          </h3>
          <p className="text-body text-slate-600">
            Tool → Contract → Subscription → Invoice
          </p>
        </Card>

        {/* 5 more cards... */}
      </FeatureGrid>
    </Section>
  );
}
```

---

## ✅ Testing Checklist

Test your responsive layouts on these screen sizes:

- [ ] **iPhone SE (375px)** - Smallest mobile device
- [ ] **iPhone 14 Pro (393px)** - Modern mobile
- [ ] **iPad (768px)** - Tablet portrait
- [ ] **iPad Landscape (1024px)** - Tablet landscape
- [ ] **Desktop (1280px)** - Standard desktop
- [ ] **Large Desktop (1920px)** - Wide screen

### Chrome DevTools

```bash
1. Open DevTools (Cmd+Opt+I)
2. Click device toolbar icon (Cmd+Shift+M)
3. Select device preset or enter custom width
4. Test portrait + landscape orientations
```

---

## 🚫 Common Pitfalls

### ❌ Don't use fixed pixel values for responsive elements:
```tsx
// Bad
<div className="py-16 px-8">

// Good - uses responsive CSS custom properties
<div className="section-padding container-padding">
```

### ❌ Don't use Flexbox for 2D layouts:
```tsx
// Bad - Flexbox for grid
<div className="flex flex-wrap gap-4">

// Good - CSS Grid for grid
<div className="grid-features">
```

### ❌ Don't forget touch targets:
```tsx
// Bad - 30px tap target (too small)
<button className="p-1 text-sm">Click</button>

// Good - 44px minimum
<button className="py-3 px-4">Click</button>
```

### ❌ Don't create horizontal scroll:
```tsx
// Bad - might overflow on mobile
<div className="min-w-[600px]">

// Good - responsive max-width
<div className="max-w-full">
```

---

## 🎯 Quick Reference

```tsx
// Import layout components
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  FeatureGrid,
  LogoGrid,
  PricingGrid,
  FooterGrid,
  AsymmetricGrid,
  FlexibleGrid,
} from "@/components/layout/GridExamples";

// Use responsive typography
<h1 className="text-hero">      // 36px → 48px → 60px → 72px
<h2 className="text-h2">        // 28px → 36px → 48px
<p className="text-body">       // 16px (consistent)

// Use responsive spacing
<section className="section-padding">  // py-12 → py-16 → py-24 → py-32
<div className="container-padding">    // px-4 → px-6 → px-8
<div className="card-padding">         // p-6 → p-8

// Use pre-built grids
<FeatureGrid>     // 1 → 2 → 3 cols
<LogoGrid>        // 2 → 4 → 6 cols
<PricingGrid>     // stack → 3 cols
<FooterGrid>      // 1 → 2 → 4 cols
<AsymmetricGrid>  // stack → 60/40
```

---

## 📚 Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs/responsive-design
- **Touch Target Size:** https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- **Mobile-First Design:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/Mobile_first

---

**Last Updated:** 2026-02-26
**Maintained by:** @swarm-frontend + @swarm-ux
