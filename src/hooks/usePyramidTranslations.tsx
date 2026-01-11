import { useTranslation } from 'react-i18next';
import { PyramidType } from '@/lib/types';

// Map pyramid types to translation keys
const PYRAMID_TRANSLATION_KEYS: Record<PyramidType, { labelKey: string; descKey: string; detailsKey: string }> = {
  PROBLEM_RENT: { 
    labelKey: 'pyramids.problemRent.label', 
    descKey: 'pyramids.problemRent.description',
    detailsKey: 'problemRent' 
  },
  STABILITY_REDIS: { 
    labelKey: 'pyramids.stabilityRedis.label', 
    descKey: 'pyramids.stabilityRedis.description',
    detailsKey: 'stabilityRedis' 
  },
  COMPETENCE_TRUST: { 
    labelKey: 'pyramids.competenceTrust.label', 
    descKey: 'pyramids.competenceTrust.description',
    detailsKey: 'competenceTrust' 
  },
  GROWTH_RISK: { 
    labelKey: 'pyramids.growthRisk.label', 
    descKey: 'pyramids.growthRisk.description',
    detailsKey: 'growthRisk' 
  },
  HYBRID_TRANSITION: { 
    labelKey: 'pyramids.hybridTransition.label', 
    descKey: 'pyramids.hybridTransition.description',
    detailsKey: 'hybridTransition' 
  },
  RESOURCE_EXTRACTION: { 
    labelKey: 'pyramids.resourceExtraction.label', 
    descKey: 'pyramids.resourceExtraction.description',
    detailsKey: 'resourceExtraction' 
  },
};

// Fallback English labels for pyramid types
const FALLBACK_LABELS: Record<PyramidType, string> = {
  PROBLEM_RENT: 'Problem Rent',
  STABILITY_REDIS: 'Stability Redistribution',
  COMPETENCE_TRUST: 'Competence Trust',
  GROWTH_RISK: 'Growth Risk',
  HYBRID_TRANSITION: 'Hybrid Transition',
  RESOURCE_EXTRACTION: 'Resource Extraction',
};

export function usePyramidTranslations() {
  const { t } = useTranslation();

  const getPyramidLabel = (pyramidType: PyramidType): string => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType];
    return t(key.labelKey, FALLBACK_LABELS[pyramidType]);
  };

  const getPyramidDescription = (pyramidType: PyramidType): string => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType];
    return t(key.descKey, '');
  };

  const getWhoThrives = (pyramidType: PyramidType): string[] => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType].detailsKey;
    const translated = t(`pyramidTypes.details.${key}.whoThrives`, { returnObjects: true });
    if (Array.isArray(translated)) {
      return translated.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  const getWhoPays = (pyramidType: PyramidType): string[] => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType].detailsKey;
    const translated = t(`pyramidTypes.details.${key}.whoPays`, { returnObjects: true });
    if (Array.isArray(translated)) {
      return translated.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  const getSurvivalRules = (pyramidType: PyramidType): string[] => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType].detailsKey;
    const translated = t(`pyramidTypes.details.${key}.survivalRules`, { returnObjects: true });
    if (Array.isArray(translated)) {
      return translated.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  const getOpportunities = (pyramidType: PyramidType): string[] => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType].detailsKey;
    const translated = t(`pyramidTypes.details.${key}.opportunities`, { returnObjects: true });
    if (Array.isArray(translated)) {
      return translated.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  const getWarningSigns = (pyramidType: PyramidType): string[] => {
    const key = PYRAMID_TRANSLATION_KEYS[pyramidType].detailsKey;
    const translated = t(`pyramidTypes.details.${key}.warningSigns`, { returnObjects: true });
    if (Array.isArray(translated)) {
      return translated.filter((item): item is string => typeof item === 'string');
    }
    return [];
  };

  return {
    getPyramidLabel,
    getPyramidDescription,
    getWhoThrives,
    getWhoPays,
    getSurvivalRules,
    getOpportunities,
    getWarningSigns,
  };
}

export { PYRAMID_TRANSLATION_KEYS, FALLBACK_LABELS };
