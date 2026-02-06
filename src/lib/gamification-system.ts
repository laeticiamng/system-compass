/**
 * GAMIFICATION SYSTEM
 * XP, Levels, Badges, Challenges for user progression
 */

export type UserLevel = 'dreamer' | 'explorer' | 'planner' | 'pioneer' | 'mentor';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  category: 'milestone' | 'achievement' | 'rare' | 'social';
  xpReward: number;
  condition: BadgeCondition;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeCondition {
  type: 'countries_explored' | 'profile_completed' | 'exit_key_created' | 'quiz_completed' | 
        'comparison_made' | 'days_active' | 'community_joined' | 'first_action' | 'special';
  threshold?: number;
  metadata?: Record<string, unknown>;
}

export interface UserProgress {
  userId: string;
  xp: number;
  level: UserLevel;
  badges: string[]; // Badge IDs
  phase: UserPhase;
  achievements: Achievement[];
  streak: number;
  lastActive: string;
  createdAt: string;
}

export type UserPhase = 'exploration' | 'preparation' | 'action' | 'installation';

export interface Achievement {
  id: string;
  unlockedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  type: 'daily' | 'weekly' | 'destination';
  deadline?: string;
  requirements: ChallengeRequirement[];
}

export interface ChallengeRequirement {
  action: string;
  count: number;
  current?: number;
}

// Level thresholds
export const LEVEL_THRESHOLDS: Record<UserLevel, { minXp: number; maxXp: number; title: string; icon: string }> = {
  dreamer: { minXp: 0, maxXp: 499, title: 'Rêveur', icon: '💭' },
  explorer: { minXp: 500, maxXp: 1999, title: 'Explorateur', icon: '🔍' },
  planner: { minXp: 2000, maxXp: 4999, title: 'Planificateur', icon: '📋' },
  pioneer: { minXp: 5000, maxXp: 9999, title: 'Pionnier', icon: '🚀' },
  mentor: { minXp: 10000, maxXp: Infinity, title: 'Mentor', icon: '🎓' },
};

// Phase definitions
export const PHASES: Record<UserPhase, { title: string; description: string; icon: string; order: number }> = {
  exploration: {
    title: 'Exploration',
    description: 'Découvrez les pays et définissez vos critères',
    icon: '🌍',
    order: 1,
  },
  preparation: {
    title: 'Préparation',
    description: 'Planifiez votre projet et rassemblez les ressources',
    icon: '📝',
    order: 2,
  },
  action: {
    title: 'Action',
    description: 'Lancez les démarches concrètes',
    icon: '⚡',
    order: 3,
  },
  installation: {
    title: 'Installation',
    description: 'Finalisez votre expatriation',
    icon: '🏠',
    order: 4,
  },
};

// All badges
export const BADGES: Badge[] = [
  // Milestone badges
  {
    id: 'first-steps',
    name: 'Premiers pas',
    description: 'Créez votre compte et complétez votre profil',
    icon: '👶',
    category: 'milestone',
    xpReward: 50,
    condition: { type: 'first_action' },
    rarity: 'common',
  },
  {
    id: 'curious-mind',
    name: 'Esprit curieux',
    description: 'Explorez 5 pays différents',
    icon: '🔍',
    category: 'milestone',
    xpReward: 100,
    condition: { type: 'countries_explored', threshold: 5 },
    rarity: 'common',
  },
  {
    id: 'world-citizen',
    name: 'Citoyen du monde',
    description: 'Explorez 20 pays différents',
    icon: '🌍',
    category: 'milestone',
    xpReward: 300,
    condition: { type: 'countries_explored', threshold: 20 },
    rarity: 'uncommon',
  },
  {
    id: 'globe-trotter',
    name: 'Globe-trotter',
    description: 'Explorez 50 pays différents',
    icon: '✈️',
    category: 'milestone',
    xpReward: 500,
    condition: { type: 'countries_explored', threshold: 50 },
    rarity: 'rare',
  },
  {
    id: 'quiz-master',
    name: 'Maître du quiz',
    description: 'Complétez tous les quiz de profil',
    icon: '🎯',
    category: 'milestone',
    xpReward: 150,
    condition: { type: 'quiz_completed', threshold: 3 },
    rarity: 'uncommon',
  },
  
  // Achievement badges
  {
    id: 'strategist',
    name: 'Stratège',
    description: 'Créez votre première stratégie personnalisée',
    icon: '🗝️',
    category: 'achievement',
    xpReward: 200,
    condition: { type: 'exit_key_created', threshold: 1 },
    rarity: 'uncommon',
  },
  {
    id: 'comparator',
    name: 'Comparateur',
    description: 'Comparez 10 destinations',
    icon: '⚖️',
    category: 'achievement',
    xpReward: 150,
    condition: { type: 'comparison_made', threshold: 10 },
    rarity: 'uncommon',
  },
  {
    id: 'dedicated',
    name: 'Assidu',
    description: 'Connectez-vous 7 jours consécutifs',
    icon: '🔥',
    category: 'achievement',
    xpReward: 200,
    condition: { type: 'days_active', threshold: 7 },
    rarity: 'uncommon',
  },
  {
    id: 'committed',
    name: 'Engagé',
    description: 'Connectez-vous 30 jours consécutifs',
    icon: '💎',
    category: 'achievement',
    xpReward: 500,
    condition: { type: 'days_active', threshold: 30 },
    rarity: 'rare',
  },
  
  // Social badges
  {
    id: 'community-member',
    name: 'Membre de la communauté',
    description: 'Rejoignez notre communauté Discord',
    icon: '👥',
    category: 'social',
    xpReward: 100,
    condition: { type: 'community_joined' },
    rarity: 'common',
  },
  
  // Rare badges
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Parmi les 1000 premiers utilisateurs',
    icon: '🌟',
    category: 'rare',
    xpReward: 500,
    condition: { type: 'special', metadata: { type: 'early_adopter' } },
    rarity: 'epic',
  },
  {
    id: 'perfect-profile',
    name: 'Profil parfait',
    description: 'Complétez 100% de votre profil',
    icon: '✨',
    category: 'rare',
    xpReward: 300,
    condition: { type: 'profile_completed', threshold: 100 },
    rarity: 'rare',
  },
  {
    id: 'tax-optimizer',
    name: 'Optimisateur fiscal',
    description: 'Utilisez le calculateur fiscal 10 fois',
    icon: '💰',
    category: 'achievement',
    xpReward: 200,
    condition: { type: 'special', metadata: { action: 'fiscal_calculator', count: 10 } },
    rarity: 'uncommon',
  },
  {
    id: 'decision-maker',
    name: 'Décideur',
    description: 'Passez de la phase Exploration à Préparation',
    icon: '🎖️',
    category: 'milestone',
    xpReward: 250,
    condition: { type: 'special', metadata: { phase_transition: 'exploration_to_preparation' } },
    rarity: 'uncommon',
  },
  {
    id: 'pioneer-spirit',
    name: 'Esprit pionnier',
    description: 'Atteignez le niveau Pionnier',
    icon: '🚀',
    category: 'rare',
    xpReward: 500,
    condition: { type: 'special', metadata: { level: 'pioneer' } },
    rarity: 'epic',
  },
  {
    id: 'mentor-achieved',
    name: 'Mentor accompli',
    description: 'Atteignez le niveau Mentor',
    icon: '🎓',
    category: 'rare',
    xpReward: 1000,
    condition: { type: 'special', metadata: { level: 'mentor' } },
    rarity: 'legendary',
  },
];

// Weekly challenges generator
export const WEEKLY_CHALLENGES: Omit<Challenge, 'deadline'>[] = [
  {
    id: 'weekly-explorer',
    title: 'Explorateur de la semaine',
    description: 'Explorez 5 nouveaux pays cette semaine',
    xpReward: 150,
    type: 'weekly',
    requirements: [{ action: 'explore_country', count: 5 }],
  },
  {
    id: 'weekly-comparator',
    title: 'Analyste comparatif',
    description: 'Faites 3 comparaisons de pays',
    xpReward: 100,
    type: 'weekly',
    requirements: [{ action: 'compare_countries', count: 3 }],
  },
  {
    id: 'weekly-fiscal',
    title: 'Expert fiscal',
    description: 'Utilisez le calculateur fiscal 3 fois',
    xpReward: 100,
    type: 'weekly',
    requirements: [{ action: 'use_fiscal_calculator', count: 3 }],
  },
];

// Daily challenges
export const DAILY_CHALLENGES: Omit<Challenge, 'deadline'>[] = [
  {
    id: 'daily-login',
    title: 'Connexion quotidienne',
    description: 'Connectez-vous aujourd\'hui',
    xpReward: 10,
    type: 'daily',
    requirements: [{ action: 'login', count: 1 }],
  },
  {
    id: 'daily-explore',
    title: 'Découverte du jour',
    description: 'Explorez un nouveau pays',
    xpReward: 25,
    type: 'daily',
    requirements: [{ action: 'explore_country', count: 1 }],
  },
];

// Utility functions
export function calculateLevel(xp: number): UserLevel {
  if (xp >= LEVEL_THRESHOLDS.mentor.minXp) return 'mentor';
  if (xp >= LEVEL_THRESHOLDS.pioneer.minXp) return 'pioneer';
  if (xp >= LEVEL_THRESHOLDS.planner.minXp) return 'planner';
  if (xp >= LEVEL_THRESHOLDS.explorer.minXp) return 'explorer';
  return 'dreamer';
}

export function getXpToNextLevel(xp: number): { current: number; required: number; percentage: number } {
  const currentLevel = calculateLevel(xp);
  const threshold = LEVEL_THRESHOLDS[currentLevel];
  
  if (currentLevel === 'mentor') {
    return { current: xp, required: xp, percentage: 100 };
  }
  
  const xpInLevel = xp - threshold.minXp;
  const levelRange = threshold.maxXp - threshold.minXp + 1;
  
  return {
    current: xpInLevel,
    required: levelRange,
    percentage: Math.min(100, (xpInLevel / levelRange) * 100),
  };
}

export function getBadgeById(badgeId: string): Badge | undefined {
  return BADGES.find(b => b.id === badgeId);
}

export function getUnlockedBadges(progress: UserProgress): Badge[] {
  return progress.badges
    .map(id => getBadgeById(id))
    .filter((b): b is Badge => b !== undefined);
}

export function getAvailableBadges(progress: UserProgress): Badge[] {
  return BADGES.filter(b => !progress.badges.includes(b.id));
}

export function getRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-emerald-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-amber-400';
  }
}

export function getRarityBgColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-gray-500/10';
    case 'uncommon': return 'bg-emerald-500/10';
    case 'rare': return 'bg-blue-500/10';
    case 'epic': return 'bg-purple-500/10';
    case 'legendary': return 'bg-amber-500/10';
  }
}

export function getPhaseProgress(phase: UserPhase): number {
  return PHASES[phase].order * 25;
}

export function createInitialProgress(userId: string): UserProgress {
  return {
    userId,
    xp: 0,
    level: 'dreamer',
    badges: [],
    phase: 'exploration',
    achievements: [],
    streak: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}
