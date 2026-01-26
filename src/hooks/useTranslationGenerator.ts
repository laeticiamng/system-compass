import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Import reference translation
import enTranslations from '@/locales/en.json';

export interface GenerationProgress {
  current: number;
  total: number;
  currentLanguage: string;
  currentSection: string;
  results: GenerationResult[];
}

export interface GenerationResult {
  language: string;
  section: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  keysTranslated?: number;
}

// Sections that need translation for secondary languages
const SECTIONS_TO_TRANSLATE = [
  'lifeTrajectory',
  'lifeProfiles', 
  'lgbtqRights',
  'pyramidQuiz',
  'dashboard',
  'achievements',
  'resources',
  'lifeGame',
  'pmo',
  'governance',
  'ovi'
] as const;

const SECONDARY_LANGUAGES = ['de', 'es', 'nl', 'it', 'pt'] as const;

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export function useTranslationGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMissingTranslations = async (
    targetLanguages: string[] = [...SECONDARY_LANGUAGES],
    sections: string[] = [...SECTIONS_TO_TRANSLATE]
  ) => {
    setIsGenerating(true);
    setError(null);
    
    const results: GenerationResult[] = [];
    const total = targetLanguages.length * sections.length;
    let current = 0;

    setProgress({ current: 0, total, currentLanguage: '', currentSection: '', results: [] });

    try {
      for (const lang of targetLanguages) {
        // Get current translations from DB
        const { data: dbTranslations } = await supabase
          .from('ui_translations')
          .select('translations')
          .eq('language', lang)
          .eq('namespace', 'translation')
          .single();

        const currentTranslations = (dbTranslations?.translations as Record<string, unknown>) || {};

        for (const section of sections) {
          current++;
          setProgress(prev => ({
            ...prev!,
            current,
            currentLanguage: lang.toUpperCase(),
            currentSection: section
          }));

          // Get source section from EN
          const sourceSection = (enTranslations as Record<string, unknown>)[section];
          if (!sourceSection) {
            results.push({
              language: lang,
              section,
              status: 'skipped',
              message: 'Section not found in source'
            });
            continue;
          }

          // Check if section already exists in target
          const targetSection = currentTranslations[section];
          if (targetSection && Object.keys(targetSection as object).length > 0) {
            // Check completeness
            const sourceKeys = getAllKeys(sourceSection as Record<string, unknown>);
            const targetKeys = getAllKeys(targetSection as Record<string, unknown>);
            const coverage = (targetKeys.length / sourceKeys.length) * 100;
            
            if (coverage >= 90) {
              results.push({
                language: lang,
                section,
                status: 'skipped',
                message: `Already ${coverage.toFixed(0)}% complete`
              });
              continue;
            }
          }

          try {
            // Call edge function to translate
            const { data, error: fnError } = await supabase.functions.invoke('generate-translations', {
              body: {
                sourceText: sourceSection,
                sourceLang: 'en',
                targetLang: lang,
                context: `Web application for country analysis and expatriation planning. Section: ${section}`
              }
            });

            if (fnError) throw fnError;

            if (data?.translation) {
              // Merge with existing translations
              const updatedTranslations = {
                ...currentTranslations,
                [section]: data.translation
              };

              // Save to DB
              const { error: upsertError } = await supabase
                .from('ui_translations')
                .upsert([{
                  language: lang,
                  namespace: 'translation',
                  translations: updatedTranslations,
                  updated_at: new Date().toISOString()
                }], {
                  onConflict: 'language,namespace'
                });

              if (upsertError) throw upsertError;

              // Update local reference for next section
              Object.assign(currentTranslations, { [section]: data.translation });

              results.push({
                language: lang,
                section,
                status: 'success',
                keysTranslated: getAllKeys(data.translation as Record<string, unknown>).length
              });
            }
          } catch (err) {
            console.error(`Translation error for ${lang}/${section}:`, err);
            results.push({
              language: lang,
              section,
              status: 'error',
              message: err instanceof Error ? err.message : 'Unknown error'
            });
          }

          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          setProgress(prev => ({ ...prev!, results: [...results] }));
        }
      }

      return results;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const getCoverageStats = async () => {
    const stats: Record<string, { total: number; translated: number; percentage: number }> = {};
    
    const enKeys = getAllKeys(enTranslations as Record<string, unknown>);
    
    for (const lang of SECONDARY_LANGUAGES) {
      const { data } = await supabase
        .from('ui_translations')
        .select('translations')
        .eq('language', lang)
        .eq('namespace', 'translation')
        .single();

      const translations = (data?.translations as Record<string, unknown>) || {};
      const langKeys = getAllKeys(translations);
      
      stats[lang] = {
        total: enKeys.length,
        translated: langKeys.length,
        percentage: Math.round((langKeys.length / enKeys.length) * 100)
      };
    }

    return stats;
  };

  return {
    generateMissingTranslations,
    getCoverageStats,
    isGenerating,
    progress,
    error,
    SECONDARY_LANGUAGES,
    SECTIONS_TO_TRANSLATE
  };
}
