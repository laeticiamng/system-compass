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
 * All country IDs that have complete data in database
 * This is the master list of countries with intelligence layer data
 */
export const DB_COMPLETE_COUNTRY_IDS = [
  'argentina',
  'australia',
  'austria',
  'belgium',
  'brazil',
  'cameroon',
  'canada',
  'chile',
  'china',
  'colombia',
  'cuba',
  'denmark',
  'france',
  'germany',
  'india',
  'italy',
  'japan',
  'mexico',
  'morocco',
  'netherlands',
  'nigeria',
  'norway',
  'peru',
  'poland',
  'portugal',
  'qatar',
  'russia',
  'saudi-arabia',
  'singapore',
  'south-africa',
  'spain',
  'sweden',
  'switzerland',
  'turkey',
  'uae',
  'united-kingdom',
  'usa',
  'venezuela',
] as const;

export type DbCompleteCountryId = typeof DB_COMPLETE_COUNTRY_IDS[number];

/**
 * Check if country ID is in extended list (has DB data but not in countries-data.ts)
 */
export function isExtendedCountry(id: string): boolean {
  return EXTENDED_COUNTRY_IDS.includes(id as ExtendedCountryId);
}

/**
 * Check if country has complete intelligence data in database
 */
export function hasCompleteDbData(id: string): boolean {
  return DB_COMPLETE_COUNTRY_IDS.includes(id as DbCompleteCountryId);
}

/**
 * Basic country metadata for extended countries (DB only, not in countries-data.ts)
 */
export const EXTENDED_COUNTRY_META: Record<string, { 
  name: string; 
  nameLocal: string;
  iso2: string; 
  region: string;
  pyramidType: string;
}> = {
  // Pyramid types aligned with authoritative seed data (additional-countries.ts / expansion-countries.ts)
  'argentina': { name: 'Argentina', nameLocal: 'Argentina', iso2: 'AR', region: 'Amérique du Sud', pyramidType: 'STABILITY_REDIS' },
  'austria': { name: 'Austria', nameLocal: 'Österreich', iso2: 'AT', region: 'Western Europe', pyramidType: 'STABILITY_REDIS' },
  'belgium': { name: 'Belgium', nameLocal: 'België / Belgique', iso2: 'BE', region: 'Western Europe', pyramidType: 'STABILITY_REDIS' },
  'chile': { name: 'Chile', nameLocal: 'Chile', iso2: 'CL', region: 'Amérique du Sud', pyramidType: 'COMPETENCE_TRUST' },
  'colombia': { name: 'Colombia', nameLocal: 'Colombia', iso2: 'CO', region: 'South America', pyramidType: 'HYBRID_TRANSITION' },
  'cuba': { name: 'Cuba', nameLocal: 'Cuba', iso2: 'CU', region: 'Caribbean', pyramidType: 'STABILITY_REDIS' },
  'denmark': { name: 'Denmark', nameLocal: 'Danmark', iso2: 'DK', region: 'Northern Europe', pyramidType: 'STABILITY_REDIS' },
  'italy': { name: 'Italy', nameLocal: 'Italia', iso2: 'IT', region: 'Southern Europe', pyramidType: 'STABILITY_REDIS' },
  'mexico': { name: 'Mexico', nameLocal: 'México', iso2: 'MX', region: 'North America', pyramidType: 'HYBRID_TRANSITION' },
  'peru': { name: 'Peru', nameLocal: 'Perú', iso2: 'PE', region: 'Amérique du Sud', pyramidType: 'HYBRID_TRANSITION' },
  'poland': { name: 'Poland', nameLocal: 'Polska', iso2: 'PL', region: 'Central Europe', pyramidType: 'GROWTH_RISK' },
  'spain': { name: 'Spain', nameLocal: 'España', iso2: 'ES', region: 'Southern Europe', pyramidType: 'STABILITY_REDIS' },
  'sweden': { name: 'Sweden', nameLocal: 'Sverige', iso2: 'SE', region: 'Northern Europe', pyramidType: 'STABILITY_REDIS' },
  'south-africa': { name: 'South Africa', nameLocal: 'South Africa', iso2: 'ZA', region: 'Southern Africa', pyramidType: 'HYBRID_TRANSITION' },
  'united-kingdom': { name: 'United Kingdom', nameLocal: 'United Kingdom', iso2: 'GB', region: 'Northern Europe', pyramidType: 'COMPETENCE_TRUST' },
};

export function getExtendedCountryMeta(id: string) {
  return EXTENDED_COUNTRY_META[id] || null;
}

/**
 * Get all countries with DB data (merged list)
 */
export function getAllDbCountryIds(): string[] {
  return [...DB_COMPLETE_COUNTRY_IDS];
}
