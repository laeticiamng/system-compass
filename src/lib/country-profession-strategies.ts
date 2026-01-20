/**
 * COUNTRY + PROFESSION SPECIFIC STRATEGIES
 * 
 * Ultra-detailed strategies for each profession in each country
 * Real steps, real procedures, real timelines
 */

export interface CountryProfessionStrategy {
  countryId: string;
  professionCategory: string;
  professionIds?: string[];  // Specific professions, empty = all in category
  steps: {
    phase: number;
    name: string;
    duration: string;
    actions: string[];
    documents?: string[];
    costs?: string;
    criticalRule?: string;
    authority?: string;
    milestone?: string;
  }[];
  keyResources: { name: string; url?: string; type: 'official' | 'community' | 'tool' }[];
  warnings: string[];
  accelerators: string[];
  successMetric: string;
  planB: string;
  estimatedTimeTotal: string;
  difficultyLevel: 'accessible' | 'medium' | 'high' | 'expert';
}

export const COUNTRY_PROFESSION_STRATEGIES: CountryProfessionStrategy[] = [
  // =============== SWITZERLAND ===============
  {
    countryId: 'switzerland',
    professionCategory: 'healthcare',
    professionIds: ['doctor', 'dentist'],
    steps: [
      {
        phase: 1,
        name: 'Reconnaissance MEBEKO',
        duration: '6-18 mois',
        actions: [
          'Constituer dossier MEBEKO (diplômes, attestations)',
          'Demander traductions assermentées des diplômes',
          'Obtenir attestation d\'inscription à l\'Ordre en France',
          'Soumettre dossier à la Commission MEBEKO',
          'Répondre aux demandes complémentaires',
        ],
        documents: ['Diplôme de médecine', 'Attestation d\'internat', 'Certificat de bonne conduite', 'Traductions assermentées'],
        costs: '500-1000 CHF de frais',
        authority: 'MEBEKO (Commission des professions médicales)',
        criticalRule: 'Anticiper de 12-18 mois avant départ prévu',
      },
      {
        phase: 2,
        name: 'Permis de travail',
        duration: '2-4 mois',
        actions: [
          'Obtenir une offre d\'emploi d\'un hôpital suisse',
          'L\'employeur demande le permis de travail (permis B)',
          'Attendre validation cantonale',
          'Obtenir autorisation de pratiquer cantonale',
        ],
        documents: ['Contrat de travail', 'Validation MEBEKO', 'Assurance responsabilité civile professionnelle'],
        authority: 'Canton de résidence',
      },
      {
        phase: 3,
        name: 'Phase hospitalière (accumulation)',
        duration: '2-3 ans',
        actions: [
          'Poste hospitalier en Suisse romande ou alémanique',
          'Épargner 50-60% du salaire net (possible car salaires élevés)',
          'Maximiser cotisations LPP (2ème pilier)',
          'Ouvrir et maximiser pilier 3a (épargne défiscalisée)',
          'Racheter années LPP manquantes',
        ],
        costs: 'Salaire médecin hospitalier: 150-250k CHF/an',
        criticalRule: 'Année 1 = adaptation pure, pas de risques',
      },
      {
        phase: 4,
        name: 'Installation libérale',
        duration: '2-5 ans',
        actions: [
          'Obtenir numéro RCC (facturation assurance)',
          'Trouver cabinet à reprendre ou créer',
          'Négocier conventions avec assurances',
          'Développer patientèle (mix conventionné + privé)',
          'Optimiser structure juridique (Sàrl médicale)',
        ],
        costs: 'Investissement cabinet: 200-500k CHF',
        milestone: 'Revenus > 300k CHF/an + patrimoine > 1M CHF',
      },
    ],
    keyResources: [
      { name: 'MEBEKO', url: 'https://www.bag.admin.ch/mebeko', type: 'official' },
      { name: 'FMH (Fédération des médecins suisses)', type: 'official' },
      { name: 'Groupes Facebook médecins français en Suisse', type: 'community' },
    ],
    warnings: [
      'MEBEKO peut refuser ou demander des formations complémentaires',
      'Certains cantons limitent l\'installation en libéral',
      'Coût de vie élevé (Genève, Zurich surtout)',
      'Langue allemande requise pour Suisse alémanique',
    ],
    accelerators: [
      'Spécialités en pénurie (psychiatrie, gériatrie) = process facilité',
      'Expérience hospitalière française reconnue',
      'Nationalité UE = pas de quota',
    ],
    successMetric: 'Patrimoine > 1M€ en 10 ans',
    planB: 'Si MEBEKO bloqué: Allemagne, Luxembourg, ou Belgique (procédures plus simples)',
    estimatedTimeTotal: '7-10 ans pour objectif patrimonial',
    difficultyLevel: 'high',
  },
  {
    countryId: 'switzerland',
    professionCategory: 'healthcare',
    professionIds: ['nurse', 'physiotherapist'],
    steps: [
      {
        phase: 1,
        name: 'Reconnaissance diplôme CRS',
        duration: '3-6 mois',
        actions: [
          'Demander reconnaissance auprès de la Croix-Rouge Suisse (CRS)',
          'Fournir diplômes traduits',
          'Obtenir attestation de niveau équivalent',
        ],
        authority: 'Croix-Rouge Suisse',
        costs: '200-400 CHF',
      },
      {
        phase: 2,
        name: 'Emploi et permis',
        duration: '1-3 mois',
        actions: [
          'Postuler dans hôpitaux/cliniques suisses',
          'L\'employeur gère le permis B',
          'S\'installer (colocation recommandée au début)',
        ],
      },
      {
        phase: 3,
        name: 'Évolution de carrière',
        duration: '2-5 ans',
        actions: [
          'Spécialisation (soins intensifs, etc.)',
          'Postes de cadre (chef d\'équipe)',
          'Passage en clinique privée (salaires plus élevés)',
        ],
        milestone: 'Salaire > 100k CHF/an',
      },
    ],
    keyResources: [
      { name: 'Croix-Rouge Suisse - Reconnaissance', type: 'official' },
      { name: 'ASI (Association suisse des infirmières)', type: 'official' },
    ],
    warnings: ['Salaires moins impressionnants que médecins mais toujours supérieurs à France'],
    accelerators: ['Pénurie majeure = embauche rapide'],
    successMetric: 'Salaire 2x France + épargne significative',
    planB: 'Belgique, Luxembourg (francophones, demande forte)',
    estimatedTimeTotal: '3-5 ans',
    difficultyLevel: 'medium',
  },
  {
    countryId: 'switzerland',
    professionCategory: 'tech',
    steps: [
      {
        phase: 1,
        name: 'Recherche d\'emploi',
        duration: '1-3 mois',
        actions: [
          'Optimiser profil LinkedIn (English + German)',
          'Postuler grandes entreprises (Google Zurich, UBS, Credit Suisse tech)',
          'Viser startups suisses (Crypto Valley à Zug)',
          'Préparer entretiens techniques en anglais',
        ],
      },
      {
        phase: 2,
        name: 'Installation',
        duration: '1-2 mois',
        actions: [
          'Permis B via employeur',
          'Trouver logement (difficile et cher)',
          'Ouvrir compte bancaire suisse',
          'S\'inscrire à la commune',
        ],
        costs: 'Loyer Zurich: 2000-3500 CHF/mois pour studio',
      },
      {
        phase: 3,
        name: 'Optimisation',
        duration: '2-5 ans',
        actions: [
          'Monter en grade (Staff, Principal)',
          'Négocier equity/stock options',
          'Maximiser pilier 3a',
          'Évaluer passage freelance (TJM 1200-2000 CHF)',
        ],
        milestone: 'Salaire > 200k CHF + stock options',
      },
    ],
    keyResources: [
      { name: 'jobs.ch', type: 'tool' },
      { name: 'SwissDevJobs', type: 'community' },
      { name: 'Crypto Valley Association', type: 'community' },
    ],
    warnings: [
      'Coût de vie très élevé (Zurich, Genève)',
      'Allemand utile pour intégration long terme',
      'Marché immobilier très tendu',
    ],
    accelerators: [
      'Expérience FAANG = très recherché',
      'Spécialités ML/AI, blockchain = premium',
      'Anglais courant suffit pour la tech',
    ],
    successMetric: 'Total comp > 200k CHF en 3-5 ans',
    planB: 'Allemagne (Berlin, Munich) si marché suisse trop compétitif',
    estimatedTimeTotal: '3-5 ans',
    difficultyLevel: 'medium',
  },
  
  // =============== GERMANY ===============
  {
    countryId: 'germany',
    professionCategory: 'healthcare',
    professionIds: ['doctor'],
    steps: [
      {
        phase: 1,
        name: 'Reconnaissance Approbation',
        duration: '3-12 mois',
        actions: [
          'Demander Approbation (équivalence diplôme) au Land',
          'Fournir diplômes traduits et apostillés',
          'Passer test de langue (B2/C1 allemand requis)',
          'Fachsprachprüfung (examen langue médicale)',
        ],
        documents: ['Diplôme médecine', 'B2/C1 allemand', 'Casier judiciaire'],
        authority: 'Regierungspräsidium du Land',
      },
      {
        phase: 2,
        name: 'Premier emploi',
        duration: '1-3 mois',
        actions: [
          'Postuler dans hôpitaux (pénurie énorme)',
          'Négocier contrat (Tarifvertrag ou hors convention)',
          'Obtenir visa si non-UE',
        ],
        costs: 'Salaire assistant: 60-70k€/an',
      },
      {
        phase: 3,
        name: 'Facharzt et installation',
        duration: '4-6 ans',
        actions: [
          'Compléter spécialisation si nécessaire',
          'Obtenir titre Facharzt',
          'Installation en cabinet (Niederlassung)',
        ],
        milestone: 'Facharzt + cabinet = 150-300k€/an',
      },
    ],
    keyResources: [
      { name: 'Anerkennung in Deutschland', type: 'official' },
      { name: 'Marburger Bund (syndicat médecins)', type: 'official' },
    ],
    warnings: ['Allemand B2 minimum obligatoire', 'Process varie selon Land'],
    accelerators: ['Pénurie majeure = embauche rapide', 'UE = process simplifié'],
    successMetric: 'Facharzt installé en 5-8 ans',
    planB: 'Autriche (procédure similaire, langue identique)',
    estimatedTimeTotal: '5-10 ans',
    difficultyLevel: 'high',
  },
  {
    countryId: 'germany',
    professionCategory: 'tech',
    steps: [
      {
        phase: 1,
        name: 'Recherche Berlin/Munich',
        duration: '1-2 mois',
        actions: [
          'Cibler Berlin (startups) ou Munich (entreprises)',
          'LinkedIn, StepStone, Indeed Germany',
          'Entretiens en anglais (tech = anglophone)',
        ],
      },
      {
        phase: 2,
        name: 'Installation',
        duration: '1 mois',
        actions: [
          'Anmeldung (enregistrement mairie)',
          'Compte bancaire N26 ou traditionnel',
          'Trouver appartement (très difficile à Berlin)',
        ],
      },
      {
        phase: 3,
        name: 'Croissance',
        duration: '2-4 ans',
        actions: [
          'Négocier augmentations (marché très demandeur)',
          'Évaluer freelance (Freiberufler)',
          'Optimiser fiscalité (plus lourde qu\'en Suisse)',
        ],
      },
    ],
    keyResources: [
      { name: 'Berlin Startup Jobs', type: 'community' },
      { name: 'StepStone', type: 'tool' },
    ],
    warnings: ['Fiscalité lourde (42%+ sur hauts revenus)', 'Marché immobilier Berlin catastrophique'],
    accelerators: ['Anglais suffit dans la tech', 'Visa Blue Card pour non-UE'],
    successMetric: 'Salaire > 80k€ en 2-3 ans',
    planB: 'Pays-Bas, Suisse si fiscalité trop lourde',
    estimatedTimeTotal: '2-5 ans',
    difficultyLevel: 'accessible',
  },

  // =============== CANADA ===============
  {
    countryId: 'canada',
    professionCategory: 'tech',
    steps: [
      {
        phase: 1,
        name: 'Entrée express ou LMIA',
        duration: '6-18 mois',
        actions: [
          'Calculer points CRS (Entrée express)',
          'Améliorer anglais (IELTS 7+) ou français (TEF)',
          'Obtenir ECA (équivalence diplôme)',
          'Créer profil Entrée express ou trouver employeur (LMIA)',
        ],
        documents: ['IELTS/TEF', 'ECA', 'Preuve de fonds'],
        authority: 'IRCC (Immigration Canada)',
      },
      {
        phase: 2,
        name: 'Résidence permanente',
        duration: '6-12 mois',
        actions: [
          'Recevoir ITA (Invitation to Apply)',
          'Soumettre dossier complet',
          'Examens médicaux et sécurité',
          'Recevoir COPR et visa RP',
        ],
      },
      {
        phase: 3,
        name: 'Installation et citoyenneté',
        duration: '3-5 ans',
        actions: [
          'Trouver emploi tech (Toronto, Vancouver, Montreal)',
          'Accumuler 3 ans de résidence',
          'Demander citoyenneté canadienne',
        ],
        milestone: 'Citoyenneté + salaire USD-indexé',
      },
    ],
    keyResources: [
      { name: 'canada.ca/immigration', type: 'official' },
      { name: 'CanadaVisa.com', type: 'community' },
    ],
    warnings: ['Process long (1-2 ans)', 'Coût de vie élevé (Toronto, Vancouver)', 'Hiver rigoureux'],
    accelerators: ['Français = bonus Québec', 'Tech = très demandé', 'PVT Canada pour test'],
    successMetric: 'Citoyenneté + salaire > 100k CAD',
    planB: 'USA avec TN visa (pour citoyens canadiens)',
    estimatedTimeTotal: '3-5 ans jusqu\'à citoyenneté',
    difficultyLevel: 'medium',
  },
  {
    countryId: 'canada',
    professionCategory: 'healthcare',
    professionIds: ['nurse'],
    steps: [
      {
        phase: 1,
        name: 'Évaluation NNAS',
        duration: '6-12 mois',
        actions: [
          'Demander évaluation NNAS (National Nursing Assessment Service)',
          'Fournir diplômes, transcripts, preuve d\'expérience',
          'Obtenir rapport NNAS',
        ],
        authority: 'NNAS + College of Nurses provincial',
      },
      {
        phase: 2,
        name: 'Inscription provinciale',
        duration: '3-6 mois',
        actions: [
          'Soumettre dossier au College of Nurses de la province',
          'Passer NCLEX-RN si requis',
          'Obtenir licence d\'exercice',
        ],
      },
      {
        phase: 3,
        name: 'Immigration et emploi',
        duration: '6-18 mois',
        actions: [
          'Entrée express (points bonus santé)',
          'Ou PNP (Programme Nominé Provincial) santé',
          'Emploi garanti vu pénurie',
        ],
      },
    ],
    keyResources: [
      { name: 'NNAS', type: 'official' },
      { name: 'College of Nurses Ontario', type: 'official' },
    ],
    warnings: ['Process long', 'NCLEX-RN requis dans certaines provinces'],
    accelerators: ['Pénurie majeure = voies accélérées', 'Français = atout Québec/Nouveau-Brunswick'],
    successMetric: 'RP + emploi stable en 2-3 ans',
    planB: 'Australie (process similaire, climat meilleur)',
    estimatedTimeTotal: '2-3 ans',
    difficultyLevel: 'medium',
  },

  // =============== PORTUGAL ===============
  {
    countryId: 'portugal',
    professionCategory: 'tech',
    steps: [
      {
        phase: 1,
        name: 'Visa D7 ou Digital Nomad',
        duration: '2-4 mois',
        actions: [
          'D7: Prouver revenus passifs (760€/mois min)',
          'Digital Nomad Visa: Prouver revenus remote (3040€/mois)',
          'Demander visa au consulat',
          'NIF (numéro fiscal) via procuration',
        ],
        documents: ['Preuves de revenus', 'Assurance santé', 'Casier judiciaire'],
      },
      {
        phase: 2,
        name: 'Installation et résidence',
        duration: '1-3 mois',
        actions: [
          'Arriver au Portugal avec visa',
          'Demander titre de séjour (SEF/AIMA)',
          'Ouvrir compte bancaire',
          'Trouver logement (Lisbonne cher, Porto + abordable)',
        ],
      },
      {
        phase: 3,
        name: 'Optimisation et citoyenneté',
        duration: '5 ans',
        actions: [
          'Renouveler résidence chaque année',
          'Après 5 ans: demander citoyenneté (test A2 portugais)',
          'Passeport UE = accès monde entier',
        ],
        milestone: 'Passeport portugais en 5 ans',
      },
    ],
    keyResources: [
      { name: 'SEF/AIMA Portugal', type: 'official' },
      { name: 'Nomad Gate', type: 'community' },
    ],
    warnings: ['Bureaucratie lente', 'Marché immobilier Lisbonne surchauffé', 'NHR fiscal supprimé'],
    accelerators: ['Francophone = portugais plus facile', 'Coût de vie bas hors Lisbonne', 'Communauté nomade active'],
    successMetric: 'Citoyenneté UE + qualité de vie',
    planB: 'Espagne (visa similaire, plus grand marché)',
    estimatedTimeTotal: '5-6 ans jusqu\'à citoyenneté',
    difficultyLevel: 'accessible',
  },

  // =============== UAE / DUBAI ===============
  {
    countryId: 'uae',
    professionCategory: 'tech',
    steps: [
      {
        phase: 1,
        name: 'Visa de travail ou Freelance',
        duration: '1-2 semaines',
        actions: [
          'Option 1: Offre d\'emploi = visa employeur',
          'Option 2: Freelance visa (free zone comme DMCC)',
          'Option 3: Golden Visa (investissement ou compétences)',
        ],
        costs: 'Freelance visa: 10-20k AED/an',
      },
      {
        phase: 2,
        name: 'Installation',
        duration: '1-2 semaines',
        actions: [
          'Emirates ID',
          'Compte bancaire (rapide avec visa)',
          'Logement (cher mais disponible)',
          'Assurance santé (obligatoire)',
        ],
      },
      {
        phase: 3,
        name: 'Optimisation fiscale',
        duration: 'ongoing',
        actions: [
          '0% impôt sur le revenu',
          'Structurer activité en free zone',
          'Attention: éviter résidence fiscale France (183 jours)',
        ],
        milestone: 'Revenus nets maximisés',
      },
    ],
    keyResources: [
      { name: 'DMCC Free Zone', type: 'official' },
      { name: 'Dubai Chamber', type: 'official' },
    ],
    warnings: ['Pas de protection sociale', 'Été très chaud', 'Coût de vie élevé', 'Culture différente'],
    accelerators: ['0% impôt', 'Process ultra-rapide', 'Hub business international'],
    successMetric: 'Revenus nets doublés vs France',
    planB: 'Singapour (plus stable, plus cher)',
    estimatedTimeTotal: '1-2 mois pour être opérationnel',
    difficultyLevel: 'accessible',
  },

  // =============== SINGAPORE ===============
  {
    countryId: 'singapore',
    professionCategory: 'finance',
    steps: [
      {
        phase: 1,
        name: 'Employment Pass',
        duration: '1-3 mois',
        actions: [
          'Obtenir offre d\'emploi (salaire min 5000 SGD)',
          'Employeur demande EP (Employment Pass)',
          'Fournir diplômes et expérience',
        ],
        authority: 'MOM (Ministry of Manpower)',
      },
      {
        phase: 2,
        name: 'Installation',
        duration: '1 mois',
        actions: [
          'SingPass (identité numérique)',
          'Compte bancaire',
          'Logement (très cher)',
          'CPF (équivalent retraite)',
        ],
        costs: 'Loyer: 2000-4000 SGD/mois',
      },
      {
        phase: 3,
        name: 'PR et long terme',
        duration: '2-5 ans',
        actions: [
          'Demander PR après 2 ans',
          'PR = accès CPF, HDB (logement subventionné)',
          'Citoyenneté possible après',
        ],
      },
    ],
    keyResources: [
      { name: 'MOM Singapore', type: 'official' },
      { name: 'SingPass', type: 'official' },
    ],
    warnings: ['Coût de vie très élevé', 'Process EP durci récemment', 'Climat tropical humide'],
    accelerators: ['Hub financier mondial', 'Fiscalité avantageuse (0-22%)', 'Anglais = langue de travail'],
    successMetric: 'PR + salaire > 150k SGD',
    planB: 'Hong Kong (similaire, situation politique incertaine)',
    estimatedTimeTotal: '3-5 ans jusqu\'à PR',
    difficultyLevel: 'medium',
  },
];

// Find strategy for a specific country + profession combination
export function findStrategy(countryId: string, professionId: string, professionCategory: string): CountryProfessionStrategy | null {
  // First look for profession-specific strategy
  const specificStrategy = COUNTRY_PROFESSION_STRATEGIES.find(s => 
    s.countryId === countryId && 
    s.professionIds?.includes(professionId)
  );
  if (specificStrategy) return specificStrategy;

  // Then look for category-wide strategy
  const categoryStrategy = COUNTRY_PROFESSION_STRATEGIES.find(s => 
    s.countryId === countryId && 
    s.professionCategory === professionCategory &&
    !s.professionIds
  );
  if (categoryStrategy) return categoryStrategy;

  // Finally any strategy for this country
  return COUNTRY_PROFESSION_STRATEGIES.find(s => 
    s.countryId === countryId && 
    s.professionCategory === professionCategory
  ) || null;
}

// Get all strategies for a country
export function getCountryStrategies(countryId: string): CountryProfessionStrategy[] {
  return COUNTRY_PROFESSION_STRATEGIES.filter(s => s.countryId === countryId);
}
