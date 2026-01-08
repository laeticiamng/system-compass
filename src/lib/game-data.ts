import { PyramidType } from './types';

// ============== RESOURCES ==============
export interface GameResources {
  time: number;      // 0-10: Capacity to take actions
  money: number;     // 0-10: Access to investments
  health: number;    // 0-10: Stability protection
  network: number;   // 0-10: Opens opportunities
  skills: number;    // 0-10: Improves returns
  mobility: number;  // 0-10: Allows migration
  family: number;    // 0-10: Family bonds (spouse, children, parents, siblings)
}

export const createDefaultResources = (): GameResources => ({
  time: 5,
  money: 3,
  health: 7,
  network: 2,
  skills: 3,
  mobility: 4,
  family: 5,
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
  family: { label: 'resources.family', icon: '👨‍👩‍👧‍👦', color: 'text-pink-400', description: 'resources.familyDesc' },
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
  isShortcut?: boolean; // Flag to trigger risk events instead of normal failure
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
  // SHORTCUT ACTION (Risky)
  {
    id: 'shortcut',
    type: 'major',
    label: 'actions.shortcut.label',
    description: 'actions.shortcut.description',
    icon: '⚡',
    costs: { money: 2 },
    gains: { mobility: 3 },
    pyramidEffect: { PROBLEM_RENT: 2 },
    riskChance: 0.7, // 70% chance of triggering a risk event
    riskPenalty: { health: 3, money: 3, mobility: 2 },
    requirements: { mobility: 1 },
    isShortcut: true, // Flag to trigger risk events
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
  // === NEW GLOBAL EVENTS ===
  {
    id: 'currency_collapse',
    type: 'global',
    label: 'events.global.currencyCollapse.label',
    description: 'events.global.currencyCollapse.description',
    icon: '💱',
    effect: { money: -3 },
    pyramidEffect: { PROBLEM_RENT: 2, HYBRID_TRANSITION: 1 },
  },
  {
    id: 'digital_surveillance',
    type: 'global',
    label: 'events.global.digitalSurveillance.label',
    description: 'events.global.digitalSurveillance.description',
    icon: '👁️',
    effect: { mobility: -1, network: -1 },
    pyramidEffect: { COMPETENCE_TRUST: 1, HYBRID_TRANSITION: 1 },
  },
  {
    id: 'trade_war',
    type: 'global',
    label: 'events.global.tradeWar.label',
    description: 'events.global.tradeWar.description',
    icon: '🚢',
    effect: { money: -1, skills: 1 },
    pyramidEffect: { RESOURCE_EXTRACTION: -1, STABILITY_REDIS: 1 },
  },
  {
    id: 'housing_crisis',
    type: 'global',
    label: 'events.global.housingCrisis.label',
    description: 'events.global.housingCrisis.description',
    icon: '🏠',
    effect: { money: -2, mobility: -1 },
    pyramidEffect: { GROWTH_RISK: -1, STABILITY_REDIS: 1 },
  },
  {
    id: 'education_reform',
    type: 'global',
    label: 'events.global.educationReform.label',
    description: 'events.global.educationReform.description',
    icon: '🎓',
    effect: { skills: 2 },
    pyramidEffect: { COMPETENCE_TRUST: 2 },
  },
  {
    id: 'talent_shortage',
    type: 'global',
    label: 'events.global.talentShortage.label',
    description: 'events.global.talentShortage.description',
    icon: '🔍',
    effect: { skills: 1, money: 1 },
    pyramidEffect: { GROWTH_RISK: 1, COMPETENCE_TRUST: 1 },
  },
  {
    id: 'debt_crisis',
    type: 'global',
    label: 'events.global.debtCrisis.label',
    description: 'events.global.debtCrisis.description',
    icon: '📊',
    effect: { money: -2 },
    pyramidEffect: { STABILITY_REDIS: -1, PROBLEM_RENT: 2 },
  },
  {
    id: 'geopolitical_tension',
    type: 'global',
    label: 'events.global.geopoliticalTension.label',
    description: 'events.global.geopoliticalTension.description',
    icon: '⚔️',
    effect: { mobility: -2, health: -1 },
    pyramidEffect: { HYBRID_TRANSITION: 2, RESOURCE_EXTRACTION: 1 },
  },
  {
    id: 'healthcare_breakthrough',
    type: 'global',
    label: 'events.global.healthcareBreakthrough.label',
    description: 'events.global.healthcareBreakthrough.description',
    icon: '💊',
    effect: { health: 2 },
    pyramidEffect: { COMPETENCE_TRUST: 1 },
  },
  {
    id: 'social_media_revolution',
    type: 'global',
    label: 'events.global.socialMediaRevolution.label',
    description: 'events.global.socialMediaRevolution.description',
    icon: '📱',
    effect: { network: 2, time: -1 },
    pyramidEffect: { PROBLEM_RENT: 1, GROWTH_RISK: 1 },
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
  // === NEW COUNTRY EVENTS ===
  {
    id: 'minority_persecution',
    type: 'country',
    label: 'events.country.minorityPersecution.label',
    description: 'events.country.minorityPersecution.description',
    icon: '🚨',
    effect: { health: -2, mobility: -2, network: -1 },
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
  },
  {
    id: 'press_freedom_crackdown',
    type: 'country',
    label: 'events.country.pressFreedomCrackdown.label',
    description: 'events.country.pressFreedomCrackdown.description',
    icon: '📰',
    effect: { network: -1, skills: -1 },
    countryTypes: ['HYBRID_TRANSITION', 'PROBLEM_RENT'],
  },
  {
    id: 'wealth_tax',
    type: 'country',
    label: 'events.country.wealthTax.label',
    description: 'events.country.wealthTax.description',
    icon: '💰',
    effect: { money: -3 },
    countryTypes: ['STABILITY_REDIS'],
  },
  {
    id: 'infrastructure_collapse',
    type: 'country',
    label: 'events.country.infrastructureCollapse.label',
    description: 'events.country.infrastructureCollapse.description',
    icon: '🏗️',
    effect: { mobility: -2, health: -1 },
    countryTypes: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
  },
  {
    id: 'talent_immigration_wave',
    type: 'country',
    label: 'events.country.talentImmigrationWave.label',
    description: 'events.country.talentImmigrationWave.description',
    icon: '✈️',
    effect: { network: 2, skills: 1 },
    countryTypes: ['GROWTH_RISK', 'COMPETENCE_TRUST'],
  },
  {
    id: 'labor_strike',
    type: 'country',
    label: 'events.country.laborStrike.label',
    description: 'events.country.laborStrike.description',
    icon: '✊',
    effect: { time: -2, money: -1 },
    countryTypes: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
  },
  {
    id: 'judicial_reform',
    type: 'country',
    label: 'events.country.judicialReform.label',
    description: 'events.country.judicialReform.description',
    icon: '⚖️',
    effect: { network: 1 },
    countryTypes: ['HYBRID_TRANSITION', 'PROBLEM_RENT'],
  },
  {
    id: 'resource_discovery',
    type: 'country',
    label: 'events.country.resourceDiscovery.label',
    description: 'events.country.resourceDiscovery.description',
    icon: '⛽',
    effect: { money: 3 },
    countryTypes: ['RESOURCE_EXTRACTION'],
  },
  {
    id: 'tech_hub_emergence',
    type: 'country',
    label: 'events.country.techHubEmergence.label',
    description: 'events.country.techHubEmergence.description',
    icon: '💻',
    effect: { skills: 2, money: 1 },
    countryTypes: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
  },
  {
    id: 'diplomatic_isolation',
    type: 'country',
    label: 'events.country.diplomaticIsolation.label',
    description: 'events.country.diplomaticIsolation.description',
    icon: '🚷',
    effect: { mobility: -3, network: -2 },
    countryTypes: ['HYBRID_TRANSITION', 'PROBLEM_RENT'],
  },
];

// ============== RISK EVENTS (Realistic dangers) ==============
export interface RiskEvent extends GameEvent {
  riskType: 'trafficking' | 'scam' | 'exploitation' | 'illegal_crossing' | 'document_fraud' | 'natural_disaster' | 'climate' | 'political';
  survivalChance: number; // 0-1 chance of surviving without major loss
  potentialOutcomes: {
    success: { probability: number; effect: Partial<GameResources>; description: string };
    failure: { probability: number; effect: Partial<GameResources>; description: string };
    catastrophic?: { probability: number; effect: Partial<GameResources>; description: string };
  };
}

export const RISK_EVENTS: RiskEvent[] = [
  {
    id: 'illegal_sea_crossing',
    type: 'country',
    riskType: 'illegal_crossing',
    label: 'events.risk.seaCrossing.label',
    description: 'events.risk.seaCrossing.description',
    icon: '🚢',
    effect: { health: -3, money: -3, mobility: -2 },
    survivalChance: 0.7,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.3, 
        effect: { mobility: 3 }, 
        description: 'events.risk.seaCrossing.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { money: -4, health: -2, mobility: -3 }, 
        description: 'events.risk.seaCrossing.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -10 }, 
        description: 'events.risk.seaCrossing.catastrophic' 
      },
    },
  },
  {
    id: 'smuggler_scam',
    type: 'country',
    riskType: 'scam',
    label: 'events.risk.smugglerScam.label',
    description: 'events.risk.smugglerScam.description',
    icon: '🎭',
    effect: { money: -5, network: -2 },
    survivalChance: 0.9,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.1, 
        effect: { mobility: 2 }, 
        description: 'events.risk.smugglerScam.success' 
      },
      failure: { 
        probability: 0.9, 
        effect: { money: -5, network: -2, time: -2 }, 
        description: 'events.risk.smugglerScam.failure' 
      },
    },
  },
  {
    id: 'labor_exploitation',
    type: 'country',
    riskType: 'exploitation',
    label: 'events.risk.laborExploitation.label',
    description: 'events.risk.laborExploitation.description',
    icon: '⛓️',
    effect: { health: -2, time: -4, money: -2 },
    survivalChance: 0.8,
    countryTypes: ['RESOURCE_EXTRACTION', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.2, 
        effect: { money: 1 }, 
        description: 'events.risk.laborExploitation.success' 
      },
      failure: { 
        probability: 0.6, 
        effect: { health: -3, time: -4, money: -2, mobility: -2 }, 
        description: 'events.risk.laborExploitation.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -5, mobility: -5, network: -3 }, 
        description: 'events.risk.laborExploitation.catastrophic' 
      },
    },
  },
  {
    id: 'trafficking_network',
    type: 'country',
    riskType: 'trafficking',
    label: 'events.risk.trafficking.label',
    description: 'events.risk.trafficking.description',
    icon: '🚨',
    effect: { health: -4, mobility: -5, network: -3 },
    survivalChance: 0.6,
    countryTypes: ['PROBLEM_RENT'],
    potentialOutcomes: {
      success: { 
        probability: 0.1, 
        effect: { mobility: 1 }, 
        description: 'events.risk.trafficking.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { health: -4, mobility: -5, money: -3, network: -3 }, 
        description: 'events.risk.trafficking.failure' 
      },
      catastrophic: { 
        probability: 0.4, 
        effect: { health: -8, mobility: -8, time: -5 }, 
        description: 'events.risk.trafficking.catastrophic' 
      },
    },
  },
  {
    id: 'fake_documents',
    type: 'country',
    riskType: 'document_fraud',
    label: 'events.risk.fakeDocuments.label',
    description: 'events.risk.fakeDocuments.description',
    icon: '📄',
    effect: { money: -3, mobility: -2 },
    survivalChance: 0.85,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.3, 
        effect: { mobility: 2 }, 
        description: 'events.risk.fakeDocuments.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { money: -4, mobility: -3, network: -2 }, 
        description: 'events.risk.fakeDocuments.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { mobility: -8, money: -5 }, 
        description: 'events.risk.fakeDocuments.catastrophic' 
      },
    },
  },
  {
    id: 'desert_crossing',
    type: 'country',
    riskType: 'illegal_crossing',
    label: 'events.risk.desertCrossing.label',
    description: 'events.risk.desertCrossing.description',
    icon: '🏜️',
    effect: { health: -4, money: -2 },
    survivalChance: 0.65,
    countryTypes: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.35, 
        effect: { mobility: 2 }, 
        description: 'events.risk.desertCrossing.success' 
      },
      failure: { 
        probability: 0.4, 
        effect: { health: -4, money: -3, time: -2 }, 
        description: 'events.risk.desertCrossing.failure' 
      },
      catastrophic: { 
        probability: 0.25, 
        effect: { health: -10 }, 
        description: 'events.risk.desertCrossing.catastrophic' 
      },
    },
  },
  {
    id: 'visa_overstay',
    type: 'country',
    riskType: 'document_fraud',
    label: 'events.risk.visaOverstay.label',
    description: 'events.risk.visaOverstay.description',
    icon: '⏰',
    effect: { mobility: -3, money: -1 },
    survivalChance: 0.9,
    countryTypes: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK'],
    potentialOutcomes: {
      success: { 
        probability: 0.4, 
        effect: { time: 1 }, 
        description: 'events.risk.visaOverstay.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { mobility: -4, money: -2 }, 
        description: 'events.risk.visaOverstay.failure' 
      },
      catastrophic: { 
        probability: 0.1, 
        effect: { mobility: -8, money: -3 }, 
        description: 'events.risk.visaOverstay.catastrophic' 
      },
    },
  },
  {
    id: 'marriage_fraud',
    type: 'country',
    riskType: 'scam',
    label: 'events.risk.marriageFraud.label',
    description: 'events.risk.marriageFraud.description',
    icon: '💍',
    effect: { money: -4, network: -2, health: -1 },
    survivalChance: 0.75,
    countryTypes: ['STABILITY_REDIS', 'GROWTH_RISK'],
    potentialOutcomes: {
      success: { 
        probability: 0.25, 
        effect: { mobility: 3, network: 1 }, 
        description: 'events.risk.marriageFraud.success' 
      },
      failure: { 
        probability: 0.55, 
        effect: { money: -5, network: -3, health: -2 }, 
        description: 'events.risk.marriageFraud.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { mobility: -5, money: -6, network: -4 }, 
        description: 'events.risk.marriageFraud.catastrophic' 
      },
    },
  },
  {
    id: 'border_detention',
    type: 'country',
    riskType: 'illegal_crossing',
    label: 'events.risk.borderDetention.label',
    description: 'events.risk.borderDetention.description',
    icon: '🚔',
    effect: { mobility: -4, time: -3 },
    survivalChance: 0.8,
    countryTypes: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK'],
    potentialOutcomes: {
      success: { 
        probability: 0.3, 
        effect: { time: -1 }, 
        description: 'events.risk.borderDetention.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { mobility: -5, money: -3, time: -4 }, 
        description: 'events.risk.borderDetention.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { mobility: -8, money: -5 }, 
        description: 'events.risk.borderDetention.catastrophic' 
      },
    },
  },
  {
    id: 'organ_trafficking',
    type: 'country',
    riskType: 'trafficking',
    label: 'events.risk.organTrafficking.label',
    description: 'events.risk.organTrafficking.description',
    icon: '🏥',
    effect: { health: -6, money: -4 },
    survivalChance: 0.5,
    countryTypes: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.15, 
        effect: { money: 4 }, 
        description: 'events.risk.organTrafficking.success' 
      },
      failure: { 
        probability: 0.45, 
        effect: { health: -4, money: -3, time: -3 }, 
        description: 'events.risk.organTrafficking.failure' 
      },
      catastrophic: { 
        probability: 0.4, 
        effect: { health: -10, mobility: -5 }, 
        description: 'events.risk.organTrafficking.catastrophic' 
      },
    },
  },
  {
    id: 'investment_scam',
    type: 'country',
    riskType: 'scam',
    label: 'events.risk.investmentScam.label',
    description: 'events.risk.investmentScam.description',
    icon: '📈',
    effect: { money: -5 },
    survivalChance: 0.85,
    countryTypes: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.25, 
        effect: { money: 5 }, 
        description: 'events.risk.investmentScam.success' 
      },
      failure: { 
        probability: 0.6, 
        effect: { money: -6, network: -2 }, 
        description: 'events.risk.investmentScam.failure' 
      },
      catastrophic: { 
        probability: 0.15, 
        effect: { money: -10, network: -4 }, 
        description: 'events.risk.investmentScam.catastrophic' 
      },
    },
  },
  {
    id: 'work_camp',
    type: 'country',
    riskType: 'exploitation',
    label: 'events.risk.workCamp.label',
    description: 'events.risk.workCamp.description',
    icon: '⛏️',
    effect: { health: -4, time: -5, mobility: -3 },
    survivalChance: 0.6,
    countryTypes: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.2, 
        effect: { money: 2 }, 
        description: 'events.risk.workCamp.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { health: -5, time: -6, mobility: -4 }, 
        description: 'events.risk.workCamp.failure' 
      },
      catastrophic: { 
        probability: 0.3, 
        effect: { health: -10, mobility: -8 }, 
        description: 'events.risk.workCamp.catastrophic' 
      },
    },
  },
  {
    id: 'natural_disaster',
    type: 'country',
    riskType: 'natural_disaster',
    label: 'events.risk.naturalDisaster.label',
    description: 'events.risk.naturalDisaster.description',
    icon: '🌊',
    effect: { health: -3, money: -2, mobility: -2 },
    survivalChance: 0.75,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.35, 
        effect: { network: 1 }, 
        description: 'events.risk.naturalDisaster.success' 
      },
      failure: { 
        probability: 0.45, 
        effect: { health: -3, money: -4, mobility: -3 }, 
        description: 'events.risk.naturalDisaster.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -8, money: -5 }, 
        description: 'events.risk.naturalDisaster.catastrophic' 
      },
    },
  },
  // === CLIMATE & NATURAL DISASTER EVENTS ===
  {
    id: 'earthquake',
    type: 'country',
    riskType: 'natural_disaster',
    label: 'events.risk.earthquake.label',
    description: 'events.risk.earthquake.description',
    icon: '🏚️',
    effect: { health: -4, money: -3, mobility: -2 },
    survivalChance: 0.7,
    countryTypes: ['COMPETENCE_TRUST', 'HYBRID_TRANSITION', 'GROWTH_RISK'],
    potentialOutcomes: {
      success: { 
        probability: 0.4, 
        effect: { network: 2 }, 
        description: 'events.risk.earthquake.success' 
      },
      failure: { 
        probability: 0.4, 
        effect: { health: -4, money: -5, mobility: -2 }, 
        description: 'events.risk.earthquake.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -10, money: -8 }, 
        description: 'events.risk.earthquake.catastrophic' 
      },
    },
  },
  {
    id: 'monsoon_flooding',
    type: 'country',
    riskType: 'climate',
    label: 'events.risk.monsoonFlooding.label',
    description: 'events.risk.monsoonFlooding.description',
    icon: '🌧️',
    effect: { health: -2, money: -3, mobility: -3 },
    survivalChance: 0.8,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.5, 
        effect: { network: 1 }, 
        description: 'events.risk.monsoonFlooding.success' 
      },
      failure: { 
        probability: 0.35, 
        effect: { health: -3, money: -4, mobility: -4 }, 
        description: 'events.risk.monsoonFlooding.failure' 
      },
      catastrophic: { 
        probability: 0.15, 
        effect: { health: -6, money: -6, mobility: -5 }, 
        description: 'events.risk.monsoonFlooding.catastrophic' 
      },
    },
  },
  {
    id: 'extreme_heat',
    type: 'country',
    riskType: 'climate',
    label: 'events.risk.extremeHeat.label',
    description: 'events.risk.extremeHeat.description',
    icon: '🔥',
    effect: { health: -3, time: -2 },
    survivalChance: 0.85,
    countryTypes: ['RESOURCE_EXTRACTION', 'PROBLEM_RENT', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.55, 
        effect: { health: 1 }, 
        description: 'events.risk.extremeHeat.success' 
      },
      failure: { 
        probability: 0.35, 
        effect: { health: -4, time: -3, money: -2 }, 
        description: 'events.risk.extremeHeat.failure' 
      },
      catastrophic: { 
        probability: 0.1, 
        effect: { health: -8 }, 
        description: 'events.risk.extremeHeat.catastrophic' 
      },
    },
  },
  {
    id: 'tropical_cyclone',
    type: 'country',
    riskType: 'natural_disaster',
    label: 'events.risk.tropicalCyclone.label',
    description: 'events.risk.tropicalCyclone.description',
    icon: '🌀',
    effect: { health: -3, money: -4, mobility: -3 },
    survivalChance: 0.75,
    countryTypes: ['GROWTH_RISK', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.4, 
        effect: { network: 1 }, 
        description: 'events.risk.tropicalCyclone.success' 
      },
      failure: { 
        probability: 0.4, 
        effect: { health: -4, money: -5, mobility: -4 }, 
        description: 'events.risk.tropicalCyclone.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -8, money: -8, mobility: -5 }, 
        description: 'events.risk.tropicalCyclone.catastrophic' 
      },
    },
  },
  {
    id: 'drought_famine',
    type: 'country',
    riskType: 'climate',
    label: 'events.risk.droughtFamine.label',
    description: 'events.risk.droughtFamine.description',
    icon: '🏜️',
    effect: { health: -3, money: -2 },
    survivalChance: 0.7,
    countryTypes: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.35, 
        effect: { network: 1, skills: 1 }, 
        description: 'events.risk.droughtFamine.success' 
      },
      failure: { 
        probability: 0.45, 
        effect: { health: -4, money: -4, time: -2 }, 
        description: 'events.risk.droughtFamine.failure' 
      },
      catastrophic: { 
        probability: 0.2, 
        effect: { health: -8, money: -5 }, 
        description: 'events.risk.droughtFamine.catastrophic' 
      },
    },
  },
  {
    id: 'volcanic_eruption',
    type: 'country',
    riskType: 'natural_disaster',
    label: 'events.risk.volcanicEruption.label',
    description: 'events.risk.volcanicEruption.description',
    icon: '🌋',
    effect: { health: -4, mobility: -4 },
    survivalChance: 0.65,
    countryTypes: ['HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.3, 
        effect: { network: 2 }, 
        description: 'events.risk.volcanicEruption.success' 
      },
      failure: { 
        probability: 0.45, 
        effect: { health: -5, mobility: -5, money: -4 }, 
        description: 'events.risk.volcanicEruption.failure' 
      },
      catastrophic: { 
        probability: 0.25, 
        effect: { health: -10, mobility: -8 }, 
        description: 'events.risk.volcanicEruption.catastrophic' 
      },
    },
  },
  {
    id: 'wildfire',
    type: 'country',
    riskType: 'climate',
    label: 'events.risk.wildfire.label',
    description: 'events.risk.wildfire.description',
    icon: '🔥',
    effect: { health: -2, money: -3 },
    survivalChance: 0.8,
    countryTypes: ['GROWTH_RISK', 'STABILITY_REDIS', 'COMPETENCE_TRUST'],
    potentialOutcomes: {
      success: { 
        probability: 0.5, 
        effect: { network: 1 }, 
        description: 'events.risk.wildfire.success' 
      },
      failure: { 
        probability: 0.35, 
        effect: { health: -3, money: -5, mobility: -2 }, 
        description: 'events.risk.wildfire.failure' 
      },
      catastrophic: { 
        probability: 0.15, 
        effect: { health: -6, money: -8 }, 
        description: 'events.risk.wildfire.catastrophic' 
      },
    },
  },
  // === POLITICAL & SOCIAL RISK EVENTS ===
  {
    id: 'civil_unrest',
    type: 'country',
    riskType: 'political',
    label: 'events.risk.civilUnrest.label',
    description: 'events.risk.civilUnrest.description',
    icon: '🔥',
    effect: { health: -2, mobility: -3, network: -1 },
    survivalChance: 0.75,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    potentialOutcomes: {
      success: { 
        probability: 0.4, 
        effect: { network: 2 }, 
        description: 'events.risk.civilUnrest.success' 
      },
      failure: { 
        probability: 0.45, 
        effect: { health: -3, mobility: -4, money: -2 }, 
        description: 'events.risk.civilUnrest.failure' 
      },
      catastrophic: { 
        probability: 0.15, 
        effect: { health: -6, mobility: -6 }, 
        description: 'events.risk.civilUnrest.catastrophic' 
      },
    },
  },
  {
    id: 'arbitrary_detention',
    type: 'country',
    riskType: 'political',
    label: 'events.risk.arbitraryDetention.label',
    description: 'events.risk.arbitraryDetention.description',
    icon: '🔒',
    effect: { mobility: -5, time: -4, network: -2 },
    survivalChance: 0.6,
    countryTypes: ['HYBRID_TRANSITION', 'PROBLEM_RENT'],
    potentialOutcomes: {
      success: { 
        probability: 0.25, 
        effect: { time: -1 }, 
        description: 'events.risk.arbitraryDetention.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { mobility: -6, time: -5, network: -3, money: -3 }, 
        description: 'events.risk.arbitraryDetention.failure' 
      },
      catastrophic: { 
        probability: 0.25, 
        effect: { health: -5, mobility: -10, time: -8 }, 
        description: 'events.risk.arbitraryDetention.catastrophic' 
      },
    },
  },
  {
    id: 'currency_crisis',
    type: 'country',
    riskType: 'scam',
    label: 'events.risk.currencyCrisis.label',
    description: 'events.risk.currencyCrisis.description',
    icon: '💸',
    effect: { money: -4 },
    survivalChance: 0.8,
    countryTypes: ['PROBLEM_RENT', 'HYBRID_TRANSITION', 'RESOURCE_EXTRACTION'],
    potentialOutcomes: {
      success: { 
        probability: 0.35, 
        effect: { money: 2, skills: 1 }, 
        description: 'events.risk.currencyCrisis.success' 
      },
      failure: { 
        probability: 0.5, 
        effect: { money: -6 }, 
        description: 'events.risk.currencyCrisis.failure' 
      },
      catastrophic: { 
        probability: 0.15, 
        effect: { money: -10 }, 
        description: 'events.risk.currencyCrisis.catastrophic' 
      },
    },
  },
];

// Get random risk event for shortcuts
export function getRandomRiskEvent(countryType: PyramidType): RiskEvent | null {
  const validEvents = RISK_EVENTS.filter(e => 
    !e.countryTypes || e.countryTypes.includes(countryType)
  );
  if (validEvents.length === 0) return null;
  return validEvents[Math.floor(Math.random() * validEvents.length)];
}

// Resolve risk event outcome
export function resolveRiskEvent(event: RiskEvent): {
  outcome: 'success' | 'failure' | 'catastrophic';
  effect: Partial<GameResources>;
  description: string;
} {
  const roll = Math.random();
  const { potentialOutcomes } = event;
  
  if (roll < potentialOutcomes.success.probability) {
    return { outcome: 'success', ...potentialOutcomes.success };
  }
  
  if (potentialOutcomes.catastrophic && 
      roll > (1 - potentialOutcomes.catastrophic.probability)) {
    return { outcome: 'catastrophic', ...potentialOutcomes.catastrophic };
  }
  
  return { outcome: 'failure', ...potentialOutcomes.failure };
}

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
