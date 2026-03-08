/**
 * Centralized Site Configuration
 * Single source of truth for domains, OG images, and app constants.
 */

export const SITE_CONFIG = {
  // Domains
  productionUrl: 'https://system-compass.app',
  stagingUrl: 'https://world-alignment.lovable.app',
  
  // Current URL (auto-detect)
  get baseUrl(): string {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('system-compass.app') || origin.includes('lovable.app')) {
        return origin;
      }
    }
    return this.productionUrl;
  },

  // OG / Social
  ogImage: '/og-image.png',
  get ogImageUrl(): string {
    return `${this.baseUrl}/og-image.png`;
  },

  // App info
  name: 'Compass',
  tagline: 'Compare les pays avant de partir',
  
  // Stats
  stats: {
    countriesCount: 80,
    languagesCount: 13,
    profilesCount: 6,
    edgeFunctionsCount: 36,
  },

  // Social
  social: {
    twitter: '@systemcompass',
  },

  // Pricing
  pricing: {
    premiumMonthly: 9.90,
    currency: 'EUR',
  },
} as const;

/** Helper: get full OG image URL for any page */
export function getOgImageUrl(path?: string): string {
  return path ? `${SITE_CONFIG.baseUrl}${path}` : SITE_CONFIG.ogImageUrl;
}

/** Helper: get full page URL */
export function getPageUrl(path: string): string {
  return `${SITE_CONFIG.baseUrl}${path}`;
}
