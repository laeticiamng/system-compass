import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Country } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { MapPin, TrendingUp, Shield, Users } from 'lucide-react';

const PYRAMID_TYPE_LABELS: Record<string, string> = {
  PROBLEM_RENT: 'pyramids.problemRent.label',
  STABILITY_REDIS: 'pyramids.stabilityRedis.label',
  COMPETENCE_TRUST: 'pyramids.competenceTrust.label',
  GROWTH_RISK: 'pyramids.growthRisk.label',
  HYBRID_TRANSITION: 'pyramids.hybridTransition.label',
  RESOURCE_EXTRACTION: 'pyramids.resourceExtraction.label',
};

const PYRAMID_TYPE_COLORS: Record<string, string> = {
  PROBLEM_RENT: 'pyramid-rent',
  STABILITY_REDIS: 'pyramid-stability',
  COMPETENCE_TRUST: 'pyramid-competence',
  GROWTH_RISK: 'pyramid-growth',
  HYBRID_TRANSITION: 'pyramid-hybrid',
  RESOURCE_EXTRACTION: 'pyramid-resource',
};

interface CountryCardProps {
  country: Country;
  className?: string;
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatNumber(num: number): string {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
}

function formatPopulation(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
  return `${(num / 1000).toFixed(0)}K`;
}

export const CountryCard = forwardRef<HTMLDivElement, CountryCardProps>(
  function CountryCard({ country, className }, ref) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const typeColor = PYRAMID_TYPE_COLORS[country.pyramidType];

    // Get translated country data
    const countryData = t(`countriesData.${country.id}`, { returnObjects: true }) as {
      name?: string;
      region?: string;
      ruleOfGold?: string;
    } | undefined;

    const displayName = countryData?.name || country.name;
    const displayRegion = countryData?.region || country.region;
    const displayRuleOfGold = countryData?.ruleOfGold || country.ruleOfGold;

    return (
      <div
        ref={ref}
        onClick={() => navigate(`/country/${country.id}`)}
        className={cn(
          'group relative p-6 rounded-xl cursor-pointer',
          'glass-card glow-subtle',
          'transition-all duration-300 hover:scale-[1.02]',
          'hover:border-primary/30',
          className
        )}
      >
        {/* Type Badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
            color: `hsl(var(--${typeColor}))`,
          }}
        >
          {t(PYRAMID_TYPE_LABELS[country.pyramidType])}
        </div>

        {/* Country Info */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{getFlagEmoji(country.iso2)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground mb-1">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {displayRegion}
            </div>
          </div>
        </div>

        {/* Rule of Gold */}
        <p className="mt-4 text-sm text-muted-foreground italic line-clamp-2">
          &quot;{displayRuleOfGold}&quot;
        </p>

        {/* Key Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="text-sm font-semibold">${formatNumber(country.snapshot.gdpPerCapita)}</div>
            <div className="text-xs text-muted-foreground">{t('countries.gdpCap')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Shield className="w-3 h-3" />
            </div>
            <div className="text-sm font-semibold">#{country.snapshot.passportRank}</div>
            <div className="text-xs text-muted-foreground">{t('countries.passport')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="w-3 h-3" />
            </div>
            <div className="text-sm font-semibold">{formatPopulation(country.snapshot.population)}</div>
            <div className="text-xs text-muted-foreground">{t('countries.population')}</div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium">{t('countries.explore')}</span>
        </div>
      </div>
    );
  }
);
