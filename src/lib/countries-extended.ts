/**
 * Extended country IDs available in database but not in main countries-data.ts
 * Use these IDs to fetch full data from Supabase tables
 */

export const EXTENDED_COUNTRY_IDS = [
  'argentina',
  'austria', 
  'belgium',
  'chile',
  'colombia',
  'cuba',
  'denmark',
  'italy',
  'mexico',
  'peru',
  'poland',
  'spain',
  'sweden',
  'south-africa',
  'united-kingdom',
] as const;

export type ExtendedCountryId = typeof EXTENDED_COUNTRY_IDS[number];

/**
 * Check if country ID is in extended list (has DB data but not in countries-data.ts)
 */
export function isExtendedCountry(id: string): boolean {
  return EXTENDED_COUNTRY_IDS.includes(id as ExtendedCountryId);
}

/**
 * Basic country metadata for extended countries
 */
export const EXTENDED_COUNTRY_META: Record<string, { name: string; iso2: string; region: string }> = {
  'argentina': { name: 'Argentina', iso2: 'AR', region: 'South America' },
  'austria': { name: 'Austria', iso2: 'AT', region: 'Western Europe' },
  'belgium': { name: 'Belgium', iso2: 'BE', region: 'Western Europe' },
  'chile': { name: 'Chile', iso2: 'CL', region: 'South America' },
  'colombia': { name: 'Colombia', iso2: 'CO', region: 'South America' },
  'cuba': { name: 'Cuba', iso2: 'CU', region: 'Caribbean' },
  'denmark': { name: 'Denmark', iso2: 'DK', region: 'Northern Europe' },
  'italy': { name: 'Italy', iso2: 'IT', region: 'Southern Europe' },
  'mexico': { name: 'Mexico', iso2: 'MX', region: 'North America' },
  'peru': { name: 'Peru', iso2: 'PE', region: 'South America' },
  'poland': { name: 'Poland', iso2: 'PL', region: 'Eastern Europe' },
  'spain': { name: 'Spain', iso2: 'ES', region: 'Southern Europe' },
  'sweden': { name: 'Sweden', iso2: 'SE', region: 'Northern Europe' },
  'south-africa': { name: 'South Africa', iso2: 'ZA', region: 'Southern Africa' },
  'united-kingdom': { name: 'United Kingdom', iso2: 'GB', region: 'Northern Europe' },
};

export function getExtendedCountryMeta(id: string) {
  return EXTENDED_COUNTRY_META[id] || null;
}
