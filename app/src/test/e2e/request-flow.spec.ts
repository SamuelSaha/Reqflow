/**
 * E2E test for critical request flow
 * Flow: Login → Dashboard → Navigate
 *
 * Uses dev seed credentials (see scripts/seed-dev.ts):
 *   admin@acme.dev / password123
 */

import { test, expect } from "@playwright/test";

/** Log in via the /login page form */
async function login(
  page: import("@playwright/test").Page,
  email = "admin@acme.dev",
  password = "password123"
) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

test.describe("Request Creation Flow", () => {
  test("should login and see the dashboard", async ({ page }) => {
    await login(page);

    // Dashboard heading visible
    await expect(page.locator("h1")).toContainText("Dashboard");

    // Key UI elements present
    await expect(page.locator("text=New Request")).toBeVisible();
    await expect(page.locator("text=Recent Requests")).toBeVisible();
    await expect(page.locator("text=Action Required")).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("should navigate to requests page", async ({ page }) => {
    await login(page);

    await page.click('a[href="/dashboard/requests"]');
    await page.waitForURL("**/dashboard/requests");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should navigate to new request form", async ({ page }) => {
    await login(page);

    // Click New Request button on dashboard
    await page.click("text=New Request");
    await page.waitForURL("**/dashboard/requests/new");
  });
});
