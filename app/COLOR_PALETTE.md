# Reqflow Color Palette

This document defines the official color palette extracted from the design PDF and implemented across the landing page.

## Color System

The design uses **Tailwind CSS Slate** colors for neutral tones and **Blue-600** as the primary brand color.

---

## Primary Colors

### Brand Blue
- **blue-600**: `#2563EB` - Primary action buttons, links, active states
- **blue-700**: `#1D4ED8` - Hover states for primary buttons
- **blue-50**: `#EFF6FF` - Light backgrounds for badges/highlights

### Dark Navy (Headers/Footer)
- **slate-900**: `#0F172A` - Dark backgrounds, primary headings
- **slate-800**: `#1E293B` - Slightly lighter dark backgrounds

---

## Text Colors

### Primary Text
- **slate-900**: `#0F172A` - Headings, primary text
- **slate-800**: `#1E293B` - Strong secondary text
- **slate-700**: `#334155` - Regular body text emphasis
- **slate-600**: `#475569` - Body text, muted content
- **slate-500**: `#64748B` - Labels, secondary information
- **slate-400**: `#94A3B8` - Disabled text, placeholders

---

## Background Colors

### Light Backgrounds
- **white**: `#FFFFFF` - Primary background
- **slate-50**: `#F8FAFC` - Light section backgrounds
- **slate-100**: `#F1F5F9` - Cards, subtle backgrounds

### Borders
- **slate-200**: `#E2E8F0` - Primary borders, dividers
- **slate-100**: `#F1F5F9` - Subtle dividers

---

## Status Colors

### Success/Positive
- **green-500**: `#10B981` - Success states, positive metrics, checkmarks
- **green-600**: `#059669` - Green hover states
- **green-100**: `#D1FAE5` - Light green backgrounds
- **green-50**: `#ECFDF5` - Very light green backgrounds

### Warning/Caution
- **amber-500**: `#F59E0B` - Warning states, pending items
- **amber-600**: `#D97706` - Amber hover states
- **amber-100**: `#FEF3C7` - Light amber backgrounds
- **amber-50**: `#FFFBEB` - Very light amber backgrounds

### Error/Alert
- **red-500**: `#EF4444` - Error states, critical alerts
- **red-600**: `#DC2626` - Red hover states
- **red-100**: `#FEE2E2` - Light red backgrounds
- **red-50**: `#FEF2F2` - Very light red backgrounds

---

## Usage Guidelines

### Primary Actions
```tsx
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Get Started
</button>
```

### Text Hierarchy
```tsx
<h1 className="text-slate-900">Main Heading</h1>
<p className="text-slate-600">Body text</p>
<span className="text-slate-400">Disabled text</span>
```

### Status Badges
```tsx
<span className="bg-green-100 text-green-800">Approved</span>
<span className="bg-amber-100 text-amber-800">Pending</span>
<span className="bg-red-100 text-red-800">Rejected</span>
```

### Backgrounds & Borders
```tsx
<div className="bg-slate-50 border border-slate-200">
  <div className="bg-white">Card content</div>
</div>
```

---

## Dark Section (Footer)

The footer uses a dark slate background:
- **Background**: `#0F172A` (slate-900)
- **Text**: `#CBD5E1` (slate-300)
- **Muted Text**: `#64748B` (slate-500)

```tsx
<footer className="bg-slate-900 text-slate-300">
  <span className="text-slate-500">Muted text</span>
</footer>
```

---

## Gradients

### Hero Background
```tsx
className="bg-gradient-to-b from-white via-blue-50/60 to-blue-100"
```

### Section Transitions
```tsx
className="bg-gradient-to-b from-slate-50 via-white to-slate-50"
```

---

## Color Extraction Source

Colors were extracted from: `/Users/samuelsaha/Downloads/Reqflow Landing Page.pdf`

**Analysis Date**: February 24, 2026
**Primary Blue**: `#2563EB` (4.32% usage in design)
**Dark Navy**: `#0F172A` (7.09% usage in design)
**Background White**: `#FFFFFF` (15.99% usage in design)
**Light Slate**: `#F8FAFC` (7.03% usage in design)

---

## Tailwind Config

Ensure your `tailwind.config.js` has the default Slate colors enabled:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Slate is included by default in Tailwind v3+
        // No custom configuration needed
      }
    }
  }
}
```

---

## Do Not Use

❌ **Avoid these color variants** (use Slate instead):
- `gray-*` classes (use `slate-*`)
- `neutral-*` classes (use `slate-*`)
- Custom blue colors (use `blue-600`)

✅ **Consistent palette**:
- Always use `slate-*` for neutrals
- Always use `blue-600` for primary actions
- Always use semantic colors (`green`, `amber`, `red`) for statuses
