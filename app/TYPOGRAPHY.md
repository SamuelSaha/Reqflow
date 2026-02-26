# Typography System

**Design System:** Manrope (Google Fonts)
**Implementation:** CSS Custom Properties + Utility Classes
**Version:** 1.0.0

---

## 📐 Type Scale

### Desktop Scale (1280px+)

| Level | Size | Weight | Line Height | Letter Spacing | Class |
|-------|------|--------|-------------|----------------|-------|
| **Hero/H1** | 72px | 600 (Semibold) | 1.1 | -0.02em (tight) | `.text-hero` |
| **H2** | 48px | 600 (Semibold) | 1.2 | -0.01em (tight) | `.text-h2` |
| **H3** | 36px | 600 (Semibold) | 1.3 | 0 | `.text-h3` |
| **H4** | 24px | 600 (Semibold) | 1.4 | 0 | `.text-h4` |
| **H5** | 20px | 500 (Medium) | 1.5 | 0 | `.text-h5` |
| **Body Large** | 18px | 400 (Regular) | 1.7 (relaxed) | 0 | `.text-body-lg` |
| **Body** | 16px | 400 (Regular) | 1.6 (relaxed) | 0 | `.text-body` |
| **Body Small** | 14px | 400 (Regular) | 1.5 | 0 | `.text-body-sm` |
| **Caption** | 12px | 500 (Medium) | 1.4 | 0.05em (wide) | `.text-caption` |

### Tablet Scale (768px-1023px)

| Level | Size |
|-------|------|
| **Hero/H1** | 48px |
| **H2** | 36px |
| **H3** | 28px |
| **H4** | 24px |
| **H5** | 20px |

### Mobile Scale (< 768px)

| Level | Size |
|-------|------|
| **Hero/H1** | 36px |
| **H2** | 28px |
| **H3** | 24px |
| **H4** | 20px |
| **H5** | 18px |

---

## 🎨 Color Pairings

### Light Mode (Default)

| Context | Color | Tailwind Class | Hex |
|---------|-------|----------------|-----|
| **Headlines** | Slate 900 | `text-slate-900` | `#0F172A` |
| **Body Text** | Slate 700 | `text-slate-700` | `#334155` |
| **Muted Text** | Slate 500 | `text-slate-500` | `#64748B` |
| **Disabled** | Slate 400 | `text-slate-400` | `#94A3B8` |

### Dark Mode (Dark Backgrounds)

| Context | Color | Tailwind Class | Hex |
|---------|-------|----------------|-----|
| **Headlines** | Slate 100 | `text-slate-100` | `#F1F5F9` |
| **Body Text** | Slate 300 | `text-slate-300` | `#CBD5E1` |
| **Muted Text** | Slate 400 | `text-slate-400` | `#94A3B8` |

---

## ♿ Accessibility

### WCAG AA Contrast Ratios (4.5:1 minimum for body text)

| Combination | Contrast Ratio | WCAG Level |
|-------------|----------------|------------|
| Slate 900 on White | 16.9:1 | AAA ✅ |
| Slate 700 on White | 10.5:1 | AAA ✅ |
| Slate 500 on White | 4.6:1 | AA ✅ |
| Slate 100 on Slate 900 | 15.3:1 | AAA ✅ |

### Font Size Minimums

- **Body text minimum:** 16px (default)
- **Small text minimum:** 14px (captions, metadata)
- **Never smaller than:** 12px (accessibility baseline)

---

## 📦 Font Weights

Manrope is loaded with three weights:

- **400 (Regular):** Body text, paragraphs
- **500 (Medium):** H5, captions, emphasis
- **600 (Semibold):** Headlines (H1-H4), buttons

**Do not use:**
- 300 (Light) - not loaded
- 700+ (Bold) - not loaded, use 600 instead

---

## 💻 Usage Examples

### Hero Section

```tsx
<h1 className="text-hero text-slate-900">
  Procurement for teams that move too fast
</h1>
<p className="text-body-lg text-slate-700">
  Stop losing invoices in Slack threads.
</p>
```

### Content Section

```tsx
<h2 className="text-h2 text-slate-900">
  Built for real workflows
</h2>
<h3 className="text-h3 text-slate-900">
  Feature Name
</h3>
<p className="text-body text-slate-700 leading-relaxed">
  Body paragraph with comfortable line height.
</p>
```

### Card Components

```tsx
<div className="bg-white rounded-xl p-8">
  <h4 className="text-h4 text-slate-900 mb-2">
    Card Title
  </h4>
  <p className="text-body-sm text-slate-600">
    Supporting description text.
  </p>
</div>
```

### Dark Backgrounds

```tsx
<section className="bg-slate-900 p-20">
  <h2 className="text-h2 text-slate-100">
    Dark Mode Headline
  </h2>
  <p className="text-body-lg text-slate-300">
    Body text on dark background.
  </p>
</section>
```

---

## 🔧 Implementation Details

### CSS Custom Properties

Typography scales responsively using CSS variables:

```css
:root {
  --text-hero: 36px;  /* Mobile */
  --text-h2: 28px;
  /* ... */
}

@media (min-width: 768px) {
  :root {
    --text-hero: 48px;  /* Tablet */
    --text-h2: 36px;
    /* ... */
  }
}

@media (min-width: 1024px) {
  :root {
    --text-hero: 60px;  /* Desktop */
    --text-h2: 48px;
    /* ... */
  }
}

@media (min-width: 1280px) {
  :root {
    --text-hero: 72px;  /* Large Desktop */
    /* ... */
  }
}
```

### Utility Classes

Each level has a dedicated utility class:

```css
.text-hero {
  font-size: var(--text-hero);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
```

### Font Loading

Manrope is loaded via Next.js Font Optimization:

```tsx
import { Manrope } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
```

---

## 📋 Checklist for New Components

When building new components:

- [ ] Use semantic utility classes (`.text-hero`, `.text-h2`, etc.)
- [ ] Apply correct color pairings (`text-slate-900` for headlines)
- [ ] Add `leading-relaxed` for body text readability
- [ ] Use `tracking-tight` for large headlines (optional, built into `.text-hero`)
- [ ] Test at mobile, tablet, and desktop breakpoints
- [ ] Verify contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] Use appropriate font weights (400 body, 500 medium, 600 headlines)

---

## 🚫 Anti-Patterns (Don't Do This)

```tsx
// ❌ Bad - inline font-size, breaks responsive scaling
<h1 className="text-[72px]">Headline</h1>

// ❌ Bad - wrong weight (not loaded)
<h1 className="font-bold">Headline</h1>

// ❌ Bad - poor contrast
<p className="text-slate-400">Body text</p>

// ❌ Bad - too small
<p className="text-[10px]">Tiny text</p>

// ✅ Good - semantic class, responsive
<h1 className="text-hero text-slate-900">Headline</h1>

// ✅ Good - correct weight
<h1 className="font-semibold">Headline</h1>  // 600

// ✅ Good - WCAG AA compliant
<p className="text-slate-700">Body text</p>

// ✅ Good - minimum size
<p className="text-caption text-slate-500">METADATA</p>
```

---

## 📚 Related Documentation

- [Color System](./COLOR_PALETTE.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Component Guidelines](./COMPONENT_GUIDELINES.md)

---

**Last Updated:** 2026-02-26
**Maintained By:** Design System Team
