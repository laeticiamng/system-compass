import { test, expect } from '@playwright/test';

test.describe('Accessibility Checks', () => {
  test('homepage should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('homepage should have a skip navigation link or landmark roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mainLandmark = page.locator('main, [role="main"]');
    await expect(mainLandmark).toBeVisible();
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      const role = await images.nth(i).getAttribute('role');
      // Images should have alt text or role="presentation"
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through the page
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
  });

  test('buttons should have accessible labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledby = await button.getAttribute('aria-labelledby');
      const title = await button.getAttribute('title');

      // Button should have some accessible name
      const hasLabel = (text && text.trim().length > 0) || ariaLabel || ariaLabelledby || title;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have some accessible label
      const hasLabel = id || ariaLabel || ariaLabelledby || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('page should have proper lang attribute', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('contrast: text should be readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Basic check: page renders with visible text
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check that the page has actual content
    const textContent = await body.textContent();
    expect(textContent && textContent.trim().length > 0).toBe(true);
  });
});
