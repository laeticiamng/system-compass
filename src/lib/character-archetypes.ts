import { CharacterCard, GameResources, CharacterTrait, CharacterAspiration, POSITIVE_TRAITS, NEGATIVE_TRAITS, ASPIRATIONS } from './game-data';
import { PyramidType } from './types';

// Helper to find traits/aspirations by ID
const findTrait = (id: string, list: CharacterTrait[]): CharacterTrait => 
  list.find(t => t.id === id) || list[0];

const findAspiration = (id: string): CharacterAspiration => 
  ASPIRATIONS.find(a => a.id === id) || ASPIRATIONS[0];

// ============== PREDEFINED CHARACTER ARCHETYPES ==============
// These represent real social archetypes that players can choose or get assigned

export interface CharacterArchetype extends Omit<CharacterCard, 'id'> {
  archetypeId: string;
  archetypeLabel: string;
  archetypeDescription: string;
  archetypeIcon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  realWorldExample: string;
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  // ========== PRIVILEGED START ==========
  {
    archetypeId: 'silver_spoon',
    archetypeLabel: 'archetypes.silverSpoon.label',
    archetypeDescription: 'archetypes.silverSpoon.description',
    archetypeIcon: '👑',
    difficulty: 'easy',
    realWorldExample: 'archetypes.silverSpoon.example',
    name: 'Alexandre Dumont',
    birthCountry: 'france',
    traits: [
      findTrait('wealthy_family', POSITIVE_TRAITS),
      findTrait('well_connected', POSITIVE_TRAITS),
    ],
    constraint: findTrait('impulsive', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('empire_builder'), scoreMultiplier: 2 },
      { ...findAspiration('influencer'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('balanced_life'), scoreMultiplier: 1 },
    startingResources: {
      time: 6,
      money: 8,
      health: 7,
      network: 7,
      skills: 4,
      mobility: 8,
      family: 7, // Supportive wealthy family
    },
  },
  
  {
    archetypeId: 'tech_bro',
    archetypeLabel: 'archetypes.techBro.label',
    archetypeDescription: 'archetypes.techBro.description',
    archetypeIcon: '💻',
    difficulty: 'easy',
    realWorldExample: 'archetypes.techBro.example',
    name: 'Kevin Chen',
    birthCountry: 'usa',
    traits: [
      findTrait('quick_learner', POSITIVE_TRAITS),
      findTrait('efficient', POSITIVE_TRAITS),
    ],
    constraint: findTrait('socially_awkward', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
      { ...findAspiration('master_craftsman'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('world_explorer'), scoreMultiplier: 1 },
    startingResources: {
      time: 4,
      money: 5,
      health: 6,
      network: 3,
      skills: 7,
      mobility: 7,
      family: 3, // Distant from family, focused on work
    },
  },

  // ========== MIDDLE CLASS ==========
  {
    archetypeId: 'suburban_dreamer',
    archetypeLabel: 'archetypes.suburbanDreamer.label',
    archetypeDescription: 'archetypes.suburbanDreamer.description',
    archetypeIcon: '🏡',
    difficulty: 'medium',
    realWorldExample: 'archetypes.suburbanDreamer.example',
    name: 'Marie Lefebvre',
    birthCountry: 'france',
    traits: [
      findTrait('resilient', POSITIVE_TRAITS),
      findTrait('efficient', POSITIVE_TRAITS),
    ],
    constraint: findTrait('burned_out', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('stability_seeker'), scoreMultiplier: 2 },
      { ...findAspiration('balanced_life'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('financial_freedom'), scoreMultiplier: 1 },
    startingResources: {
      time: 3,
      money: 4,
      health: 5,
      network: 4,
      skills: 5,
      mobility: 5,
      family: 8, // Married with kids, limits mobility
    },
  },

  {
    archetypeId: 'ambitious_graduate',
    archetypeLabel: 'archetypes.ambitiousGraduate.label',
    archetypeDescription: 'archetypes.ambitiousGraduate.description',
    archetypeIcon: '🎓',
    difficulty: 'medium',
    realWorldExample: 'archetypes.ambitiousGraduate.example',
    name: 'Lucas Martin',
    birthCountry: 'germany',
    traits: [
      findTrait('quick_learner', POSITIVE_TRAITS),
      findTrait('charismatic', POSITIVE_TRAITS),
    ],
    constraint: findTrait('poor_background', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('master_craftsman'), scoreMultiplier: 2 },
      { ...findAspiration('social_climber'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('world_explorer'), scoreMultiplier: 1 },
    startingResources: {
      time: 5,
      money: 2,
      health: 7,
      network: 4,
      skills: 6,
      mobility: 5,
      family: 4, // Supportive but modest family
    },
  },

  // ========== HARD MODE ==========
  {
    archetypeId: 'economic_migrant',
    archetypeLabel: 'archetypes.economicMigrant.label',
    archetypeDescription: 'archetypes.economicMigrant.description',
    archetypeIcon: '🧳',
    difficulty: 'hard',
    realWorldExample: 'archetypes.economicMigrant.example',
    name: 'Amadou Diallo',
    birthCountry: 'senegal',
    traits: [
      findTrait('resilient', POSITIVE_TRAITS),
      findTrait('street_smart', POSITIVE_TRAITS),
    ],
    constraint: findTrait('visa_restricted', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
      { ...findAspiration('stability_seeker'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('world_explorer'), scoreMultiplier: 1 },
    startingResources: {
      time: 6,
      money: 1,
      health: 8,
      network: 3,
      skills: 4,
      mobility: 1,
      family: 6, // Family back home to support
    },
  },

  {
    archetypeId: 'war_refugee',
    archetypeLabel: 'archetypes.warRefugee.label',
    archetypeDescription: 'archetypes.warRefugee.description',
    archetypeIcon: '🏚️',
    difficulty: 'extreme',
    realWorldExample: 'archetypes.warRefugee.example',
    name: 'Fatima Al-Hassan',
    birthCountry: 'syria',
    traits: [
      findTrait('resilient', POSITIVE_TRAITS),
      findTrait('quick_learner', POSITIVE_TRAITS),
    ],
    constraint: findTrait('visa_restricted', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('stability_seeker'), scoreMultiplier: 2 },
      { ...findAspiration('balanced_life'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('master_craftsman'), scoreMultiplier: 1 },
    startingResources: {
      time: 5,
      money: 0,
      health: 4,
      network: 1,
      skills: 3,
      mobility: 0,
      family: 3, // Family lost or scattered
    },
  },

  {
    archetypeId: 'self_made',
    archetypeLabel: 'archetypes.selfMade.label',
    archetypeDescription: 'archetypes.selfMade.description',
    archetypeIcon: '💪',
    difficulty: 'hard',
    realWorldExample: 'archetypes.selfMade.example',
    name: 'Carlos Rodriguez',
    birthCountry: 'mexico',
    traits: [
      findTrait('street_smart', POSITIVE_TRAITS),
      findTrait('charismatic', POSITIVE_TRAITS),
    ],
    constraint: findTrait('poor_background', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('empire_builder'), scoreMultiplier: 2 },
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('influencer'), scoreMultiplier: 1 },
    startingResources: {
      time: 6,
      money: 1,
      health: 7,
      network: 4,
      skills: 3,
      mobility: 3,
      family: 5, // Supportive but demanding family
    },
  },

  // ========== SPECIAL CASES ==========
  {
    archetypeId: 'digital_nomad',
    archetypeLabel: 'archetypes.digitalNomad.label',
    archetypeDescription: 'archetypes.digitalNomad.description',
    archetypeIcon: '🌍',
    difficulty: 'medium',
    realWorldExample: 'archetypes.digitalNomad.example',
    name: 'Emma Thompson',
    birthCountry: 'uk',
    traits: [
      findTrait('dual_citizenship', POSITIVE_TRAITS),
      findTrait('quick_learner', POSITIVE_TRAITS),
    ],
    constraint: findTrait('impulsive', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('world_explorer'), scoreMultiplier: 2 },
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('balanced_life'), scoreMultiplier: 1 },
    startingResources: {
      time: 5,
      money: 4,
      health: 6,
      network: 5,
      skills: 6,
      mobility: 8,
      family: 2, // Solo, no family ties
    },
  },

  {
    archetypeId: 'oligarch_heir',
    archetypeLabel: 'archetypes.oligarchHeir.label',
    archetypeDescription: 'archetypes.oligarchHeir.description',
    archetypeIcon: '🏰',
    difficulty: 'easy',
    realWorldExample: 'archetypes.oligarchHeir.example',
    name: 'Dmitri Volkov',
    birthCountry: 'russia',
    traits: [
      findTrait('wealthy_family', POSITIVE_TRAITS),
      findTrait('well_connected', POSITIVE_TRAITS),
    ],
    constraint: findTrait('visa_restricted', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('empire_builder'), scoreMultiplier: 2 },
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('influencer'), scoreMultiplier: 1 },
    startingResources: {
      time: 7,
      money: 10,
      health: 6,
      network: 8,
      skills: 4,
      mobility: 3,
      family: 6, // Complex family politics
    },
  },

  {
    archetypeId: 'state_dependent',
    archetypeLabel: 'archetypes.stateDependent.label',
    archetypeDescription: 'archetypes.stateDependent.description',
    archetypeIcon: '🏥',
    difficulty: 'hard',
    realWorldExample: 'archetypes.stateDependent.example',
    name: 'Jean-Pierre Dubois',
    birthCountry: 'france',
    traits: [
      findTrait('resilient', POSITIVE_TRAITS),
      findTrait('charismatic', POSITIVE_TRAITS),
    ],
    constraint: findTrait('chronic_illness', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('stability_seeker'), scoreMultiplier: 2 },
      { ...findAspiration('balanced_life'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('master_craftsman'), scoreMultiplier: 1 },
    startingResources: {
      time: 3,
      money: 3,
      health: 2,
      network: 5,
      skills: 5,
      mobility: 2,
      family: 7, // Relies on family support
    },
  },

  {
    archetypeId: 'expat_executive',
    archetypeLabel: 'archetypes.expatExecutive.label',
    archetypeDescription: 'archetypes.expatExecutive.description',
    archetypeIcon: '✈️',
    difficulty: 'easy',
    realWorldExample: 'archetypes.expatExecutive.example',
    name: 'James Mitchell',
    birthCountry: 'uk',
    traits: [
      findTrait('well_connected', POSITIVE_TRAITS),
      findTrait('efficient', POSITIVE_TRAITS),
    ],
    constraint: findTrait('burned_out', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('empire_builder'), scoreMultiplier: 2 },
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('world_explorer'), scoreMultiplier: 1 },
    startingResources: {
      time: 3,
      money: 7,
      health: 4,
      network: 8,
      skills: 7,
      mobility: 9,
      family: 4, // Family left behind in home country
    },
  },

  {
    archetypeId: 'underground_hustler',
    archetypeLabel: 'archetypes.undergroundHustler.label',
    archetypeDescription: 'archetypes.undergroundHustler.description',
    archetypeIcon: '🎰',
    difficulty: 'extreme',
    realWorldExample: 'archetypes.undergroundHustler.example',
    name: 'Moussa Traoré',
    birthCountry: 'cameroon',
    traits: [
      findTrait('street_smart', POSITIVE_TRAITS),
      findTrait('charismatic', POSITIVE_TRAITS),
    ],
    constraint: findTrait('visa_restricted', NEGATIVE_TRAITS),
    majorAspirations: [
      { ...findAspiration('financial_freedom'), scoreMultiplier: 2 },
      { ...findAspiration('influencer'), scoreMultiplier: 2 },
    ],
    minorAspiration: { ...findAspiration('world_explorer'), scoreMultiplier: 1 },
    startingResources: {
      time: 7,
      money: 2,
      health: 7,
      network: 6,
      skills: 2,
      mobility: 1,
      family: 4, // Street family, informal ties
    },
  },
];

// Get archetype by ID
export function getArchetypeById(id: string): CharacterArchetype | undefined {
  return CHARACTER_ARCHETYPES.find(a => a.archetypeId === id);
}

// Get archetypes by difficulty
export function getArchetypesByDifficulty(difficulty: CharacterArchetype['difficulty']): CharacterArchetype[] {
  return CHARACTER_ARCHETYPES.filter(a => a.difficulty === difficulty);
}

// Convert archetype to CharacterCard
export function archetypeToCharacterCard(archetype: CharacterArchetype, id: string): CharacterCard {
  return {
    id,
    name: archetype.name,
    birthCountry: archetype.birthCountry,
    traits: archetype.traits,
    constraint: archetype.constraint,
    majorAspirations: archetype.majorAspirations,
    minorAspiration: archetype.minorAspiration,
    startingResources: { ...archetype.startingResources },
  };
}

// Get difficulty color
export function getDifficultyColor(difficulty: CharacterArchetype['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'hard': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'extreme': return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  }
}
