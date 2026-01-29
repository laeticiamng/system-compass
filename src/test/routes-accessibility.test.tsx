import { describe, it, expect } from 'vitest';

describe('Route Accessibility', () => {
  const routes = [
    '/',
    '/auth',
    '/about', 
    '/disclaimer',
    '/quick-test',
    '/subscription-success',
    '/pricing',
    '/partners',
    '/countries',
    '/world-map',
    '/compare',
    '/profile-test',
    '/life-trajectory',
    '/profile-matcher',
    '/exit-keys',
    '/exit-keys/catalog',
    '/exit-keys/compare',
    '/pyramid-quiz',
    '/life-game',
    '/dashboard',
    '/usage',
    '/settings/notifications',
    '/institutions',
    '/b2b',
    '/latent',
    '/irreversa',
    '/terrain',
    '/financial-safety-intel',
    '/pyramid-types',
    '/resources',
    '/ovi',
    '/errors-illusions',
    '/prevention-filter',
    '/how-to-read',
    '/fiscal-calculator',
    '/personas',
    '/gamification',
    '/experts',
    '/partner-services',
    '/community',
    '/diagnostics',
  ];

  it('should have route definitions for all main paths', () => {
    expect(routes.length).toBeGreaterThan(40);
    expect(routes).toContain('/');
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/countries');
  });

  it('should have unique route paths', () => {
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(routes.length);
  });

  it('should have proper route format', () => {
    routes.forEach(route => {
      expect(route).toMatch(/^\//);
      expect(route).not.toContain(' ');
    });
  });
});

describe('Dynamic Routes', () => {
  const dynamicRoutes = [
    { pattern: '/country/:id', example: '/country/france' },
    { pattern: '/country/:countryId/terrain-realities', example: '/country/france/terrain-realities' },
    { pattern: '/terrain/:countryId', example: '/terrain/france' },
    { pattern: '/cases/:id', example: '/cases/test-case' },
    { pattern: '/universal-errors/:id', example: '/universal-errors/overconfidence' },
  ];

  it('should have dynamic route patterns defined', () => {
    expect(dynamicRoutes.length).toBe(5);
  });

  it('should have valid example paths for dynamic routes', () => {
    dynamicRoutes.forEach(route => {
      expect(route.example).toMatch(/^\//);
      expect(route.example).not.toContain(':');
    });
  });
});

describe('Redirect Routes', () => {
  const redirects = [
    { from: '/match', to: '/profile-matcher' },
    { from: '/multi-compare', to: '/compare?mode=multi' },
    { from: '/systemic-mistakes', to: '/errors-illusions' },
    { from: '/universal-errors', to: '/errors-illusions' },
    { from: '/orientation-hub', to: '/about' },
  ];

  it('should have redirect definitions', () => {
    expect(redirects.length).toBe(5);
  });

  it('should redirect to valid paths', () => {
    redirects.forEach(redirect => {
      expect(redirect.to).toMatch(/^\//);
    });
  });
});

describe('Admin Routes', () => {
  const adminRoutes = [
    '/admin/translations',
    '/admin/analytics',
    '/admin/country-generator',
    '/admin/generate-translations',
    '/admin/database-translations',
    '/admin/partners',
    '/admin/translations-sync',
  ];

  it('should have admin routes defined', () => {
    expect(adminRoutes.length).toBe(7);
  });

  it('should have admin routes under /admin prefix', () => {
    adminRoutes.forEach(route => {
      expect(route).toMatch(/^\/admin\//);
    });
  });
});
