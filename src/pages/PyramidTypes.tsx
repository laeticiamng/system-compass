import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Target, TrendingUp, Shield, Zap, Shuffle, Pickaxe } from 'lucide-react';
import { PYRAMID_TYPE_INFO, PyramidType } from '@/lib/types';
import { useCountries } from '@/lib/countries-data';
import { cn } from '@/lib/utils';
import { usePyramidTranslations } from '@/hooks/usePyramidTranslations';

const getFlagEmoji = (iso2: string) => {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

const PYRAMID_ICONS: Record<PyramidType, typeof AlertTriangle> = {
  PROBLEM_RENT: AlertTriangle,
  STABILITY_REDIS: Shield,
  COMPETENCE_TRUST: Target,
  GROWTH_RISK: TrendingUp,
  HYBRID_TRANSITION: Shuffle,
  RESOURCE_EXTRACTION: Pickaxe,
};

const PYRAMID_DETAILS: Record<PyramidType, {
  characteristics: string[];
  caseStudyKey: string;
  whoThrivesKey: string;
  whoPaysKey: string;
  survivalRulesKey: string;
  warningSignsKey: string;
  opportunitiesKey: string;
}> = {
  PROBLEM_RENT: {
    characteristics: ['corruption', 'informality', 'networks'],
    caseStudyKey: 'problemRent',
    whoThrivesKey: 'problemRent',
    whoPaysKey: 'problemRent',
    survivalRulesKey: 'problemRent',
    warningSignsKey: 'problemRent',
    opportunitiesKey: 'problemRent',
  },
  STABILITY_REDIS: {
    characteristics: ['bureaucracy', 'protection', 'redistribution'],
    caseStudyKey: 'stabilityRedis',
    whoThrivesKey: 'stabilityRedis',
    whoPaysKey: 'stabilityRedis',
    survivalRulesKey: 'stabilityRedis',
    warningSignsKey: 'stabilityRedis',
    opportunitiesKey: 'stabilityRedis',
  },
  COMPETENCE_TRUST: {
    characteristics: ['precision', 'credentials', 'trust'],
    caseStudyKey: 'competenceTrust',
    whoThrivesKey: 'competenceTrust',
    whoPaysKey: 'competenceTrust',
    survivalRulesKey: 'competenceTrust',
    warningSignsKey: 'competenceTrust',
    opportunitiesKey: 'competenceTrust',
  },
  GROWTH_RISK: {
    characteristics: ['speed', 'capital', 'scalability'],
    caseStudyKey: 'growthRisk',
    whoThrivesKey: 'growthRisk',
    whoPaysKey: 'growthRisk',
    survivalRulesKey: 'growthRisk',
    warningSignsKey: 'growthRisk',
    opportunitiesKey: 'growthRisk',
  },
  HYBRID_TRANSITION: {
    characteristics: ['contradictions', 'change', 'adaptation'],
    caseStudyKey: 'hybridTransition',
    whoThrivesKey: 'hybridTransition',
    whoPaysKey: 'hybridTransition',
    survivalRulesKey: 'hybridTransition',
    warningSignsKey: 'hybridTransition',
    opportunitiesKey: 'hybridTransition',
  },
  RESOURCE_EXTRACTION: {
    characteristics: ['resources', 'proximity', 'distribution'],
    caseStudyKey: 'resourceExtraction',
    whoThrivesKey: 'resourceExtraction',
    whoPaysKey: 'resourceExtraction',
    survivalRulesKey: 'resourceExtraction',
    warningSignsKey: 'resourceExtraction',
    opportunitiesKey: 'resourceExtraction',
  },
};

export default function PyramidTypes() {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const { getPyramidLabel, getPyramidDescription, getWhoThrives, getWhoPays, getSurvivalRules, getOpportunities, getWarningSigns } = usePyramidTranslations();

  const pyramidTypes = Object.entries(PYRAMID_TYPE_INFO) as [PyramidType, typeof PYRAMID_TYPE_INFO[PyramidType]][];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Retour')}
          </Link>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('pyramidTypes.title', 'Les Six Pyramides')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('pyramidTypes.subtitle', 'Comprendre le système réel de chaque pays pour naviguer intelligemment. Chaque pyramide représente une logique de pouvoir différente.')}
          </p>
        </div>

        {/* Pyramid Types Grid */}
        <div className="space-y-16">
          {pyramidTypes.map(([type, info], index) => {
            const Icon = PYRAMID_ICONS[type];
            const details = PYRAMID_DETAILS[type];
            const typeCountries = countries.filter(c => c.pyramidType === type).slice(0, 5);
            
            return (
              <section 
                key={type} 
                id={type.toLowerCase()}
                className="scroll-mt-24"
              >
                <div className={cn(
                  "glass-card rounded-2xl p-8 border-l-4",
                  `border-l-${info.color}`
                )} style={{ borderLeftColor: `hsl(var(--${info.color}))` }}>
                  
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                    <div className={cn(
                      "p-4 rounded-xl shrink-0",
                      `bg-${info.color}/20`
                    )} style={{ backgroundColor: `hsl(var(--${info.color}) / 0.15)` }}>
                      <Icon className="w-8 h-8" style={{ color: `hsl(var(--${info.color}))` }} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                        <h2 className="font-display text-2xl md:text-3xl font-bold">
                          {getPyramidLabel(type)}
                        </h2>
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {getPyramidDescription(type)}
                      </p>
                    </div>
                  </div>

                  {/* Characteristics Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {details.characteristics.map(char => (
                      <span 
                        key={char}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-accent/50 text-accent-foreground"
                      >
                        {t(`pyramids.characteristics.${char}`, char)}
                      </span>
                    ))}
                  </div>

                  {/* Content Grid */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Who Thrives */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold text-lg">{t('pyramidTypes.whoThrives', 'Qui prospère')}</h3>
                      </div>
                      <ul className="space-y-2">
                        {getWhoThrives(type).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-emerald-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Who Pays */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-destructive" />
                        <h3 className="font-semibold text-lg">{t('pyramidTypes.whoPays', 'Qui paie le prix')}</h3>
                      </div>
                      <ul className="space-y-2">
                        {getWhoPays(type).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-destructive mt-1">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Survival Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{t('pyramidTypes.survivalRules', 'Règles de survie')}</h3>
                      </div>
                      <ul className="space-y-2">
                        {getSurvivalRules(type).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-primary mt-1">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-lg">{t('pyramidTypes.opportunities', 'Opportunités cachées')}</h3>
                      </div>
                      <ul className="space-y-2">
                        {getOpportunities(type).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-amber-500 mt-1">★</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Warning Signs */}
                  <div className="bg-destructive/10 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold text-lg">{t('pyramidTypes.warningSigns', 'Signaux d\'alerte')}</h3>
                    </div>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {getWarningSigns(type).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-destructive mt-1">⚠</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Example Countries */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">{t('pyramidTypes.exampleCountries', 'Pays exemplaires')}</h3>
                    <div className="flex flex-wrap gap-3">
                      {typeCountries.map(country => (
                        <Link
                          key={country.id}
                          to={`/country/${country.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                        >
                          <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                          <span className="font-medium">{t(`countriesData.${country.id}.name`, country.name)}</span>
                        </Link>
                      ))}
                      {typeCountries.length === 0 && (
                        <span className="text-muted-foreground italic">
                          {t('pyramidTypes.noExamples', 'Exemples à venir')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Navigation Quick Links */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2">
          {pyramidTypes.map(([type, info]) => {
            const Icon = PYRAMID_ICONS[type];
            return (
              <a
                key={type}
                href={`#${type.toLowerCase()}`}
                className="p-2 rounded-lg bg-card/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors group"
                title={info.label}
              >
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
