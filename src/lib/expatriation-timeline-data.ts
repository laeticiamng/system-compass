/**
 * EXPATRIATION TIMELINE DATA - Module Irreversa Enhancement
 *
 * Donnees de jalons et phases pour le parcours d'expatriation complet.
 * Chaque jalon inclut des indicateurs de reversibilite, des checklists,
 * et des references aux cles de sortie associees.
 *
 * Contenu integralement en francais.
 */

// =============================================================================
// INTERFACES
// =============================================================================

export interface ExpatMilestone {
  id: string;
  phase: 'preparation' | 'transition' | 'installation' | 'integration' | 'establishment';
  order: number;
  title: string;
  description: string;
  isReversible: boolean;
  reversibilityNote: string;
  criticalLevel: 'low' | 'medium' | 'high' | 'critical';
  typicalTimeframe: string;
  checklist: { id: string; label: string; critical: boolean }[];
  warnings: string[];
  relatedExitKeys: string[];
}

export interface ExpatPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  milestones: ExpatMilestone[];
}

export interface ReversibilityChecklist {
  milestoneId: string;
  items: {
    id: string;
    label: string;
    reversible: boolean;
    costToReverse: 'none' | 'low' | 'medium' | 'high' | 'impossible';
    timeToReverse: string;
  }[];
}

// =============================================================================
// PHASE 1 : PREPARATION (6-12 mois avant le depart)
// =============================================================================

const preparationMilestones: ExpatMilestone[] = [
  {
    id: 'prep-research-destination',
    phase: 'preparation',
    order: 1,
    title: 'Recherche approfondie du pays de destination',
    description:
      'Analyse comparative des pays cibles : fiscalite, cout de la vie, marche de l\'emploi, qualite de vie, systeme de sante, education. Visite exploratoire recommandee.',
    isReversible: true,
    reversibilityNote:
      'Phase purement informationnelle, aucun engagement. Peut etre abandonnee a tout moment sans consequence.',
    criticalLevel: 'medium',
    typicalTimeframe: '2-4 mois',
    checklist: [
      { id: 'prep-r-1', label: 'Etablir une liste de 3-5 pays candidats', critical: false },
      { id: 'prep-r-2', label: 'Analyser la fiscalite de chaque pays (imposition des revenus, patrimoine, plus-values)', critical: true },
      { id: 'prep-r-3', label: 'Etudier le marche de l\'emploi dans son secteur', critical: true },
      { id: 'prep-r-4', label: 'Evaluer le cout de la vie reel (logement, alimentation, transports)', critical: true },
      { id: 'prep-r-5', label: 'Effectuer au moins une visite exploratoire de 1-2 semaines', critical: false },
      { id: 'prep-r-6', label: 'Verifier les conditions d\'obtention de visa / permis de travail', critical: true },
    ],
    warnings: [
      'Ne pas se fier uniquement aux classements en ligne : chaque situation est unique.',
      'Les conditions fiscales peuvent changer rapidement (consulter un fiscaliste specialise).',
      'Prendre en compte la barriere linguistique reelle, pas seulement le niveau "touristique".',
    ],
    relatedExitKeys: ['portugal_nomad', 'uae_golden_visa', 'digital_nomad_escape', 'medical_ch_trajectory'],
  },
  {
    id: 'prep-financial-audit',
    phase: 'preparation',
    order: 2,
    title: 'Audit financier et patrimonial complet',
    description:
      'Bilan exhaustif de la situation financiere : patrimoine immobilier, epargne, dettes, contrats en cours, droits a retraite, assurances. Identification des actifs a transferer ou liquider.',
    isReversible: true,
    reversibilityNote:
      'Exercice d\'analyse sans engagement. Utile meme sans expatriation pour une meilleure gestion patrimoniale.',
    criticalLevel: 'high',
    typicalTimeframe: '1-2 mois',
    checklist: [
      { id: 'prep-f-1', label: 'Lister tous les comptes bancaires et placements', critical: true },
      { id: 'prep-f-2', label: 'Evaluer le patrimoine immobilier (valeur marche, encours credit)', critical: true },
      { id: 'prep-f-3', label: 'Recenser les contrats d\'assurance vie, PEA, PER', critical: true },
      { id: 'prep-f-4', label: 'Calculer les droits a retraite acquis (releve de carriere CNAV)', critical: true },
      { id: 'prep-f-5', label: 'Identifier les dettes et engagements financiers en cours', critical: true },
      { id: 'prep-f-6', label: 'Consulter un conseiller fiscal specialise en expatriation', critical: true },
      { id: 'prep-f-7', label: 'Estimer le budget de transition (6-12 mois de tresorerie)', critical: true },
    ],
    warnings: [
      'L\'exit tax peut s\'appliquer si le patrimoine depasse certains seuils (750 000 EUR en valeurs mobilieres).',
      'Certains placements (PEA, PEL) peuvent etre clotures ou geles lors du changement de residence fiscale.',
      'Les conventions fiscales bilaterales sont complexes : ne jamais agir sans conseil professionnel.',
    ],
    relatedExitKeys: ['real_estate_investor', 'freelance_tech', 'corporate_ladder_jump'],
  },
  {
    id: 'prep-admin-documents',
    phase: 'preparation',
    order: 3,
    title: 'Preparation administrative et documentaire',
    description:
      'Rassemblement et mise a jour de tous les documents officiels necessaires : passeport, actes d\'etat civil, diplomes, casier judiciaire, permis de conduire. Apostilles et traductions assermentees.',
    isReversible: true,
    reversibilityNote:
      'Documents preparatoires sans consequence. Avoir des documents a jour est utile dans tous les cas.',
    criticalLevel: 'medium',
    typicalTimeframe: '2-3 mois',
    checklist: [
      { id: 'prep-a-1', label: 'Verifier la validite du passeport (minimum 6 mois apres la date prevue d\'entree)', critical: true },
      { id: 'prep-a-2', label: 'Obtenir des copies certifiees des actes de naissance et mariage', critical: true },
      { id: 'prep-a-3', label: 'Faire apostiller les diplomes et documents officiels', critical: false },
      { id: 'prep-a-4', label: 'Commander un extrait de casier judiciaire (bulletin n.3)', critical: true },
      { id: 'prep-a-5', label: 'Faire traduire les documents necessaires par un traducteur assermente', critical: false },
      { id: 'prep-a-6', label: 'Verifier la validite du permis de conduire a l\'international', critical: false },
    ],
    warnings: [
      'Les delais d\'apostille peuvent atteindre plusieurs semaines selon les juridictions.',
      'Certains pays exigent des traductions datant de moins de 3 mois.',
      'Le renouvellement de passeport peut prendre 4-6 semaines en periode de pointe.',
    ],
    relatedExitKeys: ['portugal_nomad', 'uae_golden_visa', 'medical_de_trajectory'],
  },
  {
    id: 'prep-professional-strategy',
    phase: 'preparation',
    order: 4,
    title: 'Strategie professionnelle et positionnement',
    description:
      'Definition de la strategie professionnelle dans le pays de destination : recherche d\'emploi, creation d\'entreprise, transfert interne, freelance. Adaptation du CV, activation du reseau.',
    isReversible: true,
    reversibilityNote:
      'Demarches de prospection sans engagement contractuel. Le reseau construit reste un actif meme sans depart.',
    criticalLevel: 'high',
    typicalTimeframe: '3-6 mois',
    checklist: [
      { id: 'prep-p-1', label: 'Definir le statut professionnel cible (salarie, independant, entrepreneur)', critical: true },
      { id: 'prep-p-2', label: 'Adapter le CV et profil LinkedIn aux normes du pays cible', critical: false },
      { id: 'prep-p-3', label: 'Identifier et contacter les recruteurs specialises dans le pays', critical: false },
      { id: 'prep-p-4', label: 'Etudier les equivalences de diplomes et certifications requises', critical: true },
      { id: 'prep-p-5', label: 'Activer le reseau professionnel dans le pays de destination', critical: false },
    ],
    warnings: [
      'Les equivalences de diplomes peuvent necessiter des formations complementaires couteuses.',
      'Certaines professions reglementees exigent un examen d\'Etat dans le pays d\'accueil.',
      'Ne pas sous-estimer le temps necessaire pour trouver un emploi qualifie a l\'etranger (3-9 mois).',
    ],
    relatedExitKeys: ['corporate_ladder_jump', 'freelance_tech', 'tech_canada_trajectory', 'education_arbitrage'],
  },
];

// =============================================================================
// PHASE 2 : TRANSITION (3-6 mois avant le depart)
// =============================================================================

const transitionMilestones: ExpatMilestone[] = [
  {
    id: 'trans-resignation-contract',
    phase: 'transition',
    order: 1,
    title: 'Demission ou rupture conventionnelle',
    description:
      'Formalisation de la fin du contrat de travail : negociation d\'une rupture conventionnelle, demission avec preavis, ou mobilite internationale interne. Calcul des indemnites et droits au chomage.',
    isReversible: false,
    reversibilityNote:
      'Une demission posee est definitive. Une rupture conventionnelle signee est irreversible apres le delai de retractation de 15 jours calendaires.',
    criticalLevel: 'critical',
    typicalTimeframe: '1-3 mois (preavis inclus)',
    checklist: [
      { id: 'trans-r-1', label: 'Explorer la possibilite d\'une rupture conventionnelle avant de demissionner', critical: true },
      { id: 'trans-r-2', label: 'Calculer les indemnites de depart (conges, anciennete, bonus)', critical: true },
      { id: 'trans-r-3', label: 'Verifier les droits au chomage (portabilite internationale limitee)', critical: true },
      { id: 'trans-r-4', label: 'Negocier la duree de preavis si necessaire', critical: false },
      { id: 'trans-r-5', label: 'Obtenir les documents de fin de contrat (certificat de travail, attestation Pole Emploi, solde de tout compte)', critical: true },
    ],
    warnings: [
      'La demission ne donne generalement pas droit au chomage sauf cas specifiques (suivi de conjoint, projet de reconversion valide).',
      'La clause de non-concurrence peut limiter les possibilites professionnelles a l\'etranger.',
      'Verifier le delai de retractation de 15 jours pour la rupture conventionnelle.',
    ],
    relatedExitKeys: ['corporate_ladder_jump', 'freelance_tech'],
  },
  {
    id: 'trans-housing-disposal',
    phase: 'transition',
    order: 2,
    title: 'Gestion du logement actuel (vente ou mise en location)',
    description:
      'Decision strategique concernant le bien immobilier : vente pour liberer du capital, mise en location pour conserver un revenu, ou resiliation du bail locatif. Chaque option a des implications fiscales majeures.',
    isReversible: false,
    reversibilityNote:
      'La vente est irreversible. La mise en location est reversible mais avec des delais (preavis locataire). La resiliation de bail fait perdre le logement definitivement.',
    criticalLevel: 'critical',
    typicalTimeframe: '2-6 mois',
    checklist: [
      { id: 'trans-h-1', label: 'Evaluer le bien immobilier (estimation par 2-3 agences)', critical: true },
      { id: 'trans-h-2', label: 'Comparer les scenarios : vente vs. mise en location (simulation fiscale)', critical: true },
      { id: 'trans-h-3', label: 'Si location : choisir un gestionnaire locatif et fixer le loyer', critical: false },
      { id: 'trans-h-4', label: 'Si vente : mandater une agence et fixer un prix realiste', critical: false },
      { id: 'trans-h-5', label: 'Si locataire : donner le preavis dans les delais legaux (1 ou 3 mois)', critical: true },
      { id: 'trans-h-6', label: 'Organiser le demenagement et le stockage des affaires', critical: false },
    ],
    warnings: [
      'La vente de la residence principale est exoneree de plus-value si elle intervient avant le depart fiscal.',
      'En tant que non-resident, les revenus locatifs francais restent imposables en France.',
      'La gestion locative a distance necessite un mandataire fiable (compter 7-10% du loyer en frais).',
    ],
    relatedExitKeys: ['real_estate_investor'],
  },
  {
    id: 'trans-visa-application',
    phase: 'transition',
    order: 3,
    title: 'Demande de visa et permis de sejour',
    description:
      'Depot officiel de la demande de visa ou permis de sejour aupres du consulat ou de l\'administration du pays de destination. Constitution du dossier complet selon les exigences specifiques.',
    isReversible: true,
    reversibilityNote:
      'La demande peut etre retiree ou abandonnee avant la delivrance. Les frais de dossier ne sont generalement pas remboursables.',
    criticalLevel: 'critical',
    typicalTimeframe: '1-4 mois',
    checklist: [
      { id: 'trans-v-1', label: 'Identifier le type de visa adapte (travail, entrepreneur, investisseur, regroupement familial)', critical: true },
      { id: 'trans-v-2', label: 'Constituer le dossier complet avec toutes les pieces justificatives', critical: true },
      { id: 'trans-v-3', label: 'Prendre rendez-vous au consulat ou deposer en ligne', critical: true },
      { id: 'trans-v-4', label: 'Preparer les preuves de ressources financieres suffisantes', critical: true },
      { id: 'trans-v-5', label: 'Prevoir un plan B en cas de refus (autre type de visa, autre pays)', critical: false },
    ],
    warnings: [
      'Les delais de traitement varient enormement selon les pays (2 semaines a 6 mois).',
      'Un refus de visa peut impacter les demandes futures dans certains pays.',
      'Certains visas exigent une offre d\'emploi ferme ou un investissement minimum.',
    ],
    relatedExitKeys: ['portugal_nomad', 'uae_golden_visa', 'tech_canada_trajectory', 'medical_ch_trajectory'],
  },
  {
    id: 'trans-health-coverage',
    phase: 'transition',
    order: 4,
    title: 'Organisation de la couverture sante',
    description:
      'Transition de la couverture sante : radiation de la Securite sociale, souscription d\'une assurance internationale ou affiliation au systeme du pays d\'accueil. Periode de carence a anticiper.',
    isReversible: true,
    reversibilityNote:
      'La reaffiliation a la Securite sociale francaise est possible au retour, mais avec un delai de carence potentiel de 3 mois.',
    criticalLevel: 'high',
    typicalTimeframe: '1-2 mois',
    checklist: [
      { id: 'trans-s-1', label: 'Souscrire une assurance sante internationale couvrant les 6 premiers mois minimum', critical: true },
      { id: 'trans-s-2', label: 'Demander le formulaire S1 ou la carte europeenne (si depart en UE)', critical: true },
      { id: 'trans-s-3', label: 'Mettre a jour les vaccinations requises par le pays de destination', critical: false },
      { id: 'trans-s-4', label: 'Obtenir un bilan de sante complet avant le depart (dentaire, ophtalmologique inclus)', critical: false },
      { id: 'trans-s-5', label: 'Recuperer l\'integralite du dossier medical aupres du medecin traitant', critical: true },
    ],
    warnings: [
      'La Caisse des Francais de l\'Etranger (CFE) coute cher mais assure une continuite avec le systeme francais.',
      'Certains pays imposent une assurance sante obligatoire pour l\'obtention du visa.',
      'Les maladies preexistantes peuvent etre exclues des contrats d\'assurance internationale.',
    ],
    relatedExitKeys: ['medical_ch_trajectory', 'medical_de_trajectory'],
  },
  {
    id: 'trans-fiscal-exit',
    phase: 'transition',
    order: 5,
    title: 'Notification de depart fiscal et cloture des obligations',
    description:
      'Declaration officielle du transfert de domicile fiscal : notification au centre des impots, declaration de revenus de l\'annee de depart, cloture ou transfert des comptes et placements reglements.',
    isReversible: false,
    reversibilityNote:
      'Le changement de residence fiscale est un fait juridique base sur la realite de la situation. Il est reversible au retour mais peut declencher l\'exit tax et modifier les droits acquis.',
    criticalLevel: 'critical',
    typicalTimeframe: '1-2 mois',
    checklist: [
      { id: 'trans-fx-1', label: 'Informer le centre des impots du transfert de domicile fiscal (formulaire 2042-NR)', critical: true },
      { id: 'trans-fx-2', label: 'Verifier si l\'exit tax s\'applique (plus-values latentes > 800 000 EUR ou 50% des benefices sociaux)', critical: true },
      { id: 'trans-fx-3', label: 'Cloturer le PEA si exige par la legislation ou le gestionnaire', critical: true },
      { id: 'trans-fx-4', label: 'Informer les banques et assureurs du changement de residence fiscale', critical: true },
      { id: 'trans-fx-5', label: 'Declarer les comptes bancaires ouverts a l\'etranger (formulaire 3916)', critical: true },
    ],
    warnings: [
      'Le fisc francais peut contester le transfert de residence fiscale si le centre des interets vitaux reste en France.',
      'L\'exit tax concerne les participations superieures a 50% ou valorisees a plus de 800 000 EUR.',
      'Les revenus de source francaise restent imposables en France meme apres le depart.',
    ],
    relatedExitKeys: ['real_estate_investor', 'freelance_tech', 'uae_golden_visa'],
  },
];

// =============================================================================
// PHASE 3 : INSTALLATION (0-3 mois apres l'arrivee)
// =============================================================================

const installationMilestones: ExpatMilestone[] = [
  {
    id: 'inst-arrival-registration',
    phase: 'installation',
    order: 1,
    title: 'Enregistrement administratif a l\'arrivee',
    description:
      'Demarches administratives immediates : enregistrement aupres de la mairie ou de la police locale, inscription au consulat de France, obtention du numero d\'identification fiscal ou social local.',
    isReversible: true,
    reversibilityNote:
      'Les inscriptions administratives peuvent etre annulees en cas de retour. L\'inscription consulaire est facultative et reversible.',
    criticalLevel: 'high',
    typicalTimeframe: '1-4 semaines',
    checklist: [
      { id: 'inst-a-1', label: 'S\'enregistrer aupres de l\'administration locale (mairie, immigration office)', critical: true },
      { id: 'inst-a-2', label: 'S\'inscrire au registre des Francais de l\'etranger (consulat)', critical: false },
      { id: 'inst-a-3', label: 'Obtenir le numero d\'identification local (NIE, BSN, SSN equivalent)', critical: true },
      { id: 'inst-a-4', label: 'Fournir une preuve de domicile pour les demarches suivantes', critical: true },
      { id: 'inst-a-5', label: 'Activer le titre de sejour ou permis de residence', critical: true },
    ],
    warnings: [
      'Certains pays imposent un delai d\'enregistrement tres court (48h a 8 jours apres l\'arrivee).',
      'L\'inscription consulaire est importante pour voter depuis l\'etranger et etre assiste en cas de crise.',
      'Le numero d\'identification local est souvent un prealable a toutes les autres demarches.',
    ],
    relatedExitKeys: ['portugal_nomad', 'uae_golden_visa', 'tech_canada_trajectory'],
  },
  {
    id: 'inst-housing-setup',
    phase: 'installation',
    order: 2,
    title: 'Installation dans le logement definitif',
    description:
      'Recherche et signature du bail ou achat du logement definitif. Ouverture des contrats d\'energie, internet, assurance habitation. Phase cruciale pour l\'ancrage dans le pays.',
    isReversible: true,
    reversibilityNote:
      'Un bail peut etre resilie (avec preavis). Un achat immobilier est plus difficile a inverser (frais de notaire, duree de revente). Location recommandee la premiere annee.',
    criticalLevel: 'high',
    typicalTimeframe: '2-8 semaines',
    checklist: [
      { id: 'inst-h-1', label: 'Trouver un logement temporaire pour les premieres semaines (Airbnb, hotel, colocation)', critical: true },
      { id: 'inst-h-2', label: 'Rechercher le logement definitif (agence locale, plateformes en ligne)', critical: true },
      { id: 'inst-h-3', label: 'Negocier et signer le bail (attention aux specificites locales)', critical: true },
      { id: 'inst-h-4', label: 'Ouvrir les contrats d\'electricite, gaz, eau, internet', critical: false },
      { id: 'inst-h-5', label: 'Souscrire une assurance habitation locale', critical: true },
    ],
    warnings: [
      'Ne jamais acheter un bien immobilier dans les 12 premiers mois : prendre le temps de connaitre le marche local.',
      'Les garanties locatives varient enormement selon les pays (caution de 1 a 6 mois).',
      'Se mefier des arnaques sur les plateformes en ligne : toujours visiter le bien en personne.',
    ],
    relatedExitKeys: ['real_estate_investor'],
  },
  {
    id: 'inst-bank-account',
    phase: 'installation',
    order: 3,
    title: 'Ouverture du compte bancaire local',
    description:
      'Ouverture d\'un compte bancaire dans le pays d\'accueil : indispensable pour recevoir un salaire, payer le loyer, et effectuer les transactions quotidiennes. Souvent conditionne au numero d\'identification local.',
    isReversible: true,
    reversibilityNote:
      'Un compte bancaire peut etre cloture a tout moment. Penser a transferer les fonds et a mettre a jour les prelevements automatiques.',
    criticalLevel: 'high',
    typicalTimeframe: '1-3 semaines',
    checklist: [
      { id: 'inst-b-1', label: 'Comparer les banques locales (frais, services en ligne, reseau)', critical: false },
      { id: 'inst-b-2', label: 'Rassembler les documents requis (passeport, preuve de domicile, numero fiscal)', critical: true },
      { id: 'inst-b-3', label: 'Ouvrir le compte et obtenir les moyens de paiement (carte, virement)', critical: true },
      { id: 'inst-b-4', label: 'Mettre en place les virements recurrents (loyer, assurances)', critical: false },
      { id: 'inst-b-5', label: 'Declarer le compte etranger aupres du fisc francais (formulaire 3916)', critical: true },
    ],
    warnings: [
      'Obligation legale de declarer tout compte bancaire detenu a l\'etranger au fisc francais (amende de 1 500 EUR par compte non declare).',
      'Certaines banques refusent les non-residents ou exigent un depot initial eleve.',
      'Conserver un compte bancaire francais pour la gestion des obligations restantes en France.',
    ],
    relatedExitKeys: ['freelance_tech', 'digital_nomad_escape'],
  },
  {
    id: 'inst-health-local',
    phase: 'installation',
    order: 4,
    title: 'Affiliation au systeme de sante local',
    description:
      'Inscription au systeme de sante du pays d\'accueil ou activation de l\'assurance sante privee souscrite. Identification d\'un medecin traitant, d\'un hopital de reference. Transfert du dossier medical.',
    isReversible: true,
    reversibilityNote:
      'L\'affiliation au systeme local peut etre annulee au depart. La reaffiliation au systeme francais est possible mais avec delai de carence.',
    criticalLevel: 'high',
    typicalTimeframe: '2-6 semaines',
    checklist: [
      { id: 'inst-s-1', label: 'S\'inscrire au systeme de sante local ou activer l\'assurance internationale', critical: true },
      { id: 'inst-s-2', label: 'Trouver un medecin generaliste francophone ou anglophone', critical: false },
      { id: 'inst-s-3', label: 'Identifier l\'hopital de reference le plus proche', critical: true },
      { id: 'inst-s-4', label: 'Transmettre le dossier medical traduit au nouveau medecin', critical: false },
      { id: 'inst-s-5', label: 'Verifier la couverture des traitements en cours (maladies chroniques, specialistes)', critical: true },
    ],
    warnings: [
      'La qualite des soins varie enormement selon les pays et les regions : se renseigner avant.',
      'Certains medicaments francais n\'existent pas sous le meme nom ou dosage a l\'etranger.',
      'En cas d\'urgence, connaitre le numero d\'urgence local (equivalent du 15/112).',
    ],
    relatedExitKeys: ['medical_ch_trajectory', 'medical_de_trajectory'],
  },
];

// =============================================================================
// PHASE 4 : INTEGRATION (3-12 mois apres l'arrivee)
// =============================================================================

const integrationMilestones: ExpatMilestone[] = [
  {
    id: 'integ-professional-start',
    phase: 'integration',
    order: 1,
    title: 'Debut de l\'activite professionnelle',
    description:
      'Prise de poste effective, demarrage de l\'activite independante ou creation d\'entreprise. Adaptation aux pratiques professionnelles locales, aux codes culturels du monde du travail.',
    isReversible: true,
    reversibilityNote:
      'Un contrat de travail peut etre rompu (avec preavis). La creation d\'entreprise est plus engageante mais peut etre liquidee. Les competences acquises restent.',
    criticalLevel: 'high',
    typicalTimeframe: '1-3 mois',
    checklist: [
      { id: 'integ-p-1', label: 'Finaliser le contrat de travail ou immatriculer l\'entreprise', critical: true },
      { id: 'integ-p-2', label: 'Comprendre les droits et obligations du salarie/independant local', critical: true },
      { id: 'integ-p-3', label: 'Identifier un comptable ou expert fiscal local', critical: true },
      { id: 'integ-p-4', label: 'S\'adapter aux horaires et pratiques professionnelles locales', critical: false },
      { id: 'integ-p-5', label: 'Construire les premieres relations professionnelles (collegues, partenaires)', critical: false },
    ],
    warnings: [
      'La periode d\'essai dans certains pays peut etre tres longue (jusqu\'a 6 mois).',
      'Les pratiques de management different fortement selon les cultures (hierarchie, prise de decision, communication).',
      'En tant que createur d\'entreprise, prevoir un fonds de roulement de 12-18 mois.',
    ],
    relatedExitKeys: ['corporate_ladder_jump', 'freelance_tech', 'tech_canada_trajectory', 'manual_trade_pivot'],
  },
  {
    id: 'integ-social-network',
    phase: 'integration',
    order: 2,
    title: 'Construction du reseau social et communautaire',
    description:
      'Creation d\'un cercle social dans le pays d\'accueil : communaute francophone locale, collegues, voisins, associations, activites sportives ou culturelles. Essentiel pour le bien-etre psychologique.',
    isReversible: true,
    reversibilityNote:
      'Les relations sociales se construisent et se deconstruisent naturellement. Le reseau cree reste un actif meme en cas de retour.',
    criticalLevel: 'medium',
    typicalTimeframe: '3-12 mois',
    checklist: [
      { id: 'integ-s-1', label: 'Rejoindre la communaute francaise locale (association, consulat, groupes en ligne)', critical: false },
      { id: 'integ-s-2', label: 'S\'inscrire a au moins une activite locale (sport, culture, benevolat)', critical: false },
      { id: 'integ-s-3', label: 'Developper des relations avec des locaux (pas uniquement des expatries)', critical: true },
      { id: 'integ-s-4', label: 'Identifier les ressources d\'aide psychologique en cas de difficulte (choc culturel)', critical: true },
      { id: 'integ-s-5', label: 'Maintenir le lien avec le reseau en France (appels reguliers, visites planifiees)', critical: false },
    ],
    warnings: [
      'Le choc culturel se manifeste generalement entre le 3e et le 6e mois : c\'est normal et temporaire.',
      'L\'isolement social est la premiere cause d\'echec de l\'expatriation.',
      'Se mefier du "syndrome de la bulle expatriee" : frequenter uniquement des Francais empeche l\'integration reelle.',
    ],
    relatedExitKeys: ['diaspora_leverage'],
  },
  {
    id: 'integ-language-mastery',
    phase: 'integration',
    order: 3,
    title: 'Progression linguistique active',
    description:
      'Investissement serieux dans l\'apprentissage ou le perfectionnement de la langue locale. Passage du niveau conversationnel au niveau professionnel. Cle de l\'integration durable et de la progression de carriere.',
    isReversible: true,
    reversibilityNote:
      'Les competences linguistiques acquises sont permanentes et valorisables partout. Investissement 100% reversible et portable.',
    criticalLevel: 'medium',
    typicalTimeframe: '6-18 mois',
    checklist: [
      { id: 'integ-l-1', label: 'S\'inscrire a des cours de langue intensifs (en personne de preference)', critical: true },
      { id: 'integ-l-2', label: 'Pratiquer quotidiennement avec des locaux (echanges linguistiques, tandem)', critical: true },
      { id: 'integ-l-3', label: 'Viser un niveau B2 minimum pour l\'autonomie professionnelle', critical: true },
      { id: 'integ-l-4', label: 'Passer une certification reconnue (DELE, Goethe, IELTS, JLPT selon le pays)', critical: false },
      { id: 'integ-l-5', label: 'Consommer les medias locaux (presse, television, podcasts) quotidiennement', critical: false },
    ],
    warnings: [
      'La maitrise de la langue locale est le facteur n.1 de reussite de l\'integration a long terme.',
      'Travailler uniquement en anglais dans un pays non anglophone freine considerablement l\'integration.',
      'Prevoir un budget de 2 000-5 000 EUR par an pour des cours de qualite.',
    ],
    relatedExitKeys: ['medical_ch_trajectory', 'medical_de_trajectory', 'tech_canada_trajectory'],
  },
  {
    id: 'integ-first-tax-return',
    phase: 'integration',
    order: 4,
    title: 'Premiere declaration fiscale dans le pays d\'accueil',
    description:
      'Premiere declaration de revenus dans le pays de residence fiscale. Comprehension du systeme fiscal local, des deductions possibles, et de l\'articulation avec les obligations fiscales francaises residuelles.',
    isReversible: true,
    reversibilityNote:
      'L\'obligation fiscale est liee a la residence et cesse au depart. Mais les dettes fiscales eventuelles persistent.',
    criticalLevel: 'high',
    typicalTimeframe: 'Annee fiscale suivant l\'arrivee',
    checklist: [
      { id: 'integ-t-1', label: 'Identifier un comptable/fiscaliste local maitrisant la situation des expatries', critical: true },
      { id: 'integ-t-2', label: 'Rassembler tous les justificatifs de revenus et depenses deductibles', critical: true },
      { id: 'integ-t-3', label: 'Declarer les revenus dans le pays d\'accueil dans les delais', critical: true },
      { id: 'integ-t-4', label: 'Declarer les revenus de source francaise en France (declaration des non-residents)', critical: true },
      { id: 'integ-t-5', label: 'Verifier l\'application correcte de la convention fiscale bilaterale', critical: true },
    ],
    warnings: [
      'L\'annee du depart, on peut etre impose dans les deux pays sur des periodes differentes.',
      'Les conventions fiscales bilaterales evitent normalement la double imposition mais il faut les appliquer activement.',
      'Les penalites pour retard de declaration sont souvent plus severes a l\'etranger qu\'en France.',
    ],
    relatedExitKeys: ['freelance_tech', 'uae_golden_visa', 'real_estate_investor'],
  },
];

// =============================================================================
// PHASE 5 : ETABLISSEMENT (1-3 ans apres l'arrivee)
// =============================================================================

const establishmentMilestones: ExpatMilestone[] = [
  {
    id: 'estab-tax-optimization',
    phase: 'establishment',
    order: 1,
    title: 'Optimisation fiscale et patrimoniale',
    description:
      'Mise en place d\'une strategie fiscale optimisee dans le pays d\'accueil : placements locaux avantageux, structuration patrimoniale, planification successorale internationale.',
    isReversible: false,
    reversibilityNote:
      'Certaines structures patrimoniales (societes, trusts) sont complexes et couteuses a defaire. Les avantages fiscaux obtenus ne peuvent etre retroactivement annules mais ne suivront pas en cas de retour.',
    criticalLevel: 'high',
    typicalTimeframe: '12-24 mois apres l\'arrivee',
    checklist: [
      { id: 'estab-t-1', label: 'Realiser un audit fiscal complet de la situation post-installation', critical: true },
      { id: 'estab-t-2', label: 'Optimiser les placements selon la fiscalite locale (equivalents PEA, assurance vie)', critical: true },
      { id: 'estab-t-3', label: 'Structurer la detention du patrimoine immobilier de maniere optimale', critical: false },
      { id: 'estab-t-4', label: 'Planifier la succession internationale (droit applicable, beneficiaires)', critical: true },
      { id: 'estab-t-5', label: 'Evaluer l\'interet de la CFE vs. systeme local pour la retraite', critical: false },
    ],
    warnings: [
      'L\'optimisation fiscale agressive peut etre requalifiee en abus de droit par les deux administrations fiscales.',
      'Les regles CFC (Controlled Foreign Corporation) peuvent s\'appliquer sur les societes detenues a l\'etranger.',
      'La planification successorale internationale est un domaine hyper-specialise : ne pas improviser.',
    ],
    relatedExitKeys: ['uae_golden_visa', 'real_estate_investor', 'freelance_tech'],
  },
  {
    id: 'estab-permanent-residency',
    phase: 'establishment',
    order: 2,
    title: 'Obtention de la residence permanente',
    description:
      'Demande de residence permanente ou de long sejour renouvelable. Selon les pays, possible apres 1 a 5 ans de residence legale continue. Ouvre de nouveaux droits et securise le sejour.',
    isReversible: true,
    reversibilityNote:
      'La residence permanente peut etre abandonnee mais certains pays l\'annulent automatiquement apres une absence prolongee (6-24 mois).',
    criticalLevel: 'high',
    typicalTimeframe: '1-5 ans apres l\'arrivee',
    checklist: [
      { id: 'estab-r-1', label: 'Verifier les conditions d\'eligibilite (duree de residence, revenus, casier)', critical: true },
      { id: 'estab-r-2', label: 'Constituer le dossier de demande complet', critical: true },
      { id: 'estab-r-3', label: 'Passer les tests eventuels (langue, integration civique)', critical: true },
      { id: 'estab-r-4', label: 'Soumettre la demande et suivre son avancement', critical: true },
      { id: 'estab-r-5', label: 'Planifier les absences pour ne pas perdre le benefice de la residence continue', critical: true },
    ],
    warnings: [
      'La residence permanente peut etre perdue apres une absence de plus de 6 mois dans certains pays.',
      'Les conditions peuvent changer entre le debut de la residence et la demande de permanence.',
      'Certains pays exigent un niveau de langue minimum (B1/B2) pour la residence permanente.',
    ],
    relatedExitKeys: ['portugal_nomad', 'uae_golden_visa', 'tech_canada_trajectory'],
  },
  {
    id: 'estab-investment-local',
    phase: 'establishment',
    order: 3,
    title: 'Investissements locaux et diversification',
    description:
      'Deploiement d\'une strategie d\'investissement dans le pays d\'accueil : immobilier local, creation ou acquisition d\'entreprise, placements financiers locaux. Ancrage economique definitif.',
    isReversible: false,
    reversibilityNote:
      'Les investissements immobiliers et entrepreneuriaux sont difficilement reversibles a court terme. Compter 6-24 mois pour liquider proprement des actifs locaux.',
    criticalLevel: 'high',
    typicalTimeframe: '18-36 mois apres l\'arrivee',
    checklist: [
      { id: 'estab-i-1', label: 'Etudier le marche immobilier local en profondeur (quartiers, tendances, rendements)', critical: true },
      { id: 'estab-i-2', label: 'Ouvrir un compte d\'investissement aupres d\'un courtier local ou international', critical: false },
      { id: 'estab-i-3', label: 'Diversifier entre actifs locaux et internationaux', critical: true },
      { id: 'estab-i-4', label: 'Si creation d\'entreprise : valider le business plan avec un expert local', critical: true },
      { id: 'estab-i-5', label: 'S\'assurer de la conformite fiscale de tous les investissements (France + pays d\'accueil)', critical: true },
    ],
    warnings: [
      'Ne pas investir massivement avant d\'avoir une connaissance approfondie du marche local (minimum 12-18 mois sur place).',
      'Les droits de propriete et les protections legales varient enormement selon les pays.',
      'Attention aux restrictions sur la propriete immobiliere pour les etrangers dans certains pays.',
    ],
    relatedExitKeys: ['real_estate_investor', 'uae_golden_visa', 'resource_extraction_escape'],
  },
  {
    id: 'estab-citizenship-path',
    phase: 'establishment',
    order: 4,
    title: 'Evaluation du parcours vers la nationalite',
    description:
      'Analyse de l\'opportunite et des conditions d\'acquisition de la nationalite du pays d\'accueil. Decision strategique majeure avec des implications fiscales, militaires et de droits civiques permanentes.',
    isReversible: false,
    reversibilityNote:
      'L\'acquisition d\'une nationalite est definitive dans la plupart des cas. La France autorise la double nationalite mais certains pays l\'interdisent (choix irrevocable possible).',
    criticalLevel: 'critical',
    typicalTimeframe: '3-10 ans apres l\'arrivee',
    checklist: [
      { id: 'estab-c-1', label: 'Verifier si le pays d\'accueil autorise la double nationalite', critical: true },
      { id: 'estab-c-2', label: 'Evaluer les avantages concrets (vote, libre circulation, transmission aux enfants)', critical: true },
      { id: 'estab-c-3', label: 'Verifier les obligations associees (service militaire, jury, fiscalite mondiale type USA)', critical: true },
      { id: 'estab-c-4', label: 'Atteindre le niveau de langue requis pour la naturalisation', critical: true },
      { id: 'estab-c-5', label: 'Consulter un avocat specialise en droit de la nationalite avant de se lancer', critical: true },
    ],
    warnings: [
      'Certains pays imposent de renoncer a la nationalite d\'origine (Japon, Pays-Bas sous conditions, Autriche).',
      'La nationalite americaine entraine une obligation fiscale mondiale a vie, meme sans residence aux USA.',
      'La naturalisation peut prendre 2-5 ans apres le depot de la demande.',
    ],
    relatedExitKeys: ['portugal_nomad', 'tech_canada_trajectory'],
  },
  {
    id: 'estab-family-anchoring',
    phase: 'establishment',
    order: 5,
    title: 'Ancrage familial et scolarisation long terme',
    description:
      'Decisions structurantes pour la famille : scolarisation definitive des enfants dans le systeme local (ou lycee francais), acquisition du logement familial, inscription a la protection sociale locale.',
    isReversible: false,
    reversibilityNote:
      'La scolarisation dans le systeme local rend le retour en France plus complexe pour les enfants (equivalences, adaptation). L\'achat immobilier familial ancre definitivement la famille.',
    criticalLevel: 'critical',
    typicalTimeframe: '12-36 mois apres l\'arrivee',
    checklist: [
      { id: 'estab-f-1', label: 'Choisir definitivement le systeme scolaire (local, francais, international)', critical: true },
      { id: 'estab-f-2', label: 'Inscrire les enfants dans les activites extrascolaires locales', critical: false },
      { id: 'estab-f-3', label: 'Evaluer l\'achat d\'un bien immobilier familial', critical: false },
      { id: 'estab-f-4', label: 'Mettre en place un suivi medical familial complet dans le systeme local', critical: true },
      { id: 'estab-f-5', label: 'Etablir un testament international couvrant les deux jurisdictions', critical: true },
    ],
    warnings: [
      'Le retour en France est exponentiellement plus difficile a mesure que les enfants grandissent dans le systeme local.',
      'Le lycee francais a l\'etranger coute entre 3 000 et 15 000 EUR par an et par enfant.',
      'Les decisions scolaires prises pour les enfants sont les plus structurantes et les moins reversibles de toute l\'expatriation.',
    ],
    relatedExitKeys: ['education_arbitrage', 'diaspora_leverage'],
  },
];

// =============================================================================
// PHASES ASSEMBLEES
// =============================================================================

export const EXPAT_PHASES: ExpatPhase[] = [
  {
    id: 'preparation',
    name: 'Preparation',
    description:
      'Phase de recherche, d\'analyse et de planification. Aucune decision irreversible n\'est prise. Objectif : construire un plan solide et realiste base sur des donnees concretes.',
    duration: '6-12 mois avant le depart',
    milestones: preparationMilestones,
  },
  {
    id: 'transition',
    name: 'Transition',
    description:
      'Phase d\'execution des decisions majeures. Plusieurs etapes sont irreversibles ou difficilement reversibles. C\'est le point de bascule : chaque action engage.',
    duration: '3-6 mois avant le depart',
    milestones: transitionMilestones,
  },
  {
    id: 'installation',
    name: 'Installation',
    description:
      'Phase d\'ancrage dans le pays d\'accueil. Les demarches administratives et logistiques sont nombreuses mais la plupart sont reversibles. Priorite : securiser les bases vitales (logement, sante, banque).',
    duration: '0-3 mois apres l\'arrivee',
    milestones: installationMilestones,
  },
  {
    id: 'integration',
    name: 'Integration',
    description:
      'Phase de construction de la vie quotidienne dans le pays. Le choc culturel peut survenir. Les investissements sociaux et linguistiques sont determinants pour la reussite a long terme.',
    duration: '3-12 mois apres l\'arrivee',
    milestones: integrationMilestones,
  },
  {
    id: 'establishment',
    name: 'Etablissement',
    description:
      'Phase d\'enracinement definitif. Les decisions prises ici (investissements, nationalite, scolarisation) sont les plus structurantes et les moins reversibles. Chaque choix rapproche du point de non-retour.',
    duration: '1-3 ans apres l\'arrivee',
    milestones: establishmentMilestones,
  },
];

// =============================================================================
// REVERSIBILITY CHECKLISTS
// =============================================================================

export const REVERSIBILITY_CHECKLISTS: ReversibilityChecklist[] = [
  // --- Phase 1: Preparation ---
  {
    milestoneId: 'prep-research-destination',
    items: [
      { id: 'rev-prep-r-1', label: 'Recherches et analyses effectuees', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
      { id: 'rev-prep-r-2', label: 'Visites exploratoires realisees', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
      { id: 'rev-prep-r-3', label: 'Consultations professionnelles payees', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (frais non recuperables)' },
    ],
  },
  {
    milestoneId: 'prep-financial-audit',
    items: [
      { id: 'rev-prep-f-1', label: 'Audit patrimonial realise', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
      { id: 'rev-prep-f-2', label: 'Consultations fiscales payees', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (frais non recuperables)' },
      { id: 'rev-prep-f-3', label: 'Strategie patrimoniale definie', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
    ],
  },
  {
    milestoneId: 'prep-admin-documents',
    items: [
      { id: 'rev-prep-a-1', label: 'Passeport renouvele', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (document utile en tout cas)' },
      { id: 'rev-prep-a-2', label: 'Apostilles obtenues', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (frais non recuperables)' },
      { id: 'rev-prep-a-3', label: 'Traductions assermentees realisees', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (frais non recuperables)' },
    ],
  },
  {
    milestoneId: 'prep-professional-strategy',
    items: [
      { id: 'rev-prep-p-1', label: 'CV adapte et profil mis a jour', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
      { id: 'rev-prep-p-2', label: 'Reseau professionnel active a l\'etranger', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (le reseau reste un actif)' },
      { id: 'rev-prep-p-3', label: 'Formations ou certifications engagees', reversible: true, costToReverse: 'low', timeToReverse: '1-3 mois (frais partiellement recuperables)' },
    ],
  },
  // --- Phase 2: Transition ---
  {
    milestoneId: 'trans-resignation-contract',
    items: [
      { id: 'rev-trans-r-1', label: 'Demission deposee', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible une fois acceptee' },
      { id: 'rev-trans-r-2', label: 'Rupture conventionnelle signee', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible apres le delai de retractation de 15 jours' },
      { id: 'rev-trans-r-3', label: 'Preavis en cours', reversible: false, costToReverse: 'high', timeToReverse: 'Negociation possible mais employeur non oblige d\'accepter' },
      { id: 'rev-trans-r-4', label: 'Documents de fin de contrat recus', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible' },
    ],
  },
  {
    milestoneId: 'trans-housing-disposal',
    items: [
      { id: 'rev-trans-h-1', label: 'Bien immobilier vendu', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible (transfert de propriete definitif)' },
      { id: 'rev-trans-h-2', label: 'Bien immobilier mis en location', reversible: true, costToReverse: 'medium', timeToReverse: '3-6 mois (preavis du locataire, remise en etat)' },
      { id: 'rev-trans-h-3', label: 'Bail resilie (si locataire)', reversible: false, costToReverse: 'high', timeToReverse: 'Irreversible (le logement est perdu, il faut en retrouver un)' },
      { id: 'rev-trans-h-4', label: 'Affaires stockees ou donnees', reversible: true, costToReverse: 'low', timeToReverse: '1-2 semaines (recuperation du stockage)' },
    ],
  },
  {
    milestoneId: 'trans-visa-application',
    items: [
      { id: 'rev-trans-v-1', label: 'Dossier de visa depose', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (frais de dossier non remboursables)' },
      { id: 'rev-trans-v-2', label: 'Visa accorde', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (le visa peut ne pas etre utilise)' },
      { id: 'rev-trans-v-3', label: 'Visa active a l\'entree dans le pays', reversible: true, costToReverse: 'low', timeToReverse: '1-4 semaines (procedures de sortie/annulation)' },
    ],
  },
  {
    milestoneId: 'trans-health-coverage',
    items: [
      { id: 'rev-trans-s-1', label: 'Assurance sante internationale souscrite', reversible: true, costToReverse: 'low', timeToReverse: '1 mois (resiliation avec preavis)' },
      { id: 'rev-trans-s-2', label: 'Radiation de la Securite sociale', reversible: true, costToReverse: 'medium', timeToReverse: '1-3 mois (reaffiliation avec delai de carence possible)' },
      { id: 'rev-trans-s-3', label: 'Dossier medical recupere', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (documents conserves)' },
    ],
  },
  {
    milestoneId: 'trans-fiscal-exit',
    items: [
      { id: 'rev-trans-fx-1', label: 'Transfert de domicile fiscal declare', reversible: true, costToReverse: 'medium', timeToReverse: '3-12 mois (retablissement au retour, procedures administratives)' },
      { id: 'rev-trans-fx-2', label: 'Exit tax declenchee', reversible: false, costToReverse: 'high', timeToReverse: 'Sursis de paiement possible, mais l\'obligation existe' },
      { id: 'rev-trans-fx-3', label: 'PEA cloture', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible (perte de l\'anteriorite fiscale)' },
      { id: 'rev-trans-fx-4', label: 'Comptes bancaires etrangers declares', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (obligation permanente tant que le compte existe)' },
    ],
  },
  // --- Phase 3: Installation ---
  {
    milestoneId: 'inst-arrival-registration',
    items: [
      { id: 'rev-inst-a-1', label: 'Enregistrement administratif local effectue', reversible: true, costToReverse: 'low', timeToReverse: '1-4 semaines (procedure de desinscription)' },
      { id: 'rev-inst-a-2', label: 'Inscription consulaire realisee', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (radiation en ligne)' },
      { id: 'rev-inst-a-3', label: 'Numero d\'identification local obtenu', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (le numero reste inactif en cas de depart)' },
    ],
  },
  {
    milestoneId: 'inst-housing-setup',
    items: [
      { id: 'rev-inst-h-1', label: 'Bail signe dans le pays d\'accueil', reversible: true, costToReverse: 'medium', timeToReverse: '1-3 mois (preavis selon legislation locale)' },
      { id: 'rev-inst-h-2', label: 'Bien immobilier achete a l\'etranger', reversible: true, costToReverse: 'high', timeToReverse: '6-18 mois (revente avec frais et potentielle moins-value)' },
      { id: 'rev-inst-h-3', label: 'Contrats energie/internet ouverts', reversible: true, costToReverse: 'low', timeToReverse: '1-2 semaines (resiliation avec frais eventuels)' },
    ],
  },
  {
    milestoneId: 'inst-bank-account',
    items: [
      { id: 'rev-inst-b-1', label: 'Compte bancaire local ouvert', reversible: true, costToReverse: 'low', timeToReverse: '2-4 semaines (cloture avec transfert des fonds)' },
      { id: 'rev-inst-b-2', label: 'Prelevements automatiques mis en place', reversible: true, costToReverse: 'low', timeToReverse: '1-2 semaines (annulation des mandats)' },
      { id: 'rev-inst-b-3', label: 'Compte francais conserve', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (aucune action requise)' },
    ],
  },
  {
    milestoneId: 'inst-health-local',
    items: [
      { id: 'rev-inst-s-1', label: 'Inscription au systeme de sante local', reversible: true, costToReverse: 'low', timeToReverse: '1-4 semaines (desinscription au depart)' },
      { id: 'rev-inst-s-2', label: 'Medecin traitant local identifie', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
      { id: 'rev-inst-s-3', label: 'Dossier medical transfere', reversible: true, costToReverse: 'low', timeToReverse: '2-4 semaines (recuperation du dossier)' },
    ],
  },
  // --- Phase 4: Integration ---
  {
    milestoneId: 'integ-professional-start',
    items: [
      { id: 'rev-integ-p-1', label: 'Contrat de travail local signe', reversible: true, costToReverse: 'medium', timeToReverse: '1-3 mois (preavis de demission local)' },
      { id: 'rev-integ-p-2', label: 'Entreprise locale creee', reversible: true, costToReverse: 'high', timeToReverse: '3-12 mois (liquidation, cloture administrative)' },
      { id: 'rev-integ-p-3', label: 'Comptable local mandate', reversible: true, costToReverse: 'low', timeToReverse: '1 mois (fin de mandat)' },
      { id: 'rev-integ-p-4', label: 'Competences professionnelles locales acquises', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (competences portables)' },
    ],
  },
  {
    milestoneId: 'integ-social-network',
    items: [
      { id: 'rev-integ-s-1', label: 'Reseau social local construit', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (les liens persistent a distance)' },
      { id: 'rev-integ-s-2', label: 'Adhesions a des associations locales', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (desistement libre)' },
      { id: 'rev-integ-s-3', label: 'Liens avec la France maintenus', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat' },
    ],
  },
  {
    milestoneId: 'integ-language-mastery',
    items: [
      { id: 'rev-integ-l-1', label: 'Cours de langue suivis', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (competence acquise definitivement)' },
      { id: 'rev-integ-l-2', label: 'Certification linguistique obtenue', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (certification valable internationalement)' },
      { id: 'rev-integ-l-3', label: 'Budget formation investi', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (investissement non recuperable mais competence acquise)' },
    ],
  },
  {
    milestoneId: 'integ-first-tax-return',
    items: [
      { id: 'rev-integ-t-1', label: 'Declaration fiscale locale effectuee', reversible: true, costToReverse: 'low', timeToReverse: 'Annuelle (obligation cesse au depart du pays)' },
      { id: 'rev-integ-t-2', label: 'Declaration de non-resident en France effectuee', reversible: true, costToReverse: 'low', timeToReverse: 'Annuelle (retour au statut de resident au retour)' },
      { id: 'rev-integ-t-3', label: 'Comptable fiscal local mandate', reversible: true, costToReverse: 'low', timeToReverse: '1 mois (fin de mandat)' },
    ],
  },
  // --- Phase 5: Etablissement ---
  {
    milestoneId: 'estab-tax-optimization',
    items: [
      { id: 'rev-estab-t-1', label: 'Structures patrimoniales mises en place (societes, holdings)', reversible: true, costToReverse: 'high', timeToReverse: '6-18 mois (liquidation, frais juridiques et comptables importants)' },
      { id: 'rev-estab-t-2', label: 'Placements locaux souscrits', reversible: true, costToReverse: 'medium', timeToReverse: '1-6 mois (rachat avec penalites eventuelles)' },
      { id: 'rev-estab-t-3', label: 'Testament international redige', reversible: true, costToReverse: 'low', timeToReverse: '1-2 mois (revision notariale)' },
      { id: 'rev-estab-t-4', label: 'Avantages fiscaux locaux actives', reversible: true, costToReverse: 'medium', timeToReverse: 'Variable (les avantages cessent au depart mais pas de penalite retroactive)' },
    ],
  },
  {
    milestoneId: 'estab-permanent-residency',
    items: [
      { id: 'rev-estab-r-1', label: 'Residence permanente obtenue', reversible: true, costToReverse: 'low', timeToReverse: 'Immediat (abandon volontaire possible)' },
      { id: 'rev-estab-r-2', label: 'Tests d\'integration passes', reversible: true, costToReverse: 'none', timeToReverse: 'Immediat (certification conservee)' },
      { id: 'rev-estab-r-3', label: 'Absence prolongee du pays', reversible: false, costToReverse: 'high', timeToReverse: 'Perte automatique apres 6-24 mois d\'absence selon le pays' },
    ],
  },
  {
    milestoneId: 'estab-investment-local',
    items: [
      { id: 'rev-estab-i-1', label: 'Bien immobilier achete dans le pays d\'accueil', reversible: true, costToReverse: 'high', timeToReverse: '6-18 mois (revente avec frais de notaire, agence, potentielle moins-value)' },
      { id: 'rev-estab-i-2', label: 'Entreprise locale creee ou acquise', reversible: true, costToReverse: 'high', timeToReverse: '6-24 mois (cession ou liquidation, frais juridiques importants)' },
      { id: 'rev-estab-i-3', label: 'Portefeuille financier local constitue', reversible: true, costToReverse: 'medium', timeToReverse: '1-3 mois (liquidation avec impact fiscal potentiel)' },
    ],
  },
  {
    milestoneId: 'estab-citizenship-path',
    items: [
      { id: 'rev-estab-c-1', label: 'Demande de naturalisation deposee', reversible: true, costToReverse: 'low', timeToReverse: '1-2 mois (retrait de la demande)' },
      { id: 'rev-estab-c-2', label: 'Nationalite acquise (double nationalite conservee)', reversible: false, costToReverse: 'high', timeToReverse: 'Procedure de renonciation possible mais longue (6-24 mois)' },
      { id: 'rev-estab-c-3', label: 'Nationalite francaise abandonnee (si pays impose le choix)', reversible: false, costToReverse: 'impossible', timeToReverse: 'Irreversible (la reintegration dans la nationalite francaise est une procedure exceptionnelle)' },
    ],
  },
  {
    milestoneId: 'estab-family-anchoring',
    items: [
      { id: 'rev-estab-f-1', label: 'Enfants scolarises dans le systeme local depuis plus de 2 ans', reversible: true, costToReverse: 'high', timeToReverse: '6-12 mois (adaptation au systeme francais, equivalences, impact psychologique)' },
      { id: 'rev-estab-f-2', label: 'Logement familial achete', reversible: true, costToReverse: 'high', timeToReverse: '6-18 mois (revente, demenagement)' },
      { id: 'rev-estab-f-3', label: 'Testament international etabli', reversible: true, costToReverse: 'low', timeToReverse: '1-2 mois (revision notariale)' },
      { id: 'rev-estab-f-4', label: 'Conjoint integre professionnellement dans le pays', reversible: true, costToReverse: 'high', timeToReverse: '3-12 mois (recherche d\'emploi en France, perte de reseau professionnel local)' },
    ],
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Retrieve all milestones across all phases as a flat list. */
export function getAllMilestones(): ExpatMilestone[] {
  return EXPAT_PHASES.flatMap((phase) => phase.milestones);
}

/** Retrieve a specific milestone by its id. */
export function getMilestoneById(id: string): ExpatMilestone | undefined {
  return getAllMilestones().find((m) => m.id === id);
}

/** Retrieve the reversibility checklist for a given milestone id. */
export function getReversibilityForMilestone(milestoneId: string): ReversibilityChecklist | undefined {
  return REVERSIBILITY_CHECKLISTS.find((rc) => rc.milestoneId === milestoneId);
}

/** Retrieve all milestones flagged as irreversible. */
export function getIrreversibleMilestones(): ExpatMilestone[] {
  return getAllMilestones().filter((m) => !m.isReversible);
}

/** Retrieve all milestones at the critical level. */
export function getCriticalMilestones(): ExpatMilestone[] {
  return getAllMilestones().filter((m) => m.criticalLevel === 'critical');
}

/** Retrieve milestones for a specific phase. */
export function getMilestonesByPhase(
  phase: ExpatMilestone['phase'],
): ExpatMilestone[] {
  const phaseData = EXPAT_PHASES.find((p) => p.id === phase);
  return phaseData ? phaseData.milestones : [];
}

/** Count items in a reversibility checklist that are truly irreversible (impossible to reverse). */
export function countImpossibleToReverse(milestoneId: string): number {
  const checklist = getReversibilityForMilestone(milestoneId);
  if (!checklist) return 0;
  return checklist.items.filter((item) => item.costToReverse === 'impossible').length;
}
