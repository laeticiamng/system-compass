/**
 * useSmartRecommendations - Hook for AI-powered country recommendations
 * Revolutionary feature: Personalized matching based on user profile
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

interface CountryScore {
  countryId: string;
  countryName: string;
  iso2: string;
  region: string;
  pyramidType: string;
  totalScore: number;
  breakdown: {
    profileMatch: number;      // 0-100
    riskAlignment: number;     // 0-100
    lifestyleMatch: number;    // 0-100
    careerPotential: number;   // 0-100
    costEfficiency: number;    // 0-100
  };
  strengths: string[];
  challenges: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'caution';
}

interface RecommendationFilters {
  regions?: string[];
  pyramidTypes?: string[];
  minScore?: number;
  excludeCountries?: string[];
}

// Scoring weights based on user motor profile
const MOTOR_WEIGHTS: Record<string, { career: number; lifestyle: number; cost: number; risk: number }> = {
  'performance': { career: 0.4, lifestyle: 0.2, cost: 0.1, risk: 0.3 },
  'security': { career: 0.2, lifestyle: 0.3, cost: 0.3, risk: 0.2 },
  'exploration': { career: 0.2, lifestyle: 0.4, cost: 0.2, risk: 0.2 },
  'family': { career: 0.2, lifestyle: 0.4, cost: 0.2, risk: 0.2 },
  'independence': { career: 0.3, lifestyle: 0.3, cost: 0.2, risk: 0.2 },
  'default': { career: 0.25, lifestyle: 0.25, cost: 0.25, risk: 0.25 },
};

// Risk tolerance mapping
const RISK_TOLERANCE_MAP: Record<string, number> = {
  'low': 1,
  'moderate': 2,
  'high': 3,
  'very_high': 4,
};

// Education level impact
const EDUCATION_BONUS: Record<string, number> = {
  'doctorate': 20,
  'masters': 15,
  'bachelors': 10,
  'associate': 5,
  'high_school': 0,
  'other': 0,
};

export function useSmartRecommendations(filters?: RecommendationFilters) {
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [sortBy, setSortBy] = useState<'score' | 'career' | 'lifestyle' | 'cost'>('score');

  // Fetch all countries with intelligence data
  const { data: countriesData, isLoading: countriesLoading } = useQuery({
    queryKey: ['countries-for-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select(`
          id,
          name,
          iso2,
          region,
          pyramid_type,
          cost_of_living,
          quality_of_life,
          risks,
          who_wins,
          who_loses
        `);
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch country tags for detailed scoring
  const { data: tagsData } = useQuery({
    queryKey: ['country-tags-for-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('country_tags')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Calculate recommendations
  const recommendations = useMemo<CountryScore[]>(() => {
    if (!countriesData || !profile) return [];

    const weights = MOTOR_WEIGHTS[profile.motor_profile || 'default'] || MOTOR_WEIGHTS.default;
    const userRiskLevel = RISK_TOLERANCE_MAP[profile.risk_tolerance || 'moderate'] || 2;
    const educationBonus = EDUCATION_BONUS[profile.education_level || 'other'] || 0;

    const scores: CountryScore[] = countriesData.map(country => {
      const tags = tagsData?.find(t => t.country_id === country.id);
      
      // Calculate sub-scores
      const costOfLiving = country.cost_of_living as any;
      const qualityOfLife = country.quality_of_life as any;
      const whoWins = country.who_wins as any;
      const whoLoses = country.who_loses as any;

      // Career potential score (0-100)
      let careerPotential = 50;
      if (tags) {
        careerPotential = (tags.social_mobility * 10) + (tags.diploma_weight * (educationBonus / 4));
        careerPotential = Math.min(100, Math.max(0, careerPotential));
      }

      // Lifestyle match (0-100)
      let lifestyleMatch = 50;
      if (qualityOfLife) {
        const qolScore = qualityOfLife.overall_score || qualityOfLife.score || 50;
        lifestyleMatch = typeof qolScore === 'number' ? qolScore : 50;
      }

      // Cost efficiency (0-100) - lower cost = higher score for cost-conscious users
      let costEfficiency = 50;
      if (costOfLiving) {
        const monthlyBudget = costOfLiving.monthly_budget || costOfLiving.total || 2000;
        // Score inversely proportional to cost (assuming $500-$5000 range)
        costEfficiency = Math.max(0, Math.min(100, 100 - ((monthlyBudget - 500) / 45)));
      }

      // Risk alignment (0-100) - based on user risk tolerance
      let riskAlignment = 50;
      if (tags) {
        const countryRisk = tags.risk_tolerance || 3;
        // Score based on how well country risk matches user preference
        const riskDiff = Math.abs(countryRisk - userRiskLevel);
        riskAlignment = 100 - (riskDiff * 25);
      }

      // Profile match (0-100) - based on who wins/loses
      let profileMatch = 50;
      const userProfile = profile.motor_profile || 'exploration';
      
      if (Array.isArray(whoWins)) {
        const matchingWins = whoWins.filter((w: string) => 
          w.toLowerCase().includes(userProfile.toLowerCase())
        ).length;
        profileMatch += matchingWins * 15;
      }
      
      if (Array.isArray(whoLoses)) {
        const matchingLosses = whoLoses.filter((l: string) => 
          l.toLowerCase().includes(userProfile.toLowerCase())
        ).length;
        profileMatch -= matchingLosses * 20;
      }
      
      profileMatch = Math.max(0, Math.min(100, profileMatch));

      // Calculate total weighted score
      const totalScore = Math.round(
        (profileMatch * 0.25) +
        (careerPotential * weights.career) +
        (lifestyleMatch * weights.lifestyle) +
        (costEfficiency * weights.cost) +
        (riskAlignment * weights.risk)
      );

      // Generate strengths and challenges
      const strengths: string[] = [];
      const challenges: string[] = [];

      if (careerPotential >= 70) strengths.push('Forte mobilité sociale');
      if (lifestyleMatch >= 70) strengths.push('Qualité de vie excellente');
      if (costEfficiency >= 70) strengths.push('Coût de vie avantageux');
      if (riskAlignment >= 80) strengths.push('Profil risque adapté');
      if (profileMatch >= 70) strengths.push('Correspondance profil élevée');

      if (careerPotential < 40) challenges.push('Opportunités carrière limitées');
      if (lifestyleMatch < 40) challenges.push('Qualité de vie modeste');
      if (costEfficiency < 40) challenges.push('Coût de vie élevé');
      if (riskAlignment < 40) challenges.push('Niveau de risque inadapté');
      if (profileMatch < 40) challenges.push('Correspondance profil faible');

      // Determine recommendation level
      let recommendation: CountryScore['recommendation'] = 'consider';
      if (totalScore >= 80) recommendation = 'highly_recommended';
      else if (totalScore >= 65) recommendation = 'recommended';
      else if (totalScore < 40) recommendation = 'caution';

      return {
        countryId: country.id,
        countryName: country.name,
        iso2: country.iso2,
        region: country.region,
        pyramidType: country.pyramid_type,
        totalScore,
        breakdown: {
          profileMatch,
          riskAlignment,
          lifestyleMatch,
          careerPotential,
          costEfficiency,
        },
        strengths,
        challenges,
        recommendation,
      };
    });

    // Apply filters
    let filtered = scores;

    if (filters?.regions?.length) {
      filtered = filtered.filter(s => filters.regions!.includes(s.region));
    }

    if (filters?.pyramidTypes?.length) {
      filtered = filtered.filter(s => filters.pyramidTypes!.includes(s.pyramidType));
    }

    if (filters?.minScore) {
      filtered = filtered.filter(s => s.totalScore >= filters.minScore!);
    }

    if (filters?.excludeCountries?.length) {
      filtered = filtered.filter(s => !filters.excludeCountries!.includes(s.countryId));
    }

    // Sort
    switch (sortBy) {
      case 'career':
        filtered.sort((a, b) => b.breakdown.careerPotential - a.breakdown.careerPotential);
        break;
      case 'lifestyle':
        filtered.sort((a, b) => b.breakdown.lifestyleMatch - a.breakdown.lifestyleMatch);
        break;
      case 'cost':
        filtered.sort((a, b) => b.breakdown.costEfficiency - a.breakdown.costEfficiency);
        break;
      default:
        filtered.sort((a, b) => b.totalScore - a.totalScore);
    }

    return filtered;
  }, [countriesData, tagsData, profile, filters, sortBy]);

  // Get top recommendations
  const topRecommendations = useMemo(() => {
    return recommendations.slice(0, 10);
  }, [recommendations]);

  // Get highly recommended countries
  const highlyRecommended = useMemo(() => {
    return recommendations.filter(r => r.recommendation === 'highly_recommended');
  }, [recommendations]);

  // Get countries to avoid based on profile
  const countriesToAvoid = useMemo(() => {
    return recommendations.filter(r => r.recommendation === 'caution').slice(0, 5);
  }, [recommendations]);

  return {
    // Data
    recommendations,
    topRecommendations,
    highlyRecommended,
    countriesToAvoid,
    
    // State
    isLoading: profileLoading || countriesLoading,
    hasProfile: !!profile,
    sortBy,
    setSortBy,
    
    // Helpers
    getCountryScore: (countryId: string) => recommendations.find(r => r.countryId === countryId),
  };
}
