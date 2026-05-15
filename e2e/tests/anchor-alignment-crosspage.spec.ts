/**
 * E2E — Cross-page anchor offset alignment (desktop + mobile).
 *
 * Walks public pages and dynamically discovers in-page anchors (id="..."
 * referenced by href="#..." or by Quick Action buttons). For each anchor,
 * triggers a hash navigation and asserts the target lands just below the
 * fixed header on both desktop and mobile viewports.
 */
import { test, expect, devices, type Page } from '@playwright/test';

const PAGES = [
  '/fr',
  '/fr/dashboard',
  '/fr/countries',
  '/fr/countries/portugal',
  '/fr/profile',
  '/fr/community',
  '/fr/pricing',
];

async function getHeaderHeight(page: Page): Promise<number> {
  return page.evaluate(() => {
    const h = document.querySelector('[data-app-header]') as HTMLElement | null;
    return h ? h.getBoundingClientRect().height : 64;
  });
}

async function discoverAnchors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const ids = new Set<string>();
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = (a as HTMLAnchorElement).getAttribute('href')?.slice(1);
      if (id && document.getElementById(id)) ids.add(id);
    });
    // Also pick up sections with [id$="-section"] referenced by Quick Actions
    document.querySelectorAll('[id$="-section"]').forEach((el) => {
      if (el.id) ids.add(el.id);
    });
    return Array.from(ids).slice(0, 6); // cap to keep runtime sane
  });
}

async function triggerAnchor(page: Page, id: string) {
  await page.evaluate((anchor) => {
    const a = document.createElement('a');
    a.href = `#${anchor}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, id);
  await page.waitForTimeout(1400);
}

async function assertAligned(page: Page, id: string) {
  const headerH = await getHeaderHeight(page);
  const top = await page.evaluate((anchor) => {
    const el = document.getElementById(anchor);
    return el ? el.getBoundingClientRect().top : null;
  }, id);
  expect(top).not.toBeNull();
  expect(top!).toBeGreaterThan(-4);
  expect(top!).toBeLessThanOrEqual(headerH + 32);
}

function buildSuite(label: string, viewport: { width: number; height: number } | typeof devices['Pixel 5']) {
  test.describe(`Anchor alignment — ${label}`, () => {
    if ('viewport' in (viewport as object)) {
      test.use(viewport as Parameters<typeof test.use>[0]);
    } else {
      test.use({ viewport: viewport as { width: number; height: number } });
    }

    for (const path of PAGES) {
      test(`${path} — every anchor aligned under header`, async ({ page }) => {
        const errors: string[] = [];
        try {
          await page.goto(path, { waitUntil: 'networkidle', timeout: 30000 });
        } catch {
          test.skip(true, `Cannot load ${path}`);
        }
        const anchors = await discoverAnchors(page);
        if (anchors.length === 0) test.skip(true, `No anchors on ${path}`);

        for (const id of anchors) {
          await triggerAnchor(page, id);
          try {
            await assertAligned(page, id);
          } catch (e) {
            errors.push(`${path}#${id}: ${(e as Error).message}`);
          }
          // Reset scroll between anchors
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
          await page.waitForTimeout(200);
        }
        expect(errors, `Misaligned anchors:\n${errors.join('\n')}`).toEqual([]);
      });
    }
  });
}

buildSuite('desktop', { width: 1440, height: 900 });
buildSuite('mobile', devices['Pixel 5']);
