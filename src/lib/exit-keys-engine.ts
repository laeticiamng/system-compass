/**
 * EXIT KEYS ENGINE
 * 
 * This engine generates optimal "exit keys" - strategic paths out of any situation
 * based on: origin country, current country, desired life, and personal profile.
 * 
 * The philosophy: Use constraints as levers, not obstacles.
 * Each pyramid type has specific "unlock mechanisms" that work best for escaping/optimizing.
 */

import { PyramidType, LifeMotorProfile, LifePriority } from './types';
import { Country, CountryPlaybook } from './types';

// Core strategy principles extracted from the user's documents
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
  {
    id: 'no_optimization_trap',
    name: 'Éviter le piège de la sur-optimisation',
    description: 'Le plan optimal existe, l\'exécution calme bat le génie supplémentaire',
    applicablePyramids: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
  },
  {
    id: 'year_zero',
    name: 'Année Zéro de transition',
    description: 'Première année dans un nouveau système = zéro risque, stabilisation pure',
    applicablePyramids: ['COMPETENCE_TRUST', 'STABILITY_REDIS', 'HYBRID_TRANSITION'],
  },
  {
    id: 'asymmetric_options',
    name: 'Options asymétriques',
    description: 'Projets parallèles = bonus si ça marche, plan principal intact si échec',
    applicablePyramids: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
  },
  {
    id: 'credential_arbitrage',
    name: 'Arbitrage de credentials',
    description: 'Obtenir les credentials dans le système qui les valorise le plus',
    applicablePyramids: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
  },
];

export interface ExitKey {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  timeframe: string;
  applicableFrom: PyramidType[];
  applicableTo: PyramidType[];
  requirements: string[];
  steps: ExitKeyStep[];
  risks: string[];
  successRate: number; // 0-100
}

export interface ExitKeyStep {
  phase: number;
  name: string;
  duration: string;
  actions: string[];
  milestone: string;
  criticalRule?: string;
}

export interface ExitKeyResult {
  key: ExitKey;
  compatibility: number; // 0-100
  personalizedSteps: ExitKeyStep[];
  warnings: string[];
  accelerators: string[];
  planB: string;
}

// The master database of Exit Keys
export const EXIT_KEYS: ExitKey[] = [
  {
    id: 'medical_ch_trajectory',
    name: 'Trajectoire Médicale Suisse',
    description: 'Chemin optimal pour professionnels de santé: France → Suisse hospitalier → Suisse libéral',
    icon: '🏥',
    difficulty: 'hard',
    timeframe: '7-10 ans',
    applicableFrom: ['STABILITY_REDIS'],
    applicableTo: ['COMPETENCE_TRUST'],
    requirements: [
      'Diplôme médical/paramédical reconnu',
      'Maîtrise du français ou allemand',
      'Capacité d\'épargne pendant phase hospitalière',
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
          'Commencer diplôme complémentaire (esthétique, spécialisation)',
          'Créer structure SASU pour projets parallèles (optionnel)',
        ],
        milestone: 'Diplôme validé + MEBEKO accepté',
        criticalRule: 'Aucune dispersion - focus chemin critique',
      },
      {
        phase: 2,
        name: 'Suisse Hospitalier',
        duration: '2-3 ans',
        actions: [
          'Poste hospitalier à Genève ou frontière',
          'Résidence Saint-Julien (quasi-résident fiscal)',
          'Épargne massive - objectif 60% du revenu net',
          'Rachats LPP + 3a maximisés',
          'Finaliser diplôme complémentaire',
          'Observer marché libéral sans agir',
        ],
        milestone: 'Fonds installation constitué (200-400k)',
        criticalRule: 'Année zéro = RIEN de risqué la première année',
      },
      {
        phase: 3,
        name: 'Installation Libérale',
        duration: '2-3 ans',
        actions: [
          'Validation conditions pré-cabinet',
          'Installation progressive (pas d\'achat jour 1)',
          'Mix activité conventionnée + haute marge',
          'Compression finale vers objectif patrimoine',
        ],
        milestone: 'Patrimoine > 1M€',
        criticalRule: 'Si conditions non remplies → attendre',
      },
    ],
    risks: [
      'MEBEKO refusé ou retardé',
      'Burnout pendant phase hospitalière',
      'Marché libéral saturé à l\'arrivée',
    ],
    successRate: 85,
  },
  {
    id: 'digital_nomad_escape',
    name: 'Évasion Nomade Digitale',
    description: 'Construire revenus location-independent puis optimiser la base fiscale',
    icon: '🌍',
    difficulty: 'moderate',
    timeframe: '2-5 ans',
    applicableFrom: ['PROBLEM_RENT', 'STABILITY_REDIS', 'HYBRID_TRANSITION'],
    applicableTo: ['GROWTH_RISK', 'COMPETENCE_TRUST'],
    requirements: [
      'Compétences digitales monétisables',
      'Capacité à vendre en anglais',
      'Tolérance à l\'incertitude initiale',
      'Pas d\'attaches géographiques fortes',
    ],
    steps: [
      {
        phase: 1,
        name: 'Skill Building',
        duration: '6-12 mois',
        actions: [
          'Identifier skill à haute demande internationale',
          'Construire portfolio/preuve de compétence',
          'Premiers clients via plateformes (Upwork, Toptal, Malt)',
          'Atteindre 2-3k€/mois récurrents',
        ],
        milestone: 'Revenu stable > 3k€/mois en remote',
        criticalRule: 'Pas de démission avant 6 mois de revenus stables',
      },
      {
        phase: 2,
        name: 'Transition & Test',
        duration: '12-18 mois',
        actions: [
          'Test de vie nomade (3-6 mois dans pays cible)',
          'Structure juridique optimale (micro, SASU, Estonian e-residency)',
          'Construire clientèle premium',
          'Atteindre 6-10k€/mois',
        ],
        milestone: 'Lifestyle viable + revenus 2x coût de vie',
        criticalRule: 'Garder 12 mois de runway minimum',
      },
      {
        phase: 3,
        name: 'Optimisation Base',
        duration: '1-2 ans',
        actions: [
          'Installation dans juridiction favorable (Portugal, Dubaï, Estonie)',
          'Structure holding si revenus > 100k€/an',
          'Diversification revenus (produits, consulting, SaaS)',
        ],
        milestone: 'Résidence fiscale optimisée + revenus passifs',
      },
    ],
    risks: [
      'Instabilité revenus au début',
      'Isolement social',
      'Complexité fiscale multi-pays',
    ],
    successRate: 65,
  },
  {
    id: 'corporate_ladder_jump',
    name: 'Saut d\'Échelle Corporate',
    description: 'Utiliser le système corporate pour accumuler puis sauter vers l\'entrepreneuriat',
    icon: '📈',
    difficulty: 'moderate',
    timeframe: '5-8 ans',
    applicableFrom: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    applicableTo: ['GROWTH_RISK'],
    requirements: [
      'Diplôme reconnu (Grande École, Master)',
      'Capacité à jouer le jeu corporate',
      'Réseau professionnel actif',
      'Épargne disciplinée',
    ],
    steps: [
      {
        phase: 1,
        name: 'Accumulation Corporate',
        duration: '3-5 ans',
        actions: [
          'Poste dans grande entreprise (CAC40, Big4, GAFAM)',
          'Épargne 40-50% du salaire net',
          'Construction réseau stratégique',
          'Développement side-project le weekend',
        ],
        milestone: '100-200k€ épargne + réseau solide',
        criticalRule: 'Ne pas partir avant d\'avoir 24 mois de runway',
      },
      {
        phase: 2,
        name: 'Transition Entrepreneuriale',
        duration: '1-2 ans',
        actions: [
          'Lancement projet en parallèle du job',
          'Validation marché avant démission',
          'Négociation rupture conventionnelle si possible',
          'Full-time sur projet une fois 5k€/mois atteints',
        ],
        milestone: 'Revenus entrepreneuriat > 50% ancien salaire',
      },
      {
        phase: 3,
        name: 'Scale & Optimize',
        duration: '2-3 ans',
        actions: [
          'Focus croissance et scalabilité',
          'Recrutement premiers employés',
          'Optimisation structure juridique',
          'Potentielle relocalisation favorable',
        ],
        milestone: 'Entreprise profitable + liberté géographique',
      },
    ],
    risks: [
      'Golden handcuffs (trop confortable pour partir)',
      'Échec entrepreneurial',
      'Timing de transition difficile',
    ],
    successRate: 55,
  },
  {
    id: 'education_arbitrage',
    name: 'Arbitrage Éducation',
    description: 'Utiliser les credentials d\'un système pour s\'installer dans un autre plus favorable',
    icon: '🎓',
    difficulty: 'moderate',
    timeframe: '4-7 ans',
    applicableFrom: ['PROBLEM_RENT', 'HYBRID_TRANSITION'],
    applicableTo: ['COMPETENCE_TRUST', 'GROWTH_RISK'],
    requirements: [
      'Capacité d\'études long terme',
      'Ressources pour études à l\'étranger',
      'Maîtrise langue cible',
      'Réseau diaspora actif',
    ],
    steps: [
      {
        phase: 1,
        name: 'Études dans pays cible',
        duration: '2-5 ans',
        actions: [
          'Obtenir bourse ou financement études',
          'Diplôme reconnu dans système cible (Master, MBA, PhD)',
          'Stage/alternance pour premier pied dans marché',
          'Réseau alumni et professionnel',
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
          'Épargne et investissement local',
          'Intégration culturelle active',
        ],
        milestone: 'Résidence permanente ou voie vers citoyenneté',
      },
      {
        phase: 3,
        name: 'Optimisation Long Terme',
        duration: 'Ongoing',
        actions: [
          'Montée en séniorité/spécialisation',
          'Potentiel entrepreneuriat avec credentials locaux',
          'Construction patrimoine dans système favorable',
        ],
        milestone: 'Citoyenneté ou résidence permanente + carrière établie',
      },
    ],
    risks: [
      'Coût élevé des études',
      'Visa étudiant non convertible',
      'Marché emploi difficile post-diplôme',
    ],
    successRate: 70,
  },
  {
    id: 'diaspora_leverage',
    name: 'Levier Diaspora',
    description: 'Utiliser la position entre deux mondes pour créer de la valeur unique',
    icon: '🌐',
    difficulty: 'moderate',
    timeframe: '3-6 ans',
    applicableFrom: ['PROBLEM_RENT', 'RESOURCE_EXTRACTION'],
    applicableTo: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
    requirements: [
      'Connaissance profonde pays d\'origine',
      'Réseau dans pays d\'origine ET pays d\'accueil',
      'Capacité à naviguer deux cultures',
      'Capital initial modéré',
    ],
    steps: [
      {
        phase: 1,
        name: 'Positionnement Pont',
        duration: '1-2 ans',
        actions: [
          'Identifier opportunités d\'arbitrage (import/export, conseil, tech)',
          'Construire réseau intentionnel dans les deux pays',
          'Première offre de service/produit testée',
          'Structure légale dans pays favorable',
        ],
        milestone: 'Premiers revenus de l\'activité pont',
        criticalRule: 'Tester petit avant de scaler',
      },
      {
        phase: 2,
        name: 'Scale du Pont',
        duration: '2-3 ans',
        actions: [
          'Systématiser l\'activité',
          'Équipe locale dans pays d\'origine (coûts bas)',
          'Clients premium dans pays d\'accueil (revenus hauts)',
          'Réputation d\'expert biculturel',
        ],
        milestone: 'Rentabilité stable + modèle reproductible',
      },
      {
        phase: 3,
        name: 'Expansion ou Exit',
        duration: '1-2 ans',
        actions: [
          'Expansion géographique (autres diasporas)',
          'Ou vente à acteur plus gros',
          'Ou transition vers conseil/investissement',
        ],
        milestone: 'Liberté financière ou exit réussi',
      },
    ],
    risks: [
      'Instabilité politique pays d\'origine',
      'Difficultés logistiques internationales',
      'Compétition d\'autres diasporas',
    ],
    successRate: 50,
  },
  {
    id: 'resource_extraction_escape',
    name: 'Sortie de Pyramide Extractive',
    description: 'Convertir la proximité aux ressources en actifs portables avant de partir',
    icon: '⛏️',
    difficulty: 'hard',
    timeframe: '5-10 ans',
    applicableFrom: ['RESOURCE_EXTRACTION', 'PROBLEM_RENT'],
    applicableTo: ['COMPETENCE_TRUST', 'STABILITY_REDIS'],
    requirements: [
      'Position dans secteur ressources ou connexe',
      'Capacité à épargner en devise forte',
      'Patience et discrétion',
      'Plan de sortie préparé en secret',
    ],
    steps: [
      {
        phase: 1,
        name: 'Accumulation Discrète',
        duration: '3-5 ans',
        actions: [
          'Maximiser revenus dans position actuelle',
          'Épargne en devise forte (USD, EUR, CHF) à l\'étranger',
          'Formation/certifications reconnues internationalement',
          'Réseau diaspora et contacts internationaux',
        ],
        milestone: '2-3 ans de runway en devise forte',
        criticalRule: 'Discrétion absolue sur les plans de départ',
      },
      {
        phase: 2,
        name: 'Préparation Sortie',
        duration: '1-2 ans',
        actions: [
          'Visa ou résidence dans pays cible',
          'Transfert progressif d\'actifs',
          'Offre d\'emploi ou activité en place',
          'Famille/proches préparés',
        ],
        milestone: 'Tous les éléments en place pour partir',
      },
      {
        phase: 3,
        name: 'Transition',
        duration: '1-2 ans',
        actions: [
          'Départ effectif',
          'Installation dans nouveau système',
          'Année zéro de stabilisation',
          'Reconstruction progressive dans nouveau contexte',
        ],
        milestone: 'Vie stable dans nouveau pays',
        criticalRule: 'Année zéro = zéro risque, adaptation pure',
      },
    ],
    risks: [
      'Obstacles légaux au départ',
      'Perte d\'actifs restés au pays',
      'Difficulté d\'intégration ailleurs',
    ],
    successRate: 45,
  },
  // NEW EXIT KEYS
  {
    id: 'content_creator_path',
    name: 'Créateur de Contenu',
    description: 'Construire une audience en ligne et monétiser son expertise ou sa personnalité',
    icon: '📱',
    difficulty: 'moderate',
    timeframe: '2-4 ans',
    applicableFrom: ['STABILITY_REDIS', 'PROBLEM_RENT', 'HYBRID_TRANSITION', 'GROWTH_RISK'],
    applicableTo: ['GROWTH_RISK', 'HYBRID_TRANSITION'],
    requirements: [
      'Expertise ou personnalité différenciante',
      'Capacité à créer du contenu régulièrement',
      'Patience (résultats longs à venir)',
      'Confort devant la caméra ou à l\'écrit',
    ],
    steps: [
      {
        phase: 1,
        name: 'Construction d\'Audience',
        duration: '12-18 mois',
        actions: [
          'Choisir une niche avec demande et faible compétition',
          'Publier 3-5 contenus par semaine minimum',
          'Tester YouTube, TikTok, LinkedIn, Newsletter',
          'Analyser métriques et doubler sur ce qui marche',
          'Atteindre 10k abonnés sur plateforme principale',
        ],
        milestone: '10k abonnés engagés',
        criticalRule: 'Consistance > Perfection. Publier même imparfait.',
      },
      {
        phase: 2,
        name: 'Monétisation',
        duration: '6-12 mois',
        actions: [
          'Lancer premier produit digital (formation, ebook)',
          'Partenariats marques (si pertinent)',
          'Consulting/coaching basé sur expertise',
          'Atteindre 3-5k€/mois de revenus',
        ],
        milestone: 'Revenus > 50% du salaire actuel',
        criticalRule: 'Diversifier revenus: ads + produits + services',
      },
      {
        phase: 3,
        name: 'Scale & Liberté',
        duration: '1-2 ans',
        actions: [
          'Déléguer production/montage',
          'Créer produits premium (masterclass, communauté payante)',
          'Optimiser structure juridique',
          'Potentielle relocalisation fiscale favorable',
        ],
        milestone: 'Revenus passifs > 10k€/mois',
      },
    ],
    risks: [
      'Burnout créatif',
      'Changements algorithmes plateformes',
      'Difficulté à monétiser certaines niches',
    ],
    successRate: 35,
  },
  {
    id: 'real_estate_investor',
    name: 'Investisseur Immobilier',
    description: 'Construire un patrimoine immobilier générant des revenus passifs',
    icon: '🏠',
    difficulty: 'moderate',
    timeframe: '5-10 ans',
    applicableFrom: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK'],
    applicableTo: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    requirements: [
      'Capacité d\'emprunt ou capital initial (>50k€)',
      'Stabilité professionnelle (CDI ou revenus stables)',
      'Connaissance du marché local',
      'Patience et vision long terme',
    ],
    steps: [
      {
        phase: 1,
        name: 'Premier Investissement',
        duration: '1-2 ans',
        actions: [
          'Former aux bases de l\'investissement immobilier',
          'Optimiser profil bancaire (épargne, stabilité)',
          'Identifier marché porteur (rendement > 7%)',
          'Premier achat locatif avec effet de levier',
          'Déléguer gestion si possible',
        ],
        milestone: 'Premier bien rentable (cash-flow positif)',
        criticalRule: 'Ne jamais acheter en négatif sans stratégie claire',
      },
      {
        phase: 2,
        name: 'Expansion Patrimoniale',
        duration: '2-4 ans',
        actions: [
          'Réinvestir cash-flow dans nouveaux biens',
          'Diversifier: colocation, LCD, parking, etc.',
          'Optimiser fiscalité (LMNP, SCI)',
          'Atteindre 5-10 lots',
        ],
        milestone: 'Revenus locatifs > 3k€/mois net',
      },
      {
        phase: 3,
        name: 'Liberté Financière',
        duration: '2-4 ans',
        actions: [
          'Remboursement progressif ou revente stratégique',
          'Diversification géographique',
          'Potentiel passage en gestion de patrimoine',
          'Options de mobilité internationale',
        ],
        milestone: 'Patrimoine > 1M€ ou rente > 5k€/mois',
      },
    ],
    risks: [
      'Vacance locative prolongée',
      'Impayés et procédures longues',
      'Évolution défavorable fiscalité',
      'Crise immobilière',
    ],
    successRate: 60,
  },
  {
    id: 'freelance_tech',
    name: 'Freelance Tech',
    description: 'Capitaliser sur des compétences techniques pour atteindre la liberté géographique et financière',
    icon: '💻',
    difficulty: 'easy',
    timeframe: '1-3 ans',
    applicableFrom: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK', 'HYBRID_TRANSITION'],
    applicableTo: ['GROWTH_RISK', 'COMPETENCE_TRUST'],
    requirements: [
      'Compétences tech demandées (dev, data, cloud, cybersécurité)',
      'Portfolio ou expérience prouvable',
      'Capacité à se vendre',
      'Discipline pour travailler seul',
    ],
    steps: [
      {
        phase: 1,
        name: 'Lancement',
        duration: '3-6 mois',
        actions: [
          'Définir offre de service claire',
          'Créer profils Malt, Upwork, LinkedIn optimisés',
          'Premiers clients via réseau existant',
          'Accepter missions même moins payées pour références',
          'Atteindre 3-4k€/mois',
        ],
        milestone: 'Revenus stables > 3k€/mois',
        criticalRule: 'Garder job salarié tant que revenus < 2x SMIC',
      },
      {
        phase: 2,
        name: 'Montée en Gamme',
        duration: '6-12 mois',
        actions: [
          'Augmenter TJM progressivement (+50-100€ tous les 3 mois)',
          'Spécialisation sur niche à haute valeur',
          'Clients directs (pas que plateformes)',
          'Atteindre TJM > 500€',
        ],
        milestone: 'TJM > 500€, carnet de commandes plein',
      },
      {
        phase: 3,
        name: 'Optimisation',
        duration: '6-12 mois',
        actions: [
          'Structure optimale (SASU, portage, ou étranger)',
          'Mix missions + produit (SaaS, formation)',
          'Clients internationaux (USD/CHF)',
          'Liberté géographique totale',
        ],
        milestone: 'Revenus > 100k€/an net, travail remote 100%',
      },
    ],
    risks: [
      'Instabilité entre missions',
      'Isolement professionnel',
      'Obsolescence compétences',
    ],
    successRate: 75,
  },
  {
    id: 'manual_trade_pivot',
    name: 'Reconversion Métier Manuel',
    description: 'Quitter le tertiaire pour un métier manuel pénurique, stable et bien payé',
    icon: '🔧',
    difficulty: 'moderate',
    timeframe: '2-4 ans',
    applicableFrom: ['STABILITY_REDIS', 'COMPETENCE_TRUST', 'GROWTH_RISK'],
    applicableTo: ['STABILITY_REDIS', 'COMPETENCE_TRUST'],
    requirements: [
      'Bonne condition physique',
      'Capacité à reprendre des études/formation',
      'Accepter baisse de revenus temporaire',
      'Intérêt réel pour le métier visé',
    ],
    steps: [
      {
        phase: 1,
        name: 'Exploration & Formation',
        duration: '6-18 mois',
        actions: [
          'Identifier métier pénurique (électricien, plombier, soudeur, menuisier)',
          'Stage découverte ou immersion',
          'Formation diplômante (CAP, BP) ou VAE',
          'Financement: CPF, OPCO, Pôle Emploi',
        ],
        milestone: 'Diplôme obtenu + première expérience',
        criticalRule: 'Choisir métier avec forte demande locale',
      },
      {
        phase: 2,
        name: 'Consolidation',
        duration: '1-2 ans',
        actions: [
          'Emploi salarié pour expérience terrain',
          'Construire réputation et réseau local',
          'Épargne pour équipement/véhicule',
          'Spécialisation rentable (pompes à chaleur, domotique, etc.)',
        ],
        milestone: 'Maîtrise technique + réseau clients',
      },
      {
        phase: 3,
        name: 'Installation Indépendant',
        duration: '1-2 ans',
        actions: [
          'Création entreprise (micro ou SARL)',
          'Marketing local (bouche-à-oreille, Google My Business)',
          'Recrutement apprenti si besoin',
          'Objectif: 60-100k€ CA annuel',
        ],
        milestone: 'Activité rentable + qualité de vie',
      },
    ],
    risks: [
      'Pénibilité physique long terme',
      'Marché local saturé',
      'Investissement matériel important',
    ],
    successRate: 70,
  },
];

// Engine functions

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
  age?: number;
}

export function findCompatibleKeys(context: UserContext): ExitKeyResult[] {
  const results: ExitKeyResult[] = [];

  for (const key of EXIT_KEYS) {
    // Check if the key applies to the user's current situation
    const fromMatch = key.applicableFrom.includes(context.currentCountry);
    const toMatch = key.applicableTo.some(to => isDesiredDestination(to, context.desiredLife));

    if (!fromMatch) continue;

    // Calculate compatibility score
    let compatibility = 50; // Base score

    // Adjust for destination match
    if (toMatch) compatibility += 20;

    // Adjust for risk tolerance
    if (key.difficulty === 'easy' && context.riskTolerance === 'low') compatibility += 10;
    if (key.difficulty === 'expert' && context.riskTolerance === 'high') compatibility += 10;
    if (key.difficulty === 'hard' && context.riskTolerance === 'low') compatibility -= 15;

    // Adjust for time horizon
    const keyDuration = parseTimeframe(key.timeframe);
    if (context.timeHorizon === 'short' && keyDuration > 5) compatibility -= 20;
    if (context.timeHorizon === 'long' && keyDuration > 5) compatibility += 10;

    // Adjust for resources
    if (context.hasCapital) compatibility += 10;
    if (context.hasCredentials) compatibility += 10;
    if (context.hasNetwork) compatibility += 5;

    // Adjust for motor profile fit
    compatibility += getMotorProfileFit(key.id, context.motorProfile);

    // Generate warnings
    const warnings: string[] = [];
    if (key.difficulty === 'hard' && !context.hasCapital) {
      warnings.push('Capital initial recommandé pour cette stratégie');
    }
    if (key.difficulty === 'expert' && context.riskTolerance === 'low') {
      warnings.push('Cette stratégie ne correspond pas à votre profil de risque');
    }
    if (context.hasFamily && ['digital_nomad_escape', 'resource_extraction_escape'].includes(key.id)) {
      warnings.push('Logistique familiale à considérer attentivement');
    }
    if (context.isLGBTQ) {
      warnings.push('Vérifier la sécurité LGBTQ+ dans les pays de destination');
    }

    // Generate accelerators
    const accelerators: string[] = [];
    if (context.hasCredentials) {
      accelerators.push('Vos credentials existants accélèrent la phase 1');
    }
    if (context.hasNetwork) {
      accelerators.push('Votre réseau peut réduire le temps de transition');
    }
    if (context.hasCapital) {
      accelerators.push('Votre capital permet de sauter certaines étapes d\'accumulation');
    }

    // Generate Plan B
    const planB = generatePlanB(key, context);

    // Personalize steps based on context
    const personalizedSteps = personalizeSteps(key.steps, context);

    results.push({
      key,
      compatibility: Math.min(100, Math.max(0, compatibility)),
      personalizedSteps,
      warnings,
      accelerators,
      planB,
    });
  }

  // Sort by compatibility
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
    content_creator_path: ['NOMAD', 'PURPOSE', 'BUILDER'],
    real_estate_investor: ['SAFE_WEALTH', 'BUILDER', 'STATUS'],
    freelance_tech: ['NOMAD', 'BUILDER', 'SAFE_WEALTH'],
    manual_trade_pivot: ['BUILDER', 'RECOVERY', 'SAFE_WEALTH'],
  };

  const keyFits = fits[keyId] || [];
  if (keyFits.includes(profile)) return 15;
  return 0;
}

function generatePlanB(key: ExitKey, context: UserContext): string {
  const planBs: Record<string, string> = {
    medical_ch_trajectory: 'Si blocage MEBEKO: orienter vers autres pays COMPETENCE_TRUST (Allemagne, Pays-Bas) ou rester en France avec optimisation fiscale frontalière.',
    digital_nomad_escape: 'Si revenus insuffisants: maintenir emploi partiel en remote, viser 50% nomade d\'abord avant transition complète.',
    corporate_ladder_jump: 'Si entrepreneuriat échoue: retour corporate avec expérience enrichie, ou pivot vers consulting/freelance.',
    education_arbitrage: 'Si marché emploi difficile: stage prolongé, pivot vers autre pays EU, ou retour pays d\'origine avec credentials internationales.',
    diaspora_leverage: 'Si activité pont échoue: capitaliser sur réseau biculturel pour emploi corporate international.',
    resource_extraction_escape: 'Si sortie bloquée: optimisation interne maximale + préparation longue échéance.',
    content_creator_path: 'Si audience stagne: pivoter vers niche adjacente, ou utiliser skills acquis pour agence/consulting marketing.',
    real_estate_investor: 'Si marché se retourne: conserver les biens, attendre le cycle, ou revendre pour réinvestir ailleurs.',
    freelance_tech: 'Si missions rares: retour salariat partiel, formation nouvelles technos, ou pivot vers produit (SaaS).',
    manual_trade_pivot: 'Si marché saturé: mobilité géographique vers zone pénurique, ou spécialisation haute valeur ajoutée.',
  };
  return planBs[key.id] || 'Maintenir options ouvertes et adapter la stratégie selon évolution.';
}

function personalizeSteps(steps: ExitKeyStep[], context: UserContext): ExitKeyStep[] {
  return steps.map(step => {
    const personalizedActions = [...step.actions];
    
    // Add context-specific actions
    if (context.hasFamily && step.phase === 1) {
      personalizedActions.push('Planifier logistique familiale pour chaque phase');
    }
    if (context.isLGBTQ) {
      personalizedActions.push('Vérifier environnement LGBTQ+ des destinations envisagées');
    }
    if (context.hasCapital && step.phase === 1) {
      personalizedActions.push('Optimiser placement capital pendant phase d\'accumulation');
    }

    return {
      ...step,
      actions: personalizedActions,
    };
  });
}

// Get the optimal key for a specific context
export function getOptimalKey(context: UserContext): ExitKeyResult | null {
  const keys = findCompatibleKeys(context);
  return keys.length > 0 ? keys[0] : null;
}

// Get country-specific playbook
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
