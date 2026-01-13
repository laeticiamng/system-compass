import { PyramidType } from './types';
import { GameResources, GameEvent, ResourceType } from './game-data';

// Re-export EventChoice for external use
export interface EventChoice {
  id: string;
  label: string;
  description: string;
  icon: string;
  effect: Partial<GameResources>;
  riskChance?: number;
  riskEffect?: Partial<GameResources>;
  requiresRoll?: boolean;
  minRoll?: number;
}

export interface GameEventWithChoices extends GameEvent {
  choices?: EventChoice[];
  noChoiceEffect?: Partial<GameResources>;
}

export const GLOBAL_EVENTS_WITH_CHOICES: GameEventWithChoices[] = [
  {
    id: 'tech_boom',
    type: 'global',
    label: 'events.global.techBoom.label',
    description: 'events.global.techBoom.descriptionChoice',
    icon: '🚀',
    effect: { skills: 1 },
    pyramidEffect: { GROWTH_RISK: 2 },
    choices: [
      {
        id: 'invest_heavily',
        label: 'events.choices.investHeavily',
        description: 'events.choices.investHeavilyDesc',
        icon: '📈',
        effect: { money: 3, skills: 2 },
        riskChance: 0.3,
        riskEffect: { money: -3 },
      },
      {
        id: 'invest_cautiously',
        label: 'events.choices.investCautiously',
        description: 'events.choices.investCautiouslyDesc',
        icon: '🛡️',
        effect: { money: 1, skills: 1 },
      },
      {
        id: 'retrain',
        label: 'events.choices.retrain',
        description: 'events.choices.retrainDesc',
        icon: '📚',
        effect: { skills: 3, time: -2 },
      },
    ],
    noChoiceEffect: { skills: -1 },
  },
  {
    id: 'economic_crisis',
    type: 'global',
    label: 'events.global.economicCrisis.label',
    description: 'events.global.economicCrisis.descriptionChoice',
    icon: '📉',
    effect: { money: -2 },
    pyramidEffect: { STABILITY_REDIS: -1, PROBLEM_RENT: 1 },
    choices: [
      {
        id: 'cut_expenses',
        label: 'events.choices.cutExpenses',
        description: 'events.choices.cutExpensesDesc',
        icon: '✂️',
        effect: { money: 0, health: -1 },
      },
      {
        id: 'find_opportunities',
        label: 'events.choices.findOpportunities',
        description: 'events.choices.findOpportunitiesDesc',
        icon: '🔍',
        effect: { money: 2, network: 1 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { money: -3, time: -1 },
      },
      {
        id: 'ask_help',
        label: 'events.choices.askHelp',
        description: 'events.choices.askHelpDesc',
        icon: '🤝',
        effect: { money: 1, network: -1 },
      },
    ],
    noChoiceEffect: { money: -3 },
  },
  {
    id: 'pandemic',
    type: 'global',
    label: 'events.global.pandemic.label',
    description: 'events.global.pandemic.descriptionChoice',
    icon: '🦠',
    effect: { health: -2, mobility: -2 },
    choices: [
      {
        id: 'isolate_strictly',
        label: 'events.choices.isolateStrictly',
        description: 'events.choices.isolateStrictlyDesc',
        icon: '🏠',
        effect: { health: 1, network: -2, mobility: -1 },
      },
      {
        id: 'balance_risks',
        label: 'events.choices.balanceRisks',
        description: 'events.choices.balanceRisksDesc',
        icon: '⚖️',
        effect: { health: -1, network: 0 },
        requiresRoll: true,
        minRoll: 3,
        riskEffect: { health: -3 },
      },
      {
        id: 'opportunity_crisis',
        label: 'events.choices.opportunityCrisis',
        description: 'events.choices.opportunityCrisisDesc',
        icon: '💡',
        effect: { money: 3, skills: 1 },
        requiresRoll: true,
        minRoll: 5,
        riskEffect: { health: -2, money: -2 },
      },
    ],
    noChoiceEffect: { health: -3, mobility: -2 },
  },
  {
    id: 'new_trade_deal',
    type: 'global',
    label: 'events.global.newTradeDeal.label',
    description: 'events.global.newTradeDeal.descriptionChoice',
    icon: '🤝',
    effect: { mobility: 1 },
    choices: [
      {
        id: 'export_business',
        label: 'events.choices.exportBusiness',
        description: 'events.choices.exportBusinessDesc',
        icon: '📦',
        effect: { money: 3, network: 1 },
        riskChance: 0.25,
        riskEffect: { money: -2 },
      },
      {
        id: 'study_market',
        label: 'events.choices.studyMarket',
        description: 'events.choices.studyMarketDesc',
        icon: '📊',
        effect: { skills: 2, time: -1 },
      },
      {
        id: 'relocate_opportunity',
        label: 'events.choices.relocateOpportunity',
        description: 'events.choices.relocateOpportunityDesc',
        icon: '✈️',
        effect: { mobility: 2, network: -1 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { money: -3, mobility: -1 },
      },
    ],
  },
  {
    id: 'climate_event',
    type: 'global',
    label: 'events.global.climateEvent.label',
    description: 'events.global.climateEvent.descriptionChoice',
    icon: '🌊',
    effect: { health: -1 },
    choices: [
      {
        id: 'volunteer_help',
        label: 'events.choices.volunteerHelp',
        description: 'events.choices.volunteerHelpDesc',
        icon: '🦸',
        effect: { network: 2, health: -1, time: -2 },
      },
      {
        id: 'protect_assets',
        label: 'events.choices.protectAssets',
        description: 'events.choices.protectAssetsDesc',
        icon: '🏦',
        effect: { money: -1 },
      },
      {
        id: 'invest_green',
        label: 'events.choices.investGreen',
        description: 'events.choices.investGreenDesc',
        icon: '🌱',
        effect: { money: 2, skills: 1 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { money: -2 },
      },
    ],
    noChoiceEffect: { health: -2, money: -1 },
  },
];

// ============== COUNTRY-SPECIFIC EVENTS WITH CHOICES ==============

export const COUNTRY_EVENTS_WITH_CHOICES: GameEventWithChoices[] = [
  // STABILITY_REDIS events
  {
    id: 'bureaucracy_challenge',
    type: 'country',
    label: 'events.country.bureaucracyChallenge.label',
    description: 'events.country.bureaucracyChallenge.descriptionChoice',
    icon: '📋',
    effect: { time: -2 },
    countryTypes: ['STABILITY_REDIS'],
    choices: [
      {
        id: 'follow_procedure',
        label: 'events.choices.followProcedure',
        description: 'events.choices.followProcedureDesc',
        icon: '📝',
        effect: { time: -3 },
      },
      {
        id: 'use_connections',
        label: 'events.choices.useConnections',
        description: 'events.choices.useConnectionsDesc',
        icon: '🤝',
        effect: { time: -1, network: -1 },
      },
      {
        id: 'hire_specialist',
        label: 'events.choices.hireSpecialist',
        description: 'events.choices.hireSpecialistDesc',
        icon: '👔',
        effect: { money: -2, time: 0 },
      },
    ],
    noChoiceEffect: { time: -4, money: -1 },
  },
  // GROWTH_RISK events
  {
    id: 'startup_opportunity',
    type: 'country',
    label: 'events.country.startupOpportunity.label',
    description: 'events.country.startupOpportunity.descriptionChoice',
    icon: '🚀',
    effect: { money: 1 },
    countryTypes: ['GROWTH_RISK'],
    choices: [
      {
        id: 'join_startup',
        label: 'events.choices.joinStartup',
        description: 'events.choices.joinStartupDesc',
        icon: '🎯',
        effect: { money: 4, skills: 2 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { money: -2, time: -2 },
      },
      {
        id: 'invest_angel',
        label: 'events.choices.investAngel',
        description: 'events.choices.investAngelDesc',
        icon: '💰',
        effect: { money: 5, network: 1 },
        requiresRoll: true,
        minRoll: 5,
        riskEffect: { money: -4 },
      },
      {
        id: 'observe_learn',
        label: 'events.choices.observeLearn',
        description: 'events.choices.observeLearnDesc',
        icon: '👀',
        effect: { skills: 2, network: 1 },
      },
    ],
  },
  // PROBLEM_RENT events
  {
    id: 'local_patronage',
    type: 'country',
    label: 'events.country.localPatronage.label',
    description: 'events.country.localPatronage.descriptionChoice',
    icon: '🎭',
    effect: { network: 1 },
    countryTypes: ['PROBLEM_RENT'],
    choices: [
      {
        id: 'accept_patron',
        label: 'events.choices.acceptPatron',
        description: 'events.choices.acceptPatronDesc',
        icon: '🤝',
        effect: { money: 2, network: 2, health: -1 },
      },
      {
        id: 'refuse_politely',
        label: 'events.choices.refusePolitely',
        description: 'events.choices.refusePolitelyDesc',
        icon: '🙅',
        effect: { network: -1 },
        requiresRoll: true,
        minRoll: 3,
        riskEffect: { network: -3, money: -2 },
      },
      {
        id: 'seek_alternative',
        label: 'events.choices.seekAlternative',
        description: 'events.choices.seekAlternativeDesc',
        icon: '🔄',
        effect: { time: -2, network: 1 },
      },
    ],
    noChoiceEffect: { network: -2 },
  },
  // COMPETENCE_TRUST events
  {
    id: 'professional_recognition',
    type: 'country',
    label: 'events.country.professionalRecognition.label',
    description: 'events.country.professionalRecognition.descriptionChoice',
    icon: '🏆',
    effect: { skills: 1 },
    countryTypes: ['COMPETENCE_TRUST'],
    choices: [
      {
        id: 'pursue_certification',
        label: 'events.choices.pursueCertification',
        description: 'events.choices.pursueCertificationDesc',
        icon: '📜',
        effect: { skills: 3, money: 2 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { time: -3, money: -2 },
      },
      {
        id: 'build_portfolio',
        label: 'events.choices.buildPortfolio',
        description: 'events.choices.buildPortfolioDesc',
        icon: '💼',
        effect: { skills: 2, network: 1, time: -2 },
      },
      {
        id: 'quick_win',
        label: 'events.choices.quickWin',
        description: 'events.choices.quickWinDesc',
        icon: '⚡',
        effect: { money: 2 },
      },
    ],
  },
  // HYBRID_TRANSITION events
  {
    id: 'dual_system_navigation',
    type: 'country',
    label: 'events.country.dualSystemNavigation.label',
    description: 'events.country.dualSystemNavigation.descriptionChoice',
    icon: '🔀',
    effect: {},
    countryTypes: ['HYBRID_TRANSITION'],
    choices: [
      {
        id: 'formal_path',
        label: 'events.choices.formalPath',
        description: 'events.choices.formalPathDesc',
        icon: '📋',
        effect: { time: -2, money: -1 },
      },
      {
        id: 'informal_path',
        label: 'events.choices.informalPath',
        description: 'events.choices.informalPathDesc',
        icon: '🌀',
        effect: { network: -1 },
        requiresRoll: true,
        minRoll: 3,
        riskEffect: { money: -3, health: -1 },
      },
      {
        id: 'hybrid_approach',
        label: 'events.choices.hybridApproach',
        description: 'events.choices.hybridApproachDesc',
        icon: '🎯',
        effect: { skills: 1, network: 1, time: -1, money: -1 },
      },
    ],
    noChoiceEffect: { time: -3 },
  },
  // RESOURCE_EXTRACTION events
  {
    id: 'resource_boom',
    type: 'country',
    label: 'events.country.resourceBoom.label',
    description: 'events.country.resourceBoom.descriptionChoice',
    icon: '⛏️',
    effect: { money: 1 },
    countryTypes: ['RESOURCE_EXTRACTION'],
    choices: [
      {
        id: 'invest_sector',
        label: 'events.choices.investSector',
        description: 'events.choices.investSectorDesc',
        icon: '💎',
        effect: { money: 5 },
        requiresRoll: true,
        minRoll: 4,
        riskEffect: { money: -4, health: -1 },
      },
      {
        id: 'service_providers',
        label: 'events.choices.serviceProviders',
        description: 'events.choices.serviceProvidersDesc',
        icon: '🔧',
        effect: { money: 2, network: 1 },
      },
      {
        id: 'stay_diversified',
        label: 'events.choices.stayDiversified',
        description: 'events.choices.stayDiversifiedDesc',
        icon: '📊',
        effect: { skills: 1 },
      },
    ],
  },
];

// Helper function to get a random global event with choices
export function getRandomGlobalEventWithChoices(): GameEventWithChoices {
  const index = Math.floor(Math.random() * GLOBAL_EVENTS_WITH_CHOICES.length);
  return GLOBAL_EVENTS_WITH_CHOICES[index];
}

// Helper function to get a country event with choices for a specific pyramid type
export function getRandomCountryEventWithChoices(countryType: PyramidType): GameEventWithChoices | null {
  const relevantEvents = COUNTRY_EVENTS_WITH_CHOICES.filter(
    event => !event.countryTypes || event.countryTypes.includes(countryType)
  );
  
  if (relevantEvents.length === 0) return null;
  
  const index = Math.floor(Math.random() * relevantEvents.length);
  return relevantEvents[index];
}
