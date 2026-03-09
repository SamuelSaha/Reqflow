# Migration Guide: UI System

Before/after examples for migrating to the new UI system.

## Loading States

### Before
```tsx
// Inconsistent Loader2 usage
{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}

// Custom spinner
{isLoading && (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
)}

// LoadingSkeleton
{isLoading && <LoadingSkeleton rows={3} />}
```

### After
```tsx
// Page loading
{isLoading && <PageLoader message="Loading contracts..." />}

// Card skeleton
{isLoading && <CardSkeleton rows={3} variant="list" />}

// Inline loading
{isRefreshing && <InlineLoader text="Refreshing..." />}

// Button loading
<LoadingButton loading={mutation.isPending}>Save</LoadingButton>

// Custom (use Spinner)
{isLoading && <Spinner size="md" />}
```

---

## Error Handling

### Before
```tsx
// Custom error Card
{error && (
  <Card className="border-red-200 bg-red-50">
    <CardContent className="flex items-center gap-4 py-4">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <p className="text-sm text-slate-900">{error.message}</p>
      <Button onClick={() => refetch()}>Retry</Button>
    </CardContent>
  </Card>
)}

// Inline error message
{errors.vendorName && (
  <p className="text-sm text-red-600 mt-1">
    {errors.vendorName.message}
  </p>
)}
```

### After
```tsx
// Page-level error
{error && (
  <ErrorState
    variant="error"
    title="Failed to load"
    description={error.message}
    onRetry={refetch}
  />
)}

// Field-level error
{errors.vendorName && (
  <InlineError message={errors.vendorName.message} />
)}

// Contextual warning
<Alert variant="warning">
  <AlertTitle>Budget exceeded</AlertTitle>
  <AlertDescription>This exceeds your budget by €2,500.</AlertDescription>
</Alert>
```

---

## Navigation

### Before
```tsx
// Lonely back button
<Link href="/dashboard/contracts">
  <Button variant="ghost">
    <ChevronLeft className="mr-2 h-4 w-4" />
    Back
  </Button>
</Link>

<h1>Adobe Creative Cloud</h1>
```

### After
```tsx
// Breadcrumb navigation
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

<h1 className="mt-4">Adobe Creative Cloud</h1>
```

---

## User Identity

### Before
```tsx
// Text-only requester
<div>
  <p className="text-sm font-medium">{request.requester.name}</p>
  <p className="text-xs text-slate-500">{request.requester.email}</p>
</div>
```

### After
```tsx
// Avatar + name
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarImage src={request.requester.avatarUrl} />
    <AvatarFallback className={getAvatarColor(request.requester.id)}>
      {getInitials(request.requester.name)}
    </AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm font-medium">{request.requester.name}</p>
    <p className="text-xs text-slate-500">{request.requester.email}</p>
  </div>
</div>
```

---

## Contextual Help

### Before
```tsx
// Icon button without label
<Button variant="ghost" size="icon">
  <Edit className="h-4 w-4" />
</Button>

// Truncated text without context
<span className="truncate">{vendorName}</span>

// Status badge without explanation
<Badge className="bg-amber-100 text-amber-700">Pending</Badge>
```

### After
```tsx
// Icon button with tooltip
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon">
      <Edit className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Edit contract</TooltipContent>
</Tooltip>

// Truncated text with tooltip
<Tooltip>
  <TooltipTrigger asChild>
    <span className="truncate">{vendorName}</span>
  </TooltipTrigger>
  <TooltipContent>{vendorName}</TooltipContent>
</Tooltip>

// Status badge with explanation
<Tooltip>
  <TooltipTrigger asChild>
    <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
  </TooltipTrigger>
  <TooltipContent>Waiting for finance team approval</TooltipContent>
</Tooltip>
```

---

## Visual Progress

### Before
```tsx
// Text-only budget
<div>
  <p className="text-2xl font-bold">€45,000</p>
  <p className="text-sm text-slate-600">of €100,000 used</p>
</div>
```

### After
```tsx
// Progress bar + text
<div>
  <Progress value={45000} max={100000} showLabel />
  <p className="text-sm text-slate-600 mt-2">
    €45,000 / €100,000 (45% used)
  </p>
</div>
```

---

## Common Patterns

### Dashboard Stat Card

**Before:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Pending Requests</CardTitle>
  </CardHeader>
  <CardContent>
    {isLoading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <div className="text-2xl font-bold">{stats.pending}</div>
    )}
  </CardContent>
</Card>
```

**After:**
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Pending Requests</CardTitle>
    {isLoading ? (
      <Spinner size="sm" />
    ) : (
      <Clock className="h-4 w-4 text-slate-600" />
    )}
  </CardHeader>
  <CardContent>
    <div className={cn(
      "text-2xl font-bold",
      isLoading && "text-slate-300"
    )}>
      {stats.pending ?? 0}
    </div>
  </CardContent>
</Card>
```

### Request List Item

**Before:**
```tsx
<Link href={`/dashboard/requests/${req.id}`} className="flex items-center justify-between p-3">
  <div>
    <p className="text-sm font-medium">{req.title}</p>
    <p className="text-xs text-slate-500">{req.requester.name}</p>
  </div>
  <Badge>{req.status}</Badge>
</Link>
```

**After:**
```tsx
<Link href={`/dashboard/requests/${req.id}`} className="flex items-center gap-3 p-3">
  <Avatar size="sm">
    <AvatarFallback className={getAvatarColor(req.requester.id)}>
      {getInitials(req.requester.name)}
    </AvatarFallback>
  </Avatar>
  <div className="flex-1">
    <p className="text-sm font-medium">{req.title}</p>
    <p className="text-xs text-slate-500">{req.requester.name}</p>
  </div>
  <Tooltip>
    <TooltipTrigger asChild>
      <Badge>{req.status}</Badge>
    </TooltipTrigger>
    <TooltipContent>Waiting for approval</TooltipContent>
  </Tooltip>
</Link>
```
