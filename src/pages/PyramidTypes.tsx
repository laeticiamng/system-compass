import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '@/components/i18n';
import { ArrowLeft, AlertTriangle, Target, TrendingUp, Shield, Shuffle, Pickaxe } from 'lucide-react';
import { PYRAMID_TYPE_INFO, PyramidType } from '@/lib/types';
import { useCountries } from '@/lib/countries-data';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';
import { PyramidTypeCard, PyramidQuickNav } from '@/components/pyramid';

const PYRAMID_ICONS: Record<PyramidType, typeof AlertTriangle> = {
  PROBLEM_RENT: AlertTriangle,
  STABILITY_REDIS: Shield,
  COMPETENCE_TRUST: Target,
  GROWTH_RISK: TrendingUp,
  HYBRID_TRANSITION: Shuffle,
  RESOURCE_EXTRACTION: Pickaxe,
};

const PYRAMID_CHARACTERISTICS: Record<PyramidType, string[]> = {
  PROBLEM_RENT: ['corruption', 'informality', 'networks'],
  STABILITY_REDIS: ['bureaucracy', 'protection', 'redistribution'],
  COMPETENCE_TRUST: ['precision', 'credentials', 'trust'],
  GROWTH_RISK: ['speed', 'capital', 'scalability'],
  HYBRID_TRANSITION: ['contradictions', 'change', 'adaptation'],
  RESOURCE_EXTRACTION: ['resources', 'proximity', 'distribution'],
};

export default function PyramidTypes() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { 
    getPyramidLabel, 
    getPyramidDescription, 
    getWhoThrives, 
    getWhoPays, 
    getSurvivalRules, 
    getOpportunities, 
    getWarningSigns 
  } = usePyramidTranslations();

  const pyramidTypes = Object.entries(PYRAMID_TYPE_INFO) as [PyramidType, typeof PYRAMID_TYPE_INFO[PyramidType]][];

  return (
    <main className="min-h-screen bg-background pt-16 sm:pt-24 pb-12 sm:pb-16">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            {t('pyramidTypes.title', 'Les Six Pyramides')}
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-3xl">
            {t('pyramidTypes.subtitle', 'Comprendre le système réel de chaque pays pour naviguer intelligemment. Chaque pyramide représente une logique de pouvoir différente.')}
          </p>
        </div>

        {/* Pyramid Types Grid */}
        <div className="space-y-10 sm:space-y-16">
          {pyramidTypes.map(([type, info], index) => {
            const typeCountries = countries.filter(c => c.pyramidType === type).slice(0, 5);
            
            return (
              <PyramidTypeCard
                key={type}
                type={type}
                info={info}
                index={index}
                Icon={PYRAMID_ICONS[type]}
                characteristics={PYRAMID_CHARACTERISTICS[type]}
                countries={typeCountries}
                getPyramidLabel={getPyramidLabel}
                getPyramidDescription={getPyramidDescription}
                getWhoThrives={getWhoThrives}
                getWhoPays={getWhoPays}
                getSurvivalRules={getSurvivalRules}
                getOpportunities={getOpportunities}
                getWarningSigns={getWarningSigns}
              />
            );
          })}
        </div>

        {/* Navigation Quick Links */}
        <PyramidQuickNav pyramidTypes={pyramidTypes} icons={PYRAMID_ICONS} />
      </div>
    </main>
  );
}
