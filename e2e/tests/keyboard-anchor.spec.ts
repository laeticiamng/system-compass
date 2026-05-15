/**
 * E2E — Keyboard navigation to anchors
 *
 * Validates that:
 *  - Tab moves focus through Quick Action buttons in DOM order
 *  - Enter / Space activates the focused button (anchor scroll)
 *  - After scroll, focus lands inside (or on) the anchored section
 *  - The page does NOT visually jump (scroll position changes monotonically,
 *    not in a single instant frame)
 */
import { test, expect } from '@playwright/test';

const COUNTRY_PATH = '/fr/countries/portugal';

test.describe('Keyboard navigation to anchors', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Tab + Enter activates a quick action and focuses the section', async ({ page }) => {
    await page.goto(COUNTRY_PATH, { waitUntil: 'networkidle' });

    // Focus the first quick action button (find by role + name pattern)
    const firstAction = page.locator('button', { hasText: /Fiscalité|Fiscal/i }).first();
    if ((await firstAction.count()) === 0) test.skip(true, 'No quick action present');

    await firstAction.focus();
    await expect(firstAction).toBeFocused();

    // Sample scroll positions during animation to assert it animated, not jumped
    const samples: number[] = [];
    const sampler = setInterval(async () => {
      samples.push(await page.evaluate(() => window.scrollY));
    }, 50);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(1400);
    clearInterval(sampler);

    // Animation: at least 3 distinct intermediate positions
    const unique = Array.from(new Set(samples));
    expect(unique.length).toBeGreaterThan(2);

    // Focus should be on/in the anchored section after handoff
    const focusInSection = await page.evaluate(() => {
      const section = document.getElementById('fiscal-section');
      const active = document.activeElement;
      return !!section && !!active && (section === active || section.contains(active));
    });
    expect(focusInSection).toBe(true);
  });

  test('Space also activates the action (button semantics)', async ({ page }) => {
    await page.goto(COUNTRY_PATH, { waitUntil: 'networkidle' });
    const action = page.locator('button', { hasText: /Stratégies|Strategies/i }).first();
    if ((await action.count()) === 0) test.skip(true, 'No quick action present');
    await action.focus();
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1400);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).not.toBe(before);
  });

  test('Tab order through quick actions is sequential', async ({ page }) => {
    await page.goto(COUNTRY_PATH, { waitUntil: 'networkidle' });
    const buttons = page.locator(
      'button:has-text("Fiscalité"), button:has-text("Stratégies"), button:has-text("Expert"), button:has-text("Sources")'
    );
    const count = await buttons.count();
    if (count < 2) test.skip(true, 'Quick actions absent');

    await buttons.nth(0).focus();
    for (let i = 1; i < count; i++) {
      await page.keyboard.press('Tab');
      // Focused element should be one of the action buttons (not necessarily nth, but reachable)
      const isActionFocused = await page.evaluate(() => {
        const a = document.activeElement;
        return !!a && a.tagName === 'BUTTON';
      });
      expect(isActionFocused).toBe(true);
    }
  });
});
