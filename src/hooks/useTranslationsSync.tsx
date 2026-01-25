import { useState } from 'react';
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

export interface SeedResult {
  language: string;
  namespace: string;
  status: string;
}

export interface SeedProgress {
  current: number;
  total: number;
  currentLanguage: string;
  results: SeedResult[];
}

export function useTranslationsSync() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedTranslations = async (options: { 
    namespace?: 'translation' | 'positive-points' | 'all';
    clearExisting?: boolean;
  } = {}) => {
    const { namespace = 'all' } = options;
    setIsSeeding(true);
    setError(null);
    setProgress({ current: 0, total: 0, currentLanguage: '', results: [] });

    try {
      const results: SeedResult[] = [];
      
      // Seed main translations
      if (namespace === 'all' || namespace === 'translation') {
        const languages = Object.keys(mainTranslations);
        const total = namespace === 'all' 
          ? languages.length + Object.keys(positivePointsTranslations).length
          : languages.length;
        
        setProgress(prev => ({ ...prev!, total }));

        for (let i = 0; i < languages.length; i++) {
          const lang = languages[i];
          setProgress(prev => ({ 
            ...prev!, 
            current: i + 1, 
            currentLanguage: `${lang} (translation)` 
          }));

          const { error: upsertError } = await supabase
            .from('ui_translations')
            .upsert([{
              language: lang,
              namespace: 'translation',
              translations: mainTranslations[lang] as Json,
              updated_at: new Date().toISOString(),
            }], {
              onConflict: 'language,namespace',
            });

          const status = upsertError ? `error: ${upsertError.message}` : 'success';
          results.push({ language: lang, namespace: 'translation', status });
          setProgress(prev => ({ ...prev!, results: [...results] }));
        }
      }

      // Seed positive points
      if (namespace === 'all' || namespace === 'positive-points') {
        const ppLanguages = Object.keys(positivePointsTranslations);
        const startIndex = namespace === 'all' ? Object.keys(mainTranslations).length : 0;
        
        for (let i = 0; i < ppLanguages.length; i++) {
          const lang = ppLanguages[i];
          setProgress(prev => ({ 
            ...prev!, 
            current: startIndex + i + 1, 
            currentLanguage: `${lang} (positive-points)` 
          }));

          const { error: upsertError } = await supabase
            .from('ui_translations')
            .upsert([{
              language: lang,
              namespace: 'positive-points',
              translations: positivePointsTranslations[lang] as Json,
              updated_at: new Date().toISOString(),
            }], {
              onConflict: 'language,namespace',
            });

          const status = upsertError ? `error: ${upsertError.message}` : 'success';
          results.push({ language: lang, namespace: 'positive-points', status });
          setProgress(prev => ({ ...prev!, results: [...results] }));
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      console.log(`Seeded ${successCount}/${results.length} translation sets`);
      
      return results;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setIsSeeding(false);
    }
  };

  const getTranslationsStats = async () => {
    const { data, error } = await supabase
      .from('ui_translations')
      .select('language, namespace, updated_at');

    if (error) {
      throw error;
    }

    return data || [];
  };

  const clearTranslations = async (namespace?: string) => {
    let query = supabase.from('ui_translations').delete();
    
    if (namespace) {
      query = query.eq('namespace', namespace);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await query;
    if (error) throw error;
  };

  return {
    seedTranslations,
    getTranslationsStats,
    clearTranslations,
    isSeeding,
    progress,
    error,
  };
}
