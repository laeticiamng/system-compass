/**
 * Country Service - Country data processing and scoring
 */

import type { Database } from '@/integrations/supabase/types';

type Country = Database['public']['Tables']['countries']['Row'];

export interface QualityOfLifeData {
  overall: number;
  [key: string]: number;
}

export interface CostOfLivingData {
  score: number;
  [key: string]: number;
}

export interface RiskData {
  overall: number;
  [key: string]: number | string;
}

export interface CountryScore {
  countryId: string;
  overallScore: number;
  economicScore: number;
  qualityOfLifeScore: number;
  safetyScore: number;
  accessibilityScore: number;
}

/**
 * Calculate overall country score from multiple dimensions
 */
export function calculateCountryScore(country: Country): CountryScore {
  const qualityOfLife = country.quality_of_life as QualityOfLifeData | null;
  const costOfLiving = country.cost_of_living as CostOfLivingData | null;
  const risks = country.risks as RiskData | null;

  const economicScore = costOfLiving?.score ?? 50;
  const qualityOfLifeScore = qualityOfLife?.overall ?? 50;
  const safetyScore = 100 - (risks?.overall ?? 50);
  const accessibilityScore = 50; // Default, calculated from visa data

  const overallScore = Math.round(
    economicScore * 0.25 +
    qualityOfLifeScore * 0.35 +
    safetyScore * 0.25 +
    accessibilityScore * 0.15
  );

  return {
    countryId: country.id,
    overallScore,
    economicScore,
    qualityOfLifeScore,
    safetyScore,
    accessibilityScore,
  };
}

/**
 * Get pyramid type label
 */
export function getPyramidTypeLabel(pyramidType: string): string {
  const labels: Record<string, string> = {
    'meritocracy': 'Méritocratie',
    'network-based': 'Réseaux',
    'seniority-based': 'Ancienneté',
    'hybrid': 'Hybride',
    'emerging': 'Émergent',
  };
  return labels[pyramidType] || pyramidType;
}

/**
 * Filter countries by region
 */
export function filterByRegion(countries: Country[], region: string): Country[] {
  if (!region || region === 'all') return countries;
  return countries.filter(c => c.region === region);
}

/**
 * Sort countries by score
 */
export function sortByScore(countries: Country[], ascending = false): Country[] {
  return [...countries].sort((a, b) => {
    const scoreA = calculateCountryScore(a).overallScore;
    const scoreB = calculateCountryScore(b).overallScore;
    return ascending ? scoreA - scoreB : scoreB - scoreA;
  });
}
