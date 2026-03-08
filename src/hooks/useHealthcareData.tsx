import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HealthcareCountryData {
  id: string;
  country_id: string;
  diploma_authority_name: string;
  diploma_authority_acronym: string | null;
  diploma_recognition_url: string | null;
  diploma_recognition_steps: Array<{
    order: number;
    title: string;
    description: string;
    estimated_days: number;
  }>;
  diploma_recognition_duration_months: number | null;
  diploma_recognition_cost_eur: number | null;
  licensing_authority_name: string | null;
  licensing_authority_level: string | null;
  licensing_requirements: Array<{ requirement: string; mandatory: boolean }>;
  language_requirements: {
    languages: string[];
    level: string;
    notes: string;
  } | null;
  insurance_mandatory: boolean;
  insurance_min_coverage_eur: number | null;
  insurance_notes: string | null;
  social_protection_system: string | null;
  health_insurance_system: string | null;
  pension_system: Record<string, string> | null;
  cross_border_agreements: Array<{ country: string; type: string; details: string }>;
  specialties_covered: string[];
  last_verified_at: string;
  source_urls: Array<{ name: string; url: string }>;
  data_confidence: string;
}

export interface HealthcareDocument {
  order: number;
  name: string;
  description: string;
  required: boolean;
  estimated_processing_days: number;
  official_source_url?: string;
}

export interface HealthcareChecklist {
  id: string;
  country_id: string;
  specialty: string;
  origin_region: string;
  documents: HealthcareDocument[];
  total_estimated_weeks: number | null;
  last_verified_at: string;
  source_urls: Array<{ name: string; url: string }>;
}

export function useHealthcareCountryData(countryId: string | null) {
  return useQuery({
    queryKey: ['healthcare-country', countryId],
    queryFn: async () => {
      if (!countryId) return null;
      const { data, error } = await supabase
        .from('healthcare_country_data')
        .select('*')
        .eq('country_id', countryId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as HealthcareCountryData | null;
    },
    enabled: !!countryId,
  });
}

export function useHealthcareChecklist(countryId: string | null, specialty = 'general_medicine', originRegion = 'eu') {
  return useQuery({
    queryKey: ['healthcare-checklist', countryId, specialty, originRegion],
    queryFn: async () => {
      if (!countryId) return null;
      const { data, error } = await supabase
        .from('healthcare_document_checklists')
        .select('*')
        .eq('country_id', countryId)
        .eq('specialty', specialty)
        .eq('origin_region', originRegion)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as HealthcareChecklist | null;
    },
    enabled: !!countryId,
  });
}

export function useAllHealthcareCountries() {
  return useQuery({
    queryKey: ['healthcare-countries-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('healthcare_country_data')
        .select('country_id, diploma_authority_acronym, diploma_recognition_duration_months, last_verified_at, data_confidence');
      if (error) throw error;
      return data;
    },
  });
}
