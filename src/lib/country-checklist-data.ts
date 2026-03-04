/**
 * Country Administrative Checklist Data
 * Generic checklist templates for expatriation by category
 * These apply to most countries with country-specific notes
 */

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'visa' | 'banking' | 'insurance' | 'housing' | 'admin' | 'family';
  critical: boolean;
  tipKey?: string;
}

export interface ChecklistCategory {
  id: string;
  labelKey: string;
  labelFallback: string;
  icon: string;
  items: ChecklistItem[];
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'visa',
    labelKey: 'checklist.categories.visa',
    labelFallback: 'Visa & Permis de séjour',
    icon: 'passport',
    items: [
      { id: 'visa-1', label: 'Identifier le type de visa adapté (travail, entrepreneur, investisseur, famille)', category: 'visa', critical: true },
      { id: 'visa-2', label: 'Vérifier la validité du passeport (min. 6 mois après entrée)', category: 'visa', critical: true },
      { id: 'visa-3', label: 'Constituer le dossier complet avec pièces justificatives', category: 'visa', critical: true },
      { id: 'visa-4', label: 'Prendre rendez-vous au consulat ou déposer en ligne', category: 'visa', critical: true },
      { id: 'visa-5', label: 'Préparer les preuves de ressources financières', category: 'visa', critical: true },
      { id: 'visa-6', label: 'Faire apostiller et traduire les documents officiels', category: 'visa', critical: false },
      { id: 'visa-7', label: 'Obtenir un extrait de casier judiciaire récent', category: 'visa', critical: false },
      { id: 'visa-8', label: 'Prévoir un plan B en cas de refus', category: 'visa', critical: false },
    ],
  },
  {
    id: 'banking',
    labelKey: 'checklist.categories.banking',
    labelFallback: 'Banque & Finances',
    icon: 'landmark',
    items: [
      { id: 'bank-1', label: 'Ouvrir un compte bancaire dans le pays de destination', category: 'banking', critical: true },
      { id: 'bank-2', label: 'Conserver un compte bancaire dans le pays d\'origine', category: 'banking', critical: true },
      { id: 'bank-3', label: 'Informer sa banque du changement de résidence fiscale', category: 'banking', critical: true },
      { id: 'bank-4', label: 'Transférer les fonds nécessaires (comparer Wise, Revolut, virement SWIFT)', category: 'banking', critical: false },
      { id: 'bank-5', label: 'Vérifier les obligations déclaratives (formulaire 3916 en France)', category: 'banking', critical: true },
      { id: 'bank-6', label: 'Évaluer l\'impact sur les placements (PEA, PER, assurance vie)', category: 'banking', critical: true },
      { id: 'bank-7', label: 'Souscrire une carte bancaire internationale', category: 'banking', critical: false },
    ],
  },
  {
    id: 'insurance',
    labelKey: 'checklist.categories.insurance',
    labelFallback: 'Assurance & Santé',
    icon: 'shield',
    items: [
      { id: 'ins-1', label: 'Souscrire une assurance santé internationale (6 mois min.)', category: 'insurance', critical: true },
      { id: 'ins-2', label: 'Vérifier l\'affiliation au système de santé local', category: 'insurance', critical: true },
      { id: 'ins-3', label: 'Demander la carte européenne d\'assurance maladie (si UE)', category: 'insurance', critical: false },
      { id: 'ins-4', label: 'Faire un bilan de santé complet avant le départ', category: 'insurance', critical: false },
      { id: 'ins-5', label: 'Récupérer le dossier médical complet', category: 'insurance', critical: true },
      { id: 'ins-6', label: 'Mettre à jour les vaccinations requises', category: 'insurance', critical: false },
      { id: 'ins-7', label: 'Évaluer la CFE (Caisse des Français de l\'Étranger) si pertinent', category: 'insurance', critical: false },
    ],
  },
  {
    id: 'housing',
    labelKey: 'checklist.categories.housing',
    labelFallback: 'Logement',
    icon: 'home',
    items: [
      { id: 'house-1', label: 'Trouver un logement temporaire pour les premières semaines', category: 'housing', critical: true },
      { id: 'house-2', label: 'Rechercher un logement long terme (agences locales, expat forums)', category: 'housing', critical: true },
      { id: 'house-3', label: 'Comprendre les contrats de bail locaux (durée, caution, préavis)', category: 'housing', critical: true },
      { id: 'house-4', label: 'Gérer le logement actuel (vente, mise en location, résiliation)', category: 'housing', critical: true },
      { id: 'house-5', label: 'Organiser le déménagement international (devis, transit, douanes)', category: 'housing', critical: false },
      { id: 'house-6', label: 'Souscrire les contrats locaux (électricité, internet, eau)', category: 'housing', critical: false },
    ],
  },
  {
    id: 'admin',
    labelKey: 'checklist.categories.admin',
    labelFallback: 'Administratif général',
    icon: 'file-text',
    items: [
      { id: 'admin-1', label: 'S\'inscrire au registre des Français de l\'étranger (consulat)', category: 'admin', critical: false },
      { id: 'admin-2', label: 'Obtenir un numéro d\'identification fiscal local', category: 'admin', critical: true },
      { id: 'admin-3', label: 'Faire reconnaître ses diplômes / équivalences', category: 'admin', critical: false },
      { id: 'admin-4', label: 'Obtenir un permis de conduire international ou local', category: 'admin', critical: false },
      { id: 'admin-5', label: 'Souscrire un forfait téléphone local', category: 'admin', critical: false },
      { id: 'admin-6', label: 'Mettre à jour sa procuration pour la France (impôts, courrier)', category: 'admin', critical: true },
    ],
  },
  {
    id: 'family',
    labelKey: 'checklist.categories.family',
    labelFallback: 'Famille & Enfants',
    icon: 'users',
    items: [
      { id: 'fam-1', label: 'Inscrire les enfants dans une école (internationale, locale, CNED)', category: 'family', critical: true },
      { id: 'fam-2', label: 'Obtenir les documents scolaires traduits et apostillés', category: 'family', critical: true },
      { id: 'fam-3', label: 'Vérifier les droits de garde et autorisations de sortie du territoire', category: 'family', critical: true },
      { id: 'fam-4', label: 'Trouver un pédiatre / médecin de famille sur place', category: 'family', critical: false },
      { id: 'fam-5', label: 'Identifier les activités extrascolaires pour les enfants', category: 'family', critical: false },
    ],
  },
];

export function getChecklistStorageKey(countryId: string): string {
  return `country-checklist-${countryId}`;
}
