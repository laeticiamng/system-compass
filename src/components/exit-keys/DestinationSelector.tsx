import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Briefcase, Plane, GraduationCap, Palmtree, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { Country } from '@/lib/types';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { LifePriority } from '@/lib/types';

interface DestinationSelectorProps {
  intention: ProjectIntention;
  nationalityIds: string[];
  currentCountryId: string;
  desiredLife: LifePriority;
  age?: number;
  professionId?: string;
  selectedDestinationId?: string;
  onDestinationSelect: (countryId: string) => void;
}

function getFlagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

// Score a country for different intentions - returns translation keys
function scoreCountryForIntention(
  country: Country,
  intention: ProjectIntention,
  age: number,
  currentCostOfLiving: number
): { score: number; reasonKeys: string[] } {
  let score = 50;
  const reasonKeys: string[] = [];

  const costOfLiving = country.costOfLiving?.monthlyBudgetSingle || 1500;
  const visaFriendly = country.visa?.workVisa === 'easy' || country.visa?.digitalNomadVisa;
  
  switch (intention) {
    case 'installation':
      if (country.pyramidType === 'COMPETENCE_TRUST' || country.pyramidType === 'STABILITY_REDIS') {
        score += 15;
        reasonKeys.push('exitKeys.destination.systemStability');
      }
      if (costOfLiving < currentCostOfLiving * 0.8) {
        score += 10;
        reasonKeys.push('exitKeys.destination.budgetFriendly');
      }
      if (age < 35) {
        score += 5;
        reasonKeys.push('exitKeys.destination.youngOpportunities');
      }
      break;

    case 'vacation':
      if (costOfLiving < currentCostOfLiving * 0.5) {
        score += 25;
        reasonKeys.push('exitKeys.destination.veryAffordable');
      } else if (costOfLiving < currentCostOfLiving * 0.7) {
        score += 15;
        reasonKeys.push('exitKeys.destination.goodValue');
      }
      if (visaFriendly) {
        score += 10;
        reasonKeys.push('exitKeys.destination.quickAccess');
      }
      break;

    case 'internship':
      if (age < 30) {
        score += 20;
        reasonKeys.push('exitKeys.destination.idealInternship');
      }
      if (country.pyramidType === 'COMPETENCE_TRUST') {
        score += 15;
        reasonKeys.push('exitKeys.destination.academicExcellence');
      }
      break;

    case 'retirement':
      if (age >= 55) {
        score += 10;
        reasonKeys.push('exitKeys.destination.retireeFriendly');
      }
      if (costOfLiving < currentCostOfLiving * 0.6) {
        score += 20;
        reasonKeys.push('exitKeys.destination.pensionValue');
      }
      const healthcareQuality = country.healthcare?.qualityScore || 50;
      if (healthcareQuality >= 70) {
        score += 15;
        reasonKeys.push('exitKeys.destination.goodHealthcare');
      }
      break;

    case 'digital_nomad':
      if (costOfLiving < currentCostOfLiving * 0.5) {
        score += 20;
        reasonKeys.push('exitKeys.destination.veryLowCost');
      }
      if (country.pyramidType === 'GROWTH_RISK' || country.pyramidType === 'HYBRID_TRANSITION') {
        score += 10;
        reasonKeys.push('exitKeys.destination.nomadCommunity');
      }
      break;
  }

  return { score: Math.min(100, score), reasonKeys };
}

export function DestinationSelector({
  intention,
  nationalityIds,
  currentCountryId,
  desiredLife,
  age = 30,
  professionId,
  selectedDestinationId,
  onDestinationSelect,
}: DestinationSelectorProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();

  const currentCountry = countries.find(c => c.id === currentCountryId);
  const currentCostOfLiving = currentCountry?.costOfLiving?.monthlyBudgetSingle || 2000;

  // Score and filter countries based on intention
  const scoredCountries = useMemo(() => {
    return countries
      .filter(c => c.id !== currentCountryId)
      .map(country => ({
        country,
        ...scoreCountryForIntention(country, intention, age, currentCostOfLiving)
      }))
      .sort((a, b) => b.score - a.score);
  }, [countries, currentCountryId, intention, age, currentCostOfLiving]);

  // Get top recommendations
  const topRecommendations = scoredCountries.slice(0, 12);

  const getIntentionIcon = () => {
    switch (intention) {
      case 'installation': return <Briefcase className="w-5 h-5" />;
      case 'vacation': return <Plane className="w-5 h-5" />;
      case 'internship': return <GraduationCap className="w-5 h-5" />;
      case 'retirement': return <Palmtree className="w-5 h-5" />;
      case 'digital_nomad': return <Laptop className="w-5 h-5" />;
    }
  };

  const getIntentionLabel = () => {
    switch (intention) {
      case 'installation': return t('exitKeys.intention.installation', 'Installation');
      case 'vacation': return t('exitKeys.intention.vacation', 'Vacances');
      case 'internship': return t('exitKeys.intention.internship', 'Stage');
      case 'retirement': return t('exitKeys.intention.retirement', 'Retraite');
      case 'digital_nomad': return t('exitKeys.intention.digitalNomad', 'Nomade digital');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          {getIntentionIcon()}
          <span className="font-medium">{getIntentionLabel()}</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {t('exitKeys.destination.title', 'Où voulez-vous aller ?')}
        </h3>
        <p className="text-muted-foreground">
          {t('exitKeys.destination.subtitle', 'Destinations optimisées pour votre projet et votre profil')}
        </p>
      </div>

      {/* Recommendations grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topRecommendations.map(({ country, score, reasonKeys }) => {
          const isSelected = selectedDestinationId === country.id;
          const costOfLiving = country.costOfLiving?.monthlyBudgetSingle || 1500;
          
          return (
            <button
              key={country.id}
              onClick={() => onDestinationSelect(country.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02]",
                isSelected 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30" 
                  : "border-border hover:border-primary/50 bg-card/50"
              )}
            >
              {/* Score badge */}
              <div className={cn(
                "absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white",
                score >= 80 ? "bg-green-600 dark:bg-green-500" :
                score >= 60 ? "bg-amber-600 dark:bg-amber-500" :
                "bg-muted text-foreground"
              )}>
                {score}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{getFlagEmoji(country.iso2)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{country.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    ~{costOfLiving}€/{t('common.month', 'mois')}
                  </p>
                </div>
              </div>

              {reasonKeys.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reasonKeys.slice(0, 2).map((key, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {t(key)}
                    </span>
                  ))}
                </div>
              )}

              {isSelected && (
                <div className="absolute bottom-2 right-2">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* All countries option */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          {t('exitKeys.destination.showAll', 'Voir tous les pays')} ({countries.length - 1})
        </summary>
        <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {countries
            .filter(c => c.id !== currentCountryId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(country => (
              <button
                key={country.id}
                onClick={() => onDestinationSelect(country.id)}
                className={cn(
                  "p-2 rounded-lg border text-left transition-all",
                  selectedDestinationId === country.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-lg mr-2">{getFlagEmoji(country.iso2)}</span>
                <span className="text-sm truncate">{country.name}</span>
              </button>
            ))}
        </div>
      </details>
    </div>
  );
}
