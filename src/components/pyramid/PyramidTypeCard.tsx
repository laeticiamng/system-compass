import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, XCircle, Shield, Zap, LucideIcon } from 'lucide-react';
import { PyramidType, PYRAMID_TYPE_INFO } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Country } from '@/lib/types';

const getFlagEmoji = (iso2: string) => {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

interface PyramidTypeCardProps {
  type: PyramidType;
  info: typeof PYRAMID_TYPE_INFO[PyramidType];
  index: number;
  Icon: LucideIcon;
  characteristics: string[];
  countries: Country[];
  getPyramidLabel: (type: PyramidType) => string;
  getPyramidDescription: (type: PyramidType) => string;
  getWhoThrives: (type: PyramidType) => string[];
  getWhoPays: (type: PyramidType) => string[];
  getSurvivalRules: (type: PyramidType) => string[];
  getOpportunities: (type: PyramidType) => string[];
  getWarningSigns: (type: PyramidType) => string[];
}

export function PyramidTypeCard({
  type,
  info,
  index,
  Icon,
  characteristics,
  countries,
  getPyramidLabel,
  getPyramidDescription,
  getWhoThrives,
  getWhoPays,
  getSurvivalRules,
  getOpportunities,
  getWarningSigns,
}: PyramidTypeCardProps) {
  const { t } = useTranslation();

  return (
    <section 
      id={type.toLowerCase()}
      className="scroll-mt-20 sm:scroll-mt-24"
    >
      <div className={cn(
        "glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8 border-l-4",
        `border-l-${info.color}`
      )} style={{ borderLeftColor: `hsl(var(--${info.color}))` }}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={cn(
            "p-3 sm:p-4 rounded-lg sm:rounded-xl shrink-0 w-fit",
            `bg-${info.color}/20`
          )} style={{ backgroundColor: `hsl(var(--${info.color}) / 0.15)` }}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: `hsl(var(--${info.color}))` }} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xs sm:text-sm font-mono text-muted-foreground">#{index + 1}</span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold">
                {getPyramidLabel(type)}
              </h2>
            </div>
            <p className="text-sm sm:text-lg text-muted-foreground">
              {getPyramidDescription(type)}
            </p>
          </div>
        </div>

        {/* Characteristics Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {characteristics.map(char => (
            <span 
              key={char}
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-accent/50 text-accent-foreground"
            >
              {t(`pyramids.characteristics.${char}`, char)}
            </span>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
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
            {countries.map(country => (
              <Link
                key={country.id}
                to={`/country/${country.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
                <span className="font-medium">{t(`countriesData.${country.id}.name`, country.name)}</span>
              </Link>
            ))}
            {countries.length === 0 && (
              <span className="text-muted-foreground italic">
                {t('pyramidTypes.noExamples', 'Exemples à venir')}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
