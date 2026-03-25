import { describe, it, expect, vi } from 'vitest';

// Mock supabase client before any imports that depend on it
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));

import {
  adminRoutes,
  countryRoutes,
  analysisRoutes,
  learningRoutes,
  userRoutes,
  terrainRoutes,
  redirectRoutes,
} from '@/routes';

describe('Route Accessibility', () => {
  it('keeps all user-facing feature routes reachable from route config', () => {
    const featurePaths = [
      ...countryRoutes,
      ...analysisRoutes,
      ...learningRoutes,
      ...userRoutes,
      ...terrainRoutes,
    ].map((route) => route.path);

    expect(featurePaths).toContain('countries');
    expect(featurePaths).toContain('dashboard');
    expect(featurePaths).toContain('fiscal-calculator');
    expect(featurePaths).toContain('profile-matcher');
    expect(featurePaths).toContain('terrain');
  });

  it('preserves dynamic route patterns required by deep pages', () => {
    const dynamicPaths = countryRoutes.concat(terrainRoutes).map((route) => route.path);

    expect(dynamicPaths).toContain('country/:id');
    expect(dynamicPaths).toContain('country/:countryId/terrain-realities');
    expect(dynamicPaths).toContain('terrain/:countryId');
  });
});

describe('Redirect Routes', () => {
  it('keeps redirect aliases targeting product routes instead of homepage', () => {
    const redirects = redirectRoutes
      .filter((route) => route.path !== '*')
      .map((route) => (route.element.props as { to?: string }).to)
      .filter((to): to is string => Boolean(to));

    redirects.forEach((to) => {
      expect(to).toMatch(/^\.\.\//);
      expect(to).not.toBe('/');
    });
  });
});

describe('Admin Routes', () => {
  it('keeps admin pages under the /admin namespace', () => {
    const adminPaths = adminRoutes.map((route) => route.path).filter((path) => path.startsWith('admin'));
    expect(adminPaths.length).toBeGreaterThan(0);

    adminPaths.forEach((path) => {
      expect(path).toMatch(/^admin\//);
    });
  });
});
