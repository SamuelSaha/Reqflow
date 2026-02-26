# Reqflow Design System

## 🎨 Color Palette

### Brand Colors (App)

**Primary Blue**
- `blue-600` (#2563EB) - Primary actions, CTAs, links
- `blue-700` (#1D4ED8) - Hover states

**Neutral Slate**
- `slate-900` (#0F172A) - Primary text, headings
- `slate-600` (#475569) - Secondary text
- `slate-300` (#CBD5E1) - Borders
- `slate-100` (#F1F5F9) - Subtle backgrounds
- `slate-50` (#F8FAFC) - Light backgrounds

**Accent**
- `violet` - Premium features (Case Builder)

---

### Marketing Site Warm Palette

**Warm Neutral Backgrounds**
- `warm-50` (#FFF9F5) - Primary warm background
- `warm-100` (#FEF8F0) - Soft amber variant

**Usage**
- Hero sections: `background="warm"`
- Alternating sections: `warm → white → warm` pattern
- Cards on warm: White backgrounds for contrast
- CTAs: Keep `blue-600` for brand consistency

**CSS Variables**
```css
--warm-50: #fff9f5;
--warm-100: #fef8f0;
```

**Tailwind Classes**
```tsx
<Section background="warm">
  {/* Content */}
</Section>

<div className="bg-[var(--warm-50)]">
  {/* Or use CSS variable directly */}
</div>
```

---

## ♿ WCAG Contrast Ratios

All combinations meet or exceed WCAG AA (4.5:1) for body text:

| Background | Foreground | Ratio | Rating |
|------------|-----------|-------|--------|
| `warm-50` | `slate-900` | 17.11:1 | AAA ✅ |
| `warm-50` | `slate-600` | 7.26:1 | AA ✅ |
| `warm-50` | `blue-600` | 4.95:1 | AA ✅ |
| `white` | `slate-900` | 17.85:1 | AAA ✅ |

---

## 📐 Typography

**Font Family**: Manrope (400, 500, 600)

**Scale** (Responsive CSS Variables)
- `--text-hero`: 36px → 48px → 60px → 72px
- `--text-h2`: 28px → 36px → 48px
- `--text-h3`: 24px → 28px → 36px
- `--text-body-lg`: 18px
- `--text-body`: 16px
- `--text-body-sm`: 14px

**Usage**
```tsx
<h1 className="text-hero">Headline</h1>
<p className="text-body-lg">Large body text</p>
```

---

## 📏 Spacing

**Section Padding** (Responsive)
- Mobile: `py-12` (48px)
- Tablet: `py-16` (64px)
- Desktop: `py-20` (80px)
- XL: `py-24` (96px)

**Container Max-Width**
- Default: 1280px
- Narrow: 800px
- Wide: 1440px

---

## 🏗️ Layout Components

### Section
```tsx
<Section
  background="warm"     // warm | white | slate | dark | none
  containerSize="default" // default | narrow | wide | full
  noPadding={false}
>
  {children}
</Section>
```

### Container
```tsx
<Container
  size="default"  // default | narrow | wide | full
>
  {children}
</Container>
```

---

## 🎯 Design Patterns

### Alternating Backgrounds
```tsx
<Section background="warm">Hero</Section>
<Section background="white">Features</Section>
<Section background="warm">Testimonials</Section>
<Section background="white">Pricing</Section>
<Section background="warm">CTA</Section>
```

### Cards on Warm Backgrounds
```tsx
<Section background="warm">
  <div className="bg-white rounded-xl p-6 shadow-sm">
    {/* Card content - white on warm for contrast */}
  </div>
</Section>
```

### CTAs
- Primary: `bg-blue-600 hover:bg-blue-700`
- Secondary: `border-2 border-slate-300 hover:bg-slate-50`
- Tertiary: `text-slate-600 hover:text-blue-600`

---

## 🎨 Component Library

- **Navigation**: DesktopNav, MobileNav
- **CTAs**: PrimaryCta, SecondaryCta, TertiaryCta, CtaGroup
- **Social Proof**: UserCount, Rating, NoCreditCard, TrustBadges
- **Layout**: Section, Container, PageShell

---

## 📚 References

- Tailwind CSS v4: Uses CSS variables (@import "tailwindcss")
- shadcn/ui: New York style, slate base color
- Icons: Lucide React
- Inspiration: Mistral's warm cream/beige palette

---

**Last Updated**: 2026-02-26
**Maintained by**: @swarm-frontend + @swarm-ux
