# Dashboard Visual Overhaul — Design Spec

**Date:** 2026-03-11
**Scope:** All dashboard pages (`/dashboard/**`). Marketing page files are not edited.
**Goal:** Make the real app match the premium visual language shown in the marketing homepage preview image.

---

## 1. Color Palette & Background Texture

### Warm Background — Dashboard-Scoped

The global `--warm-50: #fff9f5` is used by 17+ marketing components and **must not change**. Instead, override it within the dashboard layout tree using a scoped class.

In `globals.css`, add:
```css
.dashboard-bg {
  --warm-50: #FEF0E8;
  --warm-100: #FDE4D8;
  --warm-200: #FCD5C4;   /* NEW variable — does not exist globally */
}
```

In `dashboard/layout.tsx`, the root `div` already has `bg-[var(--warm-50)]`. Add the `dashboard-bg` class to it:
```html
<div className="min-h-screen bg-[var(--warm-50)] dashboard-bg">
```

This overrides `--warm-50` only for the dashboard subtree. Marketing pages keep `#fff9f5`. `--warm-200` is a new variable scoped to `.dashboard-bg` only.

### Grain Texture

Add a CSS pseudo-element to `.dashboard-bg`:
```css
.dashboard-bg {
  position: relative;
}
.dashboard-bg::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

200x200px tile, `feTurbulence` fractalNoise, baseFrequency 0.65, 3 octaves, stitched edges. At 2.5% opacity this produces a subtle paper-grain feel. Fixed position avoids scroll-jank. `pointer-events: none` prevents click interception.

Ensure `.dashboard-bg` children have a stacking context above the grain layer. The header already has `z-50`. The `<main>` element in `dashboard/layout.tsx` currently has NO position or z-index — **add `relative z-10`** to it so content renders above the grain pseudo-element.

---

## 2. Card System

### Current (actual `card.tsx` line 12)
```
rounded-xl border bg-card text-card-foreground shadow
```
Note: The current `border` uses Tailwind's default border color (theme `borderColor`), not an explicit `border-slate-200` class.

### New Base Card (in `card.tsx`)
```
rounded-2xl border border-slate-100 bg-card text-card-foreground shadow-sm
```

Changes:
- `rounded-xl` (12px) → `rounded-2xl` (16px)
- Add explicit `border-slate-100` (lighter than Tailwind's default border color)
- `shadow` → `shadow-sm` (subtler base shadow)

**Cross-cutting impact:** This change is global and will affect login, signup, pricing, and all other pages using the Card component. This is intentional — the user stated "I want the whole app to adopt this color code and texture." Rounder, softer cards are an improvement across the board. No marketing page FILES are edited.

### Hover Behavior (applied per-usage, not in base)
Dashboard cards that are interactive already have `shadow-sm hover:shadow-md transition-shadow`. The change is:
- Replace `transition-shadow` → `transition-all duration-200`
- Add `hover:-translate-y-0.5` (the new 2px lift effect)

The base Card component does NOT get hover behavior — it stays in page-level code.

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
- Border: `border-slate-200` → `border-[var(--warm-200)]/50` — warm-tinted, 50% opacity. Since `--warm-200` is scoped to `.dashboard-bg`, this only applies inside the dashboard layout.
- Shadow: Remove `shadow-sm` — the blur provides enough visual separation
- Active nav items: Keep `bg-blue-50 text-blue-700`, change from `rounded-lg` to `rounded-xl` (12px — a softer rectangle, not a full pill)

No structural changes to nav item layout, ordering, or content.

---

## 4. Stat Cards Redesign

### Grid Layout
```
Current: grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-6
New:     grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6
```

The 6 cards wrap into 2 rows of 3 on desktop. On mobile, 1 column. On small tablets, 2 columns. Gap values: 16px → 20px → 24px across breakpoints.

### Card Structure

```
┌──────────────────────────────────────┐
│                                      │
│  5                        ┌────┐     │
│                           │ ⏱  │     │
│  Pending Requests         └────┘     │
│                                      │
│  Awaiting approval                   │
│                                      │
└──────────────────────────────────────┘
```

Note: The mockup uses the actual app's metrics (not "$127K" from the marketing image). Currency remains EUR (€) consistent with the codebase.

#### Large Number
```
text-3xl md:text-4xl font-bold tracking-tight text-slate-900
```
Up from current `text-xl md:text-2xl`.

When `loading` is true, show existing `InlineLoader` behavior (no change to loading logic).

#### Icon Badge
`h-10 w-10 rounded-xl` (40x40px) with soft colored background and matching icon (`h-5 w-5`):

| Metric | Icon | Badge BG | Icon Color |
|--------|------|----------|------------|
| Pending Requests | Clock | `bg-amber-50` | `text-amber-500` |
| My Requests | FileText | `bg-blue-50` | `text-blue-500` |
| Pending Approvals | CheckSquare | `bg-violet-50` | `text-violet-500` |
| Active Trials | FlaskConical | `bg-cyan-50` | `text-cyan-500` |
| Upcoming Renewals | Calendar | `bg-orange-50` | `text-orange-500` |
| Approved This Month | TrendingUp | `bg-green-50` | `text-green-500` |

#### StatCard Component Props Update

Current props: `title, value, icon, subtitle, highlight?, loading?`

New props: `title, value, icon, subtitle, highlight?, loading?, iconBg, iconColor`

The icon badge styling is passed explicitly via two new props. The mapping from metric → colors is defined as a lookup object in `dashboard/page.tsx` at the call site, not inside StatCard:

```typescript
const STAT_ICON_STYLES = {
  pendingRequests: { iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  myRequests:      { iconBg: 'bg-blue-50',  iconColor: 'text-blue-500' },
  // ... etc.
};
```

#### Trend / Subtitle
No trend data is available from the current API. The subtitle line always renders the existing subtitle text as-is:
- "Awaiting approval", "Total submitted", "Require your review", etc.
- The subtitle uses `text-xs text-slate-500 mt-1` (same as current but explicit)

The trend feature (green arrows, % comparisons) is deferred to a future phase when the API provides month-over-month data. The mockup examples showing "12% vs last month" are aspirational only and NOT implemented in this phase.

#### Highlight State
Current: `ring-2 ring-blue-200 bg-blue-50/30 shadow-md`
New: `ring-2 ring-blue-200 bg-blue-50/20` — slightly subtler. The icon badge retains its own bg color when highlighted (no change to icon badge appearance on highlight).

---

## 5. Request Rows & Vendor Avatars

### Gradient Avatar Badges

Each request/approval row gets an `h-10 w-10 rounded-xl` avatar showing vendor initials on a deterministic gradient background.

#### New Component: `VendorAvatar`

**File:** `src/components/ui/vendor-avatar.tsx` (~40 lines)

**Props:**
```typescript
interface VendorAvatarProps {
  name: string;          // Vendor name, requester name, or request title
  className?: string;    // Optional size/shape override
}
```

**Initials extraction:**
1. Split `name` by spaces
2. If 2+ words: take first character of first two words, uppercase
3. If 1 word: take first two characters, uppercase
4. Fallback: "??"

**Hash function:**
```typescript
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
```
Index into gradient palette: `hashString(name) % 12`

**Gradient direction:** `linear-gradient(135deg, color1, color2)` — top-left to bottom-right diagonal.

**Text styling:** `text-white text-xs font-semibold` — white initials on gradient, 12px bold.

**Rendering:**
```tsx
<div
  className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", className)}
  style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
>
  <span className="text-white text-xs font-semibold">{initials}</span>
</div>
```

#### Gradient Palette (12 pairs)
Defined in `lib/design/tokens.ts` as `AVATAR_GRADIENTS`:
```typescript
export const AVATAR_GRADIENTS: [string, string][] = [
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

#### Row Layout — Dashboard Home (Recent Requests)

**Current layout:** `title + requestNumber/amount + statusBadge` on a single line.

**New layout:** Avatar + stacked title/subtitle + right-aligned amount/detail + status pill.

The new row renders fields that are already returned by the API but not currently displayed:
- `vendorName` → shown as subtitle (falls back to request category, then first 2 words of title)
- `category` → shown after vendor with dot separator

```
┌──────────────────────────────────────────────────────────────┐
│ [Avatar]  Title text here                  €2,700    [Pill]  │
│           Vendor • Category                                  │
└──────────────────────────────────────────────────────────────┘
```

- Avatar: `VendorAvatar` component (40x40)
- Title: `text-sm font-medium text-slate-900 truncate` (existing)
- Subtitle: `text-xs text-slate-500` — `{vendorName || category} • {requestNumber}`
- Amount: `text-sm font-semibold text-slate-900` (right-aligned)
- Status pill: Badge with pill styling (see Section 6)
- Row container: `flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors`
- Parent container: `divide-y divide-slate-100` for subtle dividers between rows

#### Row Layout — Dashboard Home (Action Required)

Same as above, but:
- Avatar uses `approval.request.requester.name` instead of vendor
- Subtitle shows requester name + amount

#### Row Layout — Requests List Page (`/dashboard/requests`)

Same avatar + row treatment applied to the request rows for visual consistency.

### Loading Skeletons

Update the skeleton pattern to match the new row layout:
```
[Circle skeleton h-10 w-10 rounded-xl]  [Line skeleton w-3/4 h-4]    [Line skeleton w-16 h-4]   [Pill skeleton w-14 h-5 rounded-full]
                                         [Line skeleton w-1/3 h-3]
```

This replaces the current skeleton which only has text lines and a badge placeholder.

---

## 6. Status Badges → Soft Pills

### Approach: New Badge Variant (not changing default)

The base `badge.tsx` is used by marketing pages (e.g., `PricingTable.tsx`). To avoid affecting those, add a new `pill` variant instead of changing the `default` variant.

In `badge.tsx`, add to the `cva` variants:
```typescript
pill: "border-transparent rounded-full px-3 py-1",
```

Dashboard code passes `variant="pill"` alongside the existing `className` color overrides. The default `rounded-md px-2.5 py-0.5` variant stays untouched for non-dashboard usage.

#### Updated Status Styles (in `lib/design/tokens.ts`)

The `className` values in STATUS_STYLES change to use softer colors and include `rounded-full`:

| Status | className (colors only) |
|--------|------------------------|
| Approved | `bg-green-50 text-green-600 border-green-100` |
| Pending | `bg-amber-50 text-amber-600 border-amber-100` |
| Rejected | `bg-red-50 text-red-600 border-red-100` |
| Draft | `bg-slate-50 text-slate-500 border-slate-100` |
| Cancelled | `bg-slate-50 text-slate-400 border-slate-100` |

The pill shape (`rounded-full px-3 py-1`) is provided by `variant="pill"` on the Badge component, NOT in the className. This avoids redundancy — STATUS_STYLES handles colors, the variant handles shape.

Changes from current:
- Backgrounds: `-100` → `-50` (softer)
- Text colors: `-700` → `-600` (slightly lighter)
- Shape: provided by `variant="pill"` at the Badge call site, not in className

The existing `bg`, `text`, `border` object properties in STATUS_STYLES (e.g., `bg: COLORS.warning[100]`) are NOT used anywhere in the codebase — only `.className` and `.label` are consumed. These structured properties are left unchanged to avoid unnecessary churn; they may be removed in a future cleanup.

The `dashboard/requests/page.tsx` local `statusConfig` object is updated to match the softer colors. All Badge usages in dashboard pages must also pass `variant="pill"`.

---

## 7. Files Changed

| File | Type | What Changes |
|------|------|-------------|
| `src/app/globals.css` | Edit | Add `.dashboard-bg` scoped class with warm variable overrides + grain texture pseudo-element |
| `src/components/ui/card.tsx` | Edit | `rounded-xl` → `rounded-2xl`, add `border-slate-100`, `shadow` → `shadow-sm` |
| `src/components/ui/badge.tsx` | Edit | Add new `pill` variant to cva (default variant unchanged) |
| `src/lib/design/tokens.ts` | Edit | STATUS_STYLES softer colors + `rounded-full`, new `AVATAR_GRADIENTS` array |
| `src/app/dashboard/layout.tsx` | Edit | Add `dashboard-bg` class to root div, nav glassmorphism, warm border |
| `src/app/dashboard/page.tsx` | Edit | StatCard redesign (icon badges + `iconBg`/`iconColor` props, large numbers, grid change, hover lift), request row redesign (avatars, new 2-line layout, dividers), updated skeleton states |
| `src/app/dashboard/requests/page.tsx` | Edit | Avatar treatment on request rows, statusConfig colors updated to pill style |
| **New:** `src/components/ui/vendor-avatar.tsx` | Create | Reusable VendorAvatar component (~40 lines) with gradient palette, hash function, initials extraction |

### Global impact (intentional, not file edits)
- `card.tsx` change (`rounded-2xl`, `shadow-sm`, `border-slate-100`) propagates to all Card usages including login, signup, pricing pages. This is accepted as a net positive. No marketing page FILES are edited.

### NOT touched (no file edits)
- Any file under `src/components/marketing/` or `src/components/landing/`
- Any page outside `/dashboard/**` (except global component changes above)
- tRPC routers, database schema, API logic, auth
- `src/app/page.tsx` (marketing homepage)
- `globals.css` global `--warm-50` / `--warm-100` values (kept at `#fff9f5` / `#fef8f0`)

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `--warm-50` override leaks to marketing | Scoped to `.dashboard-bg` class — only applied on the dashboard layout root div. Global `--warm-50` untouched. |
| Badge `rounded-full` affects marketing `PricingTable.tsx` | New `pill` variant added; default variant unchanged. Marketing Badge usage unaffected. |
| Card `rounded-2xl` affects non-dashboard pages (login, pricing) | Intentional — rounder cards are universally better. If any page needs `rounded-xl`, it can override via `className`. |
| Grain texture performance on low-end devices | Fixed-position pseudo-element, 200x200 tiled SVG, 2.5% opacity. Negligible paint cost. |
| Warm background clashes with colored components | All colored elements sit inside white cards. Only the bg surface is warm. |
| `VendorAvatar` missing vendor name data | Falls back to category, then title initials. Always produces a usable avatar. |

---

## 9. Success Criteria

1. Dashboard background is visibly warmer than marketing pages, with subtle grain texture
2. All 6 stat cards render with colored `h-10 w-10 rounded-xl` icon badges and large (`text-3xl`+) numbers
3. Request/approval rows show gradient vendor avatars with 2-letter initials
4. Status badges are full-pill (`rounded-full`) with softer `-50` background colors
5. Cards globally have `rounded-2xl` with `shadow-sm` base and `border-slate-100`
6. Nav bar shows frosted glass effect (`bg-white/80 backdrop-blur-xl`) against warm background
7. Marketing page files are not modified; global `--warm-50` CSS variable is unchanged
8. Loading skeletons match the new row layout (avatar placeholder + text lines)
9. No changes to data logic, API calls, or auth
10. No regressions in existing dashboard functionality
