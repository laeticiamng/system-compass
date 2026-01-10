import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type SimulationType = 'country_view' | 'comparison' | 'exit_key' | 'prevention_filter' | 'project_analysis';

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
  }
};

// Framework details
const FRAMEWORKS: Record<string, { icon: string; titleKey: string; descKey: string }> = {
  cognitive_bias: { 
    icon: '🧠', 
    titleKey: 'ovi.frameworks.cognitiveBias.title',
    descKey: 'ovi.frameworks.cognitiveBias.desc'
  },
  irreversible_decisions: {
    icon: '🔒',
    titleKey: 'ovi.frameworks.irreversible.title',
    descKey: 'ovi.frameworks.irreversible.desc'
  },
  control_illusion: {
    icon: '🎭',
    titleKey: 'ovi.frameworks.controlIllusion.title',
    descKey: 'ovi.frameworks.controlIllusion.desc'
  },
  hidden_costs: {
    icon: '👁️‍🗨️',
    titleKey: 'ovi.frameworks.hiddenCosts.title',
    descKey: 'ovi.frameworks.hiddenCosts.desc'
  },
  timing_error: {
    icon: '⏰',
    titleKey: 'ovi.frameworks.timingError.title',
    descKey: 'ovi.frameworks.timingError.desc'
  },
  system_bias: {
    icon: '⚙️',
    titleKey: 'ovi.frameworks.systemBias.title',
    descKey: 'ovi.frameworks.systemBias.desc'
  },
  cultural_blind_spots: {
    icon: '🌍',
    titleKey: 'ovi.frameworks.culturalBlindSpots.title',
    descKey: 'ovi.frameworks.culturalBlindSpots.desc'
  },
  comparison_fallacy: {
    icon: '⚖️',
    titleKey: 'ovi.frameworks.comparisonFallacy.title',
    descKey: 'ovi.frameworks.comparisonFallacy.desc'
  },
  opportunity_cost: {
    icon: '💡',
    titleKey: 'ovi.frameworks.opportunityCost.title',
    descKey: 'ovi.frameworks.opportunityCost.desc'
  },
  sunk_cost: {
    icon: '⚓',
    titleKey: 'ovi.frameworks.sunkCost.title',
    descKey: 'ovi.frameworks.sunkCost.desc'
  },
  confirmation_bias: {
    icon: '✅',
    titleKey: 'ovi.frameworks.confirmationBias.title',
    descKey: 'ovi.frameworks.confirmationBias.desc'
  },
  overconfidence: {
    icon: '🎯',
    titleKey: 'ovi.frameworks.overconfidence.title',
    descKey: 'ovi.frameworks.overconfidence.desc'
  },
  planning_fallacy: {
    icon: '📅',
    titleKey: 'ovi.frameworks.planningFallacy.title',
    descKey: 'ovi.frameworks.planningFallacy.desc'
  }
};

// Grid details
const GRIDS: Record<string, { icon: string; titleKey: string; descKey: string }> = {
  visible_invisible: {
    icon: '👁️',
    titleKey: 'ovi.grids.visibleInvisible.title',
    descKey: 'ovi.grids.visibleInvisible.desc'
  },
  me_system: {
    icon: '🔄',
    titleKey: 'ovi.grids.meSystem.title',
    descKey: 'ovi.grids.meSystem.desc'
  },
  reversible_irreversible: {
    icon: '↩️',
    titleKey: 'ovi.grids.reversibleIrreversible.title',
    descKey: 'ovi.grids.reversibleIrreversible.desc'
  },
  short_long_term: {
    icon: '📊',
    titleKey: 'ovi.grids.shortLongTerm.title',
    descKey: 'ovi.grids.shortLongTerm.desc'
  },
  controllable_uncontrollable: {
    icon: '🎮',
    titleKey: 'ovi.grids.controllableUncontrollable.title',
    descKey: 'ovi.grids.controllableUncontrollable.desc'
  },
  certain_uncertain: {
    icon: '❓',
    titleKey: 'ovi.grids.certainUncertain.title',
    descKey: 'ovi.grids.certainUncertain.desc'
  },
  urgent_important: {
    icon: '🚨',
    titleKey: 'ovi.grids.urgentImportant.title',
    descKey: 'ovi.grids.urgentImportant.desc'
  }
};

export function useOVISuggestions() {
  const { t } = useTranslation();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

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

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  }, []);

  const resetDismissed = useCallback(() => {
    setDismissedSuggestions(new Set());
  }, []);

  const getTopSuggestion = useCallback((simulationType: SimulationType): OVISuggestion | null => {
    const suggestions = getSuggestionsForSimulation(simulationType);
    return suggestions[0] || null;
  }, [getSuggestionsForSimulation]);

  return {
    getSuggestionsForSimulation,
    dismissSuggestion,
    resetDismissed,
    getTopSuggestion,
    dismissedCount: dismissedSuggestions.size
  };
}