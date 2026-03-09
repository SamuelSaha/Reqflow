# UI Polish & Consistency System Design

**Date**: 2026-03-09
**Status**: Approved
**Approach**: System-First (Comprehensive)

## Executive Summary

Reqflow has 123 inconsistent loading states across 36 dashboard files, missing core UI components (tooltips, avatars, breadcrumbs, progress indicators), and inconsistent error handling patterns. This design establishes a comprehensive UI system to achieve polish and consistency across the entire product.

**Goal**: Unified component library + systematic refactor → consistent, polished user experience.

**Timeline**: 3 weeks (2 weeks dashboard, 1 week optional marketing)

---

## Problem Statement

### Current State Issues

1. **Loading States**: 123 different implementations
   - Mix of `<Loader2 className="animate-spin" />`, custom spinners, `LoadingSkeleton`
   - No clear pattern for when to use each
   - Inconsistent sizing and positioning

2. **Missing Components**: 5 critical shadcn/ui components not installed
   - Tooltip (no help text on icon buttons or truncated content)
   - Popover (no contextual menus or quick actions)
   - Avatar (no visual user identity)
   - Breadcrumb (no navigation context on deep pages)
   - Progress (no visual feedback for budgets/trials)

3. **Error Handling**: Inconsistent patterns
   - Mix of inline alerts, Card-based errors, ErrorState, and toasts
   - No decision matrix for which to use when
   - Basic ErrorState component lacks visual hierarchy

4. **Discoverability**: Poor progressive disclosure
   - Icon-only buttons with no labels or tooltips
   - Truncated text loses context
   - Status badges lack explanations

---

## Design Decisions

### 1. Component Additions

#### Tooltip (`src/components/ui/tooltip.tsx`)
**Purpose**: Show helpful hints on hover/focus

**Variants**:
- Default (dark background, white text)
- Light theme option for dark backgrounds

**Behavior**:
- 200ms delay on hover
- Keyboard accessible (appears on focus)
- Escape key to dismiss
- Auto-position (flip if near edge)

**Usage**:
- Icon-only buttons (Edit, Delete, Export)
- Truncated text in tables (vendor names, contract titles)
- Status badge explanations
- Dashboard stat card data explanations

---

#### Popover (`src/components/ui/popover.tsx`)
**Purpose**: Contextual menus and interactive panels

**Behavior**:
- Click to open, click outside to close
- Escape key support
- Arrow key navigation
- Focus trap when open

**Usage**:
- Bulk actions menu on lists
- Quick filters (date picker, amount range)
- User profile menu in nav
- Contextual help panels

---

#### Avatar (`src/components/ui/avatar.tsx`)
**Purpose**: Visual user/team member identity

**Variants**:
- **xs**: 24px (inline in tables)
- **sm**: 32px (list items, cards)
- **md**: 40px (page headers)
- **lg**: 64px (profile pages)

**Fallback Strategy**:
1. Try to load image from `src`
2. If fails, show initials in colored background
3. Color derived from user ID hash (consistent across app)

**Color Palette** (8 colors):
```typescript
const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-green-500', 'bg-yellow-500', 'bg-red-500',
  'bg-indigo-500', 'bg-teal-500'
];
```

**Usage**:
- Request requester in lists
- Approver avatars in approval queue
- Team member directory
- Contract/subscription owners
- Navigation header (current user)

**AvatarGroup** for multiple users:
- Show max 3 avatars, "+N more" for overflow
- Use cases: multi-approver workflows, watchers

---

#### Breadcrumb (`src/components/ui/breadcrumb.tsx`)
**Purpose**: Show hierarchy on deep pages

**Structure**:
```
Dashboard / Contracts / Adobe Creative Cloud / Edit
```

**Placement**: Above page title (Pattern A - recommended)

**Responsive Behavior**:
- Desktop: Full path
- Tablet: Truncate middle (`Dashboard / ... / Edit`)
- Mobile: Parent + current (`Contracts / Adobe CC`)

**Pages Requiring Breadcrumbs** (23 total):

**Detail pages** (15):
- `/dashboard/contracts/[id]`
- `/dashboard/contracts/[id]/edit`
- `/dashboard/requests/[id]`
- `/dashboard/subscriptions/[id]`
- `/dashboard/renewals/[id]`
- `/dashboard/trials/[id]`
- `/dashboard/vendors/[id]`
- (All detail pages follow same pattern)

**Deep settings** (8):
- `/dashboard/settings/team`
- `/dashboard/settings/security`
- `/dashboard/settings/workflows`
- `/dashboard/settings/workflows/new`
- (All settings subpages)

---

#### Progress (`src/components/ui/progress.tsx`)
**Purpose**: Visual feedback for completion/consumption

**Variants**:

**1. Linear Bar**
```typescript
<Progress
  value={45}
  max={100}
  variant="default" | "success" | "warning" | "danger"
  size="sm" | "md" | "lg"
  showLabel={true}
/>
```

**Auto-variant thresholds**:
- 0-59%: success (green)
- 60-79%: warning (yellow)
- 80-100%: danger (red)

**2. Circular Progress** (compact spaces)
```typescript
<CircularProgress
  value={7}
  max={14}
  label="7 days left"
  size="sm" | "md" | "lg"
/>
```

**Usage**:

**Budget tracking** (4 locations):
- Dashboard budget card
- Settings → Budgets page
- Department budget breakdown
- Annual budget overview

**Trial progress** (3 locations):
- Trial detail page
- Dashboard "Active Trials" card
- Trials list page (compact indicators)

**File uploads** (2 locations):
- Contract attachments
- Request attachments

**Future**: Onboarding completion tracking

---

### 2. Loading State System

**Current Problem**: 123 inconsistent implementations across 36 files.

**Solution**: Unified component system with clear usage guidelines.

#### Components

**1. `<Spinner />` - Base indicator**
```typescript
<Spinner size="sm" | "md" | "lg" />
```
- **sm**: 16px (buttons, small cards)
- **md**: 24px (card headers, sections)
- **lg**: 32px (page-level)

---

**2. `<PageLoader />` - Full page loading**
```typescript
<PageLoader message="Loading contracts..." />
```
- Centers vertically/horizontally
- Large spinner + optional message
- Used in page.tsx during initial fetch

---

**3. `<InlineLoader />` - Contextual loading**
```typescript
<InlineLoader text="Saving..." />
```
- Spinner + text, inline-flex
- For card refreshes, list updates, form submissions

---

**4. `<LoadingButton />` - Keep existing**
```typescript
<LoadingButton loading={mutation.isPending} loadingText="Saving...">
  Save
</LoadingButton>
```
- Already implemented correctly
- No changes needed

---

**5. `<CardSkeleton />` - Replaces LoadingSkeleton**
```typescript
<CardSkeleton rows={3} variant="list" | "grid" />
```
- **list**: Horizontal layout (icon + text + badge)
- **grid**: Vertical layout (image + title + description)
- Used for optimistic UI, suspense boundaries

---

#### Usage Decision Tree

```
Need loading indicator?
├─ Button action? → LoadingButton
├─ Full page? → PageLoader
├─ Card/section? → CardSkeleton
├─ Inline text? → InlineLoader
└─ Custom layout? → Spinner
```

#### Refactor Impact
- Replace all 123 manual `<Loader2 className="animate-spin" />` with `<Spinner />`
- Replace inline spinners in dashboard cards with `<InlineLoader />`
- Replace detail page spinners with `<PageLoader />`
- Standardize all skeleton screens to `<CardSkeleton />`

---

### 3. Error Handling System

**Current Problem**: Inconsistent error patterns, no clear guidance.

**Solution**: Tiered error handling with decision matrix.

#### Components

**1. Enhanced `<ErrorState />` - Page-level**
```typescript
<ErrorState
  variant="error" | "warning" | "info" | "empty"
  title="Failed to load contracts"
  description="We couldn't connect to the server. Check your connection and try again."
  action={{ label: "Retry", onClick: refetch }}
  illustration={<ErrorIllustration />}
/>
```

**Enhancements**:
- Add variant system (currently only has one style)
- Better visual hierarchy
- Optional illustration for empty vs. error states
- Improved typography (larger title, better spacing)

---

**2. `<InlineError />` - Field-level (NEW)**
```typescript
<InlineError message="Vendor name is required" />
```
- Red text + AlertCircle icon
- Appears below form fields
- Replaces manual error messages

---

**3. `<Alert />` - Contextual warnings/info (NEW)**
```typescript
<Alert variant="error" | "warning" | "info" | "success">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Budget exceeded</AlertTitle>
  <AlertDescription>
    This request exceeds your department's remaining budget by €2,500.
  </AlertDescription>
</Alert>
```
- For non-blocking issues
- Dismissible option for persistent alerts
- Used in approval flows, budget warnings, trial expirations

---

**4. Toast (Sonner) - Keep existing**
- Already implemented correctly
- Keep for mutations (success/error/undo)

---

#### Error Handling Decision Matrix

| Situation | Component | Example |
|-----------|-----------|---------|
| Page failed to load | `<ErrorState variant="error" />` | Contract detail 404/500 |
| Section failed to load | Card with `<InlineError />` | Dashboard stats panel error |
| Form validation error | `<InlineError />` | "Amount must be positive" |
| Contextual warning | `<Alert variant="warning" />` | Budget overage notice |
| Mutation success/fail | `toast.success()` / `toast.error()` | "Request created" |
| Non-critical info | `<Alert variant="info" />` | "MFA optional but recommended" |

#### Refactor Impact
- Enhance ErrorState with variants + better styling
- Add InlineError for form fields
- Add Alert from shadcn/ui
- Standardize all dashboard errors to follow matrix
- Remove custom error Card components

---

### 4. Contextual Help & Discoverability

**Current Problem**: Icon-only buttons, truncated text, unexplained status badges.

**Solution**: Tooltip system for progressive disclosure.

#### Tooltip Usage Patterns

**1. Icon-only buttons** (50+ locations)
```typescript
<Tooltip content="Edit contract">
  <Button variant="ghost" size="icon">
    <Edit className="h-4 w-4" />
  </Button>
</Tooltip>
```

**Locations**:
- Edit/Delete/Export buttons in tables
- Icon buttons in card headers
- Action icons in approvals
- Settings icons in nav

---

**2. Truncated text**
```typescript
<Tooltip content={fullVendorName}>
  <span className="truncate">{vendorName}</span>
</Tooltip>
```

**Locations**:
- Long vendor names in tables
- Contract titles in narrow columns
- Department names on mobile
- File names in upload lists

---

**3. Status badge explanations**
```typescript
<Tooltip content="Waiting for finance team approval">
  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
</Tooltip>
```

**Locations**:
- Request status badges
- Contract status badges
- Subscription status badges
- Sync status badges

---

**4. Data explanations**
```typescript
<Tooltip content="Total approved spend in current month">
  <div>€45,230</div>
</Tooltip>
```

**Locations**:
- Dashboard stat cards
- Budget consumption percentages
- Trial days remaining
- Renewal notice windows

---

#### Accessibility Requirements
- Tooltips: 200ms delay, keyboard accessible, screen reader text
- Popovers: Escape to close, click outside, arrow key navigation
- ARIA labels on all icon-only buttons
- Focus visible styles on all interactive elements
- Minimum contrast 4.5:1

---

## Implementation Strategy

### Phase 1: Foundation (Week 1, Days 1-2)

**Goal**: Build all new components in isolation.

**Deliverables**:
1. Add shadcn/ui components:
   - `npx shadcn@latest add tooltip`
   - `npx shadcn@latest add popover`
   - `npx shadcn@latest add avatar`
   - `npx shadcn@latest add breadcrumb`
   - `npx shadcn@latest add progress`
   - `npx shadcn@latest add alert`

2. Create loading system components:
   - `src/components/ui/spinner.tsx`
   - `src/components/ui/page-loader.tsx`
   - `src/components/ui/inline-loader.tsx`
   - `src/components/ui/card-skeleton.tsx` (enhance existing skeleton.tsx)

3. Enhance error components:
   - Update `src/components/ui/empty-state.tsx` (add variants to ErrorState)
   - Create `src/components/ui/inline-error.tsx`

4. Create design tokens:
   - `src/lib/design/ui-patterns.ts` (usage guidelines as code)

5. Documentation:
   - `docs/ui-patterns.md` (comprehensive usage guide)
   - Storybook stories (optional but recommended)

---

### Phase 2: High-Traffic Pages (Week 1, Days 3-5)

**Goal**: Refactor top 5 most-used pages for maximum impact.

**Priority order**:
1. `/dashboard/page.tsx` - Dashboard home
2. `/dashboard/requests/page.tsx` - Request list
3. `/dashboard/requests/[id]/page.tsx` - Request detail
4. `/dashboard/contracts/page.tsx` - Contract list
5. `/dashboard/contracts/[id]/page.tsx` - Contract detail

**Changes per page**:
- ✅ Replace all loading states with new components
- ✅ Add breadcrumbs to detail pages
- ✅ Add avatars for users/requesters
- ✅ Add tooltips to icon buttons
- ✅ Standardize error handling
- ✅ Add progress bars where relevant

---

### Phase 3: Remaining Dashboard Pages (Week 2)

**Goal**: Systematic refactor of remaining 31 files.

**Batch by domain**:

**Approvals** (2 files):
- approvals/page.tsx
- approvals/error.tsx

**Vendors** (4 files):
- vendors/page.tsx
- vendors/[id]/page.tsx
- vendors/new/page.tsx
- vendors/error.tsx

**Subscriptions** (3 files):
- subscriptions/page.tsx
- subscriptions/[id]/page.tsx
- error.tsx

**Renewals/Trials** (4 files):
- renewals/page.tsx
- renewals/[id]/page.tsx
- trials/page.tsx
- trials/[id]/page.tsx

**Budgets/Invoices** (2 files):
- budgets/page.tsx
- invoices/page.tsx

**Settings** (10 files):
- settings/team/page.tsx
- settings/security/page.tsx
- settings/analytics/page.tsx
- settings/workflows/page.tsx
- settings/workflows/new/page.tsx
- settings/integrations/page.tsx
- settings/ai/page.tsx
- settings/budgets/page.tsx
- settings/notifications/page.tsx
- settings/categories/page.tsx
- settings/audit-logs/page.tsx

**Admin** (2 files):
- admin/health/page.tsx
- admin/web-vitals/page.tsx

**Notifications/Onboarding** (4 files):
- notifications/page.tsx
- onboarding/page.tsx
- (other root-level dashboard pages)

---

### Phase 4: Marketing Pages (Week 3, Optional)

**Goal**: Apply polish to marketing site.

**Potential additions**:
- Tooltips on feature descriptions
- Progress bars in pricing comparisons
- Better loading states for contact form
- (Lower priority than dashboard)

---

## Quality Gates

**Before merging each phase**:
1. ✅ All TypeScript errors resolved
2. ✅ All pages load without console errors
3. ✅ Lighthouse accessibility score ≥ 95
4. ✅ No broken breadcrumbs (all links work)
5. ✅ All tooltips have proper ARIA labels
6. ✅ Loading states tested (throttle network in DevTools)
7. ✅ Error states tested (mock API failures)

---

## Testing Strategy

### Manual Testing Checklist (per page)
- [ ] Page loads successfully
- [ ] Loading states appear correctly
- [ ] Error states display properly (force error)
- [ ] Breadcrumbs navigate correctly
- [ ] Tooltips appear on hover/focus
- [ ] Avatars display with fallbacks
- [ ] Progress bars show accurate percentages
- [ ] Mobile responsive (390px, 768px, 1440px)

### Automated Testing (optional, recommended)
- Visual regression tests (Playwright screenshots)
- Component unit tests (Vitest + Testing Library)
- Accessibility audits (axe-core)

---

## Rollback Plan

**If something breaks**:
1. Each phase is a separate PR (can revert individually)
2. Keep old components alongside new ones during transition
3. Feature flag for gradual rollout (if needed)
4. Database/API unchanged (only UI changes)

---

## Documentation Deliverables

### 1. Component Usage Guide (`docs/ui-patterns.md`)

Comprehensive guide covering:
- When to use each loading component
- Error handling decision matrix
- Breadcrumb placement patterns
- Avatar fallback behavior
- Tooltip best practices
- Progress indicator use cases

### 2. Migration Guide (`docs/migration-to-ui-system.md`)

Before/after examples:
```markdown
## Loading States

### Before
<Loader2 className="h-4 w-4 animate-spin" />

### After
<Spinner size="sm" />
```

### 3. Design Tokens Reference (`src/lib/design/ui-patterns.ts`)

```typescript
export const LOADING_PATTERNS = {
  page: 'Use <PageLoader /> for full-page loading',
  card: 'Use <CardSkeleton /> for card loading',
  inline: 'Use <InlineLoader /> for inline updates',
  button: 'Use <LoadingButton /> for button actions',
};

export const ERROR_PATTERNS = {
  page: 'Use <ErrorState /> for page-level errors',
  field: 'Use <InlineError /> for form validation',
  alert: 'Use <Alert /> for contextual warnings',
  toast: 'Use toast() for mutation feedback',
};
```

---

## Success Metrics

**Quantitative**:
- 123 loading states → 4 consistent components (96% reduction in variants)
- 0 tooltips → 50+ tooltips (100% icon buttons labeled)
- 0 breadcrumbs → 23 breadcrumbs (all detail pages have context)
- 0 avatars → 15+ locations (visual user identity)
- 0 progress indicators → 9 locations (budget/trial visibility)

**Qualitative**:
- Consistent visual language across all pages
- Clear navigation context on deep pages
- Discoverable actions (no mystery meat navigation)
- Accessible to keyboard/screen reader users
- Professional, polished appearance

---

## Open Questions

None. Design approved and ready for implementation planning.

---

## References

- shadcn/ui documentation: https://ui.shadcn.com
- Marketing design tokens: `src/styles/marketing-tokens.css`
- Existing components: `src/components/ui/`
- WCAG 2.1 AA guidelines for accessibility
