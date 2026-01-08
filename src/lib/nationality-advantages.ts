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
  japan: {
    countryId: 'japan',
    passportStrength: 'very_strong',
    visaFreeCount: 194,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_world_jp', name: 'Passeport #1 mondial', description: '194 pays sans visa - le plus puissant au monde', icon: '🥇', type: 'visa_free' },
      { id: 'asia_pacific_hub', name: 'Hub Asie-Pacifique', description: 'Accès privilégié à toute l\'Asie', icon: '🌏', type: 'regional_access' },
      { id: 'us_visa_waiver', name: 'ESTA USA', description: 'Accès facilité aux États-Unis', icon: '🇺🇸', type: 'visa_free' },
      { id: 'working_holiday_jp', name: 'Working Holiday', description: 'Accords avec 26 pays', icon: '🎒', type: 'work_permit' },
    ],
  },
  south_korea: {
    countryId: 'south_korea',
    passportStrength: 'very_strong',
    visaFreeCount: 192,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_world_kr', name: 'Top 3 mondial', description: '192 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'us_e2_treaty', name: 'Traité E-2 USA', description: 'Visa investisseur facilité aux US', icon: '🇺🇸', type: 'work_permit' },
      { id: 'asia_business', name: 'Hub business asiatique', description: 'Réseau d\'affaires développé en Asie', icon: '💼', type: 'regional_access' },
      { id: 'working_holiday_kr', name: 'Working Holiday', description: 'Accords avec 25+ pays', icon: '🎒', type: 'work_permit' },
    ],
  },
  singapore: {
    countryId: 'singapore',
    passportStrength: 'very_strong',
    visaFreeCount: 195,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_world_sg', name: 'Passeport élite', description: '195 pays - parmi les plus puissants', icon: '🥇', type: 'visa_free' },
      { id: 'asean_access', name: 'Accès ASEAN', description: 'Libre circulation en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'low_tax_sg', name: 'Fiscalité avantageuse', description: 'Impôts bas et pas de tax sur plus-values', icon: '💰', type: 'tax_benefit' },
      { id: 'commonwealth_sg', name: 'Commonwealth', description: 'Facilités dans les pays du Commonwealth', icon: '👑', type: 'visa_free' },
      { id: 'global_finance_hub', name: 'Hub financier mondial', description: 'Centre financier de premier plan', icon: '🏦', type: 'work_permit' },
    ],
  },
  australia: {
    countryId: 'australia',
    passportStrength: 'very_strong',
    visaFreeCount: 185,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_world_au', name: 'Accès mondial', description: '185 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'trans_tasman', name: 'Trans-Tasman', description: 'Libre circulation avec Nouvelle-Zélande', icon: '🇳🇿', type: 'regional_access' },
      { id: 'working_holiday_au', name: 'Working Holiday', description: 'Accords avec 40+ pays', icon: '🎒', type: 'work_permit' },
      { id: 'commonwealth_au', name: 'Commonwealth', description: 'Facilités dans les pays du Commonwealth', icon: '👑', type: 'visa_free' },
    ],
  },
  new_zealand: {
    countryId: 'new_zealand',
    passportStrength: 'very_strong',
    visaFreeCount: 187,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_world_nz', name: 'Accès mondial', description: '187 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'trans_tasman_nz', name: 'Trans-Tasman', description: 'Droit automatique de vivre/travailler en Australie', icon: '🇦🇺', type: 'work_permit' },
      { id: 'working_holiday_nz', name: 'Working Holiday', description: 'Accords avec 40+ pays', icon: '🎒', type: 'work_permit' },
      { id: 'quality_life_nz', name: 'Qualité de vie', description: 'Classé parmi les meilleurs pays pour vivre', icon: '🌿', type: 'residency' },
    ],
  },
  netherlands: {
    countryId: 'netherlands',
    passportStrength: 'very_strong',
    visaFreeCount: 191,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '191 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'daft_usa', name: 'Traité DAFT USA', description: 'Visa entrepreneur facilité aux US', icon: '🇺🇸', type: 'work_permit' },
      { id: 'benelux_nl', name: 'Union Benelux', description: 'Intégration poussée avec BE et LU', icon: '🤝', type: 'regional_access' },
    ],
  },
  italy: {
    countryId: 'italy',
    passportStrength: 'very_strong',
    visaFreeCount: 191,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '191 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'jure_sanguinis', name: 'Jure Sanguinis', description: 'Citoyenneté transmissible aux descendants', icon: '👨‍👩‍👧', type: 'citizenship' },
      { id: 'e2_italy', name: 'Traité E-2 USA', description: 'Visa investisseur aux États-Unis', icon: '🇺🇸', type: 'work_permit' },
    ],
  },
  spain: {
    countryId: 'spain',
    passportStrength: 'very_strong',
    visaFreeCount: 191,
    regionalBlocs: ['EU', 'SCHENGEN'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '191 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'latam_special', name: 'Liens Amérique Latine', description: 'Naturalisation facilitée pour hispanophones', icon: '🌎', type: 'citizenship' },
      { id: 'beckham_law', name: 'Loi Beckham', description: 'Régime fiscal avantageux pour nouveaux résidents', icon: '💰', type: 'tax_benefit' },
    ],
  },
  ireland: {
    countryId: 'ireland',
    passportStrength: 'very_strong',
    visaFreeCount: 190,
    regionalBlocs: ['EU'],
    advantages: [
      { id: 'eu_freedom', name: 'Libre circulation UE', description: 'Travailler et vivre dans 27 pays', icon: '🇪🇺', type: 'regional_access' },
      { id: 'visa_free_world', name: 'Accès mondial', description: '190 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'cta_uk', name: 'Common Travel Area', description: 'Libre circulation avec le Royaume-Uni', icon: '🇬🇧', type: 'regional_access' },
      { id: 'us_irish_program', name: 'Visa USA facilité', description: 'Programme E-3 potentiel et liens historiques', icon: '🇺🇸', type: 'work_permit' },
      { id: 'english_native', name: 'Anglophone natif', description: 'Avantage pour travail international', icon: '🗣️', type: 'work_permit' },
    ],
  },
  mexico: {
    countryId: 'mexico',
    passportStrength: 'strong',
    visaFreeCount: 159,
    regionalBlocs: [],
    advantages: [
      { id: 'usmca_tn_mx', name: 'Visa TN USMCA', description: 'Accès facilité au marché US/Canada', icon: '🌎', type: 'work_permit' },
      { id: 'pacific_alliance', name: 'Alliance du Pacifique', description: 'Libre circulation avec Chili, Pérou, Colombie', icon: '🌊', type: 'regional_access' },
      { id: 'visa_free_mx', name: 'Accès Amériques', description: 'Visa-free dans toute l\'Amérique Latine', icon: '✈️', type: 'visa_free' },
      { id: 'spain_fast_track', name: 'Espagne accélérée', description: 'Naturalisation en 2 ans seulement', icon: '🇪🇸', type: 'citizenship' },
    ],
  },
  argentina: {
    countryId: 'argentina',
    passportStrength: 'strong',
    visaFreeCount: 171,
    regionalBlocs: ['MERCOSUR'],
    advantages: [
      { id: 'mercosur_freedom', name: 'Mercosur', description: 'Libre circulation en Amérique du Sud', icon: '🌎', type: 'regional_access' },
      { id: 'italy_descent', name: 'Ascendance italienne', description: 'Beaucoup éligibles à citoyenneté italienne', icon: '🇮🇹', type: 'citizenship' },
      { id: 'spain_fast_track_ar', name: 'Espagne accélérée', description: 'Naturalisation en 2 ans', icon: '🇪🇸', type: 'citizenship' },
      { id: 'visa_free_ar', name: 'Accès global', description: '171 pays sans visa', icon: '✈️', type: 'visa_free' },
    ],
  },
  india: {
    countryId: 'india',
    passportStrength: 'weak',
    visaFreeCount: 62,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'commonwealth_in', name: 'Commonwealth', description: 'Facilités dans certains pays du Commonwealth', icon: '👑', type: 'visa_free' },
      { id: 'oci_card', name: 'Carte OCI', description: 'Permet aux descendants de vivre en Inde', icon: '🏠', type: 'residency' },
      { id: 'it_hub', name: 'Hub IT mondial', description: 'Réseau tech international puissant', icon: '💻', type: 'work_permit' },
      { id: 'gulf_work', name: 'Accès Golfe', description: 'Forte présence dans les pays du Golfe', icon: '🏜️', type: 'work_permit' },
    ],
  },
  nigeria: {
    countryId: 'nigeria',
    passportStrength: 'weak',
    visaFreeCount: 46,
    regionalBlocs: ['ECOWAS', 'COMMONWEALTH'],
    advantages: [
      { id: 'ecowas_freedom', name: 'CEDEAO', description: 'Libre circulation en Afrique de l\'Ouest', icon: '🌍', type: 'regional_access' },
      { id: 'commonwealth_ng', name: 'Commonwealth', description: 'Liens historiques facilitant certains accès', icon: '👑', type: 'visa_free' },
      { id: 'english_native_ng', name: 'Anglophone', description: 'Avantage linguistique international', icon: '🗣️', type: 'work_permit' },
    ],
  },
  china: {
    countryId: 'china',
    passportStrength: 'moderate',
    visaFreeCount: 85,
    regionalBlocs: [],
    advantages: [
      { id: 'asia_business_cn', name: 'Réseau Asie', description: 'Accès au réseau business chinois mondial', icon: '💼', type: 'work_permit' },
      { id: 'apec_card', name: 'Carte APEC', description: 'Voyage d\'affaires facilité en Asie-Pacifique', icon: '🌏', type: 'visa_free' },
      { id: 'diaspora_network', name: 'Diaspora puissante', description: 'Réseau d\'affaires mondial', icon: '🤝', type: 'work_permit' },
    ],
  },
  russia: {
    countryId: 'russia',
    passportStrength: 'moderate',
    visaFreeCount: 87,
    regionalBlocs: [],
    advantages: [
      { id: 'cis_access', name: 'Accès CEI', description: 'Libre circulation dans l\'ex-URSS', icon: '🌍', type: 'regional_access' },
      { id: 'serbia_special', name: 'Serbie sans visa', description: 'Option de résidence en Europe', icon: '🇷🇸', type: 'visa_free' },
    ],
  },
  turkey: {
    countryId: 'turkey',
    passportStrength: 'moderate',
    visaFreeCount: 118,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_tr', name: 'Accès régional', description: '118 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'e2_treaty_tr', name: 'Traité E-2 USA', description: 'Visa investisseur aux États-Unis', icon: '🇺🇸', type: 'work_permit' },
      { id: 'turkic_council', name: 'Conseil Turcique', description: 'Liens avec Asie Centrale', icon: '🌏', type: 'regional_access' },
      { id: 'citizenship_invest', name: 'Citoyenneté investissement', description: 'Programme de citoyenneté par investissement', icon: '🏠', type: 'citizenship' },
    ],
  },
  israel: {
    countryId: 'israel',
    passportStrength: 'strong',
    visaFreeCount: 161,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_il', name: 'Accès global', description: '161 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'startup_nation', name: 'Startup Nation', description: 'Écosystème tech de classe mondiale', icon: '🚀', type: 'work_permit' },
      { id: 'us_ties', name: 'Liens USA forts', description: 'Relations privilégiées avec les États-Unis', icon: '🇺🇸', type: 'visa_free' },
      { id: 'law_return', name: 'Loi du Retour', description: 'Citoyenneté pour personnes d\'origine juive', icon: '✡️', type: 'citizenship' },
    ],
  },
  thailand: {
    countryId: 'thailand',
    passportStrength: 'moderate',
    visaFreeCount: 80,
    regionalBlocs: [],
    advantages: [
      { id: 'asean_th', name: 'Accès ASEAN', description: 'Circulation facilitée en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'low_cost_living', name: 'Coût de vie bas', description: 'Base idéale pour nomades', icon: '💰', type: 'residency' },
    ],
  },
  philippines: {
    countryId: 'philippines',
    passportStrength: 'weak',
    visaFreeCount: 67,
    regionalBlocs: [],
    advantages: [
      { id: 'asean_ph', name: 'Accès ASEAN', description: 'Circulation en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'english_native_ph', name: 'Anglophone', description: 'Avantage pour travail international', icon: '🗣️', type: 'work_permit' },
      { id: 'gulf_workers', name: 'Réseau Golfe', description: 'Forte diaspora dans les pays du Golfe', icon: '🏜️', type: 'work_permit' },
    ],
  },
  indonesia: {
    countryId: 'indonesia',
    passportStrength: 'moderate',
    visaFreeCount: 77,
    regionalBlocs: [],
    advantages: [
      { id: 'asean_id', name: 'Accès ASEAN', description: 'Libre circulation en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'emerging_economy', name: 'Économie émergente', description: 'Opportunités de croissance', icon: '📈', type: 'work_permit' },
    ],
  },
  malaysia: {
    countryId: 'malaysia',
    passportStrength: 'strong',
    visaFreeCount: 180,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'visa_free_my', name: 'Accès mondial', description: '180 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'asean_my', name: 'Accès ASEAN', description: 'Libre circulation en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'mm2h', name: 'Programme MM2H', description: 'Résidence long terme pour expatriés', icon: '🏠', type: 'residency' },
      { id: 'commonwealth_my', name: 'Commonwealth', description: 'Facilités dans les pays du Commonwealth', icon: '👑', type: 'visa_free' },
    ],
  },
  vietnam: {
    countryId: 'vietnam',
    passportStrength: 'weak',
    visaFreeCount: 55,
    regionalBlocs: [],
    advantages: [
      { id: 'asean_vn', name: 'Accès ASEAN', description: 'Circulation en Asie du Sud-Est', icon: '🌏', type: 'regional_access' },
      { id: 'emerging_hub', name: 'Hub émergent', description: 'Économie en forte croissance', icon: '📈', type: 'work_permit' },
    ],
  },
  egypt: {
    countryId: 'egypt',
    passportStrength: 'weak',
    visaFreeCount: 51,
    regionalBlocs: [],
    advantages: [
      { id: 'arab_league_eg', name: 'Ligue Arabe', description: 'Accès au monde arabe', icon: '🌙', type: 'regional_access' },
      { id: 'africa_gateway_eg', name: 'Porte Afrique', description: 'Position stratégique Afrique du Nord', icon: '🌍', type: 'regional_access' },
    ],
  },
  south_africa: {
    countryId: 'south_africa',
    passportStrength: 'moderate',
    visaFreeCount: 106,
    regionalBlocs: ['COMMONWEALTH'],
    advantages: [
      { id: 'sadc_access', name: 'Accès SADC', description: 'Libre circulation en Afrique australe', icon: '🌍', type: 'regional_access' },
      { id: 'commonwealth_za', name: 'Commonwealth', description: 'Liens avec pays du Commonwealth', icon: '👑', type: 'visa_free' },
      { id: 'english_native_za', name: 'Anglophone', description: 'Avantage linguistique', icon: '🗣️', type: 'work_permit' },
    ],
  },
  colombia: {
    countryId: 'colombia',
    passportStrength: 'strong',
    visaFreeCount: 132,
    regionalBlocs: [],
    advantages: [
      { id: 'pacific_alliance_co', name: 'Alliance du Pacifique', description: 'Libre circulation avec Mexique, Chili, Pérou', icon: '🌊', type: 'regional_access' },
      { id: 'latam_access', name: 'Accès Amériques', description: 'Visa-free en Amérique Latine', icon: '🌎', type: 'visa_free' },
      { id: 'spain_fast_co', name: 'Espagne accélérée', description: 'Naturalisation en 2 ans', icon: '🇪🇸', type: 'citizenship' },
    ],
  },
  chile: {
    countryId: 'chile',
    passportStrength: 'strong',
    visaFreeCount: 177,
    regionalBlocs: [],
    advantages: [
      { id: 'visa_free_cl', name: 'Accès mondial', description: '177 pays sans visa', icon: '✈️', type: 'visa_free' },
      { id: 'pacific_alliance_cl', name: 'Alliance du Pacifique', description: 'Libre circulation régionale', icon: '🌊', type: 'regional_access' },
      { id: 'us_visa_waiver_cl', name: 'ESTA USA', description: 'Accès facilité aux États-Unis', icon: '🇺🇸', type: 'visa_free' },
      { id: 'spain_fast_cl', name: 'Espagne accélérée', description: 'Naturalisation en 2 ans', icon: '🇪🇸', type: 'citizenship' },
    ],
  },
};

// Destination recommendations based on nationality + aspirations
export interface DestinationRecommendation {
  countryId: string;
  countryName: string;
  flag: string;
  score: number;
  reasons: string[];
  accessType: 'visa_free' | 'easy_visa' | 'work_visa' | 'requires_visa';
  matchedAdvantages: string[];
}

// Life priority to destination mapping
const ASPIRATION_DESTINATIONS: Record<string, { 
  ideal: string[];
  good: string[];
  factors: string[];
}> = {
  freedom: {
    ideal: ['portugal', 'uae', 'singapore', 'switzerland', 'netherlands'],
    good: ['spain', 'germany', 'canada', 'australia', 'new_zealand', 'japan'],
    factors: ['Liberté personnelle', 'Faible bureaucratie', 'Digital nomad friendly'],
  },
  money: {
    ideal: ['uae', 'singapore', 'switzerland', 'usa', 'uk'],
    good: ['ireland', 'netherlands', 'germany', 'australia', 'canada', 'japan', 'south_korea'],
    factors: ['Hauts salaires', 'Fiscalité avantageuse', 'Opportunités business'],
  },
  meaning: {
    ideal: ['germany', 'switzerland', 'netherlands', 'canada', 'new_zealand'],
    good: ['france', 'belgium', 'australia', 'japan', 'ireland', 'portugal'],
    factors: ['Équilibre vie-travail', 'Impact social', 'Qualité de vie'],
  },
  status: {
    ideal: ['usa', 'uk', 'switzerland', 'singapore', 'uae'],
    good: ['france', 'germany', 'japan', 'australia', 'canada', 'netherlands'],
    factors: ['Prestige international', 'Réseau élite', 'Opportunités carrière'],
  },
  family: {
    ideal: ['canada', 'australia', 'new_zealand', 'germany', 'netherlands'],
    good: ['france', 'belgium', 'spain', 'portugal', 'ireland', 'switzerland'],
    factors: ['Sécurité', 'Système éducatif', 'Santé publique', 'Stabilité'],
  },
  calm: {
    ideal: ['portugal', 'new_zealand', 'spain', 'switzerland', 'australia'],
    good: ['canada', 'ireland', 'netherlands', 'japan', 'chile', 'malaysia'],
    factors: ['Qualité de vie', 'Nature', 'Coût de vie raisonnable', 'Sécurité'],
  },
};

// Country display names
const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  france: { name: 'France', flag: '🇫🇷' },
  germany: { name: 'Allemagne', flag: '🇩🇪' },
  switzerland: { name: 'Suisse', flag: '🇨🇭' },
  usa: { name: 'États-Unis', flag: '🇺🇸' },
  uk: { name: 'Royaume-Uni', flag: '🇬🇧' },
  canada: { name: 'Canada', flag: '🇨🇦' },
  australia: { name: 'Australie', flag: '🇦🇺' },
  new_zealand: { name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  japan: { name: 'Japon', flag: '🇯🇵' },
  south_korea: { name: 'Corée du Sud', flag: '🇰🇷' },
  singapore: { name: 'Singapour', flag: '🇸🇬' },
  uae: { name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  portugal: { name: 'Portugal', flag: '🇵🇹' },
  spain: { name: 'Espagne', flag: '🇪🇸' },
  netherlands: { name: 'Pays-Bas', flag: '🇳🇱' },
  belgium: { name: 'Belgique', flag: '🇧🇪' },
  italy: { name: 'Italie', flag: '🇮🇹' },
  ireland: { name: 'Irlande', flag: '🇮🇪' },
  brazil: { name: 'Brésil', flag: '🇧🇷' },
  mexico: { name: 'Mexique', flag: '🇲🇽' },
  argentina: { name: 'Argentine', flag: '🇦🇷' },
  chile: { name: 'Chili', flag: '🇨🇱' },
  colombia: { name: 'Colombie', flag: '🇨🇴' },
  malaysia: { name: 'Malaisie', flag: '🇲🇾' },
  thailand: { name: 'Thaïlande', flag: '🇹🇭' },
  indonesia: { name: 'Indonésie', flag: '🇮🇩' },
  vietnam: { name: 'Vietnam', flag: '🇻🇳' },
  philippines: { name: 'Philippines', flag: '🇵🇭' },
  india: { name: 'Inde', flag: '🇮🇳' },
  china: { name: 'Chine', flag: '🇨🇳' },
  turkey: { name: 'Turquie', flag: '🇹🇷' },
  israel: { name: 'Israël', flag: '🇮🇱' },
  russia: { name: 'Russie', flag: '🇷🇺' },
  morocco: { name: 'Maroc', flag: '🇲🇦' },
  senegal: { name: 'Sénégal', flag: '🇸🇳' },
  cameroon: { name: 'Cameroun', flag: '🇨🇲' },
  nigeria: { name: 'Nigeria', flag: '🇳🇬' },
  south_africa: { name: 'Afrique du Sud', flag: '🇿🇦' },
  egypt: { name: 'Égypte', flag: '🇪🇬' },
};

// Get recommended destinations based on nationalities and aspirations
export function getRecommendedDestinations(
  nationalityIds: string[],
  aspiration: string,
  currentCountryId?: string
): DestinationRecommendation[] {
  const recommendations: DestinationRecommendation[] = [];
  const aspirationData = ASPIRATION_DESTINATIONS[aspiration] || ASPIRATION_DESTINATIONS.freedom;
  const allDestinations = [...new Set([...aspirationData.ideal, ...aspirationData.good])];
  
  // Get nationality advantages
  const { combinedBlocs, strongestPassport } = getNationalityAdvantages(nationalityIds);
  
  for (const destId of allDestinations) {
    // Skip current country
    if (destId === currentCountryId) continue;
    
    const countryInfo = COUNTRY_NAMES[destId];
    if (!countryInfo) continue;
    
    let score = 0;
    const reasons: string[] = [];
    const matchedAdvantages: string[] = [];
    let accessType: DestinationRecommendation['accessType'] = 'requires_visa';
    
    // Score based on aspiration match
    if (aspirationData.ideal.includes(destId)) {
      score += 40;
      reasons.push(`Destination idéale pour: ${aspiration}`);
    } else if (aspirationData.good.includes(destId)) {
      score += 25;
      reasons.push(`Bonne destination pour: ${aspiration}`);
    }
    
    // Check regional bloc access
    const destProfile = NATIONALITY_PROFILES[destId];
    if (destProfile) {
      // Check if any nationality gives direct access via regional blocs
      for (const bloc of combinedBlocs) {
        const blocData = REGIONAL_BLOCS[bloc];
        if (blocData && blocData.members.includes(destId)) {
          score += 30;
          accessType = 'visa_free';
          reasons.push(`Accès ${blocData.name} via votre nationalité`);
          matchedAdvantages.push(blocData.name);
          break;
        }
      }
    }
    
    // Check if destination is same nationality
    if (nationalityIds.includes(destId)) {
      score += 50;
      accessType = 'visa_free';
      reasons.push('Votre pays de nationalité');
      matchedAdvantages.push('Citoyenneté');
    }
    
    // Strong passport gives visa-free access to most places
    if (strongestPassport && strongestPassport.visaFreeCount >= 180) {
      if (accessType === 'requires_visa') {
        accessType = 'easy_visa';
        score += 10;
      }
    }
    
    // Check specific nationality advantages
    for (const natId of nationalityIds) {
      const natProfile = NATIONALITY_PROFILES[natId];
      if (!natProfile) continue;
      
      for (const advantage of natProfile.advantages) {
        // Check if advantage mentions destination country
        if (advantage.id.includes(destId) || advantage.description.toLowerCase().includes(COUNTRY_NAMES[destId]?.name.toLowerCase() || '')) {
          score += 15;
          reasons.push(advantage.name);
          matchedAdvantages.push(advantage.name);
          if (advantage.type === 'work_permit') {
            accessType = 'work_visa';
          }
        }
        
        // Special cases
        if (destId === 'usa' && (advantage.id.includes('usa') || advantage.id.includes('e2') || advantage.id.includes('tn'))) {
          score += 15;
          reasons.push(advantage.name);
          matchedAdvantages.push(advantage.name);
          accessType = 'work_visa';
        }
        if (destId === 'portugal' && advantage.id.includes('portugal')) {
          score += 20;
          reasons.push(advantage.name);
          matchedAdvantages.push(advantage.name);
        }
        if (destId === 'spain' && advantage.id.includes('spain')) {
          score += 20;
          reasons.push(advantage.name);
          matchedAdvantages.push(advantage.name);
        }
      }
    }
    
    // Add aspiration factors as reasons
    if (reasons.length > 0) {
      reasons.push(...aspirationData.factors.slice(0, 2));
    }
    
    if (score > 0) {
      recommendations.push({
        countryId: destId,
        countryName: countryInfo.name,
        flag: countryInfo.flag,
        score: Math.min(100, score),
        reasons: [...new Set(reasons)].slice(0, 4),
        accessType,
        matchedAdvantages: [...new Set(matchedAdvantages)],
      });
    }
  }
  
  // Sort by score and return top results
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 6);
}

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
