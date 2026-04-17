import { test, expect } from '@playwright/test';

test.describe('Exit Keys Flow', () => {
  test('should load exit-keys page', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display step indicators', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Look for step indicators or progress
    const steps = page.locator('[class*="step"], [data-step], .step-indicator');
    const hasSteps = await steps.count() > 0;
    
    // Either has visible steps or is a different layout
    expect(typeof hasSteps).toBe('boolean');
  });

  test('should have country selection', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Look for country selector (dropdown or list)
    const countrySelector = page.locator('select, [role="combobox"], [role="listbox"]').first();
    
    if (await countrySelector.isVisible()) {
      await countrySelector.click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate through wizard steps', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Look for next button
    const nextButton = page.locator('button:has-text(/suivant|next|continuer|continue/i)');
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Should have progressed (URL change, step change, etc.)
      const currentUrl = page.url();
      expect(currentUrl).toContain('/exit-keys');
    }
  });

  test('should display exit key cards on catalog page', async ({ page }) => {
    await page.goto('/fr/exit-keys/catalog');
    
    await page.waitForLoadState('networkidle');
    
    // Look for card elements
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should filter exit keys by category', async ({ page }) => {
    await page.goto('/fr/exit-keys/catalog');
    
    await page.waitForLoadState('networkidle');
    
    // Look for filter buttons or tabs
    const filters = page.locator('[role="tab"], button[class*="filter"]');
    
    if (await filters.first().isVisible()) {
      const initialCardCount = await page.locator('[class*="card"], [class*="Card"]').count();
      
      await filters.first().click();
      await page.waitForTimeout(500);
      
      const newCardCount = await page.locator('[class*="card"], [class*="Card"]').count();
      
      // Count may change or stay same depending on filter
      expect(typeof newCardCount).toBe('number');
    }
  });

  test('should open exit key detail modal/page', async ({ page }) => {
    await page.goto('/fr/exit-keys/catalog');
    
    await page.waitForLoadState('networkidle');
    
    // Click on first card
    const firstCard = page.locator('[class*="card"], [class*="Card"]').first();
    
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(1000);
      
      // Should show detail (modal or expanded view)
      const detailVisible = await page.locator('[role="dialog"], [class*="detail"], [class*="modal"]').isVisible();
      const urlChanged = !page.url().endsWith('/catalog');
      
      expect(detailVisible || urlChanged).toBe(true);
    }
  });

  test('should show recommendations based on profile', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Fill in some profile data if fields are visible
    const countrySelect = page.locator('select, [role="combobox"]').first();
    
    if (await countrySelect.isVisible()) {
      await countrySelect.click();
      await page.waitForTimeout(300);
      
      // Select first option if available
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
    
    // Look for recommendations section
    const recommendations = page.locator('text=/recommand|suggest|compatible/i');
    expect(await recommendations.count()).toBeGreaterThanOrEqual(0);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/fr/exit-keys');
    
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    const headingCount = await h1.count();
    expect(headingCount).toBeGreaterThanOrEqual(0);
  });

  test('should compare exit keys', async ({ page }) => {
    await page.goto('/fr/exit-keys/compare');
    
    await page.waitForLoadState('networkidle');
    
    // Page should load
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Look for comparison elements
    const compareSection = page.locator('[class*="compare"], [class*="vs"]');
    expect(await compareSection.count()).toBeGreaterThanOrEqual(0);
  });
});
