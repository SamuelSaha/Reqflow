/**
 * E2E Performance Tests
 * Validates Core Web Vitals and load times meet targets
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance tracking
    await page.goto('/');
  });

  test('homepage loads with acceptable FCP (<500ms)', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Get First Contentful Paint
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByName('first-contentful-paint');
      return entries.length > 0 ? entries[0].startTime : null;
    });

    // FCP should be under 500ms (target from #89)
    expect(fcp).not.toBeNull();
    expect(fcp).toBeLessThan(500);
  });

  test('dashboard loads in under 200ms (cached)', async ({ page }) => {
    // First load - warm the cache
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Clear resource timing
    await page.evaluate(() => performance.clearResourceTimings());

    // Second load - measure cached performance
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Cached load should be under 200ms (target from #89)
    expect(loadTime).toBeLessThan(200);
  });

  test('largest contentful paint under 2.5s', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Get Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Timeout after 5s
        setTimeout(() => resolve(null), 5000);
      });
    });

    expect(lcp).not.toBeNull();
    expect(lcp).toBeLessThan(2500);
  });

  test('cumulative layout shift under 0.1', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any layout shifts to occur
    await page.waitForTimeout(2000);

    // Get Cumulative Layout Shift
    const cls = await page.evaluate(() => {
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
      return clsValue;
    });

    // CLS should be under 0.1 (target from #89)
    expect(cls).toBeLessThan(0.1);
  });

  test('time to interactive under 1s (cached)', async ({ page }) => {
    // Warm cache
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Measure TTI on cached load
    const startTime = Date.now();
    await page.goto('/dashboard');

    // Wait for page to be interactive
    await page.waitForLoadState('load');

    // Check if page is actually interactive by clicking something
    await page.locator('button, a, [role="button"]').first().isEnabled();

    const tti = Date.now() - startTime;

    // TTI should be under 1s (target from #89)
    expect(tti).toBeLessThan(1000);
  });

  test('no spinners on repeat visits (optimistic UI)', async ({ page }) => {
    // First visit
    await page.goto('/dashboard/requests');
    await page.waitForLoadState('networkidle');

    // Navigate away and back
    await page.goto('/dashboard/approvals');
    await page.waitForLoadState('networkidle');

    await page.goto('/dashboard/requests');

    // Check that data appears immediately (from cache)
    // No loading spinners should be visible
    const spinners = page.locator('[role="progressbar"], .spinner, .loading');
    const spinnerCount = await spinners.count();

    // Should have 0 spinners on cached navigation
    expect(spinnerCount).toBe(0);
  });

  test('search responds in under 100ms', async ({ page }) => {
    await page.goto('/dashboard/requests');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[type="search"]').first();

    if (await searchInput.count() > 0) {
      const startTime = Date.now();

      // Type in search
      await searchInput.fill('test');

      // Wait for search results to update
      await page.waitForTimeout(50);

      const searchTime = Date.now() - startTime;

      // Search should respond in under 100ms (target from #89)
      expect(searchTime).toBeLessThan(100);
    } else {
      test.skip();
    }
  });

  test('no console errors during navigation', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate through key pages
    await page.goto('/dashboard');
    await page.goto('/dashboard/requests');
    await page.goto('/dashboard/approvals');

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});
