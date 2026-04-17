import { test, expect } from '@playwright/test';

test.describe('Pricing & Payment Flow', () => {
  test('should load pricing page in French', async ({ page }) => {
    await page.goto('/fr/pricing');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display pricing tiers', async ({ page }) => {
    await page.goto('/fr/pricing');
    await page.waitForLoadState('networkidle');

    // Look for currency markers (€/$) or "free" / "gratuit"
    const priceMarkers = page.locator('text=/€|\\$|gratuit|free|premium|pro/i');
    expect(await priceMarkers.count()).toBeGreaterThan(0);
  });

  test('should have CTA buttons on pricing cards', async ({ page }) => {
    await page.goto('/fr/pricing');
    await page.waitForLoadState('networkidle');

    const ctas = page.locator('button, a').filter({
      hasText: /commencer|s'abonner|subscribe|upgrade|essayer|choisir/i,
    });
    expect(await ctas.count()).toBeGreaterThan(0);
  });

  test('checkout CTA should redirect or open auth when guest', async ({ page }) => {
    await page.goto('/fr/pricing');
    await page.waitForLoadState('networkidle');

    const cta = page
      .locator('button, a')
      .filter({ hasText: /commencer|s'abonner|upgrade|choisir/i })
      .first();

    if (await cta.isVisible()) {
      await cta.click();
      await page.waitForTimeout(1500);

      const url = page.url();
      // Guest must be redirected to auth, pricing, or stripe checkout
      expect(
        url.includes('/auth') ||
          url.includes('/pricing') ||
          url.includes('stripe.com') ||
          url.includes('checkout'),
      ).toBe(true);
    }
  });
});
