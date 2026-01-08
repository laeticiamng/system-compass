import { GameResources } from './game-data';
import { PyramidType } from './types';

// ============== FAMILY STATUS ==============
export type FamilyStatus = 
  | 'single'           // Célibataire sans charge
  | 'in_relationship'  // En couple sans enfants
  | 'married'          // Marié(e) sans enfants
  | 'parent_young'     // Parent d'enfants < 6 ans
  | 'parent_school'    // Parent d'enfants scolarisés (6-18)
  | 'parent_adult'     // Parent d'enfants adultes
  | 'caregiver'        // Aidant d'un parent/proche
  | 'sandwich'         // Entre enfants et parents à charge
  | 'diaspora';        // Famille au pays à soutenir

export interface FamilyConstraint {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: FamilyStatus[];
  mobilityPenalty: number;      // 0-5 pénalité sur mobilité
  timeCost: number;             // 0-3 temps pris par la famille
  moneyCost: number;            // 0-3 argent requis par la famille
  stabilityBonus: number;       // 0-3 bonus santé/moral
  networkBonus: number;         // 0-2 bonus réseau familial
}

export const FAMILY_CONSTRAINTS: FamilyConstraint[] = [
  {
    id: 'young_children',
    label: 'familyConstraints.youngChildren.label',
    description: 'familyConstraints.youngChildren.description',
    icon: '👶',
    status: ['parent_young'],
    mobilityPenalty: 4,
    timeCost: 3,
    moneyCost: 2,
    stabilityBonus: 2,
    networkBonus: 0,
  },
  {
    id: 'school_children',
    label: 'familyConstraints.schoolChildren.label',
    description: 'familyConstraints.schoolChildren.description',
    icon: '🎒',
    status: ['parent_school'],
    mobilityPenalty: 5,  // Très difficile de déménager avec enfants scolarisés
    timeCost: 2,
    moneyCost: 2,
    stabilityBonus: 2,
    networkBonus: 1,
  },
  {
    id: 'sick_parent',
    label: 'familyConstraints.sickParent.label',
    description: 'familyConstraints.sickParent.description',
    icon: '🏥',
    status: ['caregiver'],
    mobilityPenalty: 4,
    timeCost: 3,
    moneyCost: 1,
    stabilityBonus: 0,
    networkBonus: 0,
  },
  {
    id: 'family_abroad',
    label: 'familyConstraints.familyAbroad.label',
    description: 'familyConstraints.familyAbroad.description',
    icon: '🌍',
    status: ['diaspora'],
    mobilityPenalty: 1,  // Peut bouger mais pression financière
    timeCost: 0,
    moneyCost: 3,        // Doit envoyer de l'argent
    stabilityBonus: 0,
    networkBonus: 1,
  },
  {
    id: 'spouse_career',
    label: 'familyConstraints.spouseCareer.label',
    description: 'familyConstraints.spouseCareer.description',
    icon: '💼',
    status: ['married', 'in_relationship'],
    mobilityPenalty: 3,  // Le conjoint a sa carrière aussi
    timeCost: 1,
    moneyCost: 0,
    stabilityBonus: 2,
    networkBonus: 2,
  },
  {
    id: 'disabled_sibling',
    label: 'familyConstraints.disabledSibling.label',
    description: 'familyConstraints.disabledSibling.description',
    icon: '♿',
    status: ['caregiver'],
    mobilityPenalty: 4,
    timeCost: 2,
    moneyCost: 2,
    stabilityBonus: 0,
    networkBonus: 0,
  },
  {
    id: 'sandwich_generation',
    label: 'familyConstraints.sandwichGeneration.label',
    description: 'familyConstraints.sandwichGeneration.description',
    icon: '🥪',
    status: ['sandwich'],
    mobilityPenalty: 5,
    timeCost: 3,
    moneyCost: 3,
    stabilityBonus: 1,
    networkBonus: 1,
  },
];

// ============== FAMILY RESPONSIBILITIES ==============
export interface FamilyResponsibility {
  id: string;
  label: string;
  description: string;
  icon: string;
  type: 'recurring' | 'one_time';
  frequency?: 'monthly' | 'yearly';  // For recurring
  costs: Partial<GameResources>;
  benefits: Partial<GameResources>;
  requiredForStatus: FamilyStatus[];
}

export const FAMILY_RESPONSIBILITIES: FamilyResponsibility[] = [
  {
    id: 'remittance',
    label: 'familyResponsibilities.remittance.label',
    description: 'familyResponsibilities.remittance.description',
    icon: '💸',
    type: 'recurring',
    frequency: 'monthly',
    costs: { money: 2 },
    benefits: { family: 1 },
    requiredForStatus: ['diaspora'],
  },
  {
    id: 'child_education',
    label: 'familyResponsibilities.childEducation.label',
    description: 'familyResponsibilities.childEducation.description',
    icon: '📚',
    type: 'recurring',
    frequency: 'yearly',
    costs: { money: 3, time: 1 },
    benefits: { family: 1 },
    requiredForStatus: ['parent_school'],
  },
  {
    id: 'elderly_care',
    label: 'familyResponsibilities.elderlyCare.label',
    description: 'familyResponsibilities.elderlyCare.description',
    icon: '👴',
    type: 'recurring',
    frequency: 'monthly',
    costs: { time: 2, money: 1 },
    benefits: { family: 1 },
    requiredForStatus: ['caregiver', 'sandwich'],
  },
  {
    id: 'childcare',
    label: 'familyResponsibilities.childcare.label',
    description: 'familyResponsibilities.childcare.description',
    icon: '👶',
    type: 'recurring',
    frequency: 'monthly',
    costs: { time: 3, money: 2 },
    benefits: { family: 2, health: 1 },
    requiredForStatus: ['parent_young'],
  },
  {
    id: 'spouse_support',
    label: 'familyResponsibilities.spouseSupport.label',
    description: 'familyResponsibilities.spouseSupport.description',
    icon: '💑',
    type: 'recurring',
    frequency: 'monthly',
    costs: { time: 1 },
    benefits: { family: 1, health: 1, network: 1 },
    requiredForStatus: ['married', 'in_relationship'],
  },
];

// ============== FAMILY LIFE EVENTS ==============
export interface FamilyEvent {
  id: string;
  label: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: Partial<GameResources>;
  newStatus?: FamilyStatus;       // Status change if applicable
  probability: number;            // 0-1 chance per turn
  triggerStatus: FamilyStatus[];  // Which statuses can trigger this
  choices?: FamilyEventChoice[];  // Player choices if any
}

export interface FamilyEventChoice {
  id: string;
  label: string;
  description: string;
  effect: Partial<GameResources>;
  consequence: string;
}

export const FAMILY_EVENTS: FamilyEvent[] = [
  // === POSITIVE EVENTS ===
  {
    id: 'child_birth',
    label: 'familyEvents.childBirth.label',
    description: 'familyEvents.childBirth.description',
    icon: '👶',
    type: 'positive',
    effect: { family: 3, time: -2, money: -2 },
    newStatus: 'parent_young',
    probability: 0.15,
    triggerStatus: ['married', 'in_relationship'],
    choices: [
      {
        id: 'take_leave',
        label: 'Prendre un congé parental',
        description: 'Moins de revenus mais plus de temps avec bébé',
        effect: { time: 2, money: -2, family: 2 },
        consequence: 'Lien fort avec l\'enfant, carrière ralentie',
      },
      {
        id: 'continue_work',
        label: 'Continuer à travailler',
        description: 'Garde d\'enfant coûteuse mais carrière maintenue',
        effect: { money: -3, skills: 1 },
        consequence: 'Progression de carrière, moins de temps en famille',
      },
    ],
  },
  {
    id: 'marriage',
    label: 'familyEvents.marriage.label',
    description: 'familyEvents.marriage.description',
    icon: '💍',
    type: 'positive',
    effect: { family: 3, network: 2, money: -2 },
    newStatus: 'married',
    probability: 0.1,
    triggerStatus: ['single', 'in_relationship'],
  },
  {
    id: 'family_reunion',
    label: 'familyEvents.familyReunion.label',
    description: 'familyEvents.familyReunion.description',
    icon: '🏠',
    type: 'positive',
    effect: { family: 2, health: 1, money: -1 },
    probability: 0.2,
    triggerStatus: ['diaspora'],
  },
  {
    id: 'child_graduation',
    label: 'familyEvents.childGraduation.label',
    description: 'familyEvents.childGraduation.description',
    icon: '🎓',
    type: 'positive',
    effect: { family: 2, network: 1 },
    newStatus: 'parent_adult',
    probability: 0.1,
    triggerStatus: ['parent_school'],
  },

  // === NEGATIVE EVENTS ===
  {
    id: 'parent_illness',
    label: 'familyEvents.parentIllness.label',
    description: 'familyEvents.parentIllness.description',
    icon: '🏥',
    type: 'negative',
    effect: { family: -1, time: -2, money: -2, health: -1 },
    newStatus: 'caregiver',
    probability: 0.1,
    triggerStatus: ['single', 'married', 'in_relationship', 'parent_young', 'parent_school', 'parent_adult'],
    choices: [
      {
        id: 'care_personally',
        label: 'S\'en occuper personnellement',
        description: 'Devenir aidant principal',
        effect: { time: -3, mobility: -3, family: 2 },
        consequence: 'Lien familial fort mais vie sociale réduite',
      },
      {
        id: 'hire_help',
        label: 'Engager une aide',
        description: 'Solution coûteuse mais préserve le temps',
        effect: { money: -3 },
        consequence: 'Liberté préservée, coûts élevés',
      },
      {
        id: 'nursing_home',
        label: 'Maison de retraite',
        description: 'Solution institutionnelle',
        effect: { money: -2, family: -2 },
        consequence: 'Culpabilité possible, temps libre',
      },
    ],
  },
  {
    id: 'parent_death',
    label: 'familyEvents.parentDeath.label',
    description: 'familyEvents.parentDeath.description',
    icon: '🕊️',
    type: 'negative',
    effect: { family: -2, health: -2 },
    probability: 0.05,
    triggerStatus: ['caregiver', 'married', 'single', 'parent_young', 'parent_school'],
    choices: [
      {
        id: 'return_home',
        label: 'Rentrer pour les funérailles',
        description: 'Devoir familial et deuil',
        effect: { money: -2, time: -2, family: 1 },
        consequence: 'Respect des traditions, coût du voyage',
      },
      {
        id: 'cannot_return',
        label: 'Impossible de rentrer',
        description: 'Contraintes empêchent le retour',
        effect: { health: -2, family: -3 },
        consequence: 'Culpabilité durable, relations familiales tendues',
      },
    ],
  },
  {
    id: 'divorce',
    label: 'familyEvents.divorce.label',
    description: 'familyEvents.divorce.description',
    icon: '💔',
    type: 'negative',
    effect: { family: -3, money: -3, health: -2, mobility: 2 },
    newStatus: 'single',
    probability: 0.05,
    triggerStatus: ['married'],
    choices: [
      {
        id: 'amicable',
        label: 'Séparation à l\'amiable',
        description: 'Moins de conflits, partage équitable',
        effect: { money: -2, family: -1 },
        consequence: 'Relations cordiales maintenues',
      },
      {
        id: 'contentious',
        label: 'Divorce conflictuel',
        description: 'Bataille juridique',
        effect: { money: -4, time: -2, health: -2 },
        consequence: 'Traumatisme, pertes financières',
      },
    ],
  },
  {
    id: 'child_illness',
    label: 'familyEvents.childIllness.label',
    description: 'familyEvents.childIllness.description',
    icon: '🤒',
    type: 'negative',
    effect: { time: -2, money: -2, health: -1 },
    probability: 0.15,
    triggerStatus: ['parent_young', 'parent_school'],
  },
  {
    id: 'family_conflict',
    label: 'familyEvents.familyConflict.label',
    description: 'familyEvents.familyConflict.description',
    icon: '😤',
    type: 'negative',
    effect: { family: -2, health: -1, network: -1 },
    probability: 0.1,
    triggerStatus: ['diaspora', 'caregiver', 'sandwich', 'married'],
  },

  // === NEUTRAL EVENTS (require choices) ===
  {
    id: 'family_needs_money',
    label: 'familyEvents.familyNeedsMoney.label',
    description: 'familyEvents.familyNeedsMoney.description',
    icon: '💰',
    type: 'neutral',
    effect: {},
    probability: 0.2,
    triggerStatus: ['diaspora'],
    choices: [
      {
        id: 'send_money',
        label: 'Envoyer l\'argent demandé',
        description: 'Aide immédiate à la famille',
        effect: { money: -3, family: 2 },
        consequence: 'Famille reconnaissante, finances tendues',
      },
      {
        id: 'send_partial',
        label: 'Envoyer une partie',
        description: 'Compromis financier',
        effect: { money: -1, family: 0 },
        consequence: 'Équilibre maintenu',
      },
      {
        id: 'refuse',
        label: 'Refuser cette fois',
        description: 'Prioriser ses propres besoins',
        effect: { family: -2 },
        consequence: 'Tensions familiales, finances protégées',
      },
    ],
  },
  {
    id: 'spouse_opportunity',
    label: 'familyEvents.spouseOpportunity.label',
    description: 'familyEvents.spouseOpportunity.description',
    icon: '🚀',
    type: 'neutral',
    effect: {},
    probability: 0.1,
    triggerStatus: ['married'],
    choices: [
      {
        id: 'support_move',
        label: 'Soutenir et déménager',
        description: 'Suivre le/la conjoint(e)',
        effect: { mobility: -2, family: 2, skills: -1 },
        consequence: 'Couple renforcé, carrière perturbée',
      },
      {
        id: 'long_distance',
        label: 'Relation à distance temporaire',
        description: 'Chacun sa carrière pour l\'instant',
        effect: { family: -1, money: 1 },
        consequence: 'Carrières préservées, relation à distance',
      },
      {
        id: 'partner_declines',
        label: 'Le/la conjoint(e) refuse',
        description: 'Rester ensemble ici',
        effect: { family: 1 },
        consequence: 'Stabilité maintenue',
      },
    ],
  },
  {
    id: 'elderly_parent_alone',
    label: 'familyEvents.elderlyParentAlone.label',
    description: 'familyEvents.elderlyParentAlone.description',
    icon: '👵',
    type: 'neutral',
    effect: {},
    probability: 0.1,
    triggerStatus: ['diaspora', 'married', 'single'],
    choices: [
      {
        id: 'bring_parent',
        label: 'Faire venir le parent',
        description: 'Regroupement familial',
        effect: { money: -2, time: -2, family: 3, mobility: -2 },
        consequence: 'Famille réunie, responsabilités accrues',
      },
      {
        id: 'hire_local_help',
        label: 'Engager de l\'aide sur place',
        description: 'Solution à distance',
        effect: { money: -2 },
        consequence: 'Parent accompagné, distance maintenue',
      },
      {
        id: 'return_home',
        label: 'Rentrer au pays',
        description: 'Retour définitif pour s\'occuper du parent',
        effect: { mobility: 3, money: 2, family: 3, skills: -1 },
        consequence: 'Retour aux sources, changement de vie majeur',
      },
    ],
  },
];

// ============== HELPER FUNCTIONS ==============

export function getFamilyConstraints(status: FamilyStatus): FamilyConstraint[] {
  return FAMILY_CONSTRAINTS.filter(c => c.status.includes(status));
}

export function getFamilyResponsibilities(status: FamilyStatus): FamilyResponsibility[] {
  return FAMILY_RESPONSIBILITIES.filter(r => r.requiredForStatus.includes(status));
}

export function getRandomFamilyEvent(status: FamilyStatus): FamilyEvent | null {
  const eligibleEvents = FAMILY_EVENTS.filter(e => e.triggerStatus.includes(status));
  
  for (const event of eligibleEvents) {
    if (Math.random() < event.probability) {
      return event;
    }
  }
  
  return null;
}

export function calculateFamilyImpactOnMobility(status: FamilyStatus): number {
  const constraints = getFamilyConstraints(status);
  const totalPenalty = constraints.reduce((sum, c) => sum + c.mobilityPenalty, 0);
  return Math.min(totalPenalty, 8); // Max penalty of 8
}

export function calculateFamilyMonthlyCosts(status: FamilyStatus): Partial<GameResources> {
  const responsibilities = getFamilyResponsibilities(status);
  const monthlyResponsibilities = responsibilities.filter(r => r.frequency === 'monthly');
  
  const costs: Partial<GameResources> = {};
  for (const resp of monthlyResponsibilities) {
    for (const [key, value] of Object.entries(resp.costs)) {
      costs[key as keyof GameResources] = (costs[key as keyof GameResources] || 0) + (value || 0);
    }
  }
  
  return costs;
}

// Status labels for display
export const FAMILY_STATUS_LABELS: Record<FamilyStatus, { label: string; icon: string }> = {
  single: { label: 'familyStatus.single', icon: '🧑' },
  in_relationship: { label: 'familyStatus.inRelationship', icon: '💑' },
  married: { label: 'familyStatus.married', icon: '💍' },
  parent_young: { label: 'familyStatus.parentYoung', icon: '👶' },
  parent_school: { label: 'familyStatus.parentSchool', icon: '🎒' },
  parent_adult: { label: 'familyStatus.parentAdult', icon: '👨‍👩‍👧‍👦' },
  caregiver: { label: 'familyStatus.caregiver', icon: '🏥' },
  sandwich: { label: 'familyStatus.sandwich', icon: '🥪' },
  diaspora: { label: 'familyStatus.diaspora', icon: '🌍' },
};
