/**
 * EXIT KEYS ENGINE - PREMIUM EDITION
 * 
 * Clés de sortie structurées : chaque clé = une stratégie claire, mesurable, sans promesse.
 * Format fixe : Ce que ça débloque | Condition de réussite | Risque principal | Vérité brute
 */

import { PyramidType, LifeMotorProfile, LifePriority } from './types';
import { Country } from './types';

// Strategic principles
export interface StrategicPrinciple {
  id: string;
  name: string;
  description: string;
  applicablePyramids: PyramidType[];
}

export const STRATEGIC_PRINCIPLES: StrategicPrinciple[] = [
  {
    id: 'use_constraints',
    name: 'Utiliser les contraintes comme leviers',
    description: 'Ne pas lutter contre les contraintes structurelles, les utiliser comme accélérateurs',
    applicablePyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'PROBLEM_RENT'],
  },
  {
    id: 'phase_strategy',
    name: 'Stratégie en phases temporelles',
    description: 'Diviser le parcours en phases distinctes avec des objectifs clairs par phase',
    applicablePyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK'],
  },
  {
    id: 'accumulate_then_accelerate',
    name: 'Accumuler puis accélérer',
    description: 'Phase hospitalière/stable pour accumuler, puis libéral/indépendant pour accélérer',
    applicablePyramids: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
  },
  {
    id: 'portable_assets',
    name: 'Actifs portables et transférables',
    description: 'Construire des compétences/actifs qui traversent les frontières sans friction',
    applicablePyramids: ['GROWTH_RISK', 'HYBRID_TRANSITION', 'PROBLEM_RENT'],
  },
];

// =============================================================================
// PREMIUM EXIT KEY STRUCTURE
// =============================================================================

export interface ExitKeyStep {
  phase: number;
  name: string;
  duration: string;
  actions: string[];
  milestone: string;
  criticalRule?: string;
}

export interface ExitKey {
  id: string;
  name: string;
  // PREMIUM FORMAT - Fixed structure
  unlocks: string;           // Ce que ça débloque (1 phrase)
  successCondition: string;  // Condition de réussite (objective, mesurable)
  mainRisk: string;          // Risque principal (objectif)
  rawTruth: string;          // Phrase de vérité brute (courte, lucide)
  // Metadata
  difficulty: 'accessible' | 'exigeant' | 'expert';
  timeframe: string;
  linkedPyramids: PyramidType[];  // Systèmes où cette clé fonctionne
  targetPyramids: PyramidType[];  // Systèmes de destination
  // Execution details (optional, for expanded view)
  requirements: string[];
  steps: ExitKeyStep[];
  planB: string;
}

export interface ExitKeyResult {
  key: ExitKey;
  compatibility: number;
  personalizedSteps: ExitKeyStep[];
  warnings: string[];
  accelerators: string[];
  planB: string;
}

// =============================================================================
// EXIT KEYS DATABASE - Premium Format
// =============================================================================

export const EXIT_KEYS: ExitKey[] = [
  {
    id: 'medical_ch_trajectory',
    name: 'Trajectoire Médicale Suisse',
    unlocks: 'Revenu médical suisse (2-4x France) + fiscalité optimisée + qualité de vie.',
    successCondition: 'MEBEKO validé + 3 ans hospitalier + installation libérale rentable.',
    mainRisk: 'MEBEKO refusé ou retardé = plan bloqué pendant 1-2 ans.',
    rawTruth: 'Stratégie lente mais à haut rendement. La patience est le filtre principal.',
    difficulty: 'exigeant',
    timeframe: '7-10 ans',
    linkedPyramids: ['STABILITY_REDIS'],
    targetPyramids: ['COMPETENCE_TRUST'],
    requirements: [
      'Diplôme médical/paramédical reconnu',
      'Maîtrise du français ou allemand',
      'Discipline administrative stricte',
    ],
    steps: [
      {
        phase: 1,
        name: 'Formation & Préparation',
        duration: '4-5 ans',
        actions: [
          'Terminer formation/internat en France',
          'Lancer process MEBEKO anticipé',
          'Préparer diplôme complémentaire',
        ],
        milestone: 'Diplôme validé + MEBEKO accepté',
        criticalRule: 'Aucune dispersion - focus chemin critique',
      },
      {
        phase: 2,
        name: 'Suisse Hospitalier',
        duration: '2-3 ans',
        actions: [
          'Poste hospitalier en Suisse romande',
          'Épargne massive (60% du revenu net)',
          'Rachats LPP + 3a maximisés',
        ],
        milestone: 'Fonds installation constitué (200-400k)',
        criticalRule: 'Année zéro = RIEN de risqué la première année',
      },
      {
        phase: 3,
        name: 'Installation Libérale',
        duration: '2-3 ans',
        actions: [
          'Installation progressive',
          'Mix activité conventionnée + haute marge',
        ],
        milestone: 'Patrimoine > 1M€',
      },
    ],
    planB: 'Si MEBEKO bloqué : Allemagne, Pays-Bas, ou optimisation frontalière France.',
  },
  {
    id: 'digital_nomad_escape',
    name: 'Sortie Nomade Digital',
    unlocks: 'Revenus location-independent + liberté géographique + optimisation fiscale.',
    successCondition: 'Revenus stables > 6k€/mois en remote + résidence fiscale optimisée.',
    mainRisk: 'Revenus instables les 12-18 premiers mois. Pas de filet social.',
    rawTruth: 'La liberté a un prix : isolement, incertitude, discipline permanente.',
    difficulty: 'exigeant',
    timeframe: '2-5 ans',
    linkedPyramids: ['PROBLEM_RENT', 'STABILITY_REDIS', 'HYBRID_TRANSITION'],
    targetPyramids: ['GROWTH_RISK'],
    requirements: [
      'Compétences digitales monétisables',
      'Capacité à vendre en anglais',
      'Tolérance à l\'incertitude',
    ],
    steps: [
      {
        phase: 1,
        name: 'Construction de revenus',
        duration: '6-12 mois',
        actions: [
          'Identifier skill à haute demande',
          'Premiers clients via plateformes',
          'Atteindre 3k€/mois récurrents',
        ],
        milestone: 'Revenu stable > 3k€/mois en remote',
        criticalRule: 'Pas de démission avant 6 mois de revenus stables',
      },
      {
        phase: 2,
        name: 'Transition',
        duration: '12-18 mois',
        actions: [
          'Test de vie nomade (3-6 mois)',
          'Structure juridique optimale',
          'Atteindre 6-10k€/mois',
        ],
        milestone: 'Lifestyle viable + revenus 2x coût de vie',
      },
      {
        phase: 3,
        name: 'Optimisation fiscale',
        duration: '1-2 ans',
        actions: [
          'Résidence dans juridiction favorable',
          'Diversification revenus',
        ],
        milestone: 'Résidence fiscale optimisée',
      },
    ],
    planB: 'Si revenus insuffisants : maintenir emploi partiel remote, transition progressive.',
  },
  {
    id: 'corporate_ladder_jump',
    name: 'Saut Corporate → Entrepreneuriat',
    unlocks: 'Capital accumulé + réseau + compétences business → lancement entrepreneurial.',
    successCondition: 'Épargne > 100k€ + projet validé par le marché avant démission.',
    mainRisk: 'Golden handcuffs : trop confortable pour partir, fenêtre de tir ratée.',
    rawTruth: 'Le salariat finance le risque. Ne pars pas sans runway de 24 mois.',
    difficulty: 'exigeant',
    timeframe: '5-8 ans',
    linkedPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    targetPyramids: ['GROWTH_RISK'],
    requirements: [
      'Diplôme reconnu (Grande École, Master)',
      'Capacité à jouer le jeu corporate',
      'Épargne disciplinée',
    ],
    steps: [
      {
        phase: 1,
        name: 'Accumulation Corporate',
        duration: '3-5 ans',
        actions: [
          'Poste dans grande entreprise',
          'Épargne 40-50% du salaire net',
          'Side-project le weekend',
        ],
        milestone: '100-200k€ épargne + réseau solide',
        criticalRule: 'Ne pas partir avant 24 mois de runway',
      },
      {
        phase: 2,
        name: 'Transition',
        duration: '1-2 ans',
        actions: [
          'Validation marché avant démission',
          'Full-time après 5k€/mois atteints',
        ],
        milestone: 'Revenus entrepreneuriat > 50% ancien salaire',
      },
    ],
    planB: 'Si entrepreneuriat échoue : retour corporate avec expérience enrichie.',
  },
  {
    id: 'education_arbitrage',
    name: 'Arbitrage Éducation',
    unlocks: 'Credentials internationales + accès marché emploi pays cible + voie vers résidence.',
    successCondition: 'Diplôme reconnu + CDI local + visa de travail ou résidence permanente.',
    mainRisk: 'Coût élevé des études + visa non convertible + marché emploi difficile.',
    rawTruth: 'Le diplôme ouvre la porte. Le réseau et la chance font le reste.',
    difficulty: 'exigeant',
    timeframe: '4-7 ans',
    linkedPyramids: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    targetPyramids: ['COMPETENCE_TRUST', 'GROWTH_RISK'],
    requirements: [
      'Capacité d\'études long terme',
      'Ressources pour études à l\'étranger',
      'Maîtrise langue cible',
    ],
    steps: [
      {
        phase: 1,
        name: 'Études dans pays cible',
        duration: '2-5 ans',
        actions: [
          'Obtenir financement/bourse',
          'Diplôme reconnu (Master, MBA)',
          'Stages pour premier pied local',
        ],
        milestone: 'Diplôme + première expérience locale',
        criticalRule: 'Choisir filière avec forte demande locale',
      },
      {
        phase: 2,
        name: 'Enracinement',
        duration: '2-3 ans',
        actions: [
          'CDI dans entreprise établie',
          'Process visa/résidence permanente',
        ],
        milestone: 'Résidence permanente ou voie citoyenneté',
      },
    ],
    planB: 'Si marché difficile : pivot vers autre pays EU ou retour avec credentials internationales.',
  },
  {
    id: 'diaspora_leverage',
    name: 'Levier Diaspora',
    unlocks: 'Position d\'arbitrage entre deux marchés + revenus premium + expertise unique.',
    successCondition: 'Activité rentable exploitant les deux marchés + modèle reproductible.',
    mainRisk: 'Instabilité politique pays d\'origine + complexité logistique internationale.',
    rawTruth: 'Être entre deux mondes est un avantage. Mais tu n\'appartiens nulle part.',
    difficulty: 'exigeant',
    timeframe: '3-6 ans',
    linkedPyramids: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    targetPyramids: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
    requirements: [
      'Connaissance profonde pays d\'origine',
      'Réseau dans les deux pays',
      'Capital initial modéré',
    ],
    steps: [
      {
        phase: 1,
        name: 'Positionnement Pont',
        duration: '1-2 ans',
        actions: [
          'Identifier opportunités d\'arbitrage',
          'Première offre testée',
          'Structure légale favorable',
        ],
        milestone: 'Premiers revenus de l\'activité pont',
        criticalRule: 'Tester petit avant de scaler',
      },
      {
        phase: 2,
        name: 'Scale',
        duration: '2-3 ans',
        actions: [
          'Équipe locale (coûts bas)',
          'Clients premium (revenus hauts)',
        ],
        milestone: 'Rentabilité stable',
      },
    ],
    planB: 'Si activité échoue : réseau biculturel = atout pour emploi corporate international.',
  },
  {
    id: 'freelance_tech',
    name: 'Freelance Tech',
    unlocks: 'Liberté géographique + revenus > salariat + indépendance professionnelle.',
    successCondition: 'TJM > 500€ + carnet plein + 100% remote possible.',
    mainRisk: 'Instabilité entre missions + obsolescence rapide des compétences.',
    rawTruth: 'Tu vends ton temps différemment, mais tu vends toujours ton temps.',
    difficulty: 'accessible',
    timeframe: '1-3 ans',
    linkedPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK', 'HYBRID_TRANSITION'],
    targetPyramids: ['GROWTH_RISK'],
    requirements: [
      'Compétences tech demandées',
      'Portfolio prouvable',
      'Capacité à se vendre',
    ],
    steps: [
      {
        phase: 1,
        name: 'Lancement',
        duration: '3-6 mois',
        actions: [
          'Offre de service claire',
          'Profils Malt, Upwork, LinkedIn',
          'Premiers clients via réseau',
        ],
        milestone: 'Revenus stables > 3k€/mois',
        criticalRule: 'Garder job salarié tant que revenus < 2x SMIC',
      },
      {
        phase: 2,
        name: 'Montée en Gamme',
        duration: '6-12 mois',
        actions: [
          'Augmenter TJM progressivement',
          'Clients directs, pas que plateformes',
        ],
        milestone: 'TJM > 500€',
      },
      {
        phase: 3,
        name: 'Optimisation',
        duration: '6-12 mois',
        actions: [
          'Structure optimale',
          'Clients internationaux',
        ],
        milestone: 'Revenus > 100k€/an net',
      },
    ],
    planB: 'Si missions rares : retour salariat partiel ou pivot vers produit (SaaS).',
  },
  {
    id: 'real_estate_investor',
    name: 'Investisseur Immobilier',
    unlocks: 'Revenus passifs récurrents + patrimoine croissant + effet de levier bancaire.',
    successCondition: 'Cash-flow positif sur 5+ lots + patrimoine > 500k€.',
    mainRisk: 'Vacance locative + impayés + retournement marché = cash drain.',
    rawTruth: 'L\'immobilier n\'est pas passif. C\'est un second métier mal payé au début.',
    difficulty: 'exigeant',
    timeframe: '5-10 ans',
    linkedPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    targetPyramids: ['STABILITY_REDIS'],
    requirements: [
      'Capacité d\'emprunt ou capital > 50k€',
      'Stabilité professionnelle (CDI)',
      'Patience long terme',
    ],
    steps: [
      {
        phase: 1,
        name: 'Premier Investissement',
        duration: '1-2 ans',
        actions: [
          'Formation investissement immo',
          'Premier achat locatif',
          'Déléguer gestion si possible',
        ],
        milestone: 'Premier bien rentable (cash-flow +)',
        criticalRule: 'Ne jamais acheter en négatif sans stratégie claire',
      },
      {
        phase: 2,
        name: 'Expansion',
        duration: '2-4 ans',
        actions: [
          'Réinvestir cash-flow',
          'Diversifier (coloc, LCD)',
          'Optimiser fiscalité (LMNP, SCI)',
        ],
        milestone: 'Revenus locatifs > 3k€/mois net',
      },
    ],
    planB: 'Si marché se retourne : conserver, attendre le cycle, ou revendre pour réinvestir.',
  },
  {
    id: 'manual_trade_pivot',
    name: 'Reconversion Métier Manuel',
    unlocks: 'Métier pénurique + demande garantie + qualité de vie + indépendance possible.',
    successCondition: 'Diplôme obtenu + 2 ans expérience + activité indépendante rentable.',
    mainRisk: 'Pénibilité physique long terme + investissement matériel important.',
    rawTruth: 'Le tertiaire déçoit, le manuel fatigue. Choisis ta contrainte.',
    difficulty: 'exigeant',
    timeframe: '2-4 ans',
    linkedPyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    targetPyramids: ['STABILITY_REDIS'],
    requirements: [
      'Bonne condition physique',
      'Capacité à reprendre formation',
      'Intérêt réel pour le métier',
    ],
    steps: [
      {
        phase: 1,
        name: 'Formation',
        duration: '6-18 mois',
        actions: [
          'Identifier métier pénurique',
          'Formation diplômante (CAP, BP)',
        ],
        milestone: 'Diplôme obtenu',
        criticalRule: 'Choisir métier avec forte demande locale',
      },
      {
        phase: 2,
        name: 'Consolidation',
        duration: '1-2 ans',
        actions: [
          'Emploi salarié pour expérience',
          'Épargne pour équipement',
        ],
        milestone: 'Maîtrise technique + réseau clients',
      },
      {
        phase: 3,
        name: 'Installation Indépendant',
        duration: '1-2 ans',
        actions: [
          'Création entreprise',
          'Marketing local',
        ],
        milestone: 'Activité rentable',
      },
    ],
    planB: 'Si marché saturé : mobilité géographique ou spécialisation haute valeur.',
  },
  {
    id: 'resource_extraction_escape',
    name: 'Sortie Système Extractif',
    unlocks: 'Conversion actifs locaux en devise forte + nouvelle vie dans système stable.',
    successCondition: '2-3 ans de runway en devise forte + visa/résidence pays cible obtenu.',
    mainRisk: 'Obstacles légaux au départ + perte actifs restés + difficulté intégration.',
    rawTruth: 'Partir n\'est pas trahir. Mais tout le monde ne peut pas partir.',
    difficulty: 'expert',
    timeframe: '5-10 ans',
    linkedPyramids: ['RESOURCE_EXTRACTION', 'PROBLEM_RENT'],
    targetPyramids: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
    requirements: [
      'Position dans secteur ressources',
      'Capacité à épargner en devise forte',
      'Patience et discrétion absolue',
    ],
    steps: [
      {
        phase: 1,
        name: 'Accumulation Discrète',
        duration: '3-5 ans',
        actions: [
          'Maximiser revenus position actuelle',
          'Épargne en devise forte à l\'étranger',
          'Certifications internationales',
        ],
        milestone: '2-3 ans de runway en devise forte',
        criticalRule: 'Discrétion absolue sur les plans de départ',
      },
      {
        phase: 2,
        name: 'Préparation Sortie',
        duration: '1-2 ans',
        actions: [
          'Visa ou résidence pays cible',
          'Transfert progressif d\'actifs',
        ],
        milestone: 'Tous les éléments en place',
      },
      {
        phase: 3,
        name: 'Transition',
        duration: '1-2 ans',
        actions: [
          'Départ effectif',
          'Année zéro de stabilisation',
        ],
        milestone: 'Vie stable dans nouveau pays',
        criticalRule: 'Année zéro = zéro risque, adaptation pure',
      },
    ],
    planB: 'Si sortie bloquée : optimisation interne maximale + préparation longue échéance.',
  },
];

// =============================================================================
// ENGINE FUNCTIONS
// =============================================================================

export interface UserContext {
  birthCountry: PyramidType;
  nationalities: PyramidType[];
  currentCountry: PyramidType;
  desiredLife: LifePriority;
  motorProfile: LifeMotorProfile;
  riskTolerance: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  hasCapital: boolean;
  hasCredentials: boolean;
  hasNetwork: boolean;
  isLGBTQ: boolean;
  hasFamily: boolean;
}

export function findCompatibleKeys(context: UserContext): ExitKeyResult[] {
  const results: ExitKeyResult[] = [];

  for (const key of EXIT_KEYS) {
    const fromMatch = key.linkedPyramids.includes(context.currentCountry);
    const toMatch = key.targetPyramids.some(to => isDesiredDestination(to, context.desiredLife));

    if (!fromMatch) continue;

    let compatibility = 50;
    if (toMatch) compatibility += 20;

    // Risk tolerance matching
    if (key.difficulty === 'accessible' && context.riskTolerance === 'low') compatibility += 10;
    if (key.difficulty === 'expert' && context.riskTolerance === 'high') compatibility += 10;
    if (key.difficulty === 'expert' && context.riskTolerance === 'low') compatibility -= 15;

    // Time horizon matching
    const keyDuration = parseTimeframe(key.timeframe);
    if (context.timeHorizon === 'short' && keyDuration > 5) compatibility -= 20;
    if (context.timeHorizon === 'long' && keyDuration > 5) compatibility += 10;

    // Resources boost
    if (context.hasCapital) compatibility += 10;
    if (context.hasCredentials) compatibility += 10;
    if (context.hasNetwork) compatibility += 5;

    // Motor profile fit
    compatibility += getMotorProfileFit(key.id, context.motorProfile);

    // Generate warnings
    const warnings: string[] = [];
    if (key.difficulty === 'expert' && !context.hasCapital) {
      warnings.push('Capital initial recommandé');
    }
    if (context.hasFamily && ['digital_nomad_escape', 'resource_extraction_escape'].includes(key.id)) {
      warnings.push('Logistique familiale à planifier');
    }
    if (context.isLGBTQ) {
      warnings.push('Vérifier sécurité LGBTQ+ des destinations');
    }

    // Generate accelerators
    const accelerators: string[] = [];
    if (context.hasCredentials) accelerators.push('Credentials existantes = phase 1 accélérée');
    if (context.hasNetwork) accelerators.push('Réseau actif = transition facilitée');
    if (context.hasCapital) accelerators.push('Capital = phases d\'accumulation raccourcies');

    const personalizedSteps = personalizeSteps(key.steps, context);

    results.push({
      key,
      compatibility: Math.min(100, Math.max(0, compatibility)),
      personalizedSteps,
      warnings,
      accelerators,
      planB: key.planB,
    });
  }

  return results.sort((a, b) => b.compatibility - a.compatibility);
}

function isDesiredDestination(pyramidType: PyramidType, priority: LifePriority): boolean {
  const mapping: Record<LifePriority, PyramidType[]> = {
    freedom: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
    money: ['GROWTH_RISK', 'COMPETENCE_TRUST'],
    meaning: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
    status: ['COMPETENCE_TRUST', 'GROWTH_RISK'],
    family: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    calm: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
  };
  return mapping[priority]?.includes(pyramidType) ?? false;
}

function parseTimeframe(timeframe: string): number {
  const match = timeframe.match(/(\d+)-?(\d+)?/);
  if (!match) return 5;
  return parseInt(match[2] || match[1]);
}

function getMotorProfileFit(keyId: string, profile: LifeMotorProfile): number {
  const fits: Record<string, LifeMotorProfile[]> = {
    medical_ch_trajectory: ['BUILDER', 'SAFE_WEALTH', 'STATUS'],
    digital_nomad_escape: ['NOMAD', 'BUILDER', 'PURPOSE'],
    corporate_ladder_jump: ['BUILDER', 'STATUS', 'SAFE_WEALTH'],
    education_arbitrage: ['BUILDER', 'STATUS', 'PURPOSE'],
    diaspora_leverage: ['BUILDER', 'NOMAD', 'PURPOSE'],
    resource_extraction_escape: ['RECOVERY', 'SAFE_WEALTH', 'NOMAD'],
    real_estate_investor: ['SAFE_WEALTH', 'BUILDER', 'STATUS'],
    freelance_tech: ['NOMAD', 'BUILDER', 'SAFE_WEALTH'],
    manual_trade_pivot: ['BUILDER', 'RECOVERY', 'SAFE_WEALTH'],
  };

  const keyFits = fits[keyId] || [];
  return keyFits.includes(profile) ? 15 : 0;
}

function personalizeSteps(steps: ExitKeyStep[], context: UserContext): ExitKeyStep[] {
  return steps.map(step => {
    const personalizedActions = [...step.actions];
    
    if (context.hasFamily && step.phase === 1) {
      personalizedActions.push('Planifier logistique familiale');
    }
    if (context.isLGBTQ) {
      personalizedActions.push('Vérifier environnement LGBTQ+ destinations');
    }

    return { ...step, actions: personalizedActions };
  });
}

export function getOptimalKey(context: UserContext): ExitKeyResult | null {
  const keys = findCompatibleKeys(context);
  return keys.length > 0 ? keys[0] : null;
}

export function getCountryExitStrategy(
  fromCountry: Country,
  context: UserContext
): {
  ruleOfGold: string;
  immediateActions: string[];
  warnings: string[];
  exitKeys: ExitKeyResult[];
} {
  const exitKeys = findCompatibleKeys({
    ...context,
    currentCountry: fromCountry.pyramidType,
  });

  return {
    ruleOfGold: fromCountry.ruleOfGold,
    immediateActions: fromCountry.playbook.plan30Days,
    warnings: fromCountry.whoLoses.slice(0, 3),
    exitKeys: exitKeys.slice(0, 3),
  };
}
