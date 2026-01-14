import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Import all translation files
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import nl from '@/locales/nl.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import zh from '@/locales/zh.json';
import hi from '@/locales/hi.json';
import ar from '@/locales/ar.json';
import bn from '@/locales/bn.json';
import ru from '@/locales/ru.json';
import ur from '@/locales/ur.json';

// Import positive points
import countriesPositivePointsFr from '@/locales/countries-positive-points-fr.json';
import countriesPositivePointsEn from '@/locales/countries-positive-points-en.json';
import countriesPositivePointsDe from '@/locales/countries-positive-points-de.json';
import countriesPositivePointsEs from '@/locales/countries-positive-points-es.json';
import countriesPositivePointsIt from '@/locales/countries-positive-points-it.json';
import countriesPositivePointsNl from '@/locales/countries-positive-points-nl.json';
import countriesPositivePointsPt from '@/locales/countries-positive-points-pt.json';

const mainTranslations: Record<string, Record<string, unknown>> = {
  en, fr, nl, de, es, it, pt, zh, hi, ar, bn, ru, ur
};

const positivePointsTranslations: Record<string, Record<string, unknown>> = {
  en: countriesPositivePointsEn,
  fr: countriesPositivePointsFr,
  de: countriesPositivePointsDe,
  es: countriesPositivePointsEs,
  it: countriesPositivePointsIt,
  nl: countriesPositivePointsNl,
  pt: countriesPositivePointsPt,
};

let hasAutoSeeded = false;

/**
 * Check if translations exist in the database and seed if empty
 * This runs automatically on app startup
 */
export async function autoSeedTranslationsIfEmpty(): Promise<void> {
  if (hasAutoSeeded) return;
  hasAutoSeeded = true;

  try {
    // Check if any translations exist
    const { count, error: countError } = await supabase
      .from('ui_translations')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.warn('Could not check translations count:', countError.message);
      return;
    }

    // If translations already exist, skip seeding
    if (count && count > 0) {
      console.log(`Translations already in DB (${count} records), skipping auto-seed`);
      return;
    }

    console.log('No translations found in DB, starting auto-seed...');
    await seedAllTranslations();
    console.log('Auto-seed complete!');
  } catch (err) {
    console.warn('Auto-seed failed:', err);
  }
}

/**
 * Seed all translations to the database
 */
export async function seedAllTranslations(): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  // Seed main translations
  for (const [lang, data] of Object.entries(mainTranslations)) {
    try {
      const { error } = await supabase
        .from('ui_translations')
        .upsert([{
          language: lang,
          namespace: 'translation',
          translations: data as Json,
          updated_at: new Date().toISOString(),
        }], {
          onConflict: 'language,namespace',
        });

      if (error) {
        console.error(`Error seeding ${lang} main:`, error.message);
        errors++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`Exception seeding ${lang} main:`, err);
      errors++;
    }
  }

  // Seed positive points
  for (const [lang, data] of Object.entries(positivePointsTranslations)) {
    try {
      const { error } = await supabase
        .from('ui_translations')
        .upsert([{
          language: lang,
          namespace: 'positive-points',
          translations: data as Json,
          updated_at: new Date().toISOString(),
        }], {
          onConflict: 'language,namespace',
        });

      if (error) {
        console.error(`Error seeding ${lang} positive-points:`, error.message);
        errors++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`Exception seeding ${lang} positive-points:`, err);
      errors++;
    }
  }

  console.log(`Seeding complete: ${success} success, ${errors} errors`);
  return { success, errors };
}

/**
 * Get translation stats from database
 */
export async function getTranslationStats(): Promise<{ language: string; namespace: string; updated_at: string }[]> {
  const { data, error } = await supabase
    .from('ui_translations')
    .select('language, namespace, updated_at');

  if (error) {
    console.error('Error fetching translation stats:', error);
    return [];
  }

  return data || [];
}
