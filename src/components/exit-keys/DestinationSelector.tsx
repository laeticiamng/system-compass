import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Briefcase, Plane, GraduationCap, Palmtree, Laptop, TrendingUp, Heart, Shield, Zap, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountries } from '@/lib/countries-data';
import { Country, PyramidType, LifePriority } from '@/lib/types';
import { ProjectIntention } from '@/hooks/useExitKeysProfile';
import { getProfession, Profession, getEstimatedSalaryWithAge, getCountryCurrency } from '@/lib/profession-data';
import { Progress } from '@/components/ui/progress';

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
  return iso2.toUpperCase().split('').map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join('');
}

const PRIORITY_PYRAMID_WEIGHTS: Record<LifePriority, Record<PyramidType, number>> = {
  money: { 'COMPETENCE_TRUST': 95, 'GROWTH_RISK': 80, 'STABILITY_REDIS': 50, 'HYBRID_TRANSITION': 60, 'PROBLEM_RENT': 40, 'RESOURCE_EXTRACTION': 30 },
  freedom: { 'GROWTH_RISK': 90, 'HYBRID_TRANSITION': 85, 'COMPETENCE_TRUST': 70, 'STABILITY_REDIS': 50, 'PROBLEM_RENT': 45, 'RESOURCE_EXTRACTION': 35 },
  meaning: { 'STABILITY_REDIS': 80, 'COMPETENCE_TRUST': 75, 'HYBRID_TRANSITION': 70, 'GROWTH_RISK': 55, 'PROBLEM_RENT': 40, 'RESOURCE_EXTRACTION': 30 },
  status: { 'COMPETENCE_TRUST': 90, 'GROWTH_RISK': 85, 'STABILITY_REDIS': 60, 'HYBRID_TRANSITION': 55, 'PROBLEM_RENT': 50, 'RESOURCE_EXTRACTION': 45 },
  family: { 'STABILITY_REDIS': 90, 'COMPETENCE_TRUST': 85, 'HYBRID_TRANSITION': 70, 'GROWTH_RISK': 50, 'PROBLEM_RENT': 35, 'RESOURCE_EXTRACTION': 25 },
  calm: { 'HYBRID_TRANSITION': 90, 'STABILITY_REDIS': 85, 'COMPETENCE_TRUST': 70, 'GROWTH_RISK': 40, 'PROBLEM_RENT': 35, 'RESOURCE_EXTRACTION': 30 },
};

const COUNTRY_PROFESSION_BONUSES: Record<string, { categories: string[]; bonus: number; reason: string }[]> = {
  switzerland: [{ categories: ['healthcare'], bonus: 30, reason: 'professionDemandHigh' }, { categories: ['finance', 'tech'], bonus: 25, reason: 'professionDemandHigh' }],
  germany: [{ categories: ['tech', 'science'], bonus: 25, reason: 'professionDemandHigh' }, { categories: ['healthcare'], bonus: 20, reason: 'professionDemandHigh' }],
  canada: [{ categories: ['tech', 'healthcare'], bonus: 25, reason: 'professionDemandHigh' }],
  united_states: [{ categories: ['tech'], bonus: 30, reason: 'professionDemandHigh' }, { categories: ['finance'], bonus: 25, reason: 'professionDemandHigh' }],
  singapore: [{ categories: ['finance', 'tech'], bonus: 30, reason: 'professionDemandHigh' }],
  uae: [{ categories: ['finance', 'tech', 'business'], bonus: 25, reason: 'professionDemandHigh' }],
  portugal: [{ categories: ['tech'], bonus: 20, reason: 'nomadFriendly' }],
  netherlands: [{ categories: ['tech'], bonus: 25, reason: 'professionDemandHigh' }],
  australia: [{ categories: ['healthcare'], bonus: 30, reason: 'professionDemandHigh' }, { categories: ['tech'], bonus: 20, reason: 'professionDemandHigh' }],
};

const EU_COUNTRIES = ['france', 'germany', 'spain', 'portugal', 'italy', 'netherlands', 'belgium', 'ireland', 'austria', 'poland', 'sweden', 'denmark', 'finland'];

function scoreCountryAdvanced(country: Country, intention: ProjectIntention, desiredLife: LifePriority, age: number, profession: Profession | undefined, nationalityIds: string[], currentCostOfLiving: number) {
  let score = 0;
  const reasons: { key: string; impact: 'high' | 'medium' | 'low' }[] = [];
  const warnings: string[] = [];
  const costOfLiving = country.costOfLiving?.monthlyBudgetSingle || 1500;
  const hasEUNationality = nationalityIds.some(n => EU_COUNTRIES.includes(n));
  const isEUCountry = EU_COUNTRIES.includes(country.id);

  // Life priority alignment (0-35 points)
  const pyramidWeight = PRIORITY_PYRAMID_WEIGHTS[desiredLife]?.[country.pyramidType as PyramidType] || 50;
  score += (pyramidWeight / 100) * 35;
  if (pyramidWeight >= 80) reasons.push({ key: 'exitKeys.destination.alignedWithGoals', impact: 'high' });

  // Profession demand (0-25 points)
  if (profession) {
    const countryBonuses = COUNTRY_PROFESSION_BONUSES[country.id] || [];
    const professionBonus = countryBonuses.find(b => b.categories.includes(profession.category));
    if (professionBonus) {
      score += Math.min(professionBonus.bonus, 25);
      reasons.push({ key: `exitKeys.destination.${professionBonus.reason}`, impact: professionBonus.bonus >= 20 ? 'high' : 'medium' });
    } else if (profession.internationalDemand === 'very_high') {
      score += 15;
      reasons.push({ key: 'exitKeys.destination.globalDemand', impact: 'medium' });
    }
    if (intention === 'digital_nomad' && profession.remoteWorkPossible) {
      score += 10;
      reasons.push({ key: 'exitKeys.destination.remoteCompatible', impact: 'medium' });
    }
  }

  // Cost of living (0-20 points)
  const costRatio = costOfLiving / currentCostOfLiving;
  if (desiredLife === 'money' && country.pyramidType === 'COMPETENCE_TRUST') {
    score += 15;
    reasons.push({ key: 'exitKeys.destination.highSalaries', impact: 'high' });
  } else if (costRatio < 0.5) {
    score += 20;
    reasons.push({ key: 'exitKeys.destination.veryAffordable', impact: 'high' });
  } else if (costRatio < 0.7) {
    score += 12;
    reasons.push({ key: 'exitKeys.destination.affordable', impact: 'medium' });
  }

  // Visa/mobility (0-15 points)
  if (hasEUNationality && isEUCountry) {
    score += 15;
    reasons.push({ key: 'exitKeys.destination.euFreeMovement', impact: 'high' });
  } else if (country.visa?.workVisa === 'easy') {
    score += 10;
    reasons.push({ key: 'exitKeys.destination.easyVisa', impact: 'medium' });
  } else if (country.visa?.digitalNomadVisa && intention === 'digital_nomad') {
    score += 12;
    reasons.push({ key: 'exitKeys.destination.nomadVisa', impact: 'high' });
  }

  // Age adjustments
  if (intention === 'internship' && age > 30) {
    score -= 15;
    warnings.push('exitKeys.destination.ageLimitInternship');
  }
  if (intention === 'retirement' && age >= 55) {
    score += 10;
    const healthcareScore = country.healthcare?.qualityScore || 50;
    if (healthcareScore >= 75) reasons.push({ key: 'exitKeys.destination.excellentHealthcare', impact: 'high' });
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, warnings };
}

export function DestinationSelector({ intention, nationalityIds, currentCountryId, desiredLife, age = 30, professionId, selectedDestinationId, onDestinationSelect }: DestinationSelectorProps) {
  const { t } = useTranslation();
  const { countries } = useCountries();
  const currentCountry = countries.find(c => c.id === currentCountryId);
  const currentCostOfLiving = currentCountry?.costOfLiving?.monthlyBudgetSingle || 2000;
  const profession = professionId ? getProfession(professionId) : undefined;

  const scoredCountries = useMemo(() => {
    return countries.filter(c => c.id !== currentCountryId).map(country => ({
      country,
      ...scoreCountryAdvanced(country, intention, desiredLife, age, profession, nationalityIds, currentCostOfLiving)
    })).sort((a, b) => b.score - a.score);
  }, [countries, currentCountryId, intention, desiredLife, age, profession, nationalityIds, currentCostOfLiving]);

  const topRecommendations = scoredCountries.filter(c => c.score >= 40).slice(0, 8);

  const getScoreColor = (score: number) => score >= 75 ? 'text-green-600 dark:text-green-400' : score >= 55 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{t('exitKeys.destination.title')}</h3>
        <p className="text-muted-foreground text-sm">
          {profession ? `${t('exitKeys.destination.basedOnProfile')} : ${profession.name} • ${age} ${t('common.years')}` : t('exitKeys.destination.subtitle')}
        </p>
      </div>

      {topRecommendations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('exitKeys.destination.noMatches')}</div>
      ) : (
        <div className="grid gap-4">
          {topRecommendations.map(({ country, score, reasons, warnings }, index) => {
            const isSelected = selectedDestinationId === country.id;
            const isTopPick = index === 0 && score >= 70;
            return (
              <button key={country.id} onClick={() => onDestinationSelect(country.id)} className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01]",
                isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/30" : isTopPick ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50 bg-card/50"
              )}>
                {isTopPick && <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold flex items-center gap-1"><Star className="w-3 h-3" />{t('exitKeys.destination.topPick')}</div>}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getFlagEmoji(country.iso2)}</span>
                    <div>
                      <h4 className="font-bold text-lg">{country.name}</h4>
                      {profession ? (
                        <p className="text-xs text-muted-foreground">
                          {t('exitKeys.destination.expectedSalary')}: ~{getEstimatedSalaryWithAge(country.id, profession.id, age).toLocaleString()}{getCountryCurrency(country.id).symbol}/{t('common.month')}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {t('exitKeys.destination.costOfLiving')}: ~{country.costOfLiving?.monthlyBudgetSingle || 1500}€/{t('common.month')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1"><div className="flex items-center justify-between mb-2"><span className={cn("text-2xl font-bold", getScoreColor(score))}>{Math.round(score)}%</span><span className="text-xs text-muted-foreground">{t('exitKeys.destination.compatibility')}</span></div><Progress value={score} className="h-2" /></div>
                </div>
                {reasons.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{reasons.slice(0, 3).map((r, i) => <span key={i} className={cn("text-xs px-2 py-1 rounded-full", r.impact === 'high' ? "bg-green-500/20 text-green-700 dark:text-green-300" : "bg-muted text-muted-foreground")}>{t(r.key)}</span>)}</div>}
                {warnings.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{warnings.map((w, i) => <span key={i} className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">⚠️ {t(w)}</span>)}</div>}
                {isSelected && <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}

      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">{t('exitKeys.destination.showAll')} ({scoredCountries.length})</summary>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {scoredCountries.filter(c => c.score < 40 || !topRecommendations.includes(c)).map(({ country, score }) => (
            <button key={country.id} onClick={() => onDestinationSelect(country.id)} className={cn("p-3 rounded-lg border text-left flex items-center gap-2", selectedDestinationId === country.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50")}>
              <span className="text-xl">{getFlagEmoji(country.iso2)}</span>
              <div className="flex-1 min-w-0"><span className="text-sm font-medium truncate block">{country.name}</span><span className={cn("text-xs", getScoreColor(score))}>{Math.round(score)}%</span></div>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
