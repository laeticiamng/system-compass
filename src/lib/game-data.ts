import { PyramidType } from './types';

// ============== RESOURCES ==============
export interface GameResources {
  time: number;      // 0-10: Capacity to take actions
  money: number;     // 0-10: Access to investments
  health: number;    // 0-10: Stability protection
  network: number;   // 0-10: Opens opportunities
  skills: number;    // 0-10: Improves returns
  mobility: number;  // 0-10: Allows migration
}

export const createDefaultResources = (): GameResources => ({
  time: 5,
  money: 3,
  health: 7,
  network: 2,
  skills: 3,
  mobility: 4,
});

export type ResourceType = keyof GameResources;

export const RESOURCE_INFO: Record<ResourceType, { 
  label: string; 
  icon: string; 
  color: string;
  description: string;
}> = {
  time: { label: 'resources.time', icon: '⏰', color: 'text-cyan-400', description: 'resources.timeDesc' },
  money: { label: 'resources.money', icon: '💰', color: 'text-amber-400', description: 'resources.moneyDesc' },
  health: { label: 'resources.health', icon: '❤️', color: 'text-rose-400', description: 'resources.healthDesc' },
  network: { label: 'resources.network', icon: '🤝', color: 'text-purple-400', description: 'resources.networkDesc' },
  skills: { label: 'resources.skills', icon: '🎓', color: 'text-emerald-400', description: 'resources.skillsDesc' },
  mobility: { label: 'resources.mobility', icon: '✈️', color: 'text-blue-400', description: 'resources.mobilityDesc' },
};

// ============== ACTIONS ==============
export interface GameAction {
  id: string;
  type: 'major' | 'minor';
  label: string;
  description: string;
  icon: string;
  costs: Partial<GameResources>;
  gains: Partial<GameResources>;
  pyramidEffect?: Partial<Record<PyramidType, number>>;
  requirements?: Partial<GameResources>;
  riskChance?: number; // 0-1 chance of negative outcome
  riskPenalty?: Partial<GameResources>;
}

export const GAME_ACTIONS: GameAction[] = [
  // MAJOR ACTIONS
  {
    id: 'work',
    type: 'major',
    label: 'actions.work.label',
    description: 'actions.work.description',
    icon: '💼',
    costs: { time: 3, health: 1 },
    gains: { money: 3, skills: 1 },
    pyramidEffect: { STABILITY_REDIS: 1, COMPETENCE_TRUST: 1 },
  },
  {
    id: 'study',
    type: 'major',
    label: 'actions.study.label',
    description: 'actions.study.description',
    icon: '📚',
    costs: { time: 4, money: 2 },
    gains: { skills: 3 },
    pyramidEffect: { COMPETENCE_TRUST: 2 },
  },
  {
    id: 'entrepreneur',
    type: 'major',
    label: 'actions.entrepreneur.label',
    description: 'actions.entrepreneur.description',
    icon: '🚀',
    costs: { time: 4, money: 3, health: 2 },
    gains: { money: 6, network: 2 },
    pyramidEffect: { GROWTH_RISK: 3 },
    riskChance: 0.4,
    riskPenalty: { money: 4, health: 1 },
  },
  {
    id: 'migrate',
    type: 'major',
    label: 'actions.migrate.label',
    description: 'actions.migrate.description',
    icon: '✈️',
    costs: { money: 4, mobility: 3, network: 2 },
    gains: { mobility: 1 },
    pyramidEffect: { HYBRID_TRANSITION: 2, GROWTH_RISK: 1 },
    requirements: { mobility: 3 },
  },
  {
    id: 'contribute',
    type: 'major',
    label: 'actions.contribute.label',
    description: 'actions.contribute.description',
    icon: '🎨',
    costs: { time: 3 },
    gains: { network: 2, skills: 1 },
    pyramidEffect: { PROBLEM_RENT: 1, HYBRID_TRANSITION: 1 },
  },
  // MINOR ACTIONS
  {
    id: 'networking',
    type: 'minor',
    label: 'actions.networking.label',
    description: 'actions.networking.description',
    icon: '🤝',
    costs: { time: 1, money: 1 },
    gains: { network: 2 },
    pyramidEffect: { PROBLEM_RENT: 1 },
  },
  {
    id: 'relationships',
    type: 'minor',
    label: 'actions.relationships.label',
    description: 'actions.relationships.description',
    icon: '❤️',
    costs: { time: 2 },
    gains: { health: 1, network: 1 },
  },
  {
    id: 'heal',
    type: 'minor',
    label: 'actions.heal.label',
    description: 'actions.heal.description',
    icon: '🏥',
    costs: { time: 1, money: 2 },
    gains: { health: 3 },
  },
  {
    id: 'rest',
    type: 'minor',
    label: 'actions.rest.label',
    description: 'actions.rest.description',
    icon: '😴',
    costs: {},
    gains: { time: 2, health: 2 },
  },
];

// ============== EVENTS ==============
export interface GameEvent {
  id: string;
  type: 'global' | 'country';
  label: string;
  description: string;
  icon: string;
  effect: Partial<GameResources>;
  pyramidEffect?: Partial<Record<PyramidType, number>>;
  countryTypes?: PyramidType[]; // Only for country events
  duration?: number; // Turns the effect lasts
}

export const GLOBAL_EVENTS: GameEvent[] = [
  {
    id: 'tech_boom',
    type: 'global',
    label: 'events.global.techBoom.label',
    description: 'events.global.techBoom.description',
    icon: '🚀',
    effect: { skills: 1 },
    pyramidEffect: { GROWTH_RISK: 2 },
  },
  {
    id: 'economic_crisis',
    type: 'global',
    label: 'events.global.economicCrisis.label',
    description: 'events.global.economicCrisis.description',
    icon: '📉',
    effect: { money: -2 },
    pyramidEffect: { STABILITY_REDIS: -1, PROBLEM_RENT: 1 },
  },
  {
    id: 'pandemic',
    type: 'global',
    label: 'events.global.pandemic.label',
    description: 'events.global.pandemic.description',
    icon: '🦠',
    effect: { health: -1, mobility: -2 },
    pyramidEffect: { STABILITY_REDIS: 1 },
  },
  {
    id: 'remote_work',
    type: 'global',
    label: 'events.global.remoteWork.label',
    description: 'events.global.remoteWork.description',
    icon: '💻',
    effect: { time: 1, mobility: 1 },
    pyramidEffect: { GROWTH_RISK: 1, COMPETENCE_TRUST: 1 },
  },
  {
    id: 'inflation',
    type: 'global',
    label: 'events.global.inflation.label',
    description: 'events.global.inflation.description',
    icon: '💸',
    effect: { money: -1 },
    pyramidEffect: { RESOURCE_EXTRACTION: 1 },
  },
  {
    id: 'open_borders',
    type: 'global',
    label: 'events.global.openBorders.label',
    description: 'events.global.openBorders.description',
    icon: '🌍',
    effect: { mobility: 2 },
    pyramidEffect: { HYBRID_TRANSITION: 1 },
  },
  {
    id: 'ai_revolution',
    type: 'global',
    label: 'events.global.aiRevolution.label',
    description: 'events.global.aiRevolution.description',
    icon: '🤖',
    effect: { skills: -1 },
    pyramidEffect: { GROWTH_RISK: 2, COMPETENCE_TRUST: -1 },
  },
  {
    id: 'green_transition',
    type: 'global',
    label: 'events.global.greenTransition.label',
    description: 'events.global.greenTransition.description',
    icon: '🌱',
    effect: { money: -1 },
    pyramidEffect: { STABILITY_REDIS: 1, RESOURCE_EXTRACTION: -1 },
  },
];

export const COUNTRY_EVENTS: GameEvent[] = [
  {
    id: 'political_instability',
    type: 'country',
    label: 'events.country.politicalInstability.label',
    description: 'events.country.politicalInstability.description',
    icon: '⚡',
    effect: { network: -1, mobility: -1 },
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
  },
  {
    id: 'tax_reform',
    type: 'country',
    label: 'events.country.taxReform.label',
    description: 'events.country.taxReform.description',
    icon: '📋',
    effect: { money: -2 },
    countryTypes: ['STABILITY_REDIS'],
  },
  {
    id: 'startup_funding',
    type: 'country',
    label: 'events.country.startupFunding.label',
    description: 'events.country.startupFunding.description',
    icon: '💎',
    effect: { money: 2 },
    countryTypes: ['GROWTH_RISK'],
  },
  {
    id: 'visa_restrictions',
    type: 'country',
    label: 'events.country.visaRestrictions.label',
    description: 'events.country.visaRestrictions.description',
    icon: '🚫',
    effect: { mobility: -2 },
    countryTypes: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
  },
  {
    id: 'corruption_scandal',
    type: 'country',
    label: 'events.country.corruptionScandal.label',
    description: 'events.country.corruptionScandal.description',
    icon: '🕵️',
    effect: { network: 1 },
    countryTypes: ['PROBLEM_RENT'],
  },
  {
    id: 'economic_boom',
    type: 'country',
    label: 'events.country.economicBoom.label',
    description: 'events.country.economicBoom.description',
    icon: '📈',
    effect: { money: 2, network: 1 },
    countryTypes: ['GROWTH_RISK', 'RESOURCE_EXTRACTION'],
  },
];

// ============== CHARACTER CARDS ==============
export interface CharacterTrait {
  id: string;
  label: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative';
  resourceBonus?: Partial<GameResources>;
  pyramidBonus?: Partial<Record<PyramidType, number>>;
}

export interface CharacterAspiration {
  id: string;
  label: string;
  description: string;
  icon: string;
  targetPyramids: PyramidType[];
  scoreMultiplier: number; // 1 for minor, 2 for major
}

export interface CharacterCard {
  id: string;
  name: string;
  birthCountry: string;
  traits: CharacterTrait[];
  constraint: CharacterTrait;
  majorAspirations: CharacterAspiration[];
  minorAspiration: CharacterAspiration;
  startingResources: GameResources;
}

export const POSITIVE_TRAITS: CharacterTrait[] = [
  {
    id: 'charismatic',
    label: 'traits.charismatic.label',
    description: 'traits.charismatic.description',
    icon: '✨',
    type: 'positive',
    resourceBonus: { network: 2 },
  },
  {
    id: 'resilient',
    label: 'traits.resilient.label',
    description: 'traits.resilient.description',
    icon: '💪',
    type: 'positive',
    resourceBonus: { health: 2 },
  },
  {
    id: 'wealthy_family',
    label: 'traits.wealthyFamily.label',
    description: 'traits.wealthyFamily.description',
    icon: '👑',
    type: 'positive',
    resourceBonus: { money: 3 },
  },
  {
    id: 'quick_learner',
    label: 'traits.quickLearner.label',
    description: 'traits.quickLearner.description',
    icon: '🧠',
    type: 'positive',
    resourceBonus: { skills: 2 },
  },
  {
    id: 'well_connected',
    label: 'traits.wellConnected.label',
    description: 'traits.wellConnected.description',
    icon: '🔗',
    type: 'positive',
    resourceBonus: { network: 3 },
  },
  {
    id: 'dual_citizenship',
    label: 'traits.dualCitizenship.label',
    description: 'traits.dualCitizenship.description',
    icon: '🛂',
    type: 'positive',
    resourceBonus: { mobility: 3 },
  },
  {
    id: 'efficient',
    label: 'traits.efficient.label',
    description: 'traits.efficient.description',
    icon: '⚡',
    type: 'positive',
    resourceBonus: { time: 2 },
  },
  {
    id: 'street_smart',
    label: 'traits.streetSmart.label',
    description: 'traits.streetSmart.description',
    icon: '🎯',
    type: 'positive',
    pyramidBonus: { PROBLEM_RENT: 2, HYBRID_TRANSITION: 1 },
  },
];

export const NEGATIVE_TRAITS: CharacterTrait[] = [
  {
    id: 'chronic_illness',
    label: 'traits.chronicIllness.label',
    description: 'traits.chronicIllness.description',
    icon: '🏥',
    type: 'negative',
    resourceBonus: { health: -2 },
  },
  {
    id: 'poor_background',
    label: 'traits.poorBackground.label',
    description: 'traits.poorBackground.description',
    icon: '📉',
    type: 'negative',
    resourceBonus: { money: -2 },
  },
  {
    id: 'socially_awkward',
    label: 'traits.sociallyAwkward.label',
    description: 'traits.sociallyAwkward.description',
    icon: '😬',
    type: 'negative',
    resourceBonus: { network: -2 },
  },
  {
    id: 'visa_restricted',
    label: 'traits.visaRestricted.label',
    description: 'traits.visaRestricted.description',
    icon: '🚫',
    type: 'negative',
    resourceBonus: { mobility: -3 },
  },
  {
    id: 'impulsive',
    label: 'traits.impulsive.label',
    description: 'traits.impulsive.description',
    icon: '🔥',
    type: 'negative',
    resourceBonus: { time: -1, money: -1 },
  },
  {
    id: 'burned_out',
    label: 'traits.burnedOut.label',
    description: 'traits.burnedOut.description',
    icon: '😫',
    type: 'negative',
    resourceBonus: { time: -2, health: -1 },
  },
];

export const ASPIRATIONS: CharacterAspiration[] = [
  {
    id: 'financial_freedom',
    label: 'aspirations.financialFreedom.label',
    description: 'aspirations.financialFreedom.description',
    icon: '💰',
    targetPyramids: ['GROWTH_RISK', 'RESOURCE_EXTRACTION'],
    scoreMultiplier: 2,
  },
  {
    id: 'stability_seeker',
    label: 'aspirations.stabilitySeeker.label',
    description: 'aspirations.stabilitySeeker.description',
    icon: '🏠',
    targetPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    scoreMultiplier: 2,
  },
  {
    id: 'world_explorer',
    label: 'aspirations.worldExplorer.label',
    description: 'aspirations.worldExplorer.description',
    icon: '🌍',
    targetPyramids: ['HYBRID_TRANSITION', 'GROWTH_RISK'],
    scoreMultiplier: 2,
  },
  {
    id: 'master_craftsman',
    label: 'aspirations.masterCraftsman.label',
    description: 'aspirations.masterCraftsman.description',
    icon: '🎓',
    targetPyramids: ['COMPETENCE_TRUST'],
    scoreMultiplier: 2,
  },
  {
    id: 'influencer',
    label: 'aspirations.influencer.label',
    description: 'aspirations.influencer.description',
    icon: '📣',
    targetPyramids: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    scoreMultiplier: 2,
  },
  {
    id: 'empire_builder',
    label: 'aspirations.empireBuilder.label',
    description: 'aspirations.empireBuilder.description',
    icon: '🏛️',
    targetPyramids: ['GROWTH_RISK', 'RESOURCE_EXTRACTION'],
    scoreMultiplier: 2,
  },
  {
    id: 'balanced_life',
    label: 'aspirations.balancedLife.label',
    description: 'aspirations.balancedLife.description',
    icon: '☯️',
    targetPyramids: ['STABILITY_REDIS'],
    scoreMultiplier: 1,
  },
  {
    id: 'social_climber',
    label: 'aspirations.socialClimber.label',
    description: 'aspirations.socialClimber.description',
    icon: '🎭',
    targetPyramids: ['PROBLEM_RENT'],
    scoreMultiplier: 1,
  },
];

// Helper to generate a random character
export function generateRandomCharacter(
  id: string,
  name: string,
  birthCountryId: string,
  birthCountryType: PyramidType
): CharacterCard {
  // Pick 2 random positive traits
  const shuffledPositive = [...POSITIVE_TRAITS].sort(() => Math.random() - 0.5);
  const traits = shuffledPositive.slice(0, 2);
  
  // Pick 1 random constraint
  const shuffledNegative = [...NEGATIVE_TRAITS].sort(() => Math.random() - 0.5);
  const constraint = shuffledNegative[0];
  
  // Pick 2 major and 1 minor aspiration
  const shuffledAspirations = [...ASPIRATIONS].sort(() => Math.random() - 0.5);
  const majorAspirations = shuffledAspirations.slice(0, 2).map(a => ({ ...a, scoreMultiplier: 2 }));
  const minorAspiration = { ...shuffledAspirations[2], scoreMultiplier: 1 };
  
  // Calculate starting resources based on traits
  const startingResources = createDefaultResources();
  
  // Apply trait bonuses
  [...traits, constraint].forEach(trait => {
    if (trait.resourceBonus) {
      Object.entries(trait.resourceBonus).forEach(([resource, bonus]) => {
        startingResources[resource as ResourceType] = Math.max(0, Math.min(10,
          startingResources[resource as ResourceType] + bonus
        ));
      });
    }
  });
  
  // Apply country-based modifier
  if (birthCountryType === 'GROWTH_RISK') {
    startingResources.money += 1;
  } else if (birthCountryType === 'STABILITY_REDIS') {
    startingResources.health += 1;
  } else if (birthCountryType === 'PROBLEM_RENT') {
    startingResources.network += 1;
  } else if (birthCountryType === 'COMPETENCE_TRUST') {
    startingResources.skills += 1;
  } else if (birthCountryType === 'RESOURCE_EXTRACTION') {
    startingResources.money += 2;
    startingResources.mobility -= 1;
  } else if (birthCountryType === 'HYBRID_TRANSITION') {
    startingResources.mobility += 1;
  }
  
  return {
    id,
    name,
    birthCountry: birthCountryId,
    traits,
    constraint,
    majorAspirations,
    minorAspiration,
    startingResources,
  };
}

// Get random event
export function getRandomGlobalEvent(): GameEvent {
  return GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
}

export function getRandomCountryEvent(countryType: PyramidType): GameEvent | null {
  const validEvents = COUNTRY_EVENTS.filter(e => 
    !e.countryTypes || e.countryTypes.includes(countryType)
  );
  if (validEvents.length === 0) return null;
  return validEvents[Math.floor(Math.random() * validEvents.length)];
}
