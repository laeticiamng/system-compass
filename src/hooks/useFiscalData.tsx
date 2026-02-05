/**
 * Hook for fetching fiscal data (rules, regimes, conventions)
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface FiscalRule {
  id: string;
  country_id: string;
  rule_type: 'income_tax' | 'social_contributions' | 'wealth_tax' | 'capital_gains' | 'vat' | 'special_regime';
  brackets: TaxBracket[];
  deductions: Record<string, unknown>;
  currency: string;
  notes_i18n: Record<string, string>;
  source_url: string | null;
  valid_from: string;
  valid_to: string | null;
}

export interface FiscalSpecialRegime {
  id: string;
  country_id: string;
  regime_name: string;
  conditions: Record<string, string>;
  benefits: Record<string, string>;
  duration_years: number | null;
  application_deadline: string | null;
  is_active: boolean;
  description_i18n: Record<string, string>;
  source_url: string | null;
}

export interface FiscalConvention {
  id: string;
  country_a_id: string;
  country_b_id: string;
  convention_type: 'exemption' | 'credit' | 'deduction';
  applicable_income_types: string[];
  withholding_rates: Record<string, number>;
  source_url: string | null;
  effective_date: string | null;
}

// Fetch fiscal rules for a country
export function useFiscalRules(countryId: string | undefined) {
  return useQuery({
    queryKey: ['fiscal-rules', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from('fiscal_rules')
        .select('*')
        .eq('country_id', countryId)
        .or('valid_to.is.null,valid_to.gte.now()');
      
      if (error) throw error;
      return (data || []).map(rule => ({
        ...rule,
        brackets: rule.brackets as unknown as TaxBracket[],
        deductions: rule.deductions as Record<string, unknown>,
        notes_i18n: rule.notes_i18n as Record<string, string>,
      })) as FiscalRule[];
    },
    enabled: !!countryId,
  });
}

// Fetch fiscal rules for multiple countries
export function useFiscalRulesMultiple(countryIds: string[]) {
  return useQuery({
    queryKey: ['fiscal-rules-multiple', countryIds],
    queryFn: async () => {
      if (countryIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('fiscal_rules')
        .select('*')
        .in('country_id', countryIds)
        .or('valid_to.is.null,valid_to.gte.now()');
      
      if (error) throw error;
      
      // Group by country
      const grouped: Record<string, FiscalRule[]> = {};
      (data || []).forEach((rawRule) => {
        const rule: FiscalRule = {
          ...rawRule,
          brackets: rawRule.brackets as unknown as TaxBracket[],
          deductions: rawRule.deductions as Record<string, unknown>,
          notes_i18n: rawRule.notes_i18n as Record<string, string>,
        };
        if (!grouped[rule.country_id]) {
          grouped[rule.country_id] = [];
        }
        grouped[rule.country_id].push(rule as FiscalRule);
      });
      
      return grouped;
    },
    enabled: countryIds.length > 0,
  });
}

// Fetch special regimes for a country
export function useSpecialRegimes(countryId: string | undefined) {
  return useQuery({
    queryKey: ['special-regimes', countryId],
    queryFn: async () => {
      if (!countryId) return [];
      
      const { data, error } = await supabase
        .from('fiscal_special_regimes')
        .select('*')
        .eq('country_id', countryId)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as FiscalSpecialRegime[];
    },
    enabled: !!countryId,
  });
}

// Fetch special regimes for multiple countries
export function useSpecialRegimesMultiple(countryIds: string[]) {
  return useQuery({
    queryKey: ['special-regimes-multiple', countryIds],
    queryFn: async () => {
      if (countryIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('fiscal_special_regimes')
        .select('*')
        .in('country_id', countryIds)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const grouped: Record<string, FiscalSpecialRegime[]> = {};
      (data || []).forEach((regime) => {
        if (!grouped[regime.country_id]) {
          grouped[regime.country_id] = [];
        }
        grouped[regime.country_id].push(regime as FiscalSpecialRegime);
      });
      
      return grouped;
    },
    enabled: countryIds.length > 0,
  });
}

// Fetch conventions between two countries
export function useFiscalConventions(countryAId: string | undefined, countryBId: string | undefined) {
  return useQuery({
    queryKey: ['fiscal-conventions', countryAId, countryBId],
    queryFn: async () => {
      if (!countryAId || !countryBId) return [];
      
      const { data, error } = await supabase
        .from('fiscal_conventions')
        .select('*')
        .or(`and(country_a_id.eq.${countryAId},country_b_id.eq.${countryBId}),and(country_a_id.eq.${countryBId},country_b_id.eq.${countryAId})`);
      
      if (error) throw error;
      return (data || []) as FiscalConvention[];
    },
    enabled: !!countryAId && !!countryBId,
  });
}
