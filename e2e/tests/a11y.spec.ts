/**
 * Accessibility audit running axe-core on the main public flows.
 * Failures are categorized by severity; only `serious` and `critical`
 * issues fail the build to keep the bar achievable.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'home (FR)', path: '/fr' },
  { name: 'countries list', path: '/fr/countries' },
  { name: 'auth', path: '/fr/auth' },
  { name: 'exit-keys', path: '/fr/exit-keys' },
  { name: 'compare', path: '/fr/compare' },
  { name: 'pricing', path: '/fr/pricing' },
];

for (const page of PAGES) {
  test(`a11y: ${page.name} has no critical/serious violations`, async ({ page: p }) => {
    await p.goto(page.path);
    // Let async hydration settle
    await p.waitForLoadState('networkidle').catch(() => undefined);

    const results = await new AxeBuilder({ page: p })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (blocking.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `[a11y] ${page.name} — ${blocking.length} blocking violations:`,
        blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
      );
    }

    expect(blocking, `${page.name} accessibility violations`).toEqual([]);
  });
}
