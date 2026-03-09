# UI Patterns Guide

Comprehensive guide for using Reqflow's UI component system.

## Loading States

### When to Use Each Component

| Scenario | Component | Example |
|----------|-----------|---------|
| Full page loading | `<PageLoader />` | Contract detail page initial load |
| Card/section loading | `<CardSkeleton />` | Dashboard stats panel |
| Inline updates | `<InlineLoader />` | "Saving..." next to form |
| Button actions | `<LoadingButton />` | Submit button |
| Custom layouts | `<Spinner />` | Custom loading UI |

### Examples

**PageLoader:**
```tsx
// In page.tsx during initial fetch
if (contract.isLoading) {
  return <PageLoader message="Loading contract..." />;
}
```

**CardSkeleton:**
```tsx
// List variant (horizontal layout)
{isLoading && <CardSkeleton rows={3} variant="list" />}

// Grid variant (vertical layout)
{isLoading && <CardSkeleton rows={6} variant="grid" />}
```

**InlineLoader:**
```tsx
// Card refresh
{isRefreshing && <InlineLoader text="Refreshing..." />}
```

**LoadingButton:**
```tsx
<LoadingButton
  loading={mutation.isPending}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save
</LoadingButton>
```

**Spinner:**
```tsx
// Small (16px) - buttons, small cards
<Spinner size="sm" />

// Medium (24px) - card headers, sections (default)
<Spinner size="md" />

// Large (32px) - page-level
<Spinner size="lg" />
```

---

## Error Handling

### Decision Matrix

| Situation | Component | Example |
|-----------|-----------|---------|
| Page failed to load | `<ErrorState variant="error" />` | 404/500 errors |
| Section failed | Card with `<InlineError />` | Stats panel error |
| Form validation | `<InlineError />` | "Amount required" |
| Contextual warning | `<Alert variant="warning" />` | Budget exceeded |
| Mutation feedback | `toast.error()` | "Failed to save" |
| Info message | `<Alert variant="info" />` | "MFA optional" |

### Examples

**ErrorState:**
```tsx
if (error && !isLoading) {
  return (
    <ErrorState
      variant="error"
      title="Failed to load contracts"
      description="We couldn't connect to the server."
      onRetry={() => refetch()}
    />
  );
}
```

**InlineError:**
```tsx
<Input {...register("vendorName")} />
{errors.vendorName && (
  <InlineError message={errors.vendorName.message} />
)}
```

**Alert:**
```tsx
<Alert variant="warning">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Budget exceeded</AlertTitle>
  <AlertDescription>
    This request exceeds your department's remaining budget by €2,500.
  </AlertDescription>
</Alert>
```

**Toast:**
```tsx
const mutation = trpc.requests.create.useMutation({
  onSuccess: () => {
    toast.success("Request created");
  },
  onError: (err) => {
    toast.error("Failed to create request", {
      description: err.message,
    });
  },
});
```

---

## Navigation & Context

### Breadcrumbs

**When to add:**
- Detail pages (contracts/[id], subscriptions/[id])
- Edit pages (contracts/[id]/edit)
- Deep settings pages (settings/workflows/new)

**Placement:**
Above page title (recommended)

**Example:**
```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard/contracts">Contracts</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Adobe Creative Cloud</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

## User Identity

### Avatar

**When to use:**
- Request requester in lists
- Approver in approval queue
- Team member directory
- Contract/subscription owners
- Current user in nav header

**Size guide:**
- `xs` (24px): Inline in table rows
- `sm` (32px): List items, cards
- `md` (40px): Page headers
- `lg` (64px): Profile pages

**Example:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getAvatarColor } from "@/lib/utils/avatar";

<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback className={getAvatarColor(user.id)}>
    {getInitials(user.name)}
  </AvatarFallback>
</Avatar>
```

### AvatarGroup

**When to use:**
- Multiple approvers
- Contract watchers
- Team assignments

**Example:**
```tsx
import { AvatarGroup } from "@/components/ui/avatar-group";

<AvatarGroup max={3}>
  {approvers.map(user => (
    <Avatar key={user.id}>
      <AvatarFallback className={getAvatarColor(user.id)}>
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  ))}
</AvatarGroup>
```

---

## Contextual Help

### Tooltip

**When to use:**
- Icon-only buttons
- Truncated text
- Status badge explanations
- Stat card data

**Example:**
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Edit className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Edit contract</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Popover

**When to use:**
- Bulk actions menu
- Quick filters
- User profile menu
- Contextual panels

**Example:**
```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Actions</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-1">
      <Button variant="ghost" size="sm">Export selected</Button>
      <Button variant="ghost" size="sm">Approve all</Button>
    </div>
  </PopoverContent>
</Popover>
```

---

## Visual Progress

### Progress

**When to use:**
- Budget consumption
- Trial days remaining
- File upload progress
- Onboarding completion

**Example:**
```tsx
import { Progress } from "@/components/ui/progress";

// Auto-variant (green/yellow/red based on percentage)
<Progress value={45} max={100} showLabel />

// Manual variant
<Progress
  value={85}
  max={100}
  variant="danger"
  showLabel
/>
```

### CircularProgress

**When to use:**
- Compact spaces (cards, badges)
- Trial countdown indicators

**Example:**
```tsx
import { CircularProgress } from "@/components/ui/circular-progress";

<CircularProgress
  value={7}
  max={14}
  label="7 days left"
  size="md"
/>
```

---

## Accessibility

### Required Practices

**Loading states:**
- Always include `aria-label` on loaders
- Use `role="status"` for live regions
- Include `<span className="sr-only">Loading...</span>`

**Tooltips:**
- 200ms delay on hover
- Keyboard accessible (focus triggers tooltip)
- `aria-describedby` on trigger element

**Icon buttons:**
- Always add ARIA label: `<Button aria-label="Edit contract">`
- Prefer tooltip over ARIA label when possible

**Error states:**
- Use `role="alert"` for errors
- Include descriptive error messages
- Provide retry actions when applicable

---

## Testing

### Manual Testing Checklist

For each refactored page:
- [ ] Loading states appear correctly
- [ ] Error states display properly (mock API failure)
- [ ] Breadcrumbs navigate correctly
- [ ] Tooltips appear on hover/focus
- [ ] Avatars display with fallbacks
- [ ] Mobile responsive (390px, 768px, 1440px)
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

### Accessibility Testing

Run: `npx playwright test accessibility`

Expected: Lighthouse accessibility score ≥ 95
