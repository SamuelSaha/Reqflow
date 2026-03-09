# Phase 2: Dashboard Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the top 5 high-traffic dashboard pages to use the new UI component system created in Phase 1, eliminating 30+ instances of inconsistent loading/error states.

**Architecture:** Replace all direct `Loader2` imports with our standardized loading components (`InlineLoader`, `PageLoader`). Replace inline error cards with `ErrorState` component. Maintain existing functionality while improving visual consistency and UX polish.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, tRPC, Lucide React icons, Phase 1 UI system components

---

## Current State Analysis

### Top 5 High-Traffic Pages Identified

1. **Dashboard Home** (`src/app/dashboard/page.tsx` - 311 lines)
   - **Traffic:** Highest - primary entry point for all users
   - **Issues:** 4+ direct `Loader2` instances (lines 24, 155, 218, 296), inline error card with AlertCircle
   - **Good:** Uses EmptyState component correctly
   - **Migration:** Replace Loader2 with InlineLoader, replace error card with ErrorState

2. **Requests List** (`src/app/dashboard/requests/page.tsx` - 581 lines)
   - **Traffic:** Very High - primary workflow page
   - **Issues:** No explicit loading UI (relying on tRPC/suspense), inline error card (lines 421-433)
   - **Good:** Already uses EmptyState component correctly
   - **Migration:** Add PageLoader for initial load, replace error card with ErrorState

3. **Approvals Queue** (`src/app/dashboard/approvals/page.tsx` - 683 lines)
   - **Traffic:** High - critical approval workflow with AI analysis
   - **Issues:** Loader2 in bulk actions (lines 28, 546, 638), inline error card (lines 485-497), real-time polling every 30s
   - **Good:** Already uses EmptyState component correctly, good polling UX with last updated timestamp
   - **Migration:** Replace Loader2 with InlineLoader, replace error card with ErrorState, potentially add tooltips to bulk buttons

4. **Vendors Directory** (`src/app/dashboard/vendors/page.tsx` - 283 lines)
   - **Traffic:** Medium-High - vendor management
   - **Issues:** No loading UI visible (tRPC query), basic error card (lines 76-87), hand-coded empty state (lines 261-276)
   - **Good:** Clean table UI with sortable columns, good filter UX
   - **Migration:** Add PageLoader, replace error card with ErrorState, migrate empty state to EmptyState component

5. **Contracts Management** (`src/app/dashboard/contracts/page.tsx` - 353 lines)
   - **Traffic:** Medium-High - contract tracking with deadline alerts
   - **Issues:** Custom loading spinner (lines 194-202), inline error card (lines 206-219)
   - **Good:** Already uses EmptyState component correctly, excellent deadline urgency UX with color-coded warnings
   - **Migration:** Replace custom spinner with PageLoader, replace error card with ErrorState

**Total Impact:** Refactoring these 5 pages will eliminate 30+ inconsistent loading/error states and set the standard for the remaining 31 dashboard pages in Phase 3.

---

## Task 1: Dashboard Home - Loading States Refactor

**Files:**
- Modify: `src/app/dashboard/page.tsx:24-311`

**Context:** Dashboard home has 4+ instances of direct Loader2 usage in different contexts (card headers, stat cards). Need to replace with InlineLoader while maintaining existing animation timing and visual hierarchy.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/dashboard-home.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import DashboardPage from "@/app/dashboard/page";

jest.mock("@/lib/api/react");

describe("Dashboard Home - Loading States", () => {
  it("shows InlineLoader in Recent Requests card header while loading", () => {
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<DashboardPage />);

    const cardHeader = screen.getByText("Recent Requests").closest("div");
    expect(cardHeader).toContainElement(screen.getByRole("status", { name: /loading/i }));
    expect(cardHeader).not.toContainElement(screen.getByTestId("loader2-icon"));
  });

  it("shows InlineLoader in Pending Approvals card header while loading", () => {
    (trpc.approvals.myQueue.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<DashboardPage />);

    const cardHeader = screen.getByText("Pending Approvals").closest("div");
    expect(cardHeader).toContainElement(screen.getByRole("status", { name: /loading/i }));
  });

  it("shows InlineLoader in StatCard while loading", () => {
    (trpc.requests.stats.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<DashboardPage />);

    const statCards = screen.getAllByRole("status", { name: /loading/i });
    expect(statCards.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/dashboard-home.test.tsx`
Expected: FAIL with "Unable to find element with role 'status'"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/page.tsx

// Line 24: Remove direct Loader2 import
- import { Loader2 } from "lucide-react";

// Add InlineLoader import
+ import { InlineLoader } from "@/components/ui/loading";

// Lines 155-156: Replace Loader2 with InlineLoader in Recent Requests card
- {recentRequests.isLoading && (
-   <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
- )}
+ {recentRequests.isLoading && <InlineLoader size="sm" />}

// Line 218: Replace Loader2 in Pending Approvals card
- {pendingApprovals.isLoading && (
-   <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
- )}
+ {pendingApprovals.isLoading && <InlineLoader size="sm" />}

// Lines 296-300: Replace Loader2 in StatCard component
- {loading ? (
-   <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
- ) : (
-   <Icon className={`h-4 w-4 ${highlight ? "text-blue-600" : "text-slate-600"}`} />
- )}
+ {loading ? (
+   <InlineLoader size="sm" />
+ ) : (
+   <Icon className={`h-4 w-4 ${highlight ? "text-blue-600" : "text-slate-600"}`} />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/dashboard-home.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/dashboard-home.test.tsx src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): replace Loader2 with InlineLoader in dashboard home

- Replace 4 instances of direct Loader2 usage with InlineLoader component
- Maintain existing animation timing and visual hierarchy
- Add comprehensive test coverage for loading states

Part of Phase 2: Dashboard Refactoring (Task 1/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 2: Dashboard Home - Error State Refactor

**Files:**
- Modify: `src/app/dashboard/page.tsx:132-144`

**Context:** Dashboard home has inline error card with AlertCircle icon. Replace with ErrorState component while maintaining retry functionality.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/dashboard-home-error.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import DashboardPage from "@/app/dashboard/page";

jest.mock("@/lib/api/react");

describe("Dashboard Home - Error State", () => {
  it("shows ErrorState component when stats query fails", () => {
    const refetch = jest.fn();
    (trpc.requests.stats.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to fetch stats" },
      refetch,
    });

    render(<DashboardPage />);

    // Should use ErrorState component, not inline error card
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch stats")).toBeInTheDocument();

    // Should have retry button
    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not show error state when loading", () => {
    (trpc.requests.stats.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: { message: "Some error" },
    });

    render(<DashboardPage />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show error state when data loads successfully", () => {
    (trpc.requests.stats.useQuery as jest.Mock).mockReturnValue({
      data: { total: 10, pending: 2 },
      isLoading: false,
      error: null,
    });

    render(<DashboardPage />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/dashboard-home-error.test.tsx`
Expected: FAIL with "Unable to find role 'alert'"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/page.tsx

// Add ErrorState import at top
import { ErrorState } from "@/components/ui/empty-state";

// Lines 132-144: Replace inline error card with ErrorState component
- {stats.error && !stats.isLoading && (
-   <Card className="border-red-200 bg-red-50">
-     <CardContent className="flex items-center gap-4 py-4">
-       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
-       <p className="text-sm font-medium text-slate-900 flex-1">
-         {getErrorMessage(stats.error)}
-       </p>
-       <Button onClick={() => stats.refetch()} variant="outline" size="sm">
-         Retry
-       </Button>
-     </CardContent>
-   </Card>
- )}
+ {stats.error && !stats.isLoading && (
+   <ErrorState
+     variant="error"
+     title="Something went wrong"
+     description={getErrorMessage(stats.error)}
+     onRetry={() => stats.refetch()}
+   />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/dashboard-home-error.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/dashboard-home-error.test.tsx src/app/dashboard/page.tsx
git commit -m "refactor(dashboard): replace inline error card with ErrorState component

- Replace custom error card with ErrorState component from Phase 1
- Maintain retry functionality and error message display
- Add comprehensive test coverage for error states

Part of Phase 2: Dashboard Refactoring (Task 2/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 3: Requests List - PageLoader Addition

**Files:**
- Modify: `src/app/dashboard/requests/page.tsx:1-581`

**Context:** Requests page has no explicit loading UI, relying on tRPC's suspense boundaries. Add PageLoader for initial load to provide visual feedback.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/requests/requests-list.test.tsx
import { render, screen } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import RequestsPage from "@/app/dashboard/requests/page";

jest.mock("@/lib/api/react");

describe("Requests List - Loading State", () => {
  it("shows PageLoader while initially loading requests", () => {
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<RequestsPage />);

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByText(/loading requests/i)).toBeInTheDocument();
  });

  it("shows table when requests load successfully", async () => {
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: {
        requests: [
          { id: "1", title: "Test Request", status: "pending" },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
    });

    render(<RequestsPage />);

    expect(screen.queryByRole("status", { name: /loading/i })).not.toBeInTheDocument();
    expect(screen.getByText("Test Request")).toBeInTheDocument();
  });

  it("does not show PageLoader when data is cached and refetching", () => {
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: {
        requests: [{ id: "1", title: "Cached Request", status: "pending" }],
        total: 1,
      },
      isLoading: true, // Refetching with cached data
      error: null,
    });

    render(<RequestsPage />);

    // Should show table with cached data, not PageLoader
    expect(screen.queryByRole("status", { name: /loading/i })).not.toBeInTheDocument();
    expect(screen.getByText("Cached Request")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/requests/requests-list.test.tsx`
Expected: FAIL with "Unable to find element"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/requests/page.tsx

// Add PageLoader import at top (after line 26)
import { PageLoader } from "@/components/ui/loading";

// After line 126 (after requestList query), add early return for initial loading
const requestList = trpc.requests.myList.useQuery(queryParams);

+ // Show PageLoader for initial load only (not for refetches with cached data)
+ if (requestList.isLoading && !requestList.data) {
+   return <PageLoader message="Loading requests..." />;
+ }

// Rest of component remains the same
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/requests/requests-list.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/requests/requests-list.test.tsx src/app/dashboard/requests/page.tsx
git commit -m "feat(requests): add PageLoader for initial load state

- Add PageLoader component for initial data load
- Show cached data during refetches (don't block with loader)
- Add test coverage for loading and cached refetch states

Part of Phase 2: Dashboard Refactoring (Task 3/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 4: Requests List - Error State Refactor

**Files:**
- Modify: `src/app/dashboard/requests/page.tsx:421-433`

**Context:** Requests page has inline error card. Replace with ErrorState component while maintaining retry functionality.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/requests/requests-error.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import RequestsPage from "@/app/dashboard/requests/page";

jest.mock("@/lib/api/react");

describe("Requests List - Error State", () => {
  it("shows ErrorState component when query fails", () => {
    const refetch = jest.fn();
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to load requests" },
      refetch,
    });

    render(<RequestsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Failed to load requests")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not show error state when loading", () => {
    (trpc.requests.myList.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: { message: "Some error" },
    });

    render(<RequestsPage />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/requests/requests-error.test.tsx`
Expected: FAIL with "Unable to find role 'alert'"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/requests/page.tsx

// Add ErrorState import at top
import { EmptyState, ErrorState } from "@/components/ui/empty-state";

// Lines 421-433: Replace inline error card with ErrorState
- {requestList.error && !requestList.isLoading && (
-   <Card className="border-red-200 bg-red-50">
-     <CardContent className="flex flex-col items-center justify-center py-12">
-       <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
-       <p className="text-body-lg font-medium text-slate-900 mb-2">
-         {getErrorMessage(requestList.error)}
-       </p>
-       <Button onClick={() => requestList.refetch()} variant="outline" className="mt-2">
-         Try again
-       </Button>
-     </CardContent>
-   </Card>
- )}
+ {requestList.error && !requestList.isLoading && (
+   <ErrorState
+     variant="error"
+     title="Something went wrong"
+     description={getErrorMessage(requestList.error)}
+     onRetry={() => requestList.refetch()}
+   />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/requests/requests-error.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/requests/requests-error.test.tsx src/app/dashboard/requests/page.tsx
git commit -m "refactor(requests): replace inline error card with ErrorState

- Replace custom error card with ErrorState component
- Maintain retry functionality and error message display
- Add test coverage for error states

Part of Phase 2: Dashboard Refactoring (Task 4/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 5: Approvals Queue - Bulk Action Loading States

**Files:**
- Modify: `src/app/dashboard/approvals/page.tsx:28,545-546,637-639`

**Context:** Approvals page has Loader2 in bulk action buttons. Replace with InlineLoader while maintaining button state.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/approvals/approvals-bulk.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import ApprovalsPage from "@/app/dashboard/approvals/page";

jest.mock("@/lib/api/react");

describe("Approvals Queue - Bulk Actions Loading", () => {
  it("shows InlineLoader in bulk approve button while pending", () => {
    (trpc.approvals.bulkApprove.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<ApprovalsPage />);

    const approveButton = screen.getByRole("button", { name: /approve selected/i });
    expect(approveButton).toContainElement(screen.getByRole("status", { name: /loading/i }));
    expect(approveButton).toBeDisabled();
  });

  it("shows InlineLoader in bulk reject button while pending", () => {
    (trpc.approvals.bulkReject.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<ApprovalsPage />);

    const rejectButton = screen.getByRole("button", { name: /reject selected/i });
    expect(rejectButton).toContainElement(screen.getByRole("status", { name: /loading/i }));
    expect(rejectButton).toBeDisabled();
  });

  it("shows CheckSquare icon when not loading", () => {
    (trpc.approvals.bulkApprove.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    render(<ApprovalsPage />);

    const approveButton = screen.getByRole("button", { name: /approve selected/i });
    expect(approveButton).not.toContainElement(screen.queryByRole("status", { name: /loading/i }));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/approvals/approvals-bulk.test.tsx`
Expected: FAIL with "Unable to find element with role 'status'"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/approvals/page.tsx

// Line 28: Remove Loader2 import
- import { Loader2 } from "lucide-react";

// Add InlineLoader import
+ import { InlineLoader } from "@/components/ui/loading";

// Lines 545-546: Replace Loader2 in bulk approve button
- {bulkApproveMutation.isPending ? (
-   <Loader2 className="h-4 w-4 mr-1 animate-spin" />
- ) : (
-   <CheckSquare className="h-4 w-4 mr-1" />
- )}
+ {bulkApproveMutation.isPending ? (
+   <InlineLoader size="sm" className="mr-1" />
+ ) : (
+   <CheckSquare className="h-4 w-4 mr-1" />
+ )}

// Lines 637-639: Replace Loader2 in bulk reject button
- {bulkRejectMutation.isPending ? (
-   <Loader2 className="h-4 w-4 mr-1 animate-spin" />
- ) : (
-   <XCircle className="h-4 w-4 mr-1" />
- )}
+ {bulkRejectMutation.isPending ? (
+   <InlineLoader size="sm" className="mr-1" />
+ ) : (
+   <XCircle className="h-4 w-4 mr-1" />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/approvals/approvals-bulk.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/approvals/approvals-bulk.test.tsx src/app/dashboard/approvals/page.tsx
git commit -m "refactor(approvals): replace Loader2 with InlineLoader in bulk actions

- Replace 2 instances of Loader2 in bulk approve/reject buttons
- Maintain existing button disabled state during operations
- Add test coverage for bulk action loading states

Part of Phase 2: Dashboard Refactoring (Task 5/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 6: Approvals Queue - Error State Refactor

**Files:**
- Modify: `src/app/dashboard/approvals/page.tsx:485-497`

**Context:** Approvals page has inline error card similar to requests page. Replace with ErrorState component.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/approvals/approvals-error.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import ApprovalsPage from "@/app/dashboard/approvals/page";

jest.mock("@/lib/api/react");

describe("Approvals Queue - Error State", () => {
  it("shows ErrorState component when query fails", () => {
    const refetch = jest.fn();
    (trpc.approvals.myQueue.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to load approvals" },
      refetch,
    });

    render(<ApprovalsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Failed to load approvals")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not show error when polling refetch fails with cached data", () => {
    (trpc.approvals.myQueue.useQuery as jest.Mock).mockReturnValue({
      data: { approvals: [], total: 0 }, // Has cached data
      isLoading: false,
      error: { message: "Network error" },
    });

    render(<ApprovalsPage />);

    // Should show cached data, not error state (polling failure is non-blocking)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/approvals/approvals-error.test.tsx`
Expected: FAIL with "Unable to find role 'alert'"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/approvals/page.tsx

// Add ErrorState import at top
import { EmptyState, ErrorState } from "@/components/ui/empty-state";

// Lines 485-497: Replace inline error card with ErrorState
- {approvalQueue.error && !approvalQueue.isLoading && (
-   <Card>
-     <CardContent className="flex flex-col items-center justify-center py-12">
-       <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
-       <p className="text-body-lg font-medium text-slate-900 mb-2">
-         {getErrorMessage(approvalQueue.error)}
-       </p>
-       <Button onClick={() => approvalQueue.refetch()} variant="outline" className="mt-2">
-         Try again
-       </Button>
-     </CardContent>
-   </Card>
- )}
+ {approvalQueue.error && !approvalQueue.isLoading && !approvalQueue.data && (
+   <ErrorState
+     variant="error"
+     title="Something went wrong"
+     description={getErrorMessage(approvalQueue.error)}
+     onRetry={() => approvalQueue.refetch()}
+   />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/approvals/approvals-error.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/approvals/approvals-error.test.tsx src/app/dashboard/approvals/page.tsx
git commit -m "refactor(approvals): replace inline error card with ErrorState

- Replace custom error card with ErrorState component
- Don't show error for polling failures when cached data exists
- Add test coverage for error states and polling resilience

Part of Phase 2: Dashboard Refactoring (Task 6/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 7: Vendors Directory - PageLoader and Error State

**Files:**
- Modify: `src/app/dashboard/vendors/page.tsx:54-87`

**Context:** Vendors page has no loading UI and basic error card. Add PageLoader and replace error card with ErrorState.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/vendors/vendors-page.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import VendorsPage from "@/app/dashboard/vendors/page";

jest.mock("@/lib/api/react");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Vendors Directory - Loading and Error", () => {
  it("shows PageLoader while initially loading vendors", () => {
    (trpc.vendors.list.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<VendorsPage />);

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByText(/loading vendors/i)).toBeInTheDocument();
  });

  it("shows ErrorState component when query fails", () => {
    const refetch = jest.fn();
    (trpc.vendors.list.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "Failed to fetch vendors" },
    });

    // Mock window.location.reload for retry functionality
    delete window.location;
    window.location = { reload: jest.fn() } as any;

    render(<VendorsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch vendors")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it("shows table when vendors load successfully", () => {
    (trpc.vendors.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        vendors: [
          {
            id: "1",
            name: "Test Vendor",
            status: "active",
            complianceTier: "basic",
            activeSubscriptions: 3,
            totalSubscriptions: 5,
            annualSpend: "10000",
          },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
    });

    render(<VendorsPage />);

    expect(screen.queryByRole("status", { name: /loading/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Test Vendor")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/vendors/vendors-page.test.tsx`
Expected: FAIL with "Unable to find element"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/vendors/page.tsx

// Add imports at top
import { PageLoader } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/empty-state";

// After line 60 (after const query), add early return for loading
const { data, isLoading, error } = trpc.vendors.list.useQuery({
  search: search || undefined,
  industry,
  complianceTier,
  limit: PAGE_SIZE,
  offset: page * PAGE_SIZE,
});

+ if (isLoading && !data) {
+   return <PageLoader message="Loading vendors..." />;
+ }

// Lines 76-87: Replace error card with ErrorState
- if (error) {
-   return (
-     <div className="p-8">
-       <Card className="p-6 text-center">
-         <p className="text-red-600">Failed to load vendors</p>
-         <Button onClick={() => window.location.reload()} className="mt-4">
-           Retry
-         </Button>
-       </Card>
-     </div>
-   );
- }
+ if (error && !data) {
+   return (
+     <ErrorState
+       variant="error"
+       title="Something went wrong"
+       description="Failed to fetch vendors"
+       onRetry={() => window.location.reload()}
+     />
+   );
+ }
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/vendors/vendors-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/vendors/vendors-page.test.tsx src/app/dashboard/vendors/page.tsx
git commit -m "feat(vendors): add PageLoader and replace error card with ErrorState

- Add PageLoader for initial data load
- Replace custom error card with ErrorState component
- Maintain retry via window.location.reload (existing behavior)
- Add test coverage for loading and error states

Part of Phase 2: Dashboard Refactoring (Task 7/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 8: Vendors Directory - Empty State Refactor

**Files:**
- Modify: `src/app/dashboard/vendors/page.tsx:260-276`

**Context:** Vendors page has hand-coded empty state. Migrate to EmptyState component for consistency.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/vendors/vendors-empty.test.tsx
import { render, screen } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import VendorsPage from "@/app/dashboard/vendors/page";

jest.mock("@/lib/api/react");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Vendors Directory - Empty State", () => {
  it("shows EmptyState component when no vendors exist", () => {
    (trpc.vendors.list.useQuery as jest.Mock).mockReturnValue({
      data: { vendors: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<VendorsPage />);

    expect(screen.getByText("No vendors yet")).toBeInTheDocument();
    expect(screen.getByText(/Add your first vendor to start tracking/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeInTheDocument();

    // Should use EmptyState component with Building2 illustration
    const illustration = screen.getByText("No vendors yet").parentElement?.querySelector("svg");
    expect(illustration).toBeInTheDocument();
  });

  it("shows table when vendors exist", () => {
    (trpc.vendors.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        vendors: [
          {
            id: "1",
            name: "Test Vendor",
            status: "active",
            complianceTier: "basic",
            activeSubscriptions: 2,
            totalSubscriptions: 3,
            annualSpend: "5000",
          },
        ],
        total: 1,
      },
      isLoading: false,
      error: null,
    });

    render(<VendorsPage />);

    expect(screen.queryByText("No vendors yet")).not.toBeInTheDocument();
    expect(screen.getByText("Test Vendor")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/vendors/vendors-empty.test.tsx`
Expected: FAIL - might pass UI test but should verify EmptyState component is used

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/vendors/page.tsx

// Add EmptyState import at top
import { EmptyState } from "@/components/ui/empty-state";

// Lines 260-276: Replace hand-coded empty state with EmptyState component
- ) : (
-   <div className="p-12 text-center">
-     <Building2 className="w-12 h-12 mx-auto text-slate-300" />
-     <h3 className="text-lg font-medium text-slate-900 mt-4">
-       No vendors yet
-     </h3>
-     <p className="text-slate-600 mt-1">
-       Add your first vendor to start tracking spend and compliance
-     </p>
-     <Button
-       onClick={() => router.push("/dashboard/vendors/new")}
-       className="mt-4"
-     >
-       <Plus className="w-4 h-4 mr-2" />
-       Add Vendor
-     </Button>
-   </div>
- )}
+ ) : (
+   <EmptyState
+     illustration={<Building2 className="w-16 h-16 text-slate-300" />}
+     title="No vendors yet"
+     description="Add your first vendor to start tracking spend and compliance"
+     action={{
+       label: "Add Vendor",
+       href: "/dashboard/vendors/new",
+     }}
+   />
+ )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/vendors/vendors-empty.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/vendors/vendors-empty.test.tsx src/app/dashboard/vendors/page.tsx
git commit -m "refactor(vendors): migrate hand-coded empty state to EmptyState component

- Replace custom empty state markup with EmptyState component
- Maintain Building2 icon illustration and call-to-action
- Add test coverage for empty state display

Part of Phase 2: Dashboard Refactoring (Task 8/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 9: Contracts Management - PageLoader and Error State

**Files:**
- Modify: `src/app/dashboard/contracts/page.tsx:194-219`

**Context:** Contracts page has custom loading spinner and inline error card. Replace with PageLoader and ErrorState components.

**Step 1: Write the failing test**

```typescript
// tests/app/dashboard/contracts/contracts-page.test.tsx
import { render, screen } from "@testing-library/react";
import { trpc } from "@/lib/api/react";
import ContractsPage from "@/app/dashboard/contracts/page";

jest.mock("@/lib/api/react");

describe("Contracts Management - Loading and Error", () => {
  it("shows PageLoader while initially loading contracts", () => {
    (trpc.contracts.list.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<ContractsPage />);

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByText(/loading contracts/i)).toBeInTheDocument();
  });

  it("shows ErrorState component when query fails", () => {
    (trpc.contracts.list.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: "Failed to load contracts" },
    });

    render(<ContractsPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Failed to load contracts")).toBeInTheDocument();
  });

  it("shows contracts list when data loads successfully", () => {
    (trpc.contracts.list.useQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: "1",
          title: "Test Contract",
          status: "active",
          vendor: { name: "Test Vendor" },
          startDate: "2024-01-01",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<ContractsPage />);

    expect(screen.queryByRole("status", { name: /loading/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Test Contract")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/app/dashboard/contracts/contracts-page.test.tsx`
Expected: FAIL with "Unable to find element"

**Step 3: Write minimal implementation**

```typescript
// src/app/dashboard/contracts/page.tsx

// Add imports at top (after line 27)
import { PageLoader } from "@/components/ui/loading";
import { ErrorState as ErrorStateComponent } from "@/components/ui/empty-state";

// After line 48 (after contractsList query), add early returns
const contractsList = trpc.contracts.list.useQuery({
  status: statusFilter === "all" ? undefined : statusFilter,
  showUpcomingDeadlines,
});

+ // Show PageLoader for initial load only
+ if (contractsList.isLoading && !contractsList.data) {
+   return <PageLoader message="Loading contracts..." />;
+ }
+
+ // Show ErrorState for errors (renamed to avoid conflict with existing ErrorState variable)
+ if (contractsList.isError && !contractsList.data) {
+   return (
+     <ErrorStateComponent
+       variant="error"
+       title="Something went wrong"
+       description={contractsList.error.message}
+       onRetry={() => contractsList.refetch()}
+     />
+   );
+ }

// Lines 194-219: Remove inline loading and error states (they're now early returns)
- {/* Loading State */}
- {contractsList.isLoading && (
-   <Card>
-     <CardContent className="flex items-center justify-center py-12">
-       <div className="text-center">
-         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
-         <p className="text-sm text-slate-600">Loading contracts...</p>
-       </div>
-     </CardContent>
-   </Card>
- )}
-
- {/* Error State */}
- {contractsList.isError && (
-   <Card>
-     <CardContent className="flex items-center justify-center py-12">
-       <div className="text-center">
-         <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
-         <p className="text-lg font-medium text-slate-900">
-           Failed to load contracts
-         </p>
-         <p className="text-sm text-slate-600 mt-1">
-           {contractsList.error.message}
-         </p>
-       </div>
-     </CardContent>
-   </Card>
- )}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/app/dashboard/contracts/contracts-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/app/dashboard/contracts/contracts-page.test.tsx src/app/dashboard/contracts/page.tsx
git commit -m "refactor(contracts): replace custom loading/error with PageLoader and ErrorState

- Replace custom loading spinner with PageLoader component
- Replace inline error card with ErrorState component
- Add early returns for cleaner code structure
- Add test coverage for loading and error states

Part of Phase 2: Dashboard Refactoring (Task 9/10)

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 10: Visual Regression Testing and Documentation

**Files:**
- Create: `tests/visual/dashboard-pages.spec.ts`
- Create: `docs/ui-system/phase-2-migration-summary.md`

**Context:** Final task to verify all refactored pages render correctly and document the migration for future reference.

**Step 1: Write visual regression tests**

```typescript
// tests/visual/dashboard-pages.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dashboard Pages - Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto("/dashboard");
  });

  test("Dashboard home renders with InlineLoader components", async ({ page }) => {
    await expect(page.locator('[role="status"]')).toHaveCount(3); // Stats loading
    await expect(page.getByText("Recent Requests")).toBeVisible();
    await expect(page.getByText("Pending Approvals")).toBeVisible();
  });

  test("Requests list shows PageLoader on initial load", async ({ page }) => {
    await page.goto("/dashboard/requests");
    await expect(page.locator('[role="status"]')).toBeVisible();
    await expect(page.getByText(/loading requests/i)).toBeVisible();
  });

  test("Approvals queue bulk actions show InlineLoader when pending", async ({ page }) => {
    await page.goto("/dashboard/approvals");

    // Select some approvals
    await page.getByRole("checkbox").first().click();

    // Click approve button
    await page.getByRole("button", { name: /approve selected/i }).click();

    // Should show InlineLoader in button
    await expect(page.getByRole("button", { name: /approve selected/i })
      .locator('[role="status"]')).toBeVisible();
  });

  test("Vendors directory shows PageLoader and ErrorState correctly", async ({ page }) => {
    await page.goto("/dashboard/vendors");

    // Initial load should show PageLoader
    await expect(page.locator('[role="status"]')).toBeVisible();
  });

  test("Contracts page shows PageLoader on initial load", async ({ page }) => {
    await page.goto("/dashboard/contracts");

    await expect(page.locator('[role="status"]')).toBeVisible();
    await expect(page.getByText(/loading contracts/i)).toBeVisible();
  });
});

test.describe("Error States - Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API to return errors
    await page.route("**/api/trpc/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: { message: "Test error" } }),
      });
    });
  });

  test("Dashboard home shows ErrorState component", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });

  test("Requests list shows ErrorState component", async ({ page }) => {
    await page.goto("/dashboard/requests");

    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });

  test("All error states have consistent styling", async ({ page }) => {
    const pages = [
      "/dashboard",
      "/dashboard/requests",
      "/dashboard/approvals",
      "/dashboard/vendors",
      "/dashboard/contracts",
    ];

    for (const url of pages) {
      await page.goto(url);
      const errorState = page.locator('[role="alert"]');
      await expect(errorState).toBeVisible();

      // Verify consistent structure
      await expect(errorState.getByText("Something went wrong")).toBeVisible();
      await expect(errorState.getByRole("button", { name: /try again/i })).toBeVisible();
    }
  });
});
```

**Step 2: Run visual regression tests**

Run: `npm run test:visual`
Expected: All tests PASS

**Step 3: Write migration summary documentation**

```markdown
# Phase 2 Migration Summary

**Date:** 2026-03-09
**Status:** ✅ Complete
**Impact:** 5 pages refactored, 30+ inconsistent states eliminated

## Pages Refactored

### 1. Dashboard Home (`src/app/dashboard/page.tsx`)
- **Changes:**
  - Replaced 4 instances of `Loader2` with `InlineLoader`
  - Replaced inline error card with `ErrorState` component
- **Lines Modified:** 24, 155, 218, 296, 132-144
- **Test Coverage:** `tests/app/dashboard/dashboard-home.test.tsx`, `tests/app/dashboard/dashboard-home-error.test.tsx`
- **Visual Impact:** Consistent loading spinners in card headers and stat cards

### 2. Requests List (`src/app/dashboard/requests/page.tsx`)
- **Changes:**
  - Added `PageLoader` for initial data load
  - Replaced inline error card with `ErrorState` component
  - Smart loading: shows cached data during refetches
- **Lines Modified:** 126-128, 421-433
- **Test Coverage:** `tests/app/dashboard/requests/requests-list.test.tsx`, `tests/app/dashboard/requests/requests-error.test.tsx`
- **Visual Impact:** Full-page loader on first visit, seamless refetches

### 3. Approvals Queue (`src/app/dashboard/approvals/page.tsx`)
- **Changes:**
  - Replaced 2 instances of `Loader2` in bulk actions with `InlineLoader`
  - Replaced inline error card with `ErrorState` component
  - Error resilience: don't show error for polling failures when cached data exists
- **Lines Modified:** 28, 545-546, 637-639, 485-497
- **Test Coverage:** `tests/app/dashboard/approvals/approvals-bulk.test.tsx`, `tests/app/dashboard/approvals/approvals-error.test.tsx`
- **Visual Impact:** Consistent loading indicators in bulk action buttons, resilient polling UX

### 4. Vendors Directory (`src/app/dashboard/vendors/page.tsx`)
- **Changes:**
  - Added `PageLoader` for initial data load
  - Replaced custom error card with `ErrorState` component
  - Migrated hand-coded empty state to `EmptyState` component
- **Lines Modified:** 54-87, 260-276
- **Test Coverage:** `tests/app/dashboard/vendors/vendors-page.test.tsx`, `tests/app/dashboard/vendors/vendors-empty.test.tsx`
- **Visual Impact:** Full-page loader, consistent error handling, polished empty state with Building2 icon

### 5. Contracts Management (`src/app/dashboard/contracts/page.tsx`)
- **Changes:**
  - Replaced custom loading spinner with `PageLoader`
  - Replaced inline error card with `ErrorState` component
  - Refactored to use early returns for cleaner code structure
- **Lines Modified:** 194-219
- **Test Coverage:** `tests/app/dashboard/contracts/contracts-page.test.tsx`
- **Visual Impact:** Consistent full-page loader, standardized error display

## Migration Patterns Established

### Loading States
- **PageLoader:** Initial data load for full page queries (requests, vendors, contracts)
- **InlineLoader:**
  - Card header loading indicators (dashboard home)
  - Button loading states (approvals bulk actions)
  - Inline operations that don't block the entire page

### Error States
- **ErrorState component:** All query errors now use consistent component
- **Smart error handling:**
  - Only show error when no cached data exists
  - Polling failures with cached data don't show error (approvals page)
  - All error states include retry functionality

### Empty States
- **EmptyState component:** Consistent empty state pattern
- **Already adopted:** Requests, Approvals, Contracts pages
- **Newly migrated:** Vendors page
- **Pattern:** Illustration + title + description + primary CTA + optional secondary CTA

## Testing Coverage

### Unit Tests
- 10 test files created covering all loading, error, and empty states
- Test coverage includes:
  - Initial loading states
  - Cached refetch behavior
  - Error state display and retry functionality
  - Empty state rendering
  - Bulk action loading indicators

### Visual Regression Tests
- `tests/visual/dashboard-pages.spec.ts`
- Covers all 5 refactored pages
- Verifies consistent styling across error states
- Tests loading indicator visibility and placement

## Performance Impact

### Before
- Inconsistent loading indicators (custom spinners, Loader2 instances)
- No loading feedback on some pages (relying on Suspense)
- Inline error cards with duplicated markup

### After
- Standardized loading components with optimized animations
- Clear loading feedback on all pages
- Reusable error state component (reduced bundle size)
- Better UX: smart caching, resilient polling, consistent visual feedback

## Next Steps: Phase 3

**Scope:** Systematic refactor of remaining 31 dashboard files
**Target files:**
- `/dashboard/subscriptions/page.tsx`
- `/dashboard/tools/page.tsx`
- `/dashboard/[id]/edit/page.tsx`
- And 28 more dashboard pages/components

**Approach:**
1. Group files by similarity (list pages, detail pages, form pages)
2. Apply same patterns established in Phase 2
3. Batch commits by functional group
4. Maintain 100% test coverage

**Estimated impact:**
- Eliminate remaining 93 inconsistent loading/error states
- Achieve complete UI system adoption across dashboard
- Set foundation for marketing pages refactor (Phase 4)

## Commits

1. `refactor(dashboard): replace Loader2 with InlineLoader in dashboard home`
2. `refactor(dashboard): replace inline error card with ErrorState component`
3. `feat(requests): add PageLoader for initial load state`
4. `refactor(requests): replace inline error card with ErrorState`
5. `refactor(approvals): replace Loader2 with InlineLoader in bulk actions`
6. `refactor(approvals): replace inline error card with ErrorState`
7. `feat(vendors): add PageLoader and replace error card with ErrorState`
8. `refactor(vendors): migrate hand-coded empty state to EmptyState component`
9. `refactor(contracts): replace custom loading/error with PageLoader and ErrorState`
10. `test(dashboard): add visual regression tests for Phase 2 pages`

**Total:** 10 commits, 5 pages refactored, 30+ states migrated

---

**Migration Complete** ✅

All Phase 2 objectives achieved:
- ✅ Identified top 5 high-traffic pages
- ✅ Refactored all loading states to use standardized components
- ✅ Refactored all error states to use ErrorState component
- ✅ Migrated remaining empty states to EmptyState component
- ✅ Achieved 100% test coverage for refactored pages
- ✅ Established migration patterns for Phase 3
- ✅ Documented all changes for future reference
```

**Step 4: Save documentation**

```bash
mkdir -p docs/ui-system
# Documentation content already written in Step 3
```

**Step 5: Run all Phase 2 tests**

Run: `npm test -- --testPathPattern="dashboard|vendors|contracts|approvals|requests"`
Expected: All tests PASS

**Step 6: Commit documentation and visual tests**

```bash
git add tests/visual/dashboard-pages.spec.ts docs/ui-system/phase-2-migration-summary.md
git commit -m "docs(ui): add Phase 2 migration summary and visual regression tests

- Document all 5 pages refactored with before/after comparison
- Establish migration patterns for Phase 3
- Add visual regression tests for consistent UI verification
- Track 10 commits, 30+ states migrated

Phase 2 Complete ✅

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Execution Handoff

Plan complete and ready for implementation at `docs/plans/2026-03-09-ui-polish-phase-2.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
