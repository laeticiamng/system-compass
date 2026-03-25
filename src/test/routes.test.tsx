import { describe, it, expect, vi } from 'vitest';
import { isValidElement } from 'react';

// Mock supabase client before any imports that depend on it
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

import { allLocalizedRoutes, redirectRoutes } from '@/routes';

const CRITICAL_INTERNAL_ROUTES = [
  'dashboard',
  'tools',
  'countries',
  'compare',
  'fiscal-calculator',
  'pyramid-quiz',
  'gamification',
  'world-map',
  'pyramid-types',
  'profile-matcher',
  'terrain',
];

interface RouteEntry {
  path: string;
  element: React.ReactNode;
}

describe('Route Configuration', () => {
  it('exposes all route definitions through a single source of truth', () => {
    expect(allLocalizedRoutes.length).toBeGreaterThan(50);
  });

  it('uses relative paths for nested routing (no leading slash except *)', () => {
    allLocalizedRoutes.forEach((route: RouteEntry) => {
      if (route.path !== '*') {
        expect(route.path).not.toMatch(/^\//);
      }
      expect(route.path).not.toContain(' ');
    });
  });

  it('keeps path declarations unique', () => {
    const paths = allLocalizedRoutes.map((route: RouteEntry) => route.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  it('maps every critical internal route to a dedicated page component', () => {
    CRITICAL_INTERNAL_ROUTES.forEach((criticalPath) => {
      const route = allLocalizedRoutes.find((candidate: RouteEntry) => candidate.path === criticalPath);
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
      const redirect = redirectRoutes.find((candidate: RouteEntry) => candidate.path === criticalPath);
      expect(redirect, `${criticalPath} should never be declared as a redirect`).toBeUndefined();
    });
  });
});
