import { supabase } from '@/integrations/supabase/client';

export interface TranslationData {
  language: string;
  namespace: string;
  translations: Record<string, unknown>;
}

// Cache for loaded translations
const translationsCache = new Map<string, Record<string, unknown>>();
let cacheLoaded = false;

/**
 * Load translations from Supabase for a specific language
 */
export async function loadTranslationsFromDB(
  language: string,
  namespace: string = 'translation'
): Promise<Record<string, unknown> | null> {
  const cacheKey = `${language}:${namespace}`;
  
  // Check cache first
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey) || null;
  }

  try {
    const { data, error } = await supabase
      .from('ui_translations')
      .select('translations')
      .eq('language', language)
      .eq('namespace', namespace)
      .maybeSingle();

    if (error) {
      console.warn(`Failed to load translations for ${language}/${namespace}:`, error.message);
      return null;
    }

    if (data?.translations) {
      translationsCache.set(cacheKey, data.translations as Record<string, unknown>);
      return data.translations as Record<string, unknown>;
    }

    return null;
  } catch (err) {
    console.warn(`Error loading translations for ${language}/${namespace}:`, err);
    return null;
  }
}

/**
 * Load all translations for a language (main + positive points)
 */
export async function loadAllTranslationsForLanguage(
  language: string
): Promise<Record<string, unknown>> {
  const [mainTranslations, positivePoints] = await Promise.all([
    loadTranslationsFromDB(language, 'translation'),
    loadTranslationsFromDB(language, 'positive-points'),
  ]);

  // Merge translations
  const merged: Record<string, unknown> = {};
  
  if (mainTranslations) {
    Object.assign(merged, mainTranslations);
  }
  
  if (positivePoints) {
    // Deep merge positive points
    deepMerge(merged, positivePoints);
  }

  return merged;
}

/**
 * Preload translations for all supported languages
 */
export async function preloadAllTranslations(
  languages: string[]
): Promise<Map<string, Record<string, unknown>>> {
  if (cacheLoaded) {
    return translationsCache;
  }

  try {
    const { data, error } = await supabase
      .from('ui_translations')
      .select('language, namespace, translations')
      .in('language', languages);

    if (error) {
      console.warn('Failed to preload translations:', error.message);
      return translationsCache;
    }

    if (data) {
      for (const row of data) {
        const cacheKey = `${row.language}:${row.namespace}`;
        translationsCache.set(cacheKey, row.translations as Record<string, unknown>);
      }
      cacheLoaded = true;
    }

    return translationsCache;
  } catch (err) {
    console.warn('Error preloading translations:', err);
    return translationsCache;
  }
}

/**
 * Check if translations are available in the database
 */
export async function hasDBTranslations(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('ui_translations')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return false;
    }

    return (count || 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Clear the translations cache
 */
export function clearTranslationsCache(): void {
  translationsCache.clear();
  cacheLoaded = false;
}

/**
 * Deep merge utility for translation objects
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) {
        target[key] = {};
      }
      deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
