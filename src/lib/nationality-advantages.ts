/**
 * Nationality advantages data
 * Lists visa-free access, regional benefits, and special programs by nationality
 */

export interface NationalityAdvantage {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'visa_free' | 'regional_access' | 'work_permit' | 'tax_benefit' | 'residency' | 'citizenship';
}

export interface NationalityProfile {
  countryId: string;
  passportStrength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  visaFreeCount: number;
  advantages: NationalityAdvantage[];
  regionalBlocs: string[];
}

// Regional blocs and their benefits
export const REGIONAL_BLOCS: Record<string, { name: string; icon: string; description: string; members: string[] }> = {
  EU: {
    name: 'Union Européenne',
    icon: '🇪🇺',
    description: 'Libre circulation, travail et résidence dans 27 pays',
    members: ['france', 'germany', 'belgium', 'netherlands', 'italy', 'spain', 'portugal', 'austria', 'ireland', 'sweden', 'denmark', 'finland', 'poland', 'czech_republic', 'greece', 'hungary', 'romania', 'bulgaria', 'croatia', 'slovakia', 'slovenia', 'estonia', 'latvia', 'lithuania', 'luxembourg', 'malta', 'cyprus'],
  },
  SCHENGEN: {
    name: 'Espace Schengen',
    icon: '🛂',
    description: 'Pas de contrôle aux frontières dans 27 pays',
    members: ['france', 'germany', 'belgium', 'netherlands', 'italy', 'spain', 'portugal', 'austria', 'sweden', 'denmark', 'finland', 'poland', 'czech_republic', 'greece', 'hungary', 'slovakia', 'slovenia', 'estonia', 'latvia', 'lithuania', 'luxembourg', 'malta', 'switzerland', 'norway', 'iceland', 'liechtenstein', 'croatia'],
  },
  COMMONWEALTH: {
    name: 'Commonwealth',
    icon: '👑',
    description: 'Facilités de visa et programmes de travail spéciaux',
    members: ['uk', 'canada', 'australia', 'new_zealand', 'india', 'nigeria', 'south_africa', 'singapore', 'malaysia', 'kenya'],
  },
  MERCOSUR: {
    name: 'Mercosur',
    icon: '🌎',
    description: 'Libre circulation en Amérique du Sud',
    members: ['brazil', 'argentina', 'uruguay', 'paraguay'],
  },
  ECOWAS: {
    name: 'CEDEAO',
    icon: '🌍',
    description: 'Libre circulation en Afrique de l\'Ouest',
    members: ['senegal', 'ivory_coast', 'nigeria', 'ghana', 'mali', 'burkina_faso', 'benin', 'togo', 'guinea', 'sierra_leone', 'liberia', 'niger', 'gambia', 'guinea_bissau', 'cape_verde'],
  },
  GCC: {
    name: 'Conseil de Coopération du Golfe',
    icon: '🏜️',
    description: 'Facilités de travail et résidence dans le Golfe',
    members: ['uae', 'saudi_arabia', 'qatar', 'kuwait', 'bahrain', 'oman'],
  },
};

// Nationality profiles with advantages
export const NATIONALITY_PROFILES: Record<string, NationalityProfile> = {
  france: {
    countryId: 'france',
    passportStrength: 'very_strong',
    visaFreeCount: 194,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays sans visa', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '194 pays sans visa ou visa à l\'arrivée', icon: '✈️', type: 'visa_free' },
      { id: 'switzerland_bilateral', name: 'Accords Suisse-UE', description: 'Accès facilité au marché du travail suisse', icon: '🇨🇭', type: 'work_permit' },
      { id: 'french_territories', name: 'Territoires français', description: 'Accès à tous les DOM-TOM (Réunion, Polynésie, etc.)', icon: '🏝️', type: 'residency' },
    ],
  },
  germany: {
    countryId: 'germany',
    passportStrength: 'very_strong',
    visaFreeCount: 193,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays sans visa', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial premium', description: '193 pays sans visa ou visa à l\'arrivée', icon: '✈️', type: 'visa_free' },
      { id: 'bilateral_social', name: 'Accords sociaux', description: 'Conventions bilatérales avec 60+ pays', icon: '📋', type: 'tax_benefit' },
    ],
  },
  belgium: {
    countryId: 'belgium',
    passportStrength: 'very_strong',
    visaFreeCount: 192,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays sans visa', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '192 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'benelux_special', name: 'Union Benelux', description: 'Intégration poussée avec NL et Luxembourg', icon: '🤝', type: 'regional_access' },
    ],
  },
  switzerland: {
    countryId: 'switzerland',
    passportStrength: 'very_strong',
    visaFreeCount: 194,
    regionalBlocs: ['SCHENGEN'],
    advantages: [
      { id: 'schengen_access', name: 'Accès Schengen', description: 'Libre circulation dans l\'espace Schengen', icon: '🛂', type: 'regional_access' },
      { id: 'eu_bilateral', name: 'Accords bilatéraux UE', description: 'Accès au marché du travail UE', icon: '🇪🇺', type: 'work_permit' },
      { id: 'neutral_status', name: 'Statut neutre', description: 'Passeport respecté mondialement', icon: '🕊️', type: 'visa_free' },
      { id: 'swiss_banking', name: 'Accès bancaire privilégié', description: 'Facilités financières internationales', icon: '🏦', type: 'tax_benefit' },
    ],
  },
  usa: {
    countryId: 'usa',
    passportStrength: 'very_strong',
    visaFreeCount: 186,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_world', name: 'Accès mondial', description: '186 pays sans visa ou ESTA', icon: '✈️', type: 'visa_free' },
      { id: 'esta_countries', name: 'Programmes ESTA', description: 'Accès réciproque facilité', icon: '🔄', type: 'visa_free' },
      { id: 'e2_treaties', name: 'Traités E-2', description: 'Visas investisseur dans 80+ pays', icon: '💼', type: 'work_permit' },
      { id: 'us_territories', name: 'Territoires US', description: 'Puerto Rico, Guam, USVI sans restrictions', icon: '🏝️', type: 'residency' },
    ],
  },
  uk: {
    countryId: 'uk',
    passportStrength: 'very_strong',
    visaFreeCount: 187,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_world', name: 'Accès mondial', description: '187 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'commonwealth_whv', name: 'Working Holiday', description: 'Programmes WHV dans pays du Commonwealth', icon: '🎒', type: 'work_permit' },
      { id: 'ireland_cta', name: 'Common Travel Area', description: 'Libre circulation avec l\'Irlande', icon: '🇮🇪', type: 'regional_access' },
      { id: 'bno_heritage', name: 'Héritage colonial', description: 'Liens historiques facilitant certains visas', icon: '📜', type: 'residency' },
    ],
  },
  canada: {
    countryId: 'canada',
    passportStrength: 'very_strong',
    visaFreeCount: 185,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_world', name: 'Accès mondial', description: '185 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'usmca_tn', name: 'Visa TN USMCA', description: 'Accès facilité au marché US/Mexique', icon: '🌎', type: 'work_permit' },
      { id: 'iec_youth', name: 'IEC/PVT', description: 'Accords vacances-travail avec 35+ pays', icon: '🎒', type: 'work_permit' },
      { id: 'commonwealth_access', name: 'Commonwealth', description: 'Facilités dans les pays du Commonwealth', icon: '👑', type: 'visa_free' },
    ],
  },
  cameroon: {
    countryId: 'cameroon',
    passportStrength: 'weak',
    visaFreeCount: 52,
    regionalBlocs: [],
    advantages: [
      { id: 'cemac_freedom', name: 'Zone CEMAC', description: 'Libre circulation en Afrique centrale', icon: '🌍', type: 'regional_access' },
      { id: 'francophone_network', name: 'Francophonie', description: 'Réseau francophone facilitant certains accès', icon: '🗣️', type: 'visa_free' },
      { id: 'campus_france', name: 'Campus France', description: 'Procédures études facilitées vers France', icon: '🎓', type: 'residency' },
    ],
  },
  senegal: {
    countryId: 'senegal',
    passportStrength: 'weak',
    visaFreeCount: 55,
    regionalBlocs: ['ECOWAS'],
    advantages: [
      { id: 'ecowas_freedom', name: 'CEDEAO', description: 'Libre circulation en Afrique de l\'Ouest', icon: '🌍', type: 'regional_access' },
      { id: 'francophone_network', name: 'Francophonie', description: 'Réseau francophone actif', icon: '🗣️', type: 'visa_free' },
      { id: 'uemoa_economic', name: 'Zone UEMOA', description: 'Intégration économique régionale', icon: '💱', type: 'work_permit' },
    ],
  },
  morocco: {
    countryId: 'morocco',
    passportStrength: 'moderate',
    visaFreeCount: 69,
    regionalBlocs: [],
    advantages: [
      { id: 'arab_league', name: 'Ligue Arabe', description: 'Facilités dans le monde arabe', icon: '🌙', type: 'visa_free' },
      { id: 'eu_association', name: 'Association UE', description: 'Accord d\'association avec l\'UE', icon: '🇪🇺', type: 'visa_free' },
      { id: 'francophone_network', name: 'Francophonie', description: 'Accès au réseau francophone', icon: '🗣️', type: 'visa_free' },
      { id: 'africa_gateway', name: 'Hub Africain', description: 'Position stratégique vers l\'Afrique', icon: '🌍', type: 'regional_access' },
    ],
  },
  uae: {
    countryId: 'uae',
    passportStrength: 'very_strong',
    visaFreeCount: 180,
    regionalBlocs: ['GCC'],
    advantages: [
      { id: 'visa_free_world', name: 'Accès mondial', description: '180 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'gcc_freedom', name: 'Accès GCC', description: 'Libre circulation dans le Golfe', icon: '🏜️', type: 'regional_access' },
      { id: 'no_tax_residency', name: 'Résidence fiscale', description: 'Pas d\'impôt sur le revenu personnel', icon: '💰', type: 'tax_benefit' },
    ],
  },
  brazil: {
    countryId: 'brazil',
    passportStrength: 'strong',
    visaFreeCount: 170,
    regionalBlocs: ['MERCOSUR'],
    advantages: [
      { id: 'mercosur_freedom', name: 'Mercosur', description: 'Libre circulation en Amérique du Sud', icon: '🌎', type: 'regional_access' },
      { id: 'portugal_special', name: 'Portugal spécial', description: 'Voie facilitée vers citoyenneté portugaise', icon: '🇵🇹', type: 'citizenship' },
      { id: 'cplp_access', name: 'CPLP', description: 'Accès facilité aux pays lusophones', icon: '🗣️', type: 'visa_free' },
    ],
  },
  portugal: {
    countryId: 'portugal',
    passportStrength: 'very_strong',
    visaFreeCount: 191,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '191 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'cplp_special', name: 'CPLP', description: 'Liens privilégiés avec le Brésil, Angola, etc.', icon: '🤝', type: 'visa_free' },
      { id: 'nhr_tax', name: 'NHR fiscal', description: 'Régime fiscal avantageux pour résidents', icon: '💰', type: 'tax_benefit' },
    ],
  },
};

// Get advantages for a list of nationalities
export function getNationalityAdvantages(nationalityIds: string[]): {
  allAdvantages: NationalityAdvantage[];
  uniqueAdvantages: NationalityAdvantage[];
  combinedBlocs: string[];
  strongestPassport: NationalityProfile | null;
  totalVisaFree: number;
} {
  const allAdvantages: NationalityAdvantage[] = [];
  const blocsSet = new Set<string>();
  let strongestPassport: NationalityProfile | null = null;
  let maxVisaFree = 0;

  for (const id of nationalityIds) {
    const profile = NATIONALITY_PROFILES[id];
    if (profile) {
      allAdvantages.push(...profile.advantages);
      profile.regionalBlocs.forEach(b => blocsSet.add(b));
      
      if (profile.visaFreeCount > maxVisaFree) {
        maxVisaFree = profile.visaFreeCount;
        strongestPassport = profile;
      }
    }
  }

  // Remove duplicates based on advantage id
  const seen = new Set<string>();
  const uniqueAdvantages = allAdvantages.filter(adv => {
    if (seen.has(adv.id)) return false;
    seen.add(adv.id);
    return true;
  });

  return {
    allAdvantages,
    uniqueAdvantages,
    combinedBlocs: Array.from(blocsSet),
    strongestPassport,
    totalVisaFree: maxVisaFree,
  };
}

// Get passport strength label
export function getPassportStrengthLabel(strength: NationalityProfile['passportStrength']): { label: string; color: string } {
  switch (strength) {
    case 'very_strong': return { label: 'Très puissant', color: 'text-emerald-500' };
    case 'strong': return { label: 'Puissant', color: 'text-green-500' };
    case 'moderate': return { label: 'Modéré', color: 'text-amber-500' };
    case 'weak': return { label: 'Limité', color: 'text-orange-500' };
  }
}
