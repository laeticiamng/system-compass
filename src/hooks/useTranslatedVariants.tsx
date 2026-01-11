import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface CountryVariants {
  labor_market: string[];
  entrepreneurship: string[];
  daily_life: string[];
  institutions: string[];
  networks: string[];
  profiles_succeed: string[];
  profiles_struggle: string[];
  surprises: string[];
  example_trajectories: { profile: string; outcome: string }[];
  is_complete?: boolean;
  // New enriched fields
  typical_day?: { time: string; activity: string; cultural_note: string }[];
  year_one_reality?: { month: string; milestone: string; difficulty: string; tip: string }[];
  common_mistakes_timeline?: { phase: string; mistake: string; consequence: string; prevention: string }[];
  hidden_admin_steps?: { step: string; time_estimate: string; difficulty: string; insider_tip: string }[];
  cultural_shocks?: { shock: string; explanation: string; adaptation_time: string }[];
  real_costs_breakdown?: { category: string; official_cost: string; real_cost: string; notes: string }[];
  success_timeline_months?: { month_range: string; realistic_goal: string; warning: string }[];
  expat_communities?: { name: string; location: string; size: string; focus: string; entry_difficulty: string }[];
}

export function useTranslatedVariants(
  countryId: string,
  originalData: CountryVariants | null
) {
  const { i18n } = useTranslation();
  const [translatedData, setTranslatedData] = useState<CountryVariants | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalData || !countryId) {
      setTranslatedData(null);
      return;
    }

    const currentLang = i18n.language;

    // English is the source, no translation needed
    if (currentLang === 'en') {
      setTranslatedData(originalData);
      return;
    }

    const translateData = async () => {
      setIsTranslating(true);
      setError(null);

      try {
        // First check local cache from Supabase
        const { data: cached } = await supabase
          .from('country_variants_translations')
          .select('translated_data')
          .eq('country_id', countryId)
          .eq('language', currentLang)
          .maybeSingle();

        if (cached?.translated_data) {
          setTranslatedData(cached.translated_data as unknown as CountryVariants);
          setIsTranslating(false);
          return;
        }

        // No cached translation - use original data (English) as fallback
        // Don't call edge function to avoid blocking UI
        console.debug(`No ${currentLang} variant translation for ${countryId}, using original data`);
        setTranslatedData(originalData);
      } catch (err) {
        console.error('Variants translation lookup error:', err);
        setError(err instanceof Error ? err.message : 'Translation failed');
        // Fallback to original data
        setTranslatedData(originalData);
      } finally {
        setIsTranslating(false);
      }
    };

    translateData();
  }, [countryId, originalData, i18n.language]);

  return { translatedData, isTranslating, error };
}
