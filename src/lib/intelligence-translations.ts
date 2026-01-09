/**
 * Intelligence Layer Translation System
 * Provides translations for dynamic DB content
 */

import i18n from '@/i18n';

// Translation keys for intelligence layer content
export const INTELLIGENCE_TRANSLATIONS = {
  // Mobility speed
  mobility_speed: {
    slow: {
      en: 'Slow',
      fr: 'Lente',
      de: 'Langsam',
      es: 'Lenta',
      it: 'Lenta',
      pt: 'Lenta',
      nl: 'Langzaam'
    },
    medium: {
      en: 'Medium',
      fr: 'Moyenne',
      de: 'Mittel',
      es: 'Media',
      it: 'Media',
      pt: 'Média',
      nl: 'Gemiddeld'
    },
    fast: {
      en: 'Fast',
      fr: 'Rapide',
      de: 'Schnell',
      es: 'Rápida',
      it: 'Veloce',
      pt: 'Rápida',
      nl: 'Snel'
    }
  },
  // Mental cost
  mental_cost: {
    low: {
      en: 'Low',
      fr: 'Faible',
      de: 'Niedrig',
      es: 'Bajo',
      it: 'Basso',
      pt: 'Baixo',
      nl: 'Laag'
    },
    medium: {
      en: 'Medium',
      fr: 'Moyen',
      de: 'Mittel',
      es: 'Medio',
      it: 'Medio',
      pt: 'Médio',
      nl: 'Gemiddeld'
    },
    high: {
      en: 'High',
      fr: 'Élevé',
      de: 'Hoch',
      es: 'Alto',
      it: 'Alto',
      pt: 'Alto',
      nl: 'Hoog'
    }
  },
  // Cycle status
  cycle_status: {
    stable: {
      en: 'Stable',
      fr: 'Stable',
      de: 'Stabil',
      es: 'Estable',
      it: 'Stabile',
      pt: 'Estável',
      nl: 'Stabiel'
    },
    growing: {
      en: 'Growing',
      fr: 'En croissance',
      de: 'Wachsend',
      es: 'En crecimiento',
      it: 'In crescita',
      pt: 'Em crescimento',
      nl: 'Groeiend'
    },
    declining: {
      en: 'Declining',
      fr: 'En déclin',
      de: 'Im Niedergang',
      es: 'En declive',
      it: 'In declino',
      pt: 'Em declínio',
      nl: 'Afnemend'
    },
    uncertain: {
      en: 'Uncertain',
      fr: 'Incertain',
      de: 'Unsicher',
      es: 'Incierto',
      it: 'Incerto',
      pt: 'Incerto',
      nl: 'Onzeker'
    },
    transitioning: {
      en: 'Transitioning',
      fr: 'En transition',
      de: 'Im Übergang',
      es: 'En transición',
      it: 'In transizione',
      pt: 'Em transição',
      nl: 'In overgang'
    }
  }
} as const;

type TranslationCategory = keyof typeof INTELLIGENCE_TRANSLATIONS;
type SupportedLanguage = 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'nl';

/**
 * Translate a value from the intelligence layer
 */
export function translateIntelligenceValue(
  category: TranslationCategory,
  value: string | null | undefined
): string {
  if (!value) return '';
  
  const normalizedValue = value.toLowerCase().trim();
  const currentLang = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  
  const categoryTranslations = INTELLIGENCE_TRANSLATIONS[category] as Record<string, Record<SupportedLanguage, string>>;
  
  if (categoryTranslations && normalizedValue in categoryTranslations) {
    const valueTranslations = categoryTranslations[normalizedValue];
    return valueTranslations[currentLang] || valueTranslations.en || value;
  }
  
  // Return original value if no translation found
  return value;
}

/**
 * Get mobility speed badge color
 */
export function getMobilitySpeedColor(speed: string | null | undefined): string {
  if (!speed) return 'bg-muted text-muted-foreground';
  
  const normalized = speed.toLowerCase();
  if (normalized === 'fast') return 'bg-green-500/10 text-green-600 border-green-500/30';
  if (normalized === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  if (normalized === 'slow') return 'bg-red-500/10 text-red-600 border-red-500/30';
  return 'bg-muted text-muted-foreground';
}

/**
 * Get mental cost badge color
 */
export function getMentalCostColor(cost: string | null | undefined): string {
  if (!cost) return 'bg-muted text-muted-foreground';
  
  const normalized = cost.toLowerCase();
  if (normalized === 'low') return 'bg-green-500/10 text-green-600 border-green-500/30';
  if (normalized === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  if (normalized === 'high') return 'bg-red-500/10 text-red-600 border-red-500/30';
  return 'bg-muted text-muted-foreground';
}

/**
 * Get cycle status badge color
 */
export function getCycleStatusColor(status: string | null | undefined): string {
  if (!status) return 'bg-muted text-muted-foreground';
  
  const normalized = status.toLowerCase();
  if (normalized === 'stable') return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
  if (normalized === 'growing') return 'bg-green-500/10 text-green-600 border-green-500/30';
  if (normalized === 'declining') return 'bg-red-500/10 text-red-600 border-red-500/30';
  if (normalized === 'uncertain' || normalized === 'transitioning') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  return 'bg-muted text-muted-foreground';
}

// Section headers for Intelligence Layer
export const INTELLIGENCE_SECTION_LABELS = {
  power: {
    en: 'Power Map',
    fr: 'Carte du pouvoir',
    de: 'Machtstruktur',
    es: 'Mapa del poder',
    it: 'Mappa del potere',
    pt: 'Mapa do poder',
    nl: 'Machtskaart'
  },
  social: {
    en: 'Social System',
    fr: 'Système social',
    de: 'Sozialsystem',
    es: 'Sistema social',
    it: 'Sistema sociale',
    pt: 'Sistema social',
    nl: 'Sociaal systeem'
  },
  strategies: {
    en: 'Strategies',
    fr: 'Stratégies',
    de: 'Strategien',
    es: 'Estrategias',
    it: 'Strategie',
    pt: 'Estratégias',
    nl: 'Strategieën'
  },
  mobility: {
    en: 'Mobility',
    fr: 'Mobilité',
    de: 'Mobilität',
    es: 'Movilidad',
    it: 'Mobilità',
    pt: 'Mobilidade',
    nl: 'Mobiliteit'
  },
  psycho: {
    en: 'Psychology',
    fr: 'Psychologie',
    de: 'Psychologie',
    es: 'Psicología',
    it: 'Psicologia',
    pt: 'Psicologia',
    nl: 'Psychologie'
  },
  geo: {
    en: 'Geopolitics',
    fr: 'Géopolitique',
    de: 'Geopolitik',
    es: 'Geopolítica',
    it: 'Geopolitica',
    pt: 'Geopolítica',
    nl: 'Geopolitiek'
  },
  history: {
    en: 'Historical Legacy',
    fr: 'Héritage historique',
    de: 'Historisches Erbe',
    es: 'Legado histórico',
    it: 'Eredità storica',
    pt: 'Legado histórico',
    nl: 'Historische erfenis'
  }
} as const;

// Tag labels with translations
export const TAG_LABELS = {
  network_weight: {
    en: 'Network Weight',
    fr: 'Poids des réseaux',
    de: 'Netzwerkgewicht',
    es: 'Peso de redes',
    it: 'Peso delle reti',
    pt: 'Peso das redes',
    nl: 'Netwerkgewicht'
  },
  diploma_weight: {
    en: 'Diploma Weight',
    fr: 'Poids des diplômes',
    de: 'Diplomgewicht',
    es: 'Peso de diplomas',
    it: 'Peso dei diplomi',
    pt: 'Peso dos diplomas',
    nl: 'Diplomagewicht'
  },
  risk_tolerance: {
    en: 'Risk Tolerance',
    fr: 'Tolérance au risque',
    de: 'Risikotoleranz',
    es: 'Tolerancia al riesgo',
    it: 'Tolleranza al rischio',
    pt: 'Tolerância ao risco',
    nl: 'Risicotolerantie'
  },
  admin_speed: {
    en: 'Admin Speed',
    fr: 'Vitesse administrative',
    de: 'Verwaltungsgeschwindigkeit',
    es: 'Velocidad administrativa',
    it: 'Velocità amministrativa',
    pt: 'Velocidade administrativa',
    nl: 'Administratieve snelheid'
  },
  authority_verticality: {
    en: 'Authority Verticality',
    fr: 'Verticalité de l\'autorité',
    de: 'Autoritätsvertikalität',
    es: 'Verticalidad de autoridad',
    it: 'Verticalità dell\'autorità',
    pt: 'Verticalidade da autoridade',
    nl: 'Autoritaire hiërarchie'
  },
  mental_friction: {
    en: 'Mental Friction',
    fr: 'Friction mentale',
    de: 'Mentale Reibung',
    es: 'Fricción mental',
    it: 'Attrito mentale',
    pt: 'Fricção mental',
    nl: 'Mentale wrijving'
  },
  social_mobility: {
    en: 'Social Mobility',
    fr: 'Mobilité sociale',
    de: 'Soziale Mobilität',
    es: 'Movilidad social',
    it: 'Mobilità sociale',
    pt: 'Mobilidade social',
    nl: 'Sociale mobiliteit'
  },
  predictability: {
    en: 'Predictability',
    fr: 'Prévisibilité',
    de: 'Vorhersehbarkeit',
    es: 'Previsibilidad',
    it: 'Prevedibilità',
    pt: 'Previsibilidade',
    nl: 'Voorspelbaarheid'
  },
  reputation_requirement: {
    en: 'Reputation Requirement',
    fr: 'Exigence de réputation',
    de: 'Reputationsanforderung',
    es: 'Requisito de reputación',
    it: 'Requisito di reputazione',
    pt: 'Requisito de reputação',
    nl: 'Reputatievereiste'
  },
  compliance_sensitivity: {
    en: 'Compliance Sensitivity',
    fr: 'Sensibilité aux règles',
    de: 'Regelkonformität',
    es: 'Sensibilidad a las reglas',
    it: 'Sensibilità alle regole',
    pt: 'Sensibilidade às regras',
    nl: 'Regelgevoeligheid'
  }
} as const;

type TagKey = keyof typeof TAG_LABELS;

/**
 * Get translated tag label
 */
export function getTagLabel(tagKey: TagKey): string {
  const currentLang = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const translations = TAG_LABELS[tagKey];
  if (currentLang in translations) {
    return translations[currentLang as keyof typeof translations];
  }
  return translations.en;
}

/**
 * Get all tag labels for current language
 */
export function getAllTagLabels(): Record<TagKey, string> {
  const result = {} as Record<TagKey, string>;
  for (const key of Object.keys(TAG_LABELS) as TagKey[]) {
    result[key] = getTagLabel(key);
  }
  return result;
}
