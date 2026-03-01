/**
 * E2E test for critical request flow
 * Flow: Login → Create Request → View in dashboard
 */

import { test, expect } from "@playwright/test";

test.describe("Request Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto("/");
  });

  test("should create a new request and see it in dashboard", async ({ page }) => {
    // TODO: Implement actual login flow when auth is finalized
    // For now, this is a placeholder for the critical path

    // 1. Login (placeholder)
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');

    // 2. Navigate to dashboard
    await page.goto("/dashboard");

    // 3. Verify dashboard loads
    await expect(page.locator("h1")).toContainText("Dashboard");

    // 4. Click "New Request" button
    await page.click('text=New Request');

    // 5. Fill out request form
    await page.fill('[name="title"]', "Test Purchase Request");
    await page.fill('[name="amount"]', "1000");
    await page.selectOption('[name="category"]', "Software");

    // 6. Submit request
    await page.click('button[type="submit"]');

    // 7. Verify success message
    await expect(page.locator('text=Request created')).toBeVisible();

    // 8. Navigate back to dashboard
    await page.goto("/dashboard");

    // 9. Verify request appears in list
    await expect(page.locator('text=Test Purchase Request')).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/dashboard/requests/new");

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Verify validation errors appear
    await expect(page.locator('text=required')).toBeVisible();
  });

  test("should show pending requests in dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify stats cards are visible
    await expect(page.locator('text=Pending Requests')).toBeVisible();
    await expect(page.locator('text=My Requests')).toBeVisible();
  });
});
