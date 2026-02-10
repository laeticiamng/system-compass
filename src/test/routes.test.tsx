import { describe, it, expect } from 'vitest';
import { isValidElement } from 'react';
import { allRoutes, redirectRoutes } from '@/routes';

const CRITICAL_INTERNAL_ROUTES = [
  '/dashboard',
  '/tools',
  '/countries',
  '/compare',
  '/fiscal-calculator',
  '/pyramid-quiz',
  '/gamification',
  '/world-map',
  '/pyramid-types',
  '/profile-matcher',
  '/terrain',
];

describe('Route Configuration', () => {
  it('exposes all route definitions through a single source of truth', () => {
    expect(allRoutes.length).toBeGreaterThan(50);
  });

  it('uses canonical absolute paths', () => {
    allRoutes.forEach((route) => {
      expect(route.path === '*' || route.path.startsWith('/')).toBe(true);
      expect(route.path).not.toContain(' ');
    });
  });

  it('keeps path declarations unique', () => {
    const paths = allRoutes.map((route) => route.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('maps every critical internal route to a dedicated page component (not home redirect)', () => {
    CRITICAL_INTERNAL_ROUTES.forEach((criticalPath) => {
      const route = allRoutes.find((candidate) => candidate.path === criticalPath);
      expect(route, `Missing route definition for ${criticalPath}`).toBeDefined();

      if (!route || !isValidElement(route.element)) {
        return;
      }

      const maybeRedirectTarget = (route.element.props as { to?: string }).to;
      expect(maybeRedirectTarget, `${criticalPath} should render a page, not redirect`).toBeUndefined();
    });
  });

  it('does not redirect critical paths back to homepage', () => {
    CRITICAL_INTERNAL_ROUTES.forEach((criticalPath) => {
      const redirect = redirectRoutes.find((candidate) => candidate.path === criticalPath);
      expect(redirect, `${criticalPath} should never be declared as a redirect`).toBeUndefined();
    });
  });
});
