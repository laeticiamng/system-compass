import { GameStatistics } from '@/hooks/useGameStatistics';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'risk' | 'mastery' | 'social' | 'special';
  condition: (stats: GameStatistics) => boolean;
  progress?: (stats: GameStatistics) => { current: number; target: number };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // EXPLORATION
  {
    id: 'first_game',
    name: 'Premier pas',
    description: 'Jouer ta première partie',
    icon: '🎮',
    category: 'exploration',
    rarity: 'common',
    condition: (stats) => stats.totalGamesPlayed >= 1,
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Jouer 10 parties',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'rare',
    condition: (stats) => stats.totalGamesPlayed >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalGamesPlayed, 10), target: 10 }),
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    description: 'Jouer 50 parties',
    icon: '🏅',
    category: 'exploration',
    rarity: 'epic',
    condition: (stats) => stats.totalGamesPlayed >= 50,
    progress: (stats) => ({ current: Math.min(stats.totalGamesPlayed, 50), target: 50 }),
  },
  {
    id: 'globetrotter',
    name: 'Globe-trotter',
    description: 'Visiter 5 pays différents',
    icon: '🌍',
    category: 'exploration',
    rarity: 'rare',
    condition: (stats) => stats.countriesVisited.length >= 5,
    progress: (stats) => ({ current: Math.min(stats.countriesVisited.length, 5), target: 5 }),
  },
  {
    id: 'world_citizen',
    name: 'Citoyen du monde',
    description: 'Visiter 15 pays différents',
    icon: '✈️',
    category: 'exploration',
    rarity: 'legendary',
    condition: (stats) => stats.countriesVisited.length >= 15,
    progress: (stats) => ({ current: Math.min(stats.countriesVisited.length, 15), target: 15 }),
  },
  
  // RISK
  {
    id: 'risk_taker',
    name: 'Preneur de risques',
    description: 'Affronter 10 événements à risque',
    icon: '🎲',
    category: 'risk',
    rarity: 'common',
    condition: (stats) => stats.totalRiskEvents >= 10,
    progress: (stats) => ({ current: Math.min(stats.totalRiskEvents, 10), target: 10 }),
  },
  {
    id: 'lucky_one',
    name: 'Le Chanceux',
    description: 'Réussir 10 événements à risque',
    icon: '🍀',
    category: 'risk',
    rarity: 'rare',
    condition: (stats) => stats.riskSuccesses >= 10,
    progress: (stats) => ({ current: Math.min(stats.riskSuccesses, 10), target: 10 }),
  },
  {
    id: 'survivor',
    name: 'Survivant',
    description: 'Survivre à 5 échecs catastrophiques',
    icon: '💪',
    category: 'risk',
    rarity: 'epic',
    condition: (stats) => stats.riskFailures >= 5,
    progress: (stats) => ({ current: Math.min(stats.riskFailures, 5), target: 5 }),
  },
  {
    id: 'calculated_risk',
    name: 'Risque calculé',
    description: 'Maintenir un taux de succès de 70%+ sur 20 risques',
    icon: '🧠',
    category: 'risk',
    rarity: 'legendary',
    condition: (stats) => {
      if (stats.totalRiskEvents < 20) return false;
      const rate = stats.riskSuccesses / stats.totalRiskEvents;
      return rate >= 0.7;
    },
  },
  
  // MASTERY
  {
    id: 'century',
    name: 'Centenaire',
    description: 'Jouer 100 tours au total',
    icon: '⏳',
    category: 'mastery',
    rarity: 'rare',
    condition: (stats) => stats.totalTurnsPlayed >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalTurnsPlayed, 100), target: 100 }),
  },
  {
    id: 'marathon',
    name: 'Marathonien',
    description: 'Jouer 500 tours au total',
    icon: '🏃',
    category: 'mastery',
    rarity: 'epic',
    condition: (stats) => stats.totalTurnsPlayed >= 500,
    progress: (stats) => ({ current: Math.min(stats.totalTurnsPlayed, 500), target: 500 }),
  },
  {
    id: 'high_score_50',
    name: 'Demi-siècle',
    description: 'Atteindre un score de 50+ en solo',
    icon: '🏆',
    category: 'mastery',
    rarity: 'rare',
    condition: (stats) => stats.bestScoreSolo >= 50,
  },
  {
    id: 'high_score_100',
    name: 'Centurion',
    description: 'Atteindre un score de 100+ en solo',
    icon: '👑',
    category: 'mastery',
    rarity: 'legendary',
    condition: (stats) => stats.bestScoreSolo >= 100,
  },
  {
    id: 'archetype_collector',
    name: 'Collectionneur',
    description: 'Essayer 5 archétypes différents',
    icon: '🎭',
    category: 'mastery',
    rarity: 'rare',
    condition: (stats) => stats.archetypesUsed.length >= 5,
    progress: (stats) => ({ current: Math.min(stats.archetypesUsed.length, 5), target: 5 }),
  },
  {
    id: 'archetype_master',
    name: 'Maître des archétypes',
    description: 'Essayer 10 archétypes différents',
    icon: '🌟',
    category: 'mastery',
    rarity: 'epic',
    condition: (stats) => stats.archetypesUsed.length >= 10,
    progress: (stats) => ({ current: Math.min(stats.archetypesUsed.length, 10), target: 10 }),
  },
  
  // SPECIAL
  {
    id: 'millionaire',
    name: 'Millionnaire',
    description: 'Gagner 100 points d\'argent au total',
    icon: '💰',
    category: 'special',
    rarity: 'rare',
    condition: (stats) => stats.totalMoneyEarned >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalMoneyEarned, 100), target: 100 }),
  },
  {
    id: 'bankrupt',
    name: 'Faillite acceptée',
    description: 'Perdre 50 points d\'argent au total',
    icon: '📉',
    category: 'special',
    rarity: 'common',
    condition: (stats) => stats.totalMoneyLost >= 50,
    progress: (stats) => ({ current: Math.min(stats.totalMoneyLost, 50), target: 50 }),
  },
  {
    id: 'health_conscious',
    name: 'Conscient de la santé',
    description: 'Perdre moins de 10 points de santé sur 50 tours',
    icon: '❤️',
    category: 'special',
    rarity: 'epic',
    condition: (stats) => {
      if (stats.totalTurnsPlayed < 50) return false;
      const avgHealthLossPerTurn = stats.totalHealthLost / stats.totalTurnsPlayed;
      return avgHealthLossPerTurn < 0.2;
    },
  },
  {
    id: 'perfect_start',
    name: 'Départ parfait',
    description: 'Réussir tes 5 premiers risques consécutivement',
    icon: '⭐',
    category: 'special',
    rarity: 'legendary',
    condition: (stats) => stats.totalRiskEvents >= 5 && stats.riskFailures === 0,
  },
];

export function getUnlockedAchievements(stats: GameStatistics): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.condition(stats));
}

export function getLockedAchievements(stats: GameStatistics): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.condition(stats));
}

export function getNewlyUnlockedAchievements(
  oldStats: GameStatistics,
  newStats: GameStatistics
): Achievement[] {
  const oldUnlocked = new Set(getUnlockedAchievements(oldStats).map(a => a.id));
  return getUnlockedAchievements(newStats).filter(a => !oldUnlocked.has(a.id));
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    case 'rare': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    case 'epic': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    case 'legendary': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }
}

export function getCategoryLabel(category: Achievement['category']): string {
  switch (category) {
    case 'exploration': return 'Exploration';
    case 'risk': return 'Prise de risque';
    case 'mastery': return 'Maîtrise';
    case 'social': return 'Social';
    case 'special': return 'Spécial';
  }
}