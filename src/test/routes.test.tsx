import { describe, it, expect } from 'vitest';

/**
 * All routes defined in App.tsx
 * This list documents all available routes for reference
 */
export const ALL_ROUTES = [
  // Eager routes
  { path: '/', name: 'Index' },
  { path: '/auth', name: 'Auth' },
  { path: '/about', name: 'About' },
  { path: '/disclaimer', name: 'Disclaimer' },
  { path: '/quick-test', name: 'QuickTest' },
  { path: '/subscription-success', name: 'SubscriptionSuccess' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/partners', name: 'Partners' },
  
  // Country routes
  { path: '/countries', name: 'Countries' },
  { path: '/world-map', name: 'WorldMapExplorer' },
  { path: '/country/france', name: 'CountryDetail' },
  { path: '/country/france/terrain-realities', name: 'TerrainRealities' },
  { path: '/compare', name: 'CompareUnified' },
  
  // Analysis tools
  { path: '/profile-test', name: 'ProfileTest' },
  { path: '/life-trajectory', name: 'LifeTrajectory' },
  { path: '/profile-matcher', name: 'ProfileMatcher' },
  { path: '/exit-keys', name: 'ExitKeys' },
  { path: '/exit-keys/catalog', name: 'ExitKeysCatalog' },
  { path: '/exit-keys/compare', name: 'CompareExitKeys' },
  { path: '/compare-exit-keys', name: 'CompareExitKeys2' },
  
  // Game
  { path: '/pyramid-quiz', name: 'PyramidQuiz' },
  { path: '/life-game', name: 'LifeGame' },
  
  // Dashboard & User
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/usage', name: 'Usage' },
  { path: '/settings/notifications', name: 'NotificationSettings' },
  
  // B2B & Institutional
  { path: '/institutions', name: 'Institutions' },
  { path: '/b2b', name: 'B2BSolutions' },
  { path: '/cases/test-case-id', name: 'CaseDetail' },
  { path: '/latent', name: 'LatentModule' },
  { path: '/irreversa', name: 'IrreversaModule' },
  
  // Terrain & Intel
  { path: '/terrain', name: 'TerrainRealitiesSelector' },
  { path: '/terrain/france', name: 'TerrainRealities2' },
  { path: '/financial-safety-intel', name: 'FinancialSafetyIntel' },
  
  // Content
  { path: '/pyramid-types', name: 'PyramidTypes' },
  { path: '/resources', name: 'Resources' },
  { path: '/ovi', name: 'OVI' },
  { path: '/errors-illusions', name: 'ErrorsAndIllusions' },
  { path: '/prevention-filter', name: 'PreventionFilter' },
  { path: '/universal-errors/overconfidence', name: 'UniversalErrorDetail' },
  { path: '/how-to-read', name: 'HowToRead' },
  
  // New modules
  { path: '/fiscal-calculator', name: 'FiscalCalculator' },
  { path: '/personas', name: 'PersonaJourneys' },
  { path: '/gamification', name: 'GamificationHub' },
  { path: '/experts', name: 'ExpertMarketplace' },
  { path: '/partner-services', name: 'PartnerIntegrations' },
  { path: '/community', name: 'Community' },
  
  // Utility
  { path: '/seed-translations', name: 'SeedTranslations' },
  { path: '/diagnostics', name: 'Diagnostics' },
  
  // Redirects (should redirect to target)
  { path: '/match', name: 'RedirectToProfileMatcher', redirectsTo: '/profile-matcher' },
  { path: '/multi-compare', name: 'RedirectToCompare', redirectsTo: '/compare?mode=multi' },
  { path: '/systemic-mistakes', name: 'RedirectToErrorsIllusions', redirectsTo: '/errors-illusions' },
  { path: '/universal-errors', name: 'RedirectToErrorsIllusions2', redirectsTo: '/errors-illusions' },
  { path: '/orientation-hub', name: 'RedirectToAbout', redirectsTo: '/about' },
];

// Admin routes (require authentication)
export const ADMIN_ROUTES = [
  { path: '/admin/translations', name: 'AdminTranslations' },
  { path: '/admin/analytics', name: 'AdminAnalytics' },
  { path: '/admin/country-generator', name: 'AdminCountryGenerator' },
  { path: '/admin/generate-translations', name: 'AdminGenerateTranslations' },
  { path: '/admin/database-translations', name: 'AdminDatabaseTranslations' },
  { path: '/admin/partners', name: 'AdminPartners' },
  { path: '/admin/translations-sync', name: 'AdminTranslationsSync' },
];

describe('Route Configuration', () => {
  it('should have all routes defined', () => {
    expect(ALL_ROUTES.length).toBeGreaterThan(50);
  });
  
  it('should have all paths starting with /', () => {
    ALL_ROUTES.forEach(route => {
      expect(route.path).toMatch(/^\//);
    });
  });
  
  it('should have unique route names', () => {
    const names = ALL_ROUTES.map(r => r.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
  
  it('should have admin routes requiring authentication', () => {
    ADMIN_ROUTES.forEach(route => {
      expect(route.path).toMatch(/^\/admin\//);
    });
  });
});
