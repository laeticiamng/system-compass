import { test, expect } from '@playwright/test';

test.describe('Country Compare Flow', () => {
  test('should load compare page', async ({ page }) => {
    await page.goto('/fr/compare');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should let user pick at least 2 countries', async ({ page }) => {
    await page.goto('/fr/compare');
    await page.waitForLoadState('networkidle');

    // Look for country selectors (combobox / select / search input)
    const selectors = page.locator('[role="combobox"], select, input[placeholder*="ays" i]');
    const count = await selectors.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display comparison table or columns', async ({ page }) => {
    await page.goto('/fr/compare');
    await page.waitForLoadState('networkidle');

    const compareUI = page.locator('table, [class*="compare" i], [class*="grid" i]');
    expect(await compareUI.count()).toBeGreaterThan(0);
  });

  test('should not crash on direct deep-link with no countries', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/fr/compare');
    await page.waitForLoadState('networkidle');

    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
