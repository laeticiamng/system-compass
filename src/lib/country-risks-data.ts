export interface CountryHiddenRisk {
  id: string;
  countryId: string;
  countryName: string;
  category: 'corruption' | 'legal_trap' | 'cultural' | 'financial' | 'bureaucratic' | 'social';
  title: string;
  description: string;
  severity: number;
  visibility: 'invisible' | 'subtle' | 'emerging';
  sources: string[];
  affectedProfiles: string[];
  mitigationTips: string[];
}

export interface CountryRiskProfile {
  countryId: string;
  countryName: string;
  overallLatentScore: number;
  corruptionScore: number;
  legalTrapScore: number;
  culturalRiskScore: number;
  financialRiskScore: number;
  bureaucraticScore: number;
  socialRiskScore: number;
  hiddenRisks: CountryHiddenRisk[];
  lastUpdated: string;
}

function r(countryId: string, idx: number, cat: string): string {
  return `${countryId}-${cat}-${idx}`;
}

export const countryRiskProfiles: CountryRiskProfile[] = [
  {
    countryId: 'FR', countryName: 'France', overallLatentScore: 5,
    corruptionScore: 3, legalTrapScore: 6, culturalRiskScore: 4, financialRiskScore: 7, bureaucraticScore: 8, socialRiskScore: 3,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('FR',1,'bureaucratic'), countryId: 'FR', countryName: 'France', category: 'bureaucratic', title: 'Rigidité administrative pour les entrepreneurs étrangers', description: "Les démarches de création d'entreprise impliquent des délais imprévisibles et des pièces justificatives rarement listées à l'avance.", severity: 7, visibility: 'subtle', sources: ['OCDE', 'Banque Mondiale'], affectedProfiles: ['entrepreneur', 'freelance'], mitigationTips: ["Faire appel à un expert-comptable local dès le départ", "Prévoir 3 mois de délai supplémentaire"] },
      { id: r('FR',2,'financial'), countryId: 'FR', countryName: 'France', category: 'financial', title: 'Taxation mondiale des résidents fiscaux français', description: "Tout résident fiscal français est imposé sur ses revenus mondiaux, y compris les revenus passifs étrangers.", severity: 8, visibility: 'invisible', sources: ['Direction Générale des Finances Publiques', 'OCDE'], affectedProfiles: ['investisseur', 'digital_nomad', 'retraité'], mitigationTips: ["Consulter un fiscaliste international avant l'installation", "Vérifier les conventions de double imposition"] },
      { id: r('FR',3,'cultural'), countryId: 'FR', countryName: 'France', category: 'cultural', title: 'Barrière linguistique dans les services publics', description: "Les administrations françaises fonctionnent quasi exclusivement en français, sans service de traduction.", severity: 5, visibility: 'subtle', sources: ['Défenseur des droits'], affectedProfiles: ['expatrié', 'étudiant', 'salarié'], mitigationTips: ["Atteindre un niveau B2 en français avant l'arrivée", "Se faire accompagner par une association d'aide aux expatriés"] },
      { id: r('FR',4,'legal_trap'), countryId: 'FR', countryName: 'France', category: 'legal_trap', title: 'Complexité du droit du bail commercial', description: "Le bail commercial français impose des obligations rigides sur 9 ans avec des clauses de sortie très encadrées.", severity: 6, visibility: 'invisible', sources: ['Chambre de Commerce de Paris'], affectedProfiles: ['entrepreneur', 'investisseur'], mitigationTips: ["Négocier une clause de résiliation anticipée", "Faire relire le bail par un avocat spécialisé"] },
    ],
  },
  {
    countryId: 'PT', countryName: 'Portugal', overallLatentScore: 4,
    corruptionScore: 4, legalTrapScore: 5, culturalRiskScore: 2, financialRiskScore: 5, bureaucraticScore: 6, socialRiskScore: 3,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('PT',1,'financial'), countryId: 'PT', countryName: 'Portugal', category: 'financial', title: 'Fin progressive du régime NHR', description: "Le statut de Résident Non Habituel est en cours de démantèlement, réduisant les avantages fiscaux pour les nouveaux arrivants.", severity: 7, visibility: 'emerging', sources: ['Autoridade Tributária', 'Financial Times'], affectedProfiles: ['retraité', 'investisseur', 'digital_nomad'], mitigationTips: ["Vérifier l'éligibilité actuelle avant tout projet", "Prévoir un plan fiscal alternatif"] },
      { id: r('PT',2,'bureaucratic'), countryId: 'PT', countryName: 'Portugal', category: 'bureaucratic', title: 'Lenteur extrême des services fiscaux', description: "L'obtention du NIF et les démarches fiscales peuvent prendre plusieurs mois sans visibilité sur l'avancement.", severity: 6, visibility: 'subtle', sources: ['Banque Mondiale', 'OCDE'], affectedProfiles: ['expatrié', 'entrepreneur'], mitigationTips: ["Engager un représentant fiscal dès le premier jour", "Prendre rendez-vous en ligne à l'avance"] },
      { id: r('PT',3,'social'), countryId: 'PT', countryName: 'Portugal', category: 'social', title: 'Crise du logement à Lisbonne et Porto', description: "La spéculation immobilière rend l'accès au logement très difficile, avec des loyers en hausse constante.", severity: 7, visibility: 'emerging', sources: ['INE Portugal', 'Eurostat'], affectedProfiles: ['expatrié', 'étudiant', 'salarié'], mitigationTips: ["Chercher en dehors des centres-villes", "Prévoir un budget logement supérieur de 30%"] },
    ],
  },
  {
    countryId: 'AE', countryName: 'Émirats Arabes Unis', overallLatentScore: 6,
    corruptionScore: 4, legalTrapScore: 8, culturalRiskScore: 7, financialRiskScore: 5, bureaucraticScore: 4, socialRiskScore: 6,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('AE',1,'legal_trap'), countryId: 'AE', countryName: 'Émirats Arabes Unis', category: 'legal_trap', title: 'Absence de droit du travail protecteur', description: "Le droit du travail émirati offre peu de recours en cas de licenciement abusif ou de non-paiement de salaire.", severity: 8, visibility: 'subtle', sources: ['Human Rights Watch', 'OIT'], affectedProfiles: ['salarié', 'expatrié'], mitigationTips: ["Négocier un contrat détaillé avec clause d'arbitrage", "Conserver toutes les preuves de communication écrite"] },
      { id: r('AE',2,'financial'), countryId: 'AE', countryName: 'Émirats Arabes Unis', category: 'financial', title: 'Risque de gel bancaire sans préavis', description: "Les banques émiraties peuvent geler un compte sur simple plainte d'un tiers, sans décision judiciaire préalable.", severity: 9, visibility: 'invisible', sources: ['Banque Centrale des EAU', 'Gulf News'], affectedProfiles: ['entrepreneur', 'investisseur', 'salarié'], mitigationTips: ["Maintenir un compte bancaire dans un autre pays", "Ne jamais concentrer tous ses fonds aux EAU"] },
      { id: r('AE',3,'cultural'), countryId: 'AE', countryName: 'Émirats Arabes Unis', category: 'cultural', title: 'Restrictions sur la liberté d\'expression', description: "Toute critique publique du gouvernement ou de la religion peut entraîner des poursuites pénales.", severity: 8, visibility: 'subtle', sources: ['Amnesty International', 'RSF'], affectedProfiles: ['digital_nomad', 'expatrié', 'entrepreneur'], mitigationTips: ["Éviter tout commentaire politique sur les réseaux sociaux", "Se renseigner sur les lois locales de cybercriminalité"] },
      { id: r('AE',4,'legal_trap'), countryId: 'AE', countryName: 'Émirats Arabes Unis', category: 'legal_trap', title: 'Chèque sans provision pénalement sanctionné', description: "Émettre un chèque sans provision est un délit pénal aux EAU pouvant entraîner une peine de prison.", severity: 7, visibility: 'invisible', sources: ['Ministère de la Justice des EAU'], affectedProfiles: ['entrepreneur', 'investisseur'], mitigationTips: ["Éviter absolument l'usage de chèques", "Privilégier les virements bancaires"] },
    ],
  },
  {
    countryId: 'SG', countryName: 'Singapour', overallLatentScore: 3,
    corruptionScore: 1, legalTrapScore: 4, culturalRiskScore: 3, financialRiskScore: 3, bureaucraticScore: 2, socialRiskScore: 4,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('SG',1,'financial'), countryId: 'SG', countryName: 'Singapour', category: 'financial', title: 'Coût de la vie extrêmement élevé', description: "Le logement, l'éducation et la santé atteignent des niveaux parmi les plus chers au monde.", severity: 7, visibility: 'subtle', sources: ['EIU', 'Mercer'], affectedProfiles: ['expatrié', 'salarié', 'famille'], mitigationTips: ["Négocier un package incluant logement et école", "Prévoir un budget mensuel minimum de 5000 SGD"] },
      { id: r('SG',2,'legal_trap'), countryId: 'SG', countryName: 'Singapour', category: 'legal_trap', title: 'Sanctions pénales sévères pour infractions mineures', description: "Des amendes lourdes ou peines de prison s'appliquent pour des actes considérés bénins ailleurs (chewing-gum, graffiti).", severity: 5, visibility: 'subtle', sources: ['Singapore Statutes Online'], affectedProfiles: ['expatrié', 'digital_nomad', 'étudiant'], mitigationTips: ["Étudier le code pénal local avant l'arrivée", "Respecter scrupuleusement les règles locales"] },
      { id: r('SG',3,'bureaucratic'), countryId: 'SG', countryName: 'Singapour', category: 'bureaucratic', title: 'Dépendance du visa au sponsor employeur', description: "La perte d'emploi entraîne l'annulation rapide du visa de travail, laissant peu de temps pour se retourner.", severity: 6, visibility: 'invisible', sources: ['Ministry of Manpower Singapore'], affectedProfiles: ['salarié', 'expatrié'], mitigationTips: ["Anticiper un plan B en cas de licenciement", "Constituer une épargne de sécurité de 6 mois"] },
    ],
  },
  {
    countryId: 'TH', countryName: 'Thaïlande', overallLatentScore: 6,
    corruptionScore: 6, legalTrapScore: 7, culturalRiskScore: 5, financialRiskScore: 5, bureaucraticScore: 6, socialRiskScore: 4,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('TH',1,'legal_trap'), countryId: 'TH', countryName: 'Thaïlande', category: 'legal_trap', title: 'Impossibilité légale de posséder un terrain', description: "Les étrangers ne peuvent pas détenir de terrain en Thaïlande ; seules des structures juridiques complexes le permettent indirectement.", severity: 8, visibility: 'invisible', sources: ['Land Code Act', 'Banque Mondiale'], affectedProfiles: ['investisseur', 'retraité', 'expatrié'], mitigationTips: ["Privilégier l'achat de condominiums en pleine propriété", "Consulter un avocat spécialisé en droit foncier thaï"] },
      { id: r('TH',2,'bureaucratic'), countryId: 'TH', countryName: 'Thaïlande', category: 'bureaucratic', title: 'Zones grises du visa long séjour', description: "Les règles de visa changent fréquemment et les agents d'immigration appliquent des interprétations variables.", severity: 7, visibility: 'emerging', sources: ['Immigration Bureau Thailand'], affectedProfiles: ['digital_nomad', 'retraité', 'freelance'], mitigationTips: ["Utiliser un agent de visa réputé", "Toujours avoir un plan de sortie vers un pays voisin"] },
      { id: r('TH',3,'corruption'), countryId: 'TH', countryName: 'Thaïlande', category: 'corruption', title: 'Corruption policière ciblant les étrangers', description: "Les contrôles routiers et vérifications de documents donnent souvent lieu à des demandes de paiement informel.", severity: 6, visibility: 'subtle', sources: ['Transparency International'], affectedProfiles: ['expatrié', 'digital_nomad', 'touriste'], mitigationTips: ["Toujours avoir ses documents en règle sur soi", "Demander un reçu officiel en cas d'amende"] },
      { id: r('TH',4,'cultural'), countryId: 'TH', countryName: 'Thaïlande', category: 'cultural', title: 'Loi de lèse-majesté strictement appliquée', description: "Toute critique de la monarchie, même en ligne, est passible de 15 ans de prison.", severity: 9, visibility: 'subtle', sources: ['Amnesty International', 'RSF'], affectedProfiles: ['expatrié', 'digital_nomad', 'journaliste'], mitigationTips: ["Ne jamais commenter la monarchie thaïlandaise", "Éviter de partager du contenu politique thaïlandais"] },
    ],
  },
  {
    countryId: 'VN', countryName: 'Vietnam', overallLatentScore: 6,
    corruptionScore: 7, legalTrapScore: 6, culturalRiskScore: 4, financialRiskScore: 6, bureaucraticScore: 7, socialRiskScore: 3,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('VN',1,'corruption'), countryId: 'VN', countryName: 'Vietnam', category: 'corruption', title: 'Pots-de-vin systémiques dans l\'administration', description: "Les démarches administratives impliquent souvent des paiements officieux pour accélérer les procédures.", severity: 7, visibility: 'subtle', sources: ['Transparency International', 'Banque Mondiale'], affectedProfiles: ['entrepreneur', 'investisseur'], mitigationTips: ["Passer par un intermédiaire local de confiance", "Documenter toutes les transactions"] },
      { id: r('VN',2,'financial'), countryId: 'VN', countryName: 'Vietnam', category: 'financial', title: 'Restrictions sur le rapatriement de capitaux', description: "Sortir des fonds du Vietnam nécessite des justificatifs stricts et des délais bancaires importants.", severity: 7, visibility: 'invisible', sources: ['Banque d\'État du Vietnam'], affectedProfiles: ['investisseur', 'entrepreneur', 'freelance'], mitigationTips: ["Ouvrir un compte dans une banque internationale présente au Vietnam", "Conserver tous les justificatifs d'origine des fonds"] },
      { id: r('VN',3,'legal_trap'), countryId: 'VN', countryName: 'Vietnam', category: 'legal_trap', title: 'Interdiction de détenir des biens immobiliers fonciers', description: "Les étrangers ne peuvent acheter que des appartements, avec un bail limité à 50 ans renouvelable.", severity: 6, visibility: 'invisible', sources: ['Loi foncière du Vietnam'], affectedProfiles: ['investisseur', 'retraité'], mitigationTips: ["Vérifier les conditions de renouvellement du bail", "Privilégier les projets immobiliers approuvés pour les étrangers"] },
    ],
  },
  {
    countryId: 'MY', countryName: 'Malaisie', overallLatentScore: 5,
    corruptionScore: 5, legalTrapScore: 5, culturalRiskScore: 5, financialRiskScore: 4, bureaucraticScore: 5, socialRiskScore: 5,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('MY',1,'cultural'), countryId: 'MY', countryName: 'Malaisie', category: 'cultural', title: 'Dualité juridique civil/charia', description: "Certaines régions appliquent la charia aux musulmans, créant une complexité juridique pour les affaires mixtes.", severity: 6, visibility: 'invisible', sources: ['Département judiciaire de Malaisie'], affectedProfiles: ['entrepreneur', 'expatrié', 'investisseur'], mitigationTips: ["Se renseigner sur le cadre juridique applicable dans chaque État", "Consulter un avocat familier des deux systèmes"] },
      { id: r('MY',2,'bureaucratic'), countryId: 'MY', countryName: 'Malaisie', category: 'bureaucratic', title: 'Durcissement du programme MM2H', description: "Le visa de résidence Malaysia My Second Home a vu ses conditions drastiquement relevées, excluant de nombreux candidats.", severity: 7, visibility: 'emerging', sources: ['Ministry of Tourism Malaysia'], affectedProfiles: ['retraité', 'investisseur', 'digital_nomad'], mitigationTips: ["Vérifier les seuils financiers actuels avant de postuler", "Considérer le visa DE Rantau comme alternative"] },
      { id: r('MY',3,'social'), countryId: 'MY', countryName: 'Malaisie', category: 'social', title: 'Tensions ethniques latentes', description: "Les politiques de discrimination positive (bumiputera) peuvent limiter les opportunités commerciales pour les non-Malais.", severity: 5, visibility: 'subtle', sources: ['Banque Mondiale', 'OCDE'], affectedProfiles: ['entrepreneur', 'investisseur'], mitigationTips: ["S'associer avec un partenaire local bumiputera si nécessaire", "Cibler les zones franches économiques"] },
    ],
  },
  {
    countryId: 'ID', countryName: 'Indonésie', overallLatentScore: 7,
    corruptionScore: 7, legalTrapScore: 7, culturalRiskScore: 5, financialRiskScore: 6, bureaucraticScore: 8, socialRiskScore: 4,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('ID',1,'bureaucratic'), countryId: 'ID', countryName: 'Indonésie', category: 'bureaucratic', title: 'Bureaucratie imprévisible pour les permis de travail', description: "L'obtention du KITAS nécessite de multiples allers-retours administratifs avec des exigences changeantes.", severity: 8, visibility: 'subtle', sources: ['Banque Mondiale', 'Ministère de la Main-d\'œuvre'], affectedProfiles: ['salarié', 'entrepreneur', 'expatrié'], mitigationTips: ["Passer par un sponsor ou agent agréé", "Prévoir des délais de 3 à 6 mois"] },
      { id: r('ID',2,'corruption'), countryId: 'ID', countryName: 'Indonésie', category: 'corruption', title: 'Corruption endémique dans les affaires', description: "Les projets immobiliers et commerciaux impliquent fréquemment des intermédiaires demandant des commissions non officielles.", severity: 7, visibility: 'subtle', sources: ['Transparency International', 'KPK'], affectedProfiles: ['investisseur', 'entrepreneur'], mitigationTips: ["Travailler uniquement avec des partenaires vérifiés", "Utiliser des cabinets d'avocats internationaux"] },
      { id: r('ID',3,'legal_trap'), countryId: 'ID', countryName: 'Indonésie', category: 'legal_trap', title: 'Propriété étrangère limitée via le droit d\'usage', description: "Les étrangers ne peuvent obtenir qu'un droit d'usage (Hak Pakai) de 80 ans maximum, jamais la pleine propriété foncière.", severity: 7, visibility: 'invisible', sources: ['Loi agraire indonésienne'], affectedProfiles: ['investisseur', 'retraité'], mitigationTips: ["Utiliser une structure PT PMA pour investir", "Faire vérifier tout contrat par un notaire agréé"] },
    ],
  },
  {
    countryId: 'CO', countryName: 'Colombie', overallLatentScore: 6,
    corruptionScore: 7, legalTrapScore: 5, culturalRiskScore: 3, financialRiskScore: 5, bureaucraticScore: 6, socialRiskScore: 7,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('CO',1,'social'), countryId: 'CO', countryName: 'Colombie', category: 'social', title: 'Insécurité ciblant les étrangers visibles', description: "Les expatriés sont souvent ciblés pour des arnaques et vols dans les grandes villes, notamment Bogotá et Medellín.", severity: 7, visibility: 'subtle', sources: ['OSAC', 'Ministère des Affaires Étrangères'], affectedProfiles: ['digital_nomad', 'expatrié', 'touriste'], mitigationTips: ["Éviter d'afficher des signes extérieurs de richesse", "Utiliser des taxis par application uniquement"] },
      { id: r('CO',2,'financial'), countryId: 'CO', countryName: 'Colombie', category: 'financial', title: 'Contrôles stricts sur les transferts internationaux', description: "Les banques colombiennes signalent automatiquement les transferts importants, entraînant des blocages et vérifications.", severity: 6, visibility: 'invisible', sources: ['DIAN', 'Banque de la République de Colombie'], affectedProfiles: ['freelance', 'entrepreneur', 'investisseur'], mitigationTips: ["Déclarer proactivement l'origine des fonds", "Fractionner les transferts avec justificatifs"] },
      { id: r('CO',3,'corruption'), countryId: 'CO', countryName: 'Colombie', category: 'corruption', title: 'Corruption dans les processus de visa', description: "Les intermédiaires proposent des raccourcis payants pour accélérer les démarches migratoires.", severity: 5, visibility: 'subtle', sources: ['Transparency International'], affectedProfiles: ['expatrié', 'entrepreneur'], mitigationTips: ["Passer uniquement par les canaux officiels de Migración Colombia", "Se méfier des offres trop rapides"] },
    ],
  },
  {
    countryId: 'MX', countryName: 'Mexique', overallLatentScore: 6,
    corruptionScore: 7, legalTrapScore: 5, culturalRiskScore: 3, financialRiskScore: 5, bureaucraticScore: 6, socialRiskScore: 7,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('MX',1,'legal_trap'), countryId: 'MX', countryName: 'Mexique', category: 'legal_trap', title: 'Zone restreinte pour l\'achat immobilier côtier', description: "Les étrangers ne peuvent pas acheter directement dans la zone de 50 km des côtes sans fidéicommis bancaire.", severity: 7, visibility: 'invisible', sources: ['Constitution mexicaine', 'Banque Mondiale'], affectedProfiles: ['investisseur', 'retraité'], mitigationTips: ["Utiliser un fideicomiso via une banque mexicaine réputée", "Vérifier la validité du titre de propriété auprès du registre public"] },
      { id: r('MX',2,'social'), countryId: 'MX', countryName: 'Mexique', category: 'social', title: 'Insécurité variable selon les régions', description: "Certains États présentent des risques sécuritaires élevés souvent sous-estimés par les nouveaux arrivants.", severity: 8, visibility: 'emerging', sources: ['OSAC', 'Secrétariat de la Sécurité Publique'], affectedProfiles: ['expatrié', 'digital_nomad', 'entrepreneur'], mitigationTips: ["Consulter les alertes régionales avant de s'installer", "Privilégier les zones à faible risque comme Mérida ou Querétaro"] },
      { id: r('MX',3,'corruption'), countryId: 'MX', countryName: 'Mexique', category: 'corruption', title: 'Extorsion policière envers les étrangers', description: "Les contrôles routiers donnent fréquemment lieu à des demandes de « mordida » (pot-de-vin).", severity: 6, visibility: 'subtle', sources: ['Transparency International', 'INEGI'], affectedProfiles: ['expatrié', 'touriste', 'digital_nomad'], mitigationTips: ["Connaître ses droits et demander le numéro de badge", "Filmer discrètement les interactions si possible"] },
    ],
  },
  {
    countryId: 'MA', countryName: 'Maroc', overallLatentScore: 6,
    corruptionScore: 6, legalTrapScore: 5, culturalRiskScore: 5, financialRiskScore: 5, bureaucraticScore: 7, socialRiskScore: 4,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('MA',1,'bureaucratic'), countryId: 'MA', countryName: 'Maroc', category: 'bureaucratic', title: 'Lourdeur administrative pour la création d\'entreprise', description: "Le parcours de création d'entreprise implique de nombreux interlocuteurs et des délais peu prévisibles.", severity: 7, visibility: 'subtle', sources: ['Banque Mondiale', 'OCDE'], affectedProfiles: ['entrepreneur', 'freelance'], mitigationTips: ["Passer par un Centre Régional d'Investissement", "Prévoir un budget pour un accompagnement juridique"] },
      { id: r('MA',2,'financial'), countryId: 'MA', countryName: 'Maroc', category: 'financial', title: 'Contrôle des changes strict', description: "Le dirham n'est pas librement convertible et le rapatriement de bénéfices est soumis à autorisation.", severity: 7, visibility: 'invisible', sources: ['Office des Changes du Maroc', 'Bank Al-Maghrib'], affectedProfiles: ['investisseur', 'entrepreneur', 'freelance'], mitigationTips: ["Structurer les flux financiers via un compte en devises", "Obtenir les autorisations de l'Office des Changes en amont"] },
      { id: r('MA',3,'corruption'), countryId: 'MA', countryName: 'Maroc', category: 'corruption', title: 'Corruption dans les marchés publics et le foncier', description: "L'accès au foncier et aux marchés publics implique souvent des réseaux d'influence et des pratiques opaques.", severity: 6, visibility: 'subtle', sources: ['Transparency International', 'Instance Nationale de la Probité'], affectedProfiles: ['investisseur', 'entrepreneur'], mitigationTips: ["Travailler avec des partenaires locaux établis", "Documenter chaque étape des transactions"] },
    ],
  },
  {
    countryId: 'DE', countryName: 'Allemagne', overallLatentScore: 4,
    corruptionScore: 2, legalTrapScore: 5, culturalRiskScore: 4, financialRiskScore: 5, bureaucraticScore: 6, socialRiskScore: 3,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('DE',1,'bureaucratic'), countryId: 'DE', countryName: 'Allemagne', category: 'bureaucratic', title: 'Anmeldung obligatoire et bloquante', description: "Sans enregistrement de domicile (Anmeldung), il est impossible d'ouvrir un compte bancaire ou de signer un contrat.", severity: 7, visibility: 'subtle', sources: ['Bundesverwaltungsamt'], affectedProfiles: ['expatrié', 'salarié', 'étudiant'], mitigationTips: ["Trouver un logement avec bail accepté par le Bürgeramt avant l'arrivée", "Utiliser une adresse temporaire via un service spécialisé"] },
      { id: r('DE',2,'financial'), countryId: 'DE', countryName: 'Allemagne', category: 'financial', title: 'Système fiscal complexe avec impôt religieux', description: "L'Allemagne prélève automatiquement un impôt religieux (Kirchensteuer) sauf désinscription explicite.", severity: 5, visibility: 'invisible', sources: ['Bundesministerium der Finanzen'], affectedProfiles: ['salarié', 'expatrié'], mitigationTips: ["Se désinscrire de la taxe religieuse au Finanzamt si non pratiquant", "Consulter un Steuerberater pour optimiser sa déclaration"] },
      { id: r('DE',3,'cultural'), countryId: 'DE', countryName: 'Allemagne', category: 'cultural', title: 'Rigidité des règles de voisinage', description: "Les règlements de copropriété et lois sur le bruit sont strictement appliqués et source fréquente de conflits.", severity: 4, visibility: 'subtle', sources: ['Deutscher Mieterbund'], affectedProfiles: ['expatrié', 'famille', 'étudiant'], mitigationTips: ["Lire attentivement la Hausordnung avant d'emménager", "Respecter les heures de silence (Ruhezeiten)"] },
    ],
  },
  {
    countryId: 'US', countryName: 'États-Unis', overallLatentScore: 5,
    corruptionScore: 3, legalTrapScore: 6, culturalRiskScore: 3, financialRiskScore: 6, bureaucraticScore: 5, socialRiskScore: 5,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('US',1,'financial'), countryId: 'US', countryName: 'États-Unis', category: 'financial', title: 'Obligation fiscale mondiale pour les résidents permanents', description: "Les détenteurs de Green Card sont imposés sur leurs revenus mondiaux, même après avoir quitté le territoire.", severity: 8, visibility: 'invisible', sources: ['IRS', 'OCDE'], affectedProfiles: ['investisseur', 'expatrié', 'entrepreneur'], mitigationTips: ["Consulter un CPA spécialisé en fiscalité internationale", "Évaluer les implications avant d'accepter la Green Card"] },
      { id: r('US',2,'social'), countryId: 'US', countryName: 'États-Unis', category: 'social', title: 'Coût prohibitif de la santé sans assurance', description: "Une hospitalisation peut générer des factures de dizaines de milliers de dollars sans couverture adéquate.", severity: 9, visibility: 'subtle', sources: ['Kaiser Family Foundation', 'CDC'], affectedProfiles: ['expatrié', 'freelance', 'digital_nomad'], mitigationTips: ["Souscrire une assurance santé complète avant l'arrivée", "Vérifier la couverture employeur en détail"] },
      { id: r('US',3,'legal_trap'), countryId: 'US', countryName: 'États-Unis', category: 'legal_trap', title: 'Complexité du système d\'immigration', description: "Les délais de traitement des visas de travail (H-1B, L-1) sont imprévisibles et les refus fréquents.", severity: 7, visibility: 'emerging', sources: ['USCIS', 'Department of State'], affectedProfiles: ['salarié', 'entrepreneur', 'étudiant'], mitigationTips: ["Engager un avocat d'immigration dès le début du processus", "Avoir un plan B en cas de refus de visa"] },
      { id: r('US',4,'financial'), countryId: 'US', countryName: 'États-Unis', category: 'financial', title: 'FATCA et reporting bancaire international', description: "Les résidents américains doivent déclarer tous leurs comptes étrangers sous peine de lourdes sanctions.", severity: 7, visibility: 'invisible', sources: ['IRS', 'FinCEN'], affectedProfiles: ['investisseur', 'expatrié', 'entrepreneur'], mitigationTips: ["Déposer le formulaire FBAR chaque année", "Déclarer tous les comptes dépassant 10 000 USD cumulés"] },
    ],
  },
  {
    countryId: 'CA', countryName: 'Canada', overallLatentScore: 3,
    corruptionScore: 2, legalTrapScore: 3, culturalRiskScore: 2, financialRiskScore: 5, bureaucraticScore: 4, socialRiskScore: 3,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('CA',1,'financial'), countryId: 'CA', countryName: 'Canada', category: 'financial', title: 'Fiscalité élevée et complexe entre provinces', description: "Les taux d'imposition varient fortement entre provinces, créant des pièges fiscaux pour les nouveaux résidents.", severity: 6, visibility: 'subtle', sources: ['Agence du Revenu du Canada', 'OCDE'], affectedProfiles: ['salarié', 'entrepreneur', 'investisseur'], mitigationTips: ["Comparer la fiscalité provinciale avant de choisir sa résidence", "Consulter un comptable agréé canadien"] },
      { id: r('CA',2,'social'), countryId: 'CA', countryName: 'Canada', category: 'social', title: 'Difficultés de reconnaissance des diplômes étrangers', description: "De nombreux professionnels qualifiés ne peuvent exercer leur métier sans une revalidation longue et coûteuse.", severity: 7, visibility: 'subtle', sources: ['IRCC', 'Statistique Canada'], affectedProfiles: ['salarié', 'expatrié'], mitigationTips: ["Lancer la procédure de reconnaissance avant l'immigration", "Vérifier les exigences de l'ordre professionnel provincial"] },
      { id: r('CA',3,'bureaucratic'), countryId: 'CA', countryName: 'Canada', category: 'bureaucratic', title: 'Délais d\'immigration en forte augmentation', description: "Les délais de traitement de la résidence permanente dépassent régulièrement 18 mois.", severity: 6, visibility: 'emerging', sources: ['IRCC'], affectedProfiles: ['expatrié', 'salarié', 'famille'], mitigationTips: ["Déposer sa demande le plus tôt possible", "Utiliser Entrée Express pour un traitement prioritaire"] },
    ],
  },
  {
    countryId: 'CH', countryName: 'Suisse', overallLatentScore: 3,
    corruptionScore: 1, legalTrapScore: 4, culturalRiskScore: 4, financialRiskScore: 4, bureaucraticScore: 3, socialRiskScore: 4,
    lastUpdated: '2026-01-15',
    hiddenRisks: [
      { id: r('CH',1,'financial'), countryId: 'CH', countryName: 'Suisse', category: 'financial', title: 'Coût de la vie parmi les plus élevés au monde', description: "L'assurance maladie obligatoire, le logement et l'alimentation représentent des charges mensuelles très élevées.", severity: 8, visibility: 'subtle', sources: ['OFS', 'EIU'], affectedProfiles: ['expatrié', 'salarié', 'famille'], mitigationTips: ["Comparer les primes d'assurance maladie chaque année", "Envisager de résider à la frontière pour réduire les coûts"] },
      { id: r('CH',2,'cultural'), countryId: 'CH', countryName: 'Suisse', category: 'cultural', title: 'Intégration sociale difficile et lente', description: "La société suisse est réputée fermée aux nouveaux arrivants, avec des codes sociaux implicites et exigeants.", severity: 6, visibility: 'subtle', sources: ['InterNations Expat Survey', 'OFS'], affectedProfiles: ['expatrié', 'famille', 'salarié'], mitigationTips: ["Rejoindre des associations locales (Verein/association)", "Apprendre la langue locale du canton de résidence"] },
      { id: r('CH',3,'bureaucratic'), countryId: 'CH', countryName: 'Suisse', category: 'bureaucratic', title: 'Permis de séjour conditionné au canton', description: "Chaque canton applique ses propres règles pour les permis de séjour et de travail, créant une complexité administrative.", severity: 5, visibility: 'invisible', sources: ['Secrétariat d\'État aux migrations'], affectedProfiles: ['salarié', 'entrepreneur', 'expatrié'], mitigationTips: ["Se renseigner auprès de l'office cantonal de la population", "Anticiper les délais de changement de canton"] },
    ],
  },
];
