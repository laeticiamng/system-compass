import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface ScamItem {
  name: string;
  category: string;
  process: string;
  typical_targets: string;
  red_flags: string[];
  psychological_tactics: string[];
  risks: string[];
  protection_checklist: string[];
  where_to_verify: string[];
  where_to_report: string[];
}

export interface LegitOption {
  name: string;
  category: string;
  why_safer: string;
  what_its_not: string;
  verification_checklist: string[];
  when_to_avoid: string[];
  official_resources: string[];
}

export interface CountryProfile {
  name: string;
  currency: string;
  main_regulators: string[];
  source_confidence: 'high' | 'medium' | 'low';
}

export interface FinancialIntelResult {
  country_profile: CountryProfile;
  scam_top7: ScamItem[];
  legit_top7: LegitOption[];
  sources: Array<{ name: string; url?: string; type: string; date?: string }>;
  confidence: number;
  disclaimer: string;
  cached?: boolean;
}

interface UseFinancialIntelParams {
  country: string;
  sector_focus?: string;
  audience?: string;
}

export function useFinancialIntel() {
  const { i18n, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FinancialIntelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateIntel = async ({ country, sector_focus, audience }: UseFinancialIntelParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('financial-intel', {
        body: {
          country,
          sector_focus,
          audience,
          language: i18n.language || 'fr'
        }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error(t('errors.rateLimited'));
        } else if (data.error.includes('credits')) {
          toast.error(t('errors.insufficientCredits'));
        } else {
          toast.error(data.error);
        }
        setError(data.error);
        return null;
      }

      setResult(data);
      
      if (data.cached) {
        toast.info(t('financialIntel.cachedResult', 'Résultat en cache'));
      }

      return data as FinancialIntelResult;
    } catch (err) {
      console.error('Financial Intel error:', err);
      const message = err instanceof Error ? err.message : t('errors.generationFailed');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    generateIntel,
    isLoading,
    result,
    error,
    reset
  };
}
