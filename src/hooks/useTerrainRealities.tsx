import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface FakeMedications {
  prevalence: string;
  affected_categories: string[];
  known_distribution_channels: string[];
  protection_measures: string[];
  sources: Array<{ name: string; year: number; finding: string }>;
}

export interface MedicalEquipment {
  issues: string[];
  affected_facilities: string;
  reliable_alternatives: string[];
  sources: Array<{ name: string; year?: number }>;
}

export interface ChronicDiseaseManagement {
  hiv_treatment: {
    availability: string;
    test_reliability: string;
    issues_reported: string[];
    reliable_centers: string[];
    international_support: string[];
  };
  diabetes_care: { availability: string; issues: string[] };
  cancer_care: { availability: string; issues: string[] };
}

export interface HealthcareRealities {
  risk_level: 'high' | 'medium' | 'low';
  fake_medications: FakeMedications;
  medical_equipment: MedicalEquipment;
  chronic_disease_management: ChronicDiseaseManagement;
  recommendations: string[];
}

export interface CorruptionPattern {
  prevalence: string;
  mechanism?: string;
  protection: string[];
  typical_bribes_range?: string;
  common_scenarios?: string[];
}

export interface EmergencyRecourse {
  name: string;
  description: string;
  timeline: string;
  cost_range: string;
  effectiveness: 'high' | 'medium' | 'low';
  how_to_access: string;
}

export interface ReliableContact {
  type: string;
  name: string;
  specialty: string;
  contact_info: string;
}

export interface JusticeRealities {
  risk_level: 'high' | 'medium' | 'low';
  corruption_patterns: {
    lawyer_corruption: CorruptionPattern;
    judicial_corruption: CorruptionPattern;
    police_corruption: CorruptionPattern;
  };
  average_delays: {
    civil_cases: string;
    criminal_cases: string;
    commercial_disputes: string;
  };
  emergency_recourses: EmergencyRecourse[];
  reliable_contacts: ReliableContact[];
  recommendations: string[];
}

export interface HumanTrafficking {
  prevalence: string;
  common_scenarios: string[];
  risk_zones: string[];
  warning_signs: string[];
  emergency_contacts: string[];
  sources: Array<{ name: string; year?: number }>;
}

export interface SecurityRealities {
  risk_level: 'high' | 'medium' | 'low';
  human_trafficking: HumanTrafficking;
  organized_crime: {
    prevalence: string;
    types: string[];
    risk_zones: string[];
    protection: string[];
  };
  petty_crime: {
    prevalence: string;
    hotspots: string[];
    protection: string[];
  };
  recommendations: string[];
}

export interface CorruptionBySector {
  sector: string;
  prevalence: string;
  typical_amounts: string;
  how_to_avoid: string[];
}

export interface AdministrationRealities {
  risk_level: 'high' | 'medium' | 'low';
  document_reliability: {
    birth_certificates: string;
    land_titles: string;
    business_licenses: string;
    verification_methods: string[];
  };
  corruption_by_sector: CorruptionBySector[];
  recommendations: string[];
}

export interface PositiveDevelopment {
  domain: string;
  development: string;
  since: string;
  source: string;
}

export interface TerrainSource {
  name: string;
  type: string;
  url?: string;
  year: number;
  reliability: 'high' | 'medium' | 'low';
}

export interface TerrainRealitiesResult {
  country_name: string;
  last_updated: string;
  overall_risk_level: 'high' | 'medium' | 'low';
  healthcare_realities: HealthcareRealities;
  justice_realities: JusticeRealities;
  security_realities: SecurityRealities;
  administration_realities: AdministrationRealities;
  positive_developments: PositiveDevelopment[];
  sources: TerrainSource[];
  confidence_score: number;
  disclaimer: string;
  cached?: boolean;
}

export function useTerrainRealities() {
  const { i18n, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TerrainRealitiesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateRealities = async (country: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('terrain-realities', {
        body: {
          country,
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
        toast.info(t('terrainRealities.cachedResult', 'Données en cache'));
      }

      return data as TerrainRealitiesResult;
    } catch (err) {
      console.error('Terrain Realities error:', err);
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
    generateRealities,
    isLoading,
    result,
    error,
    reset
  };
}
