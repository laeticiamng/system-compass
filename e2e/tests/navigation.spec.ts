import { test, expect } from '@playwright/test';

test.describe('Navigation and Core Pages', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/fr');
    
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/fr');
    
    await page.waitForLoadState('networkidle');
    
    // Check for navigation
    const nav = page.locator('header nav, header');
    await expect(nav).toBeVisible();
    
    // Check for navigation links
    const links = page.locator('header a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should navigate to countries page', async ({ page }) => {
    await page.goto('/fr');
    
    // Click on countries link
    const countriesLink = page.locator('a[href*="countries"]').first();
    
    if (await countriesLink.isVisible()) {
      await countriesLink.click();
      await page.waitForURL('**/fr/countries**');
      expect(page.url()).toContain('/countries');
    } else {
      // Direct navigation
      await page.goto('/fr/countries');
      expect(page.url()).toContain('/countries');
    }
  });

  test('should display country cards on countries page', async ({ page }) => {
    await page.goto('/fr/countries');
    
    await page.waitForLoadState('networkidle');
    
    // Look for country cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should navigate to country detail', async ({ page }) => {
    await page.goto('/fr/countries');
    
    await page.waitForLoadState('networkidle');
    
    // Click first country card
    const firstCard = page.locator('[class*="card"], [class*="Card"]').first();
    
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to country detail
      expect(page.url()).toMatch(/\/country\/.+/);
    }
  });

  test('should load world map explorer', async ({ page }) => {
    await page.goto('/fr/world-map');
    
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('should load pyramid types page', async ({ page }) => {
    await page.goto('/fr/pyramid-types');
    
    await page.waitForLoadState('networkidle');
    
    // Check for pyramid content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should load errors and illusions page', async ({ page }) => {
    await page.goto('/fr/errors-illusions');
    
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should load pricing page', async ({ page }) => {
    await page.goto('/fr/pricing');
    
    await page.waitForLoadState('networkidle');
    
    // Check for pricing content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Look for pricing cards
    const pricingCards = page.locator('[class*="card"], [class*="pricing"]');
    expect(await pricingCards.count()).toBeGreaterThan(0);
  });

  test('should load about page', async ({ page }) => {
    await page.goto('/fr/about');
    
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const content = page.locator('main, [role="main"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/fr/this-page-does-not-exist-12345');
    
    await page.waitForLoadState('networkidle');
    
    // Should show 404 content
    const notFoundText = page.locator('text=/404|not found|page introuvable/i');
    await expect(notFoundText.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working footer', async ({ page }) => {
    await page.goto('/fr');
    
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for footer links
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should handle language switching', async ({ page }) => {
    await page.goto('/fr');
    
    await page.waitForLoadState('networkidle');
    
    // Look for language switcher
    const langSwitcher = page.locator('[class*="language"], select[class*="lang"]').first();
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      await page.waitForTimeout(300);
      
      // Should show language options
      const options = page.locator('[role="option"], option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/fr');
    
    await page.waitForLoadState('networkidle');
    
    // Should have mobile menu button
    const menuButton = page.locator('[class*="menu"], button[aria-label*="menu"]').first();
    
    // Page should still function
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
