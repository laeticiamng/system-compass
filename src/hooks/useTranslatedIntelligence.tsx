import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface CountryIntelligence {
  power_formal: any[];
  power_informal: any[];
  power_keys_ranking: any[];
  social_norms: string | null;
  authority_relation: string | null;
  risk_attitude: string | null;
  conflict_approach: string | null;
  strategies_rewarded: any[];
  strategies_punished: any[];
  newcomer_mistakes: any[];
  mobility_elevators: any[];
  mobility_speed: string | null;
  mobility_speed_reason: string | null;
  mental_cost: string | null;
  mental_cost_reason: string | null;
  system_produces: any[];
  adaptive_behaviors: any[];
  backfiring_behaviors: any[];
  dependencies: any[];
  cycle_status: string | null;
  macro_risks: any[];
  historical_traces: any[];
  legacy_implications: any;
  // New enriched fields
  unspoken_rules?: { rule: string; consequence: string; how_to_know: string }[];
  negotiation_styles?: { context: string; style: string; taboo: string }[];
  trust_signals?: string[];
  distrust_signals?: string[];
  exit_difficulty?: { scenario: string; difficulty: string; timeline: string; hidden_costs: string }[];
  career_ceiling_by_profile?: { profile: string; ceiling: string; workaround: string }[];
  hidden_hierarchies?: { hierarchy: string; how_it_works: string; access_method: string }[];
  taboo_topics?: string[];
  decision_making_patterns?: { context: string; who_decides: string; how_long: string; influence_method: string }[];
  time_perception?: { aspect: string; local_norm: string; foreigner_trap: string }[];
}

export function useTranslatedIntelligence(
  countryId: string,
  originalData: CountryIntelligence | null
) {
  const { i18n } = useTranslation();
  const [translatedData, setTranslatedData] = useState<CountryIntelligence | null>(null);
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
          .from('country_intelligence_translations')
          .select('translated_data')
          .eq('country_id', countryId)
          .eq('language', currentLang)
          .single();

        if (cached) {
          setTranslatedData(cached.translated_data as unknown as CountryIntelligence);
          setIsTranslating(false);
          return;
        }

        // Call translation edge function
        const response = await supabase.functions.invoke('translate-intelligence', {
          body: {
            countryId,
            targetLang: currentLang,
            intelligenceData: originalData,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data?.translatedData) {
          setTranslatedData(response.data.translatedData);
        } else {
          // Fallback to original if translation fails
          setTranslatedData(originalData);
        }
      } catch (err) {
        console.error('Translation error:', err);
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
