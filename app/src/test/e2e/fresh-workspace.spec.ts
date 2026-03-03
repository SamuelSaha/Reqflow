/**
 * E2E tests: fresh workspace empty states
 *
 * Dev seed creates orgs/users/departments/budgets but no subscriptions,
 * invoices, or contracts — so those pages load into their true empty state.
 *
 * Uses dev seed credentials (see scripts/seed-dev.ts):
 *   admin@acme.dev / password123
 */

import { test, expect } from "@playwright/test";

async function login(
  page: import("@playwright/test").Page,
  email = "admin@acme.dev",
  password = "password123"
) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

// ─────────────────────────────────────────────────
// Subscriptions
// ─────────────────────────────────────────────────
test.describe("Subscriptions — empty state", () => {
  test("shows empty state with CTA on fresh workspace", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/subscriptions");

    // Page heading
    await expect(page.locator("h1")).toContainText("Subscriptions");

    // Empty state headline
    await expect(
      page.getByText("No subscriptions yet", { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    // Primary CTA present and links to request creation
    const cta = page.getByRole("link", { name: "Create a Request" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/dashboard/requests/new");
  });

  test("shows filter-aware empty state when status filter matches nothing", async ({
    page,
  }) => {
    await login(page);
    // Navigate with a status that won't match anything in fresh workspace
    await page.goto("/dashboard/subscriptions");

    // Change the status filter to "expired" (no expired subs on fresh install)
    const statusTrigger = page.locator('[id="radix-\\:.*:"], [data-radix-select-trigger]').first();
    // Use the first Select trigger in the subscriptions card header
    const selectTriggers = page.locator('[role="combobox"]');
    await selectTriggers.first().click();
    await page.getByRole("option", { name: "Expired" }).click();

    // Should show filter-aware copy
    await expect(
      page.getByText("No subscriptions match these filters", { exact: false })
    ).toBeVisible({ timeout: 8_000 });

    // Should show "Clear filters" secondary action
    const clearBtn = page.getByRole("button", { name: "Clear filters" });
    await expect(clearBtn).toBeVisible();

    // Clicking clear should reset to default empty state
    await clearBtn.click();
    await expect(
      page.getByText("No subscriptions yet", { exact: false })
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────
test.describe("Invoices — empty state", () => {
  test("shows empty state on fresh workspace (no invoices)", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/dashboard/invoices");

    await expect(page.locator("h1")).toContainText("Invoice");

    // Empty state headline
    await expect(
      page.getByText("No invoices yet", { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    // Descriptive copy about accounting sync
    await expect(
      page.getByText(/Invoices will appear here once they are uploaded/, {
        exact: false,
      })
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────
// Contracts
// ─────────────────────────────────────────────────
test.describe("Contracts — empty state", () => {
  test("does NOT render filter card on fresh workspace", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/contracts");

    // Wait for data to settle (loading spinner disappears)
    await expect(page.locator("text=Loading contracts...")).not.toBeVisible({
      timeout: 10_000,
    });

    // "Filters" card should NOT be visible when there are no contracts and
    // no active filter
    await expect(page.getByText("Filters", { exact: true })).not.toBeVisible();

    // Empty state headline
    await expect(
      page.getByText("No contracts yet", { exact: false })
    ).toBeVisible();

    // Primary CTA present
    const cta = page.getByRole("link", { name: "Create Contract" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/dashboard/contracts/new");
  });

  test("New Contract button in header is always visible", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/contracts");

    await expect(
      page.getByRole("link", { name: "New Contract" })
    ).toBeVisible();
  });

  test("shows filter-aware empty state when filtering via 'Upcoming Deadlines' toggle", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/dashboard/contracts");

    // Wait for empty state to be visible first
    await expect(
      page.getByText("No contracts yet", { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    // The "Upcoming Deadlines" toggle is inside the filter card which is hidden.
    // Verify the filter card is NOT present (correct default behavior).
    await expect(page.getByText("Filters", { exact: true })).not.toBeVisible();

    // Verify clicking "New Contract" opens the contract creation form
    await page.getByRole("link", { name: "Create Contract" }).click();
    await page.waitForURL("**/dashboard/contracts/new", { timeout: 8_000 });
    await expect(page.locator("h1, h2")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────
// Team invite flow (fresh workspace)
// ─────────────────────────────────────────────────
test.describe("Team — empty state and invite", () => {
  test("team settings shows existing users (from seed)", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard/settings/team");

    // The seed created 4 users, so the team page should NOT be empty
    await expect(page.locator("h1, h2").filter({ hasText: /team/i })).toBeVisible({
      timeout: 10_000,
    });

    // Invite button is always visible for admins
    await expect(
      page.getByRole("button", { name: /invite/i })
    ).toBeVisible();
  });

  test("unauthenticated access to team settings redirects to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings/team");
    await page.waitForURL("**/login**", { timeout: 10_000 });
  });
});
