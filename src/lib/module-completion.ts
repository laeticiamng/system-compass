export type ModuleAuditCategory = 'featureEnrichments' | 'moduleElements' | 'leastDeveloped' | 'nonWorking';

export type ModuleAudit = {
  id: string;
  title: string;
  subtitle: string;
  items: Record<ModuleAuditCategory, string[]>;
};

export const moduleAudits: ModuleAudit[] = [
  // ===== MODULE 1: COUNTRY ANALYSIS =====
  {
    id: 'country-analysis',
    title: 'Country Analysis',
    subtitle: 'Profil pays, pyramides et intelligence systeme.',
    items: {
      featureEnrichments: [
        'Ajouter un score d alignement dynamique par profil utilisateur.',
        'Deployer des comparatifs multi-criteres avec ponderations personnalisees.',
        'Integrer des alertes de changement de gouvernance par pays.',
        'Proposer des scenarios si/alors (choc politique, crise, reforme).',
        'Ajouter un export PDF synthese (1 page) par pays.',
      ],
      moduleElements: [
        'Cartographie des risques sectoriels par region interne.',
        'Historique des tendances sur 5-10 ans.',
        'Sources et dates de mise a jour visibles.',
        'Indicateurs de qualite de vie contextualises par profil.',
        'Recommandations d actions rapides par niveau de risque.',
      ],
      leastDeveloped: [
        'Couverture des micro-regions (villes secondaires).',
        'Donnees d acces au logement (disponibilite/prix).',
        'Cartes d influence locale (acteurs cles).',
        'Signalements terrain (observations utilisateurs).',
        'Bibliotheque de cas reels indexes par pays.',
      ],
      nonWorking: [
        'Pipeline d actualisation automatique des indicateurs.',
        'Connexion aux alertes geopolitiques temps reel.',
        'Synchronisation avec les dossiers utilisateurs.',
        'Exports PDF multi-langues automatises.',
        'Version offline pour consultation en mobilite.',
      ],
    },
  },
  // ===== MODULE 2: EXIT KEYS =====
  {
    id: 'exit-keys',
    title: 'Stratégies',
    subtitle: 'Strategies personnalisees selon le profil et les objectifs.',
    items: {
      featureEnrichments: [
        'Ajouter un simulateur de couts par strategie (CAPEX/OPEX).',
        'Introduire un score de faisabilite en temps reel.',
        'Creer des itineraires multi-etapes (plan A/B/C).',
        'Automatiser des checklists par strategie selectionnee.',
        'Ajouter un mode risque minimal vs vitesse maximale.',
      ],
      moduleElements: [
        'Details de prerequis juridiques par pays cible.',
        'Calendriers predictifs par type de demarche.',
        'Bibliotheque d exemples de parcours reussis.',
        'Criteres d eligibilite visibles et ponderes.',
        'Raccourcis vers ressources et contacts utiles.',
      ],
      leastDeveloped: [
        'Indicateurs de complexite administrative par pays.',
        'Scenarios fiscaux compares (residence, societe).',
        'Mode collectif (famille/equipe) avec dependances.',
        'Suivi post-installation (90 jours).',
        'Compatibilite des strategies avec profils non standards.',
      ],
      nonWorking: [
        'Connexion automatique aux dossiers (creation/suivi).',
        'Alertes d echeances par strategie.',
        'Exports en PDF des parcours personnalises.',
        'Synchronisation des donnees profil avec comparateurs.',
        'Historique des iterations de strategie.',
      ],
    },
  },
  // ===== MODULE 3: DASHBOARD & DOSSIERS =====
  {
    id: 'dashboard',
    title: 'Dashboard & Dossiers',
    subtitle: 'Suivi des progres, dossiers et timelines.',
    items: {
      featureEnrichments: [
        'Ajouter un tableau de bord risque avec alertes prioritaires.',
        'Creer des modeles de dossiers pre-remplis par scenario.',
        'Ajouter un calendrier consolide multi-modules.',
        'Integrer des objectifs trimestriels et OKR personnels.',
        'Proposer une synthese hebdo envoyee par email.',
      ],
      moduleElements: [
        'Widgets configurables par utilisateur.',
        'Timeline interactive par dossier.',
        'Archivage et duplication de dossiers.',
        'Historique des decisions et notes.',
        'Export des jalons au format calendrier.',
      ],
      leastDeveloped: [
        'Automatisation des rappels multi-canaux.',
        'Suivi des depenses liees au projet.',
        'Tableau des risques consolide par dossier.',
        'Vue plan B avec bascule rapide.',
        'Mode collaboration avec commentaires.',
      ],
      nonWorking: [
        'Synchronisation bidirectionnelle avec calendrier externe.',
        'Notifications push persistantes.',
        'Exports PDF des dossiers complets.',
        'Mise a jour automatique des statuts depuis d autres modules.',
        'Historique complet des modifications (audit log).',
      ],
    },
  },
  // ===== MODULE 4: COMPARATIVE ANALYSIS =====
  {
    id: 'comparative-analysis',
    title: 'Comparative Analysis',
    subtitle: 'Comparaisons multi-pays et multi-strategies.',
    items: {
      featureEnrichments: [
        'Ajouter des ponderations par objectif utilisateur.',
        'Integrer des comparaisons cout de vie detaillees.',
        'Permettre l export des comparatifs (PDF/CSV).',
        'Ajouter des visualisations radar enrichies.',
        'Creer des shortlists partageables.',
      ],
      moduleElements: [
        'Filtres avances par profil et contraintes.',
        'Historique des comparaisons sauvegardees.',
        'Notes collaboratives par comparaison.',
        'Segments de population (famille, solo, entrepreneur).',
        'Comparaison d options de residence legales.',
      ],
      leastDeveloped: [
        'Comparaison effet reseau (diaspora, soutien local).',
        'Comparaison du risque juridique sectoriel.',
        'Scenarios de volatilite (inflation, stabilite).',
        'Comparaison du systeme de sante par profil.',
        'Simulateur de trajectoire sur 12-24 mois.',
      ],
      nonWorking: [
        'Synchronisation avec les dossiers utilisateurs.',
        'Export automatise multi-langue.',
        'Comparaison dynamique en temps reel par API externe.',
        'Partage public securise par lien.',
        'Validation automatique des donnees d entree.',
      ],
    },
  },
  // ===== MODULE 5: TERRAIN REALITIES =====
  {
    id: 'terrain-realities',
    title: 'Terrain Realities',
    subtitle: 'Risques, friction, acteurs et gouvernance terrain.',
    items: {
      featureEnrichments: [
        'Ajouter un module de veille et signaux faibles.',
        'Construire un score de friction par secteur.',
        'Integrer des checklists de conformite locale.',
        'Ajouter une cartographie des acteurs de pouvoir.',
        'Creer des plans de mitigation exportables.',
      ],
      moduleElements: [
        'Fiches d acteurs (role, fiabilite, influence).',
        'Registre des risques par phase de projet.',
        'Journal d observations terrain datees.',
        'Guides d entree marche par secteur.',
        'Analyse des dependances critiques.',
      ],
      leastDeveloped: [
        'Analyse des circuits informels et frictions non officielles.',
        'Benchmark des partenaires locaux fiables.',
        'Cartographie des delais administratifs reels.',
        'Revue des contreparties et concessions usuelles.',
        'Detection d incoherences reglementaires.',
      ],
      nonWorking: [
        'Synchronisation avec TraceOS pour la tracabilite.',
        'Exports PDF des plans de mitigation.',
        'Alertes sur changements reglementaires.',
        'Historique des preuves et sources externes.',
        'Mode hors ligne pour usage terrain.',
      ],
    },
  },
  // ===== MODULE 6: PYRAMID QUIZ & GAME =====
  {
    id: 'pyramid-quiz',
    title: 'Pyramid Quiz & Game',
    subtitle: 'Apprentissage gamifie des systemes pays.',
    items: {
      featureEnrichments: [
        'Ajouter des scenarios adaptatifs par niveau.',
        'Integrer un systeme de saisons/evenements speciaux.',
        'Ajouter des classements anonymises.',
        'Creer des feedbacks detailles par decision.',
        'Deployer des defis cooperatifs en equipe.',
      ],
      moduleElements: [
        'Bibliotheque de scenarios par region.',
        'Systeme de progression et badges.',
        'Tutoriels interactifs au demarrage.',
        'Recompenses contextuelles utiles (guides, checklists).',
        'Mode rapide micro-sessions.',
      ],
      leastDeveloped: [
        'Mode simulation long terme (10-20 tours).',
        'Diversite de profils jouables.',
        'Arbres de consequences visibles.',
        'Journal de decisions exportable.',
        'Personnalisation des objectifs d apprentissage.',
      ],
      nonWorking: [
        'Synchronisation des scores avec le profil utilisateur.',
        'Sauvegarde cloud multi-appareils.',
        'Partage securise des resultats.',
        'Export des parcours de jeu.',
        'Notifications de reprise de session.',
      ],
    },
  },
  // ===== MODULE 7: LIFE TRAJECTORY =====
  {
    id: 'life-trajectory',
    title: 'Life Trajectory',
    subtitle: 'Projection et trajectoires multi-systemes.',
    items: {
      featureEnrichments: [
        'Ajouter des trajectoires multi-objectifs.',
        'Integrer des jalons personnalisables.',
        'Creer une vue plan B parallele.',
        'Ajouter un simulateur de risque financier.',
        'Permettre l export des trajectoires.',
      ],
      moduleElements: [
        'Graphiques interactifs par phase.',
        'Hypotheses modifiables avec impact visuel.',
        'Comparaisons avant/apres decision.',
        'Notes et commentaires par etape.',
        'Synchronisation avec le dossier principal.',
      ],
      leastDeveloped: [
        'Scenarios d imprevus majeurs.',
        'Alignement sante/finances (cout de couverture).',
        'Prise en compte du reseau local.',
        'Modele de temps de stabilisation.',
        'Indicatif de stress decisionnel.',
      ],
      nonWorking: [
        'Exports PDF multi-langues.',
        'Synchronisation automatique des donnees profil.',
        'Notifications de derive des hypotheses.',
        'Partage securise de trajectoire.',
        'Historique complet des versions.',
      ],
    },
  },
  // ===== MODULE 8: TRACEOS =====
  {
    id: 'traceos',
    title: 'TraceOS',
    subtitle: 'Tracabilite decisionnelle pour organisations.',
    items: {
      featureEnrichments: [
        'Ajouter un mode audit externe exportable.',
        'Creer des rapports de conformite automatiques.',
        'Integrer des workflows multi-etapes configurables.',
        'Ajouter un moteur de recherche avance.',
        'Creer des tableaux de bord par unite.',
      ],
      moduleElements: [
        'Journal des decisions avec preuves.',
        'Gestion des roles et permissions.',
        'Templates de decision par type.',
        'Alertes et rappels de validation.',
        'Integrations webhook multi-sources.',
      ],
      leastDeveloped: [
        'Score de qualite decisionnelle.',
        'Analyse des biais par role.',
        'Archivage legal a long terme.',
        'Comparaison inter-equipes.',
        'Mode post-mortem collaboratif.',
      ],
      nonWorking: [
        'Synchronisation avec les modules Terrain/Latent.',
        'Exports multi-format (CSV, PDF, JSON).',
        'Signature electronique integree.',
        'Notifications push multi-canaux.',
        'Indexation semantique des decisions.',
      ],
    },
  },
  // ===== MODULE 9: LATENT =====
  {
    id: 'latent',
    title: 'Latent',
    subtitle: 'Zones de tension et signaux emergents.',
    items: {
      featureEnrichments: [
        'Ajouter un scoring d intensite des tensions.',
        'Creer un mode journal de signaux chronologique.',
        'Integrer des recommandations d actions prudentes.',
        'Permettre la fusion automatique de zones proches.',
        'Ajouter des exports vers TraceOS.',
      ],
      moduleElements: [
        'Cartes de zones avec tags et priorites.',
        'Historique des evolutions de chaque zone.',
        'Notes et preuves attachees.',
        'Filtrage par categorie et statut.',
        'Partage controle entre collaborateurs.',
      ],
      leastDeveloped: [
        'Vue cartographie des zones par pays.',
        'Detection de signaux faibles automatises.',
        'Analyse de correlation entre zones.',
        'Alertes sur seuils de bascule.',
        'Bibliotheque d exemples anonymises.',
      ],
      nonWorking: [
        'Synchronisation temps reel multi-appareils.',
        'Exports PDF multi-langues.',
        'Connexion automatique avec dossiers.',
        'Notifications push sur changements.',
        'API d integration externe.',
      ],
    },
  },
  // ===== MODULE 10: IRREVERSA =====
  {
    id: 'irreversa',
    title: 'Irreversa',
    subtitle: 'Documentation des seuils irreversibles.',
    items: {
      featureEnrichments: [
        'Ajouter un mode validation externe signe.',
        'Creer des modeles de seuils par scenario.',
        'Proposer des rappels de relecture periodiques.',
        'Integrer un score de criticite.',
        'Exporter un certificat PDF horodate.',
      ],
      moduleElements: [
        'Fiches seuils avec contexte detaille.',
        'Gestion des temoins et validations.',
        'Historique de version pour chaque seuil.',
        'Journal des decisions associees.',
        'Liens vers strategies Exit Keys.',
      ],
      leastDeveloped: [
        'Regles d irreversibilite comparees.',
        'Bibliotheque de seuils anonymises.',
        'Rappels de check-in sur consequences.',
        'Visualisation des impacts a 6-12 mois.',
        'Lien direct avec les jalons du dossier.',
      ],
      nonWorking: [
        'Signature electronique qualifiee.',
        'Exports multi-format certifies.',
        'Synchronisation avec TraceOS.',
        'Notifications automatiques aux temoins.',
        'Partage securise par lien.',
      ],
    },
  },
  // ===== MODULE 11: OVI =====
  {
    id: 'ovi',
    title: 'OVI',
    subtitle: 'Optimisation et validation d intelligence.',
    items: {
      featureEnrichments: [
        'Ajouter un espace de collecte de preuves.',
        'Creer un score de robustesse des hypotheses.',
        'Ajouter des templates par type de decision.',
        'Integrer un fil de discussion avec l equipe.',
        'Exporter une synthese executive.',
      ],
      moduleElements: [
        'Hypotheses centralisees et tracables.',
        'Contradictions et angles morts identifies.',
        'Priorisation des actions de validation.',
        'Suivi des sources utilisees.',
        'Checklist de validation finale.',
      ],
      leastDeveloped: [
        'Bibliotheque d exemples d OVI reussies.',
        'Moteur de suggestions automatiques.',
        'Analyse de biais cognitifs.',
        'Mode review post-decision.',
        'Alignement avec la strategie d entreprise.',
      ],
      nonWorking: [
        'Connexion aux donnees Terrain/Latent.',
        'Exports multi-format.',
        'Notifications de suivi des validations.',
        'Synchronisation avec dossiers utilisateurs.',
        'Historique des versions detaille.',
      ],
    },
  },
  // ===== MODULE 12: PMO (ROADMAP OS) =====
  {
    id: 'pmo-roadmap',
    title: 'PMO - Roadmap OS',
    subtitle: 'Planification strategique et suivi d initiatives.',
    items: {
      featureEnrichments: [
        'Ajouter des vues Kanban, Gantt et Liste combinees.',
        'Integrer un mode focus semaine pour micro-sprints.',
        'Creer des templates d OKR par secteur.',
        'Ajouter un calcul automatique du chemin critique.',
        'Permettre la creation de jalons conditionnels.',
      ],
      moduleElements: [
        'Objectifs avec horizons 30/90/365 jours.',
        'Initiatives liees aux objectifs.',
        'Milestones avec dates et responsables.',
        'Dependances inter-initiatives.',
        'Vue consolidee par phase.',
      ],
      leastDeveloped: [
        'Reporting automatique aux parties prenantes.',
        'Simulation de scenarios what-if.',
        'Integration avec outils externes (Jira, Asana).',
        'Alertes de derive de planning.',
        'Historique des changements de scope.',
      ],
      nonWorking: [
        'Exports automatises vers calendriers.',
        'Notifications de jalons a J-7.',
        'Synchronisation temps reel multi-utilisateurs.',
        'PDF de synthese projet.',
        'API webhook pour integrations tierces.',
      ],
    },
  },
  // ===== MODULE 13: PMO (RISK ENGINE) =====
  {
    id: 'pmo-risks',
    title: 'PMO - Risk Engine',
    subtitle: 'Gestion et mitigation des risques projet.',
    items: {
      featureEnrichments: [
        'Ajouter une matrice impact/probabilite interactive.',
        'Creer un workflow de revue periodique automatise.',
        'Integrer des templates de risques par secteur.',
        'Permettre la creation d initiatives de mitigation en 1 clic.',
        'Ajouter un score de risque global par projet.',
      ],
      moduleElements: [
        'Registre des risques avec niveaux.',
        'Strategies de mitigation associees.',
        'Revues periodiques avec suivi.',
        'Liens avec les dependances du Roadmap.',
        'Historique des evolutions par risque.',
      ],
      leastDeveloped: [
        'Detection automatique de risques emergents.',
        'Benchmarks sectoriels de risques.',
        'Simulation Monte Carlo.',
        'Alertes de seuils critiques.',
        'Tableau de bord executif.',
      ],
      nonWorking: [
        'Synchronisation avec le module Latent.',
        'Exports PDF des plans de mitigation.',
        'Notifications aux proprietaires de risques.',
        'Integration API avec outils GRC.',
        'Archivage legal des revues.',
      ],
    },
  },
  // ===== MODULE 14: PMO (BUDGET RUNWAY) =====
  {
    id: 'pmo-budget',
    title: 'PMO - Budget Runway',
    subtitle: 'Suivi financier et scenarios budgetaires.',
    items: {
      featureEnrichments: [
        'Ajouter des graphiques de burn-rate.',
        'Creer des scenarios pessimiste/optimiste/realiste.',
        'Integrer des alertes de depassement.',
        'Permettre le suivi des engagements vs realise.',
        'Ajouter un calcul de runway automatique.',
      ],
      moduleElements: [
        'Lignes budgetaires par categorie.',
        'Scenarios multiples sauvegardes.',
        'Suivi des variations.',
        'Liens avec les initiatives du Roadmap.',
        'Export CSV des donnees.',
      ],
      leastDeveloped: [
        'Previsions automatiques basees sur l historique.',
        'Comparaison multi-projets.',
        'Integration comptable (QuickBooks, Xero).',
        'Alertes de cash-flow critique.',
        'Reporting pour investisseurs.',
      ],
      nonWorking: [
        'Synchronisation bancaire automatique.',
        'PDF de synthese financiere.',
        'Notifications de seuils.',
        'API d export vers ERP.',
        'Historique des revisions budgetaires.',
      ],
    },
  },
  // ===== MODULE 15: PMO (COMPLIANCE MATRIX) =====
  {
    id: 'pmo-compliance',
    title: 'PMO - Compliance Matrix',
    subtitle: 'Conformite reglementaire et suivi des obligations.',
    items: {
      featureEnrichments: [
        'Ajouter des frameworks pre-configures (RGPD, AI Act, MDR).',
        'Creer un score de conformite global.',
        'Integrer des checklists interactives.',
        'Permettre le mapping exigences/initiatives.',
        'Ajouter un mode audit avec export.',
      ],
      moduleElements: [
        'Frameworks reglementaires.',
        'Exigences detaillees par framework.',
        'Statut de conformite par exigence.',
        'Liens avec les initiatives de remediation.',
        'Historique des evaluations.',
      ],
      leastDeveloped: [
        'Detection automatique d ecarts.',
        'Benchmarks sectoriels.',
        'Integration avec outils GRC externes.',
        'Alertes d echeances reglementaires.',
        'Formation integree par exigence.',
      ],
      nonWorking: [
        'Exports certifies pour audits.',
        'Synchronisation avec preuves (Evidence Vault).',
        'Notifications aux responsables.',
        'API pour reporting automatise.',
        'Archivage legal des evaluations.',
      ],
    },
  },
  // ===== MODULE 16: FINANCIAL INTEL =====
  {
    id: 'financial-intel',
    title: 'Financial Safety Intel',
    subtitle: 'Intelligence financiere et prevention des arnaques.',
    items: {
      featureEnrichments: [
        'Ajouter un scanner de liens/emails suspects.',
        'Creer un mode verification rapide d opportunite.',
        'Integrer des alertes sectorielles en temps reel.',
        'Permettre le signalement communautaire.',
        'Ajouter un historique de consultations.',
      ],
      moduleElements: [
        'Top 7 arnaques par pays.',
        'Top 7 options legitimes par pays.',
        'Profil pays avec regulateurs.',
        'Sources et niveau de confiance.',
        'Checklists de protection.',
      ],
      leastDeveloped: [
        'Base de donnees d arnaques signalees.',
        'Scoring de fiabilite d entites.',
        'Comparaison inter-pays.',
        'Mode due diligence approfondi.',
        'Integration avec bases officielles.',
      ],
      nonWorking: [
        'Alertes push sur nouvelles arnaques.',
        'PDF de rapport securite.',
        'API de verification externe.',
        'Synchronisation avec dossiers.',
        'Mode offline.',
      ],
    },
  },
  // ===== MODULE 17: GOVERNANCE (B2B) =====
  {
    id: 'governance',
    title: 'Governance & Institutions',
    subtitle: 'Intelligence gouvernance pour entreprises.',
    items: {
      featureEnrichments: [
        'Ajouter des fiches d acteurs cles par pays.',
        'Creer un scoring de stabilite institutionnelle.',
        'Integrer des alertes de changement politique.',
        'Permettre le mapping des parties prenantes.',
        'Ajouter des recommandations sectorielles.',
      ],
      moduleElements: [
        'Scores par domaine (stabilite, friction, capture).',
        'Attractivite et competition sectorielle.',
        'Douanes et logistique.',
        'Checklist fiscale.',
        'Notes d analyse.',
      ],
      leastDeveloped: [
        'Intelligence sur les reformes en cours.',
        'Historique des changements.',
        'Comparaison regionale.',
        'Integration avec TraceOS.',
        'Mode prospectif.',
      ],
      nonWorking: [
        'Exports PDF executifs.',
        'Alertes de veille.',
        'API d integration CRM.',
        'Synchronisation avec dossiers.',
        'Visualisation cartographique.',
      ],
    },
  },
  // ===== MODULE 18: PARTNER PROGRAM =====
  {
    id: 'partner-program',
    title: 'Partner Program',
    subtitle: 'Gestion des partenaires et ambassadeurs.',
    items: {
      featureEnrichments: [
        'Ajouter un tableau de bord partenaire.',
        'Creer un systeme de commissions.',
        'Integrer des ressources marketing.',
        'Permettre le suivi des leads.',
        'Ajouter des certifications.',
      ],
      moduleElements: [
        'Formulaire de candidature.',
        'Workflow de validation.',
        'Charte ethique.',
        'Profils partenaires.',
        'Historique des collaborations.',
      ],
      leastDeveloped: [
        'Reporting de performance.',
        'Integration CRM.',
        'Programme de formation.',
        'Evenements partenaires.',
        'Support dedie.',
      ],
      nonWorking: [
        'Portail partenaire autonome.',
        'Tracking des conversions.',
        'Paiement automatique commissions.',
        'Notifications de leads.',
        'API partenaire.',
      ],
    },
  },
  // ===== MODULE 19: AUTHENTICATION & PROFILES =====
  {
    id: 'auth-profiles',
    title: 'Authentication & Profiles',
    subtitle: 'Gestion des comptes et donnees utilisateurs.',
    items: {
      featureEnrichments: [
        'Ajouter l authentification sociale (Google, Apple).',
        'Creer un systeme de 2FA.',
        'Integrer la gestion des sessions multi-appareils.',
        'Permettre l export des donnees personnelles (RGPD).',
        'Ajouter un mode compte invite.',
      ],
      moduleElements: [
        'Inscription et connexion securisees.',
        'Profil utilisateur editable.',
        'Gestion des preferences.',
        'Historique des connexions.',
        'Suppression de compte.',
      ],
      leastDeveloped: [
        'Recuperation de compte avancee.',
        'Audit log des actions.',
        'Integration SSO entreprise.',
        'Gestion des appareils autorises.',
        'Mode famille/equipe.',
      ],
      nonWorking: [
        'Notifications de securite.',
        'Alerte connexion suspecte.',
        'API de gestion utilisateurs.',
        'Synchronisation cross-platform.',
        'Backup automatique des donnees.',
      ],
    },
  },
  // ===== MODULE 20: ADMIN & ANALYTICS =====
  {
    id: 'admin-analytics',
    title: 'Admin & Analytics',
    subtitle: 'Administration et tableaux de bord analytiques.',
    items: {
      featureEnrichments: [
        'Ajouter des dashboards personnalisables.',
        'Creer des rapports automatises.',
        'Integrer des metriques de retention.',
        'Permettre l A/B testing natif.',
        'Ajouter un systeme de feature flags.',
      ],
      moduleElements: [
        'Statistiques d usage.',
        'Gestion des utilisateurs.',
        'Gestion des traductions.',
        'Monitoring des erreurs.',
        'Logs d activite.',
      ],
      leastDeveloped: [
        'Segmentation utilisateurs.',
        'Cohortes et funnels.',
        'Integration analytics tierces.',
        'Alertes de performance.',
        'Reporting executif.',
      ],
      nonWorking: [
        'Export automatise des rapports.',
        'API analytics.',
        'Webhooks de metriques.',
        'Tableau de bord temps reel.',
        'Archivage des donnees historiques.',
      ],
    },
  },
];

/**
 * Get a summary of completion status for each module
 */
export function getModuleCompletionSummary(): Array<{
  id: string;
  title: string;
  enrichments: number;
  elements: number;
  underdeveloped: number;
  broken: number;
  total: number;
}> {
  return moduleAudits.map((mod) => ({
    id: mod.id,
    title: mod.title,
    enrichments: mod.items.featureEnrichments.length,
    elements: mod.items.moduleElements.length,
    underdeveloped: mod.items.leastDeveloped.length,
    broken: mod.items.nonWorking.length,
    total:
      mod.items.featureEnrichments.length +
      mod.items.moduleElements.length +
      mod.items.leastDeveloped.length +
      mod.items.nonWorking.length,
  }));
}

/**
 * Get total count of items across all modules
 */
export function getTotalAuditItems(): {
  enrichments: number;
  elements: number;
  underdeveloped: number;
  broken: number;
  total: number;
} {
  const summary = getModuleCompletionSummary();
  return {
    enrichments: summary.reduce((acc, m) => acc + m.enrichments, 0),
    elements: summary.reduce((acc, m) => acc + m.elements, 0),
    underdeveloped: summary.reduce((acc, m) => acc + m.underdeveloped, 0),
    broken: summary.reduce((acc, m) => acc + m.broken, 0),
    total: summary.reduce((acc, m) => acc + m.total, 0),
  };
}
