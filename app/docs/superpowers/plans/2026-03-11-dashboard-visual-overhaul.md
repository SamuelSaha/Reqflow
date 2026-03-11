# Dashboard Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dashboard UI match the premium visual language from the marketing homepage preview — warm background, rounded cards, gradient avatars, pill badges, glassmorphism nav.

**Architecture:** Pure visual layer changes. No data logic, API, or auth modifications. Scoped CSS variable overrides prevent marketing page leakage. One new component (`VendorAvatar`), rest are edits to existing files.

**Tech Stack:** Tailwind CSS v4, React 19, shadcn/ui (CVA), Lucide React icons

**Spec:** `docs/superpowers/specs/2026-03-11-dashboard-visual-overhaul-design.md`

**Note:** This is a visual/CSS overhaul — no business logic changes. Steps use visual verification (dev server) instead of unit tests.

---

## Chunk 1: Foundation Layer

### Task 1: CSS Foundation — Warm Background & Grain Texture

**Files:**
- Modify: `src/app/globals.css` (add `.dashboard-bg` class after `:root` media queries)

- [ ] **Step 1: Add `.dashboard-bg` scoped class to `globals.css`**

**IMPORTANT:** The `.dashboard-bg` class must be placed OUTSIDE the `:root {}` block. Insert after line 116 (after the last `:root` media query closing brace), before the `@theme inline` block. Add:

```css
/* Dashboard-scoped warm overrides (does NOT change global --warm-50) */
.dashboard-bg {
  --warm-50: #FEF0E8;
  --warm-100: #FDE4D8;
  --warm-200: #FCD5C4;
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

- [ ] **Step 2: Verify marketing pages unaffected**

Run: `npm run dev`

Open `/` (marketing homepage) — background should still be `#fff9f5` (faint warm).
Open `/dashboard` — background should now be `#FEF0E8` (richer peach).
Confirm the grain texture overlay is visible on dashboard but NOT on marketing page.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add dashboard-scoped warm background with grain texture

Scoped to .dashboard-bg class — global --warm-50 unchanged.
SVG feTurbulence noise at 2.5% opacity for paper-grain feel."
```

---

### Task 2: Card Component — Rounder, Softer

**Files:**
- Modify: `src/components/ui/card.tsx:12` (Card className)

- [ ] **Step 1: Update Card base styles**

In `card.tsx` line 12, change:
```
"rounded-xl border bg-card text-card-foreground shadow",
```
to:
```
"rounded-2xl border border-slate-100 bg-card text-card-foreground shadow-sm",
```

- [ ] **Step 2: Verify card rendering**

Check dashboard, login, and settings pages — cards should appear rounder (16px) with lighter borders and subtler shadows. No visual breakage.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "style: update Card to rounded-2xl with softer shadow and border

Global change — rounder, lighter cards across the entire app.
rounded-xl → rounded-2xl, border-slate-100, shadow → shadow-sm."
```

---

### Task 3: Badge Component — Add Pill Variant

**Files:**
- Modify: `src/components/ui/badge.tsx:7-23` (cva variants)

- [ ] **Step 1: Add `pill` variant to badge cva**

In `badge.tsx`, add a new variant inside the `variants.variant` object (after the `outline` variant on line 17):

```typescript
pill:
  "border-transparent rounded-full px-3 py-1",
```

- [ ] **Step 2: Verify existing badges unchanged**

Check `/dashboard/requests` — status badges should still look the same (they use `default` variant + className override). The new `pill` variant is unused until Tasks 5 and 6.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "style: add pill variant to Badge component

New rounded-full variant with larger padding for dashboard status badges.
Default variant unchanged — marketing Badge usages unaffected."
```

---

### Task 4: Design Tokens — Softer Status Colors + Avatar Gradients

**Files:**
- Modify: `src/lib/design/tokens.ts:88-125` (STATUS_STYLES), add AVATAR_GRADIENTS

- [ ] **Step 1: Update STATUS_STYLES className values**

In `tokens.ts`, make these exact string replacements (one per status). Only the `className` line changes — leave `label`, `bg`, `text`, `border` properties untouched:

Line 95 — change:
```
className: "bg-slate-100 text-slate-700 border-slate-200",
```
to:
```
className: "bg-slate-50 text-slate-500 border-slate-100",
```

Line 102 — change:
```
className: "bg-amber-100 text-amber-700 border-amber-200",
```
to:
```
className: "bg-amber-50 text-amber-600 border-amber-100",
```

Line 109 — change:
```
className: "bg-green-100 text-green-700 border-green-200",
```
to:
```
className: "bg-green-50 text-green-600 border-green-100",
```

Line 116 — change:
```
className: "bg-red-100 text-red-700 border-red-200",
```
to:
```
className: "bg-red-50 text-red-600 border-red-100",
```

Line 123 — change:
```
className: "bg-slate-100 text-slate-500 border-slate-200",
```
to:
```
className: "bg-slate-50 text-slate-400 border-slate-100",
```

- [ ] **Step 2: Add AVATAR_GRADIENTS array**

After the `URGENCY_STYLES` block (around line 147), add:

```typescript
// ============================================================================
// AVATAR GRADIENTS
// ============================================================================

/** 12 gradient pairs for deterministic vendor/requester avatars */
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

- [ ] **Step 3: Commit**

```bash
git add src/lib/design/tokens.ts
git commit -m "style: soften status badge colors and add avatar gradient palette

STATUS_STYLES: -100 backgrounds → -50, -700 text → -600.
AVATAR_GRADIENTS: 12 gradient pairs for deterministic vendor avatars."
```

---

### Task 5: Create VendorAvatar Component

**Files:**
- Create: `src/components/ui/vendor-avatar.tsx`

- [ ] **Step 1: Create the VendorAvatar component**

Create `src/components/ui/vendor-avatar.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { AVATAR_GRADIENTS } from "@/lib/design/tokens";

interface VendorAvatarProps {
  name: string;
  className?: string;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function VendorAvatar({ name, className }: VendorAvatarProps) {
  const index = hashString(name) % AVATAR_GRADIENTS.length;
  const [color1, color2] = AVATAR_GRADIENTS[index];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
    >
      <span className="text-white text-xs font-semibold">{initials}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders**

Import and render a test `<VendorAvatar name="GitHub Copilot" />` anywhere temporarily. Confirm it shows "GC" on a gradient background. Remove the test usage.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/vendor-avatar.tsx
git commit -m "feat: add VendorAvatar component with deterministic gradient backgrounds

40x40 rounded-xl avatar with 2-letter initials.
12 gradient pairs cycled via string hash for consistent vendor colors."
```

---

## Chunk 2: Dashboard Layout & Nav

### Task 6: Dashboard Layout — Warm Background + Glassmorphism Nav

**Files:**
- Modify: `src/app/dashboard/layout.tsx:67` (root div class), `:77` (header class), `:85-99` (nav items), `:159` (main element)

- [ ] **Step 1: Add `dashboard-bg` class to root div**

Line 67, change:
```tsx
<div className="min-h-screen bg-[var(--warm-50)]">
```
to:
```tsx
<div className="min-h-screen bg-[var(--warm-50)] dashboard-bg">
```

- [ ] **Step 2: Update header to glassmorphism**

Line 77, change:
```tsx
<header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
```
to:
```tsx
<header className="border-b border-[var(--warm-200)]/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
```

- [ ] **Step 3: Update nav item active pill shape**

Lines 95-99 (desktop nav) and lines 139-143 (mobile nav), change `rounded-lg` to `rounded-xl` in the active state class:

Desktop (line 97):
```tsx
? "bg-blue-50 text-blue-700 font-semibold"
```
stays, but the base class on line 95 changes from `rounded-lg` to `rounded-xl`:
```tsx
className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
```

Same change for mobile nav (line 139):
```tsx
className={`flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-xl transition-colors ${
```

- [ ] **Step 4: Add z-index to main content**

Line 159, change:
```tsx
<main id="main-content" className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
```
to:
```tsx
<main id="main-content" className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
```

- [ ] **Step 5: Verify full layout**

Open `/dashboard` — confirm:
1. Warm peach background (visibly different from `/` marketing page)
2. Subtle grain texture visible on the warm background
3. Nav bar has frosted glass translucency
4. Nav border is warm-tinted, nearly invisible
5. Content renders above the grain overlay (text/cards not covered)
6. Active nav item has softer rounded corners

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/layout.tsx
git commit -m "style: dashboard layout — warm bg, glassmorphism nav, grain texture stacking

- Add dashboard-bg class for scoped warm background
- Nav: bg-white/80 backdrop-blur-xl, warm border
- Nav items: rounded-lg → rounded-xl
- Main: relative z-10 for grain texture stacking context"
```

---

## Chunk 3: Dashboard Home Page Redesign

### Task 7: Stat Cards — Icon Badges + Large Numbers

**Files:**
- Modify: `src/app/dashboard/page.tsx:83-129` (stat grid + StatCard calls), `:298-331` (StatCard component)

- [ ] **Step 1: Add STAT_ICON_STYLES lookup and update grid**

At the top of `dashboard/page.tsx` (after imports, around line 33), add:

```typescript
const STAT_ICON_STYLES: Record<string, { iconBg: string; iconColor: string }> = {
  pendingRequests:  { iconBg: "bg-amber-50",  iconColor: "text-amber-500" },
  myRequests:       { iconBg: "bg-blue-50",   iconColor: "text-blue-500" },
  pendingApprovals: { iconBg: "bg-violet-50", iconColor: "text-violet-500" },
  activeTrials:     { iconBg: "bg-cyan-50",   iconColor: "text-cyan-500" },
  upcomingRenewals: { iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  approvedMonth:    { iconBg: "bg-green-50",  iconColor: "text-green-500" },
};
```

- [ ] **Step 2: Update stat cards grid classes**

Line 83, change:
```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
```
to:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6">
```

- [ ] **Step 3: Add iconBg and iconColor props to all StatCard calls**

Update each `<StatCard ... />` call (lines 84-129) to include the new props. Example for the first one:

```tsx
<StatCard
  title="Pending Requests"
  value={stats.data?.myPending ?? 0}
  icon={Clock}
  subtitle="Awaiting approval"
  loading={stats.isLoading}
  iconBg={STAT_ICON_STYLES.pendingRequests.iconBg}
  iconColor={STAT_ICON_STYLES.pendingRequests.iconColor}
/>
```

Repeat for all 6 cards with their respective keys: `myRequests`, `pendingApprovals`, `activeTrials`, `upcomingRenewals`, `approvedMonth`.

- [ ] **Step 4: Redesign the StatCard component**

Replace the entire `StatCard` function (lines 298-331) with:

```tsx
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight,
  loading,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | string;
  icon: typeof Clock;
  subtitle: string;
  highlight?: boolean;
  loading?: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card
      className={
        highlight
          ? "ring-2 ring-blue-200 bg-blue-50/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          : "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      }
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div
              className={`text-3xl md:text-4xl font-bold tracking-tight ${
                highlight ? "text-blue-700" : "text-slate-900"
              } ${loading ? "text-slate-300" : ""}`}
            >
              {value}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">
              {title}
            </p>
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {loading ? (
              <InlineLoader size="sm" />
            ) : (
              <Icon className={`h-5 w-5 ${iconColor}`} />
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Remove unused CardHeader import from StatCard**

The new StatCard uses only `Card` + `CardContent` (no `CardHeader`/`CardTitle`). Verify `CardHeader` and `CardTitle` are still used by the request/approval cards above — if so, keep the imports.

- [ ] **Step 6: Verify stat cards render correctly**

Open `/dashboard`:
- 6 cards in 3-column grid on desktop, 2 on tablet, 1 on mobile
- Large bold numbers (text-3xl+) on the left
- Colored icon badges (40x40 rounded-xl squares) on the right
- Subtitles below the title
- Hover lift effect on card hover
- Highlighted cards (pending approvals > 0) show blue ring

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "style: redesign stat cards with icon badges and large numbers

- Grid: 6-across → 3-across with better spacing
- Numbers: text-xl → text-3xl/4xl bold
- Icon badges: h-10 w-10 rounded-xl with colored backgrounds
- Hover lift: hover:-translate-y-0.5 with transition-all"
```

---

### Task 8: Dashboard Recent Requests — Avatar Rows + Pill Badges

**Files:**
- Modify: `src/app/dashboard/page.tsx:1-30` (add VendorAvatar import), `:149-220` (Recent Requests card), `:222-293` (Action Required card), `:164-176` (loading skeletons)

- [ ] **Step 1: Add VendorAvatar import**

At the top of `dashboard/page.tsx`, add:
```typescript
import { VendorAvatar } from "@/components/ui/vendor-avatar";
```

- [ ] **Step 2: Update loading skeletons for Recent Requests**

Replace the skeleton block (lines 164-176) with:
```tsx
{recentRequests.isLoading && (
  <div className="divide-y divide-slate-100">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16 ml-4" />
        <Skeleton className="h-6 w-16 rounded-full ml-2" />
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 3: Redesign Recent Requests rows**

Replace the request row rendering (the `recentRequests.data.map` block, lines 194-218) with:
```tsx
{recentRequests.data && recentRequests.data.length > 0 && (
  <div className="divide-y divide-slate-100">
    {recentRequests.data.map((req) => {
      const badge = statusBadge[req.status as keyof typeof statusBadge] ?? statusBadge.draft;
      return (
        <Link
          key={req.id}
          href={`/dashboard/requests/${req.id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors group"
        >
          <VendorAvatar name={req.vendorName || req.category || req.title} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
              {req.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {req.vendorName || req.category || "Request"} &middot; {req.requestNumber}
            </p>
          </div>
          {/* Amount — minimumFractionDigits: 0 for cleaner display (€2,700 instead of €2,700.00) */}
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-slate-900">
              &euro;{parseFloat(req.amount).toLocaleString("en", { minimumFractionDigits: 0 })}
            </p>
          </div>
          <Badge variant="pill" className={badge.className}>{badge.label}</Badge>
        </Link>
      );
    })}
  </div>
)}
```

- [ ] **Step 4: Update loading skeletons for Action Required**

Replace the skeleton block (lines 238-249) with the same avatar-based skeleton pattern from Step 2 (identical structure, just inside the Action Required card).

- [ ] **Step 5: Redesign Action Required rows**

Replace the approval row rendering (the `pendingApprovals.data.map` block, lines 267-289) with:
```tsx
{pendingApprovals.data && pendingApprovals.data.length > 0 && (
  <div className="divide-y divide-slate-100">
    {pendingApprovals.data.slice(0, 5).map((approval) => (
      <Link
        key={approval.id}
        href="/dashboard/approvals"
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors group"
      >
        <VendorAvatar name={approval.request.requester.name || approval.request.title} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600">
            {approval.request.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {approval.request.requester.name} &middot;{" "}
            &euro;{parseFloat(approval.request.amount).toLocaleString("en", { minimumFractionDigits: 0 })}
          </p>
        </div>
        {(approval.context?.riskFlags?.length ?? 0) > 0 && (
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
        )}
      </Link>
    ))}
  </div>
)}
```

- [ ] **Step 6: Update card hover classes**

Lines 149 and 223, change both Card className values from:
```
shadow-sm hover:shadow-md transition-shadow
```
to:
```
hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
```

- [ ] **Step 7: Verify complete dashboard home**

Open `/dashboard`:
- Recent Requests: gradient avatar badges on each row, stacked title/subtitle, pill-shaped status badges
- Action Required: same avatar treatment with requester names
- Skeletons match new layout (avatar placeholder + text lines + pill placeholder)
- Dividers between rows (subtle `divide-slate-100`)
- Hover states work (subtle bg change + card lift)

- [ ] **Step 8: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "style: dashboard home — avatar rows, pill badges, updated skeletons

- Recent Requests: VendorAvatar + vendor/category subtitle + pill badges
- Action Required: requester avatar + name subtitle
- Loading skeletons: avatar placeholder + text lines + pill
- Cards: hover lift effect (translate-y-0.5)"
```

---

## Chunk 4: Requests List Page

### Task 9: Requests List — Avatar Rows + Pill Badges

**Files:**
- Modify: `src/app/dashboard/requests/page.tsx:1-61` (imports + statusConfig), `:489-573` (request rows)

- [ ] **Step 1: Add VendorAvatar import**

Add at top of file:
```typescript
import { VendorAvatar } from "@/components/ui/vendor-avatar";
```

- [ ] **Step 2: Update statusConfig colors**

Replace the statusConfig object (lines 52-61) with softer colors matching `STATUS_STYLES`:
```typescript
const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", className: "bg-slate-50 text-slate-500 border-slate-100", icon: Edit3 },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
  approved: { label: "Approved", className: "bg-green-50 text-green-600 border-green-100", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-100", icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-slate-50 text-slate-400 border-slate-100", icon: XCircle },
};
```

- [ ] **Step 3: Add VendorAvatar to request rows**

In the request row (inside the `requestList.data.map` block, starting ~line 495), replace the status icon div (lines 504-510):
```tsx
<div className="flex-shrink-0">
  <StatusIcon className={`h-5 w-5 ${...}`} />
</div>
```
with:
```tsx
<VendorAvatar
  name={req.vendorName || req.category || req.title}
  className="flex-shrink-0"
/>
```

- [ ] **Step 4: Update Badge to use pill variant**

Line 540, change:
```tsx
<Badge className={config.className}>{config.label}</Badge>
```
to:
```tsx
<Badge variant="pill" className={config.className}>{config.label}</Badge>
```

Also update the Synced badge (line 542) and Sync failed badge (line 548) — these keep their existing small styling since they are secondary indicators, not status badges.

- [ ] **Step 5: Verify requests list page**

Open `/dashboard/requests`:
- Each request row shows a gradient vendor avatar instead of a status icon
- Status badges are pill-shaped with softer colors
- Vendor name shows in the subtitle line (it already does, just verifying no regression)
- Search, filters, sorting still work
- Delete button on drafts still works
- CSV export still works

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/requests/page.tsx
git commit -m "style: requests list — vendor avatars, pill badges, softer status colors

- VendorAvatar replaces status icon in each row
- statusConfig: softer -50 backgrounds, -600 text
- Badge variant='pill' for rounded-full status badges"
```

---

## Chunk 5: Final Verification

### Task 10: Full Visual Verification & Push

- [ ] **Step 1: Cross-page consistency check**

Navigate through ALL dashboard pages and verify the warm background + card styling is consistent:
- `/dashboard` (home)
- `/dashboard/requests` (list)
- `/dashboard/requests/new` (form)
- `/dashboard/approvals`
- `/dashboard/trials`
- `/dashboard/renewals`
- `/dashboard/budgets`
- `/dashboard/subscriptions`
- `/dashboard/invoices`
- `/dashboard/vendors`
- `/dashboard/settings`

All should have warm peach background, rounded cards, grain texture.

- [ ] **Step 2: Verify marketing pages are unaffected**

Check these pages have NOT changed:
- `/` (homepage) — background still `#fff9f5`, not `#FEF0E8`
- `/pricing`
- `/features`
- `/login`
- `/signup`

Cards on login/signup will be rounder (intentional global card change), but background must NOT be warm peach.

- [ ] **Step 3: Verify reduced-motion support**

In browser dev tools, enable "prefers-reduced-motion: reduce". Confirm:
- Card hover lift (`-translate-y-0.5`) is suppressed (already handled by existing CSS in globals.css lines 383-388)
- No jarring animations

- [ ] **Step 4: Push to main**

```bash
git push origin main
```
