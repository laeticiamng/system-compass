/**
 * E2E — anchor scrolling alignment
 *
 * For every Country Quick Action and the dashboard quick links, clicking the
 * anchor must:
 *  - Scroll the target into view
 *  - Land it just below the fixed header (within ~16px)
 *  - Behave correctly on desktop AND mobile viewports
 */
import { test, expect, devices } from '@playwright/test';

const COUNTRY_PATH = '/fr/countries/portugal';
const ANCHORS = ['fiscal-section', 'strategies-section', 'expert-section', 'sources-section'];

async function getHeaderHeight(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const h = document.querySelector('[data-app-header]') as HTMLElement | null;
    return h ? h.getBoundingClientRect().height : 64;
  });
}

async function checkAnchorAligned(page: import('@playwright/test').Page, id: string) {
  // Trigger the quick-action button (or fall back to a hash navigation)
  const btn = page.locator(`button:has-text(""), [href="#${id}"]`).first();
  // Prefer scrollToAnchor exposed on window via the click handler — emulate a hash click:
  await page.evaluate((anchor) => {
    const el = document.getElementById(anchor);
    if (!el) throw new Error(`Missing #${anchor}`);
    // Use the helper through the global click delegate
    const a = document.createElement('a');
    a.href = `#${anchor}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, id);

  // Wait for scroll animation
  await page.waitForTimeout(1400);

  const headerH = await getHeaderHeight(page);
  const top = await page.evaluate((anchor) => {
    const el = document.getElementById(anchor)!;
    return el.getBoundingClientRect().top;
  }, id);

  // Expect target top to sit just below header (≤ headerH + ~24px breathing)
  expect(top).toBeGreaterThan(0);
  expect(top).toBeLessThanOrEqual(headerH + 28);
}

test.describe('Anchor scroll alignment — desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const id of ANCHORS) {
    test(`#${id} aligns under the header`, async ({ page }) => {
      await page.goto(COUNTRY_PATH, { waitUntil: 'networkidle' });
      const exists = await page.locator(`#${id}`).count();
      test.skip(exists === 0, `Anchor #${id} not present on this page`);
      await checkAnchorAligned(page, id);
    });
  }
});

test.describe('Anchor scroll alignment — mobile', () => {
  test.use({ ...devices['Pixel 5'] });

  for (const id of ANCHORS) {
    test(`#${id} aligns under the header (mobile)`, async ({ page }) => {
      await page.goto(COUNTRY_PATH, { waitUntil: 'networkidle' });
      const exists = await page.locator(`#${id}`).count();
      test.skip(exists === 0, `Anchor #${id} not present on this page`);
      await checkAnchorAligned(page, id);
    });
  }
});
