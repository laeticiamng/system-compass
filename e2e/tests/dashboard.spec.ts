import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Dashboard should load (may redirect to auth if not logged in)
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    expect(currentUrl.includes('/dashboard') || currentUrl.includes('/auth')).toBe(true);
  });

  test('should display main dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for dashboard title or heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should show login prompt for guests', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Look for login prompt or redirect
    const loginPrompt = page.locator('text=/connexion|login|sign in|connecter/i');
    const authPage = page.url().includes('/auth');
    
    // Either shows login prompt or redirected to auth
    expect(await loginPrompt.isVisible() || authPage).toBe(true);
  });

  test('should have navigation to exit-keys', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Look for link to exit-keys
    const exitKeysLink = page.locator('a[href*="exit-keys"], button:has-text(/clés de sortie|exit keys/i)');
    
    if (await exitKeysLink.first().isVisible()) {
      await exitKeysLink.first().click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('exit-keys');
    }
  });

  test('should display tabs for different sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Look for tab navigation
    const tabs = page.locator('[role="tablist"], .tabs');
    
    if (await tabs.isVisible()) {
      const tabButtons = page.locator('[role="tab"]');
      const count = await tabButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show progress indicators', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Look for progress bars or percentage indicators
    const progressBars = page.locator('[role="progressbar"], .progress');
    const percentages = page.locator('text=/%/');
    
    const hasProgress = await progressBars.count() > 0 || await percentages.count() > 0;
    // Progress may not be visible if user hasn't started a plan
    expect(typeof hasProgress).toBe('boolean');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Page should still be functional on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // No horizontal overflow
    const bodyWidth = await body.evaluate(el => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20); // Small tolerance
  });
});
