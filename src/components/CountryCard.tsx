import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Country } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { MapPin, TrendingUp, Shield, Users } from 'lucide-react';
import { SavedCountriesButton } from '@/components/common/SavedCountriesButton';
import { RiskGradeBadge } from '@/components/RiskGradeLabel';

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
    
    // Calculate overall safety score for the grade with robust fallback
    const calculateSafetyScore = (): number => {
      if (country.qualityOfLife?.safetyIndex && country.qualityOfLife.safetyIndex > 0) {
        return country.qualityOfLife.safetyIndex;
      }
      const risks = country.risks || {};
      const avgRisk = ((risks.legal || 50) + (risks.safety || 50) + (risks.corruption || 50)) / 3;
      return Math.max(0, Math.min(100, 100 - avgRisk));
    };
    const safetyScore = calculateSafetyScore();

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
          'group relative p-4 sm:p-6 rounded-xl cursor-pointer',
          'glass-card glow-subtle border border-border/60',
          'transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02]',
          'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 touch-manipulation',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className
        )}
      >
        {/* Save Button */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <SavedCountriesButton 
            countryId={country.id} 
            countryName={displayName}
            size="sm"
          />
        </div>

        {/* Country Info - Restructured to avoid overlap */}
        <div className="flex items-start gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="text-3xl sm:text-4xl flex-shrink-0">{getFlagEmoji(country.iso2)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-1 truncate pr-2">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{displayRegion}</span>
            </div>
          </div>
        </div>

        {/* Type Badge - Moved below header for clarity */}
        <div className="mt-3 sm:mt-4">
          <span
            className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
            style={{
              backgroundColor: `hsl(var(--${typeColor}) / 0.15)`,
              color: `hsl(var(--${typeColor}))`,
            }}
          >
            {t(PYRAMID_TYPE_LABELS[country.pyramidType])}
          </span>
        </div>

        {/* Rule of Gold */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground italic line-clamp-2">
          &quot;{displayRuleOfGold}&quot;
        </p>

        {/* Key Stats with Risk Grade */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
          {/* Risk Grade - New */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-0.5 sm:mb-1">
              <RiskGradeBadge score={safetyScore} className="w-7 h-7 sm:w-8 sm:h-8 text-xs" />
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('countries.risk', 'Risque')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="text-xs sm:text-sm font-semibold">${formatNumber(country.snapshot.gdpPerCapita)}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('countries.gdpCap', 'PIB/hab')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <Shield className="w-3 h-3" />
            </div>
            <div className="text-xs sm:text-sm font-semibold">#{country.snapshot.passportRank}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('countries.passport', 'Passeport')}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5 sm:mb-1">
              <Users className="w-3 h-3" />
            </div>
            <div className="text-xs sm:text-sm font-semibold">{formatPopulation(country.snapshot.population)}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('countries.population', 'Pop.')}</div>
          </div>
        </div>

        {/* Hover indicator - hidden on mobile */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-primary opacity-0 sm:group-hover:opacity-100 transition-opacity hidden sm:block">
          <span className="text-sm font-medium">{t('countries.explore')}</span>
        </div>
      </div>
    );
  }
);
