import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SimulationType = 'country_view' | 'comparison' | 'exit_key' | 'prevention_filter' | 'project_analysis' | 'matching' | 'trajectory';

export interface OVISuggestion {
  id: string;
  type: 'framework' | 'grid';
  key: string;
  title: string;
  description: string;
  relevanceScore: number;
  icon: string;
}

// Mapping of simulation types to relevant OVI content
const SIMULATION_TO_OVI_MAP: Record<SimulationType, { frameworks: string[]; grids: string[] }> = {
  country_view: {
    frameworks: ['system_bias', 'hidden_costs', 'cultural_blind_spots'],
    grids: ['visible_invisible', 'me_system', 'controllable_uncontrollable']
  },
  comparison: {
    frameworks: ['comparison_fallacy', 'opportunity_cost', 'sunk_cost'],
    grids: ['reversible_irreversible', 'short_long_term', 'visible_invisible']
  },
  exit_key: {
    frameworks: ['irreversible_decisions', 'control_illusion', 'timing_error'],
    grids: ['me_system', 'reversible_irreversible', 'urgent_important']
  },
  prevention_filter: {
    frameworks: ['cognitive_bias', 'confirmation_bias', 'overconfidence'],
    grids: ['certain_uncertain', 'controllable_uncontrollable', 'visible_invisible']
  },
  project_analysis: {
    frameworks: ['planning_fallacy', 'hidden_costs', 'irreversible_decisions'],
    grids: ['short_long_term', 'reversible_irreversible', 'me_system']
  },
  matching: {
    frameworks: ['comparison_fallacy', 'cognitive_bias', 'confirmation_bias'],
    grids: ['visible_invisible', 'me_system', 'controllable_uncontrollable']
  },
  trajectory: {
    frameworks: ['planning_fallacy', 'irreversible_decisions', 'timing_error'],
    grids: ['short_long_term', 'reversible_irreversible', 'urgent_important']
  }
};

// Framework details - using existing translation keys
const FRAMEWORKS: Record<string, { icon: string; titleKey: string; descKey: string }> = {
  cognitive_bias: { 
    icon: '🧠', 
    titleKey: 'ovi.frameworks.bias.title',
    descKey: 'ovi.frameworks.bias.preview'
  },
  irreversible_decisions: {
    icon: '🔒',
    titleKey: 'ovi.frameworks.irreversible.title',
    descKey: 'ovi.frameworks.irreversible.preview'
  },
  control_illusion: {
    icon: '🎭',
    titleKey: 'ovi.frameworks.control.title',
    descKey: 'ovi.frameworks.control.preview'
  },
  hidden_costs: {
    icon: '👁️‍🗨️',
    titleKey: 'ovi.grids.visibility.title',
    descKey: 'ovi.grids.visibility.desc'
  },
  timing_error: {
    icon: '⏰',
    titleKey: 'ovi.frameworks.speed.title',
    descKey: 'ovi.frameworks.speed.preview'
  },
  system_bias: {
    icon: '⚙️',
    titleKey: 'ovi.frameworks.individual.title',
    descKey: 'ovi.frameworks.individual.preview'
  },
  cultural_blind_spots: {
    icon: '🌍',
    titleKey: 'ovi.grids.visibility.title',
    descKey: 'ovi.grids.visibility.desc'
  },
  comparison_fallacy: {
    icon: '⚖️',
    titleKey: 'ovi.grids.agency.title',
    descKey: 'ovi.grids.agency.desc'
  },
  opportunity_cost: {
    icon: '💡',
    titleKey: 'ovi.grids.visibility.title',
    descKey: 'ovi.grids.visibility.desc'
  },
  sunk_cost: {
    icon: '⚓',
    titleKey: 'ovi.frameworks.irreversible.title',
    descKey: 'ovi.frameworks.irreversible.preview'
  },
  confirmation_bias: {
    icon: '✅',
    titleKey: 'ovi.frameworks.bias.title',
    descKey: 'ovi.frameworks.bias.preview'
  },
  overconfidence: {
    icon: '🎯',
    titleKey: 'ovi.frameworks.control.title',
    descKey: 'ovi.frameworks.control.preview'
  },
  planning_fallacy: {
    icon: '📅',
    titleKey: 'ovi.frameworks.speed.title',
    descKey: 'ovi.frameworks.speed.preview'
  }
};

// Grid details - using existing translation keys
const GRIDS: Record<string, { icon: string; titleKey: string; descKey: string }> = {
  visible_invisible: {
    icon: '👁️',
    titleKey: 'ovi.grids.visibility.title',
    descKey: 'ovi.grids.visibility.desc'
  },
  me_system: {
    icon: '🔄',
    titleKey: 'ovi.grids.agency.title',
    descKey: 'ovi.grids.agency.desc'
  },
  reversible_irreversible: {
    icon: '↩️',
    titleKey: 'ovi.grids.reversibility.title',
    descKey: 'ovi.grids.reversibility.desc'
  },
  short_long_term: {
    icon: '📊',
    titleKey: 'ovi.grids.title',
    descKey: 'ovi.grids.subtitle'
  },
  controllable_uncontrollable: {
    icon: '🎮',
    titleKey: 'ovi.grids.agency.title',
    descKey: 'ovi.grids.agency.desc'
  },
  certain_uncertain: {
    icon: '❓',
    titleKey: 'ovi.grids.visibility.title',
    descKey: 'ovi.grids.visibility.desc'
  },
  urgent_important: {
    icon: '🚨',
    titleKey: 'ovi.grids.title',
    descKey: 'ovi.grids.subtitle'
  }
};

export function useOVISuggestions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load dismissed suggestions from database on mount
  useEffect(() => {
    const loadDismissed = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('ovi_suggestions')
          .select('id')
          .eq('user_id', user.id)
          .eq('dismissed', true);
        
        if (data) {
          const ids = new Set(data.map(d => d.id));
          setDismissedSuggestions(ids);
        }
      } catch (err) {
        console.error('Failed to load OVI dismissed suggestions:', err);
      }
    };
    
    loadDismissed();
  }, [user]);

  const getSuggestionsForSimulation = useCallback((
    simulationType: SimulationType,
    context?: { countryIds?: string[]; exitKeyIds?: string[]; riskLevel?: 'low' | 'medium' | 'high' }
  ): OVISuggestion[] => {
    const mapping = SIMULATION_TO_OVI_MAP[simulationType];
    if (!mapping) return [];

    const suggestions: OVISuggestion[] = [];

    // Add framework suggestions
    mapping.frameworks.forEach((frameworkKey, index) => {
      const framework = FRAMEWORKS[frameworkKey];
      if (framework && !dismissedSuggestions.has(`framework-${frameworkKey}`)) {
        suggestions.push({
          id: `framework-${frameworkKey}`,
          type: 'framework',
          key: frameworkKey,
          title: t(framework.titleKey, frameworkKey),
          description: t(framework.descKey, ''),
          relevanceScore: 100 - (index * 10),
          icon: framework.icon
        });
      }
    });

    // Add grid suggestions
    mapping.grids.forEach((gridKey, index) => {
      const grid = GRIDS[gridKey];
      if (grid && !dismissedSuggestions.has(`grid-${gridKey}`)) {
        suggestions.push({
          id: `grid-${gridKey}`,
          type: 'grid',
          key: gridKey,
          title: t(grid.titleKey, gridKey),
          description: t(grid.descKey, ''),
          relevanceScore: 95 - (index * 10),
          icon: grid.icon
        });
      }
    });

    // Boost relevance based on context
    if (context?.riskLevel === 'high') {
      suggestions.forEach(s => {
        if (s.key.includes('irreversible') || s.key.includes('control')) {
          s.relevanceScore += 20;
        }
      });
    }

    // Sort by relevance
    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [t, dismissedSuggestions]);

  const dismissSuggestion = useCallback(async (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    
    // Save to database if user is logged in
    if (user) {
      try {
        await supabase
          .from('ovi_suggestions')
          .upsert({
            id: suggestionId,
            user_id: user.id,
            simulation_type: 'general',
            simulation_context: {},
            dismissed: true
          }, { onConflict: 'id' });
      } catch (err) {
        console.error('Failed to save dismissed suggestion:', err);
      }
    }
  }, [user]);

  const resetDismissed = useCallback(async () => {
    setDismissedSuggestions(new Set());
    
    // Clear from database if user is logged in
    if (user) {
      try {
        await supabase
          .from('ovi_suggestions')
          .update({ dismissed: false })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to reset dismissed suggestions:', err);
      }
    }
  }, [user]);

  const getTopSuggestion = useCallback((simulationType: SimulationType): OVISuggestion | null => {
    const suggestions = getSuggestionsForSimulation(simulationType);
    return suggestions[0] || null;
  }, [getSuggestionsForSimulation]);

  // Track suggestion view
  const trackSuggestionView = useCallback(async (suggestionId: string, simulationType: SimulationType) => {
    if (!user) return;
    
    try {
      await supabase
        .from('ovi_suggestions')
        .upsert({
          id: suggestionId,
          user_id: user.id,
          simulation_type: simulationType,
          simulation_context: {},
          viewed_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to track suggestion view:', err);
    }
  }, [user]);

  return {
    getSuggestionsForSimulation,
    dismissSuggestion,
    resetDismissed,
    getTopSuggestion,
    trackSuggestionView,
    dismissedCount: dismissedSuggestions.size,
    loading
  };
}