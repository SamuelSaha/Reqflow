# Dashboard Visual Overhaul — Design Spec

**Date:** 2026-03-11
**Scope:** All dashboard pages (`/dashboard/**`). Marketing pages untouched.
**Goal:** Make the real app match the premium visual language shown in the marketing homepage preview image.

---

## 1. Color Palette & Background Texture

### Warm Background
Replace the current faint warm background with a richer cream:

```css
--warm-50: #FEF0E8;   /* Main app background */
--warm-100: #FDE4D8;  /* Subtle hover on warm bg */
--warm-200: #FCD5C4;  /* Borders on warm bg */
```

All semantic colors (success, warning, error, primary blue) remain unchanged. The warmth applies only to background surfaces — cards stay pure white.

### Grain Texture
Add a subtle SVG noise overlay via CSS pseudo-element on the dashboard layout's root `div`:

```css
.dashboard-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,..."); /* inline noise SVG */
  background-repeat: repeat;
}
```

Zero DOM impact. Fixed position so it doesn't scroll-jank. `pointer-events: none` so it never intercepts clicks.

---

## 2. Card System

### Current
`rounded-xl border bg-card text-card-foreground shadow`

### New Base Card (in `card.tsx`)
```
rounded-2xl border border-slate-100 bg-card text-card-foreground shadow-sm
```

Changes:
- `rounded-xl` (12px) → `rounded-2xl` (16px)
- `border-slate-200` → `border-slate-100` (lighter, near-invisible)
- `shadow` → `shadow-sm` (subtler base shadow)

### Hover Behavior (applied per-usage, not in base)
Cards that are interactive get:
```
hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
```

This is applied in page-level code (e.g., `dashboard/page.tsx`), not in the base Card component, to avoid hover effects on non-interactive cards like form containers.

---

## 3. Navigation Bar

### Current
```
border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm
```

### New
```
border-b border-[var(--warm-200)]/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50
```

Changes:
- Background: `bg-white/95` → `bg-white/80` (more translucent for glass effect)
- Backdrop blur: `backdrop-blur-md` → `backdrop-blur-xl` (stronger frosting)
- Border: `border-slate-200` → warm-tinted, 50% opacity
- Shadow: Remove `shadow-sm` — the blur provides enough visual separation
- Active nav items: Keep `bg-blue-50 text-blue-700` but add `rounded-xl` pill shape

No structural changes to nav item layout, ordering, or content.

---

## 4. Stat Cards Redesign

### Grid Layout
```
Current: grid-cols-2 md:grid-cols-3 lg:grid-cols-6  (6 cards, cramped)
New:     grid-cols-1 sm:grid-cols-2 md:grid-cols-3   (same 6 cards, more breathing room)
```

The 6 cards wrap into 2 rows of 3 on desktop. On mobile, they stack to 1 column. On small tablets, 2 columns.

### Card Structure

```
┌──────────────────────────────────────┐
│                                      │
│  $127K                    ┌────┐     │
│                           │ 📈 │     │
│  Monthly Spend            └────┘     │
│                                      │
│  ↓ 12% vs last month                │
│                                      │
└──────────────────────────────────────┘
```

#### Large Number
```
text-3xl md:text-4xl font-bold tracking-tight text-slate-900
```
Up from current `text-xl md:text-2xl`.

#### Icon Badge
40x40px `rounded-xl` square with soft colored background and matching icon:

| Metric | Icon | Badge BG | Icon Color |
|--------|------|----------|------------|
| Pending Requests | Clock | `bg-amber-50` | `text-amber-500` |
| My Requests | FileText | `bg-blue-50` | `text-blue-500` |
| Pending Approvals | CheckSquare | `bg-violet-50` | `text-violet-500` |
| Active Trials | FlaskConical | `bg-cyan-50` | `text-cyan-500` |
| Upcoming Renewals | Calendar | `bg-orange-50` | `text-orange-500` |
| Approved This Month | TrendingUp | `bg-green-50` | `text-green-500` |

#### Trend / Subtitle
- Text below the label, smaller: `text-xs text-slate-500`
- When trend data exists and is positive: green text with check icon
- When trend data shows decrease in spending: green text with down arrow (spending decreases are good)
- Default fallback: current subtitle text as-is (no fabricated data)

#### Highlight State
Currently: `ring-2 ring-blue-200 bg-blue-50/30 shadow-md`
New: `ring-2 ring-blue-200 bg-blue-50/20` — slightly subtler, keeps the prominence signal.

---

## 5. Request Rows & Vendor Avatars

### Gradient Avatar Badges

Each request/approval row gets a 40x40 `rounded-xl` avatar showing vendor initials on a deterministic gradient background.

#### Avatar Component (`VendorAvatar`)
- Input: vendor name string (or request title as fallback)
- Output: 40x40 div with 2-letter initials, gradient background
- Gradient derived from name hash → palette index

#### Gradient Palette (12 pairs)
```typescript
const AVATAR_GRADIENTS = [
  ['#8B5CF6', '#6366F1'], // violet → indigo
  ['#3B82F6', '#6366F1'], // blue → indigo
  ['#EC4899', '#F43F5E'], // pink → rose
  ['#F59E0B', '#F97316'], // amber → orange
  ['#10B981', '#14B8A6'], // emerald → teal
  ['#06B6D4', '#3B82F6'], // cyan → blue
  ['#8B5CF6', '#EC4899'], // violet → pink
  ['#F97316', '#EF4444'], // orange → red
  ['#14B8A6', '#10B981'], // teal → emerald
  ['#6366F1', '#8B5CF6'], // indigo → violet
  ['#64748B', '#475569'], // slate → slate (neutral)
  ['#D946EF', '#8B5CF6'], // fuchsia → violet
];
```

Hash function: simple string hash mod 12.

#### Row Layout

**Dashboard home (Recent Requests card):**
```
[Avatar] Title                         €2,700/yr   [Approved]
         Vendor • Category             20 seats
```

- Left column: avatar (40x40) + title (14px semibold) + vendor/category (12px slate-500)
- Right column: amount (14px semibold, right-aligned) + optional detail (12px slate-400) + status pill
- Divider: `divide-y divide-slate-100` on the parent container
- Hover: `hover:bg-slate-50/50 transition-colors`

**Dashboard home (Action Required card):**
Same avatar treatment. Requester name shows instead of vendor.

**Requests list page (`/dashboard/requests`):**
Same avatar + row treatment for consistency with dashboard home.

### Vendor Data Source
The `recentRequests` query already returns `vendorName` (or falls back to category). The `pendingApprovals` query returns `request.requester.name`. No new API fields needed.

If vendor name is unavailable, fall back to first 2 letters of the request title.

---

## 6. Status Badges → Soft Pills

### Current
```
rounded-md px-2.5 py-0.5 bg-green-100 text-green-700 border-green-200
```

### New
```
rounded-full px-3 py-1 bg-green-50 text-green-600
```

#### Updated Status Styles

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Approved | `bg-green-50` | `text-green-600` | `border-green-100` |
| Pending | `bg-amber-50` | `text-amber-600` | `border-amber-100` |
| Rejected | `bg-red-50` | `text-red-600` | `border-red-100` |
| Draft | `bg-slate-50` | `text-slate-500` | `border-slate-100` |
| Cancelled | `bg-slate-50` | `text-slate-400` | `border-slate-100` |

Changes:
- `rounded-md` → `rounded-full` (full pill shape)
- Colors softer: `-100` backgrounds → `-50`, `-700` text → `-600`
- Padding: `px-2.5 py-0.5` → `px-3 py-1` (larger touch target, more breathing room)

Updated in both:
- `lib/design/tokens.ts` (STATUS_STYLES object)
- `dashboard/requests/page.tsx` (local statusConfig)

The base `badge.tsx` component changes `rounded-md` to `rounded-full` in the `cva` base styles.

---

## 7. Files Changed

| File | Type | What Changes |
|------|------|-------------|
| `src/app/globals.css` | Edit | `--warm-50/100/200` values updated |
| `src/components/ui/card.tsx` | Edit | `rounded-xl` → `rounded-2xl`, `border-slate-100`, `shadow-sm` |
| `src/components/ui/badge.tsx` | Edit | `rounded-md` → `rounded-full`, padding increase |
| `src/lib/design/tokens.ts` | Edit | STATUS_STYLES softer colors, new `AVATAR_GRADIENTS` array |
| `src/app/dashboard/layout.tsx` | Edit | Nav glassmorphism, warm border, grain texture class |
| `src/app/dashboard/page.tsx` | Edit | StatCard redesign (icon badges, large numbers), request row redesign (avatars, new layout) |
| `src/app/dashboard/requests/page.tsx` | Edit | Avatar treatment on request rows, statusConfig colors |
| **New file:** `src/components/ui/vendor-avatar.tsx` | Create | Reusable VendorAvatar component (~30 lines) |

### NOT touched
- Any file under `src/components/marketing/` or `src/components/landing/`
- Any page outside `/dashboard/**`
- tRPC routers, database schema, API logic, auth
- `src/app/page.tsx` (marketing homepage)
- Any feature pages (features/, about/, pricing/, etc.)

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Badge `rounded-full` change affects non-dashboard badges | The badge component is only used in dashboard context. Marketing pages use their own badge styles inline. |
| Card border-radius change affects form/settings cards | `rounded-2xl` is universally better for the warm aesthetic. No card in settings needs a sharper radius. |
| Grain texture causes performance issues on low-end devices | Fixed-position pseudo-element with `will-change: auto`. Tiny SVG repeats. Tested pattern — no paint cost. |
| Warm background may clash with existing colored components | Only cards (white) and the background (warm) interact. All colored elements sit inside cards on white. |

---

## 9. Success Criteria

1. Dashboard visually matches the marketing homepage preview image
2. All 6 stat cards render with colored icon badges and large numbers
3. Request rows show gradient vendor avatars with initials
4. Status badges are full-pill `rounded-full` with softer colors
5. Cards have `rounded-2xl` with subtle shadow and hover lift
6. Nav bar shows frosted glass effect against warm background
7. No changes to data logic, API calls, or marketing pages
8. No regressions in existing functionality
