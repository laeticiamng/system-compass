// Country Quick Compare - Inline comparison widget
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  ArrowUpDown,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Shield,
  Heart,
  Briefcase,
  GraduationCap,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountryData {
  id: string;
  name: string;
  iso2: string;
  pyramid_type: string;
  cost_of_living: {
    index: number;
    monthlyBudgetSingle: number;
    monthlyBudgetFamily: number;
  };
  quality_of_life: {
    safetyIndex: number;
    healthcareRank: number;
    educationIndex: number;
    workLifeBalance: number;
  };
  risks: {
    volatility: number;
    corruption: number;
    bureaucracy: number;
    legal: number;
    safety: number;
  };
  visa: {
    citizenshipYears: number;
    workVisa: string;
    digitalNomadVisa: boolean;
  };
  snapshot: {
    gdpPerCapita: number;
    freedomIndex: number;
    corruptionIndex: number;
  };
}

interface QuickCompareProps {
  currentCountry: CountryData;
  allCountries: CountryData[];
  onFullCompare?: (countryIds: string[]) => void;
}

interface ComparisonMetric {
  key: string;
  label: string;
  icon: React.ReactNode;
  getValue: (country: CountryData) => number;
  format?: (value: number) => string;
  higherIsBetter: boolean;
}

export function QuickCompare({
  currentCountry,
  allCountries,
  onFullCompare
}: QuickCompareProps) {
  const { t } = useTranslation();
  const [compareCountryId, setCompareCountryId] = useState<string>('');

  const compareCountry = useMemo(() => {
    return allCountries.find(c => c.id === compareCountryId);
  }, [allCountries, compareCountryId]);

  const metrics: ComparisonMetric[] = [
    {
      key: 'costOfLiving',
      label: t('compare.metrics.costOfLiving', 'Coût de la vie'),
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (c) => c.cost_of_living.index,
      higherIsBetter: false
    },
    {
      key: 'safety',
      label: t('compare.metrics.safety', 'Sécurité'),
      icon: <Shield className="h-4 w-4" />,
      getValue: (c) => c.quality_of_life.safetyIndex,
      higherIsBetter: true
    },
    {
      key: 'healthcare',
      label: t('compare.metrics.healthcare', 'Santé'),
      icon: <Heart className="h-4 w-4" />,
      getValue: (c) => 100 - c.quality_of_life.healthcareRank,
      format: (v) => `#${100 - v}`,
      higherIsBetter: true
    },
    {
      key: 'workLife',
      label: t('compare.metrics.workLife', 'Équilibre vie/travail'),
      icon: <Briefcase className="h-4 w-4" />,
      getValue: (c) => c.quality_of_life.workLifeBalance * 10,
      format: (v) => `${v / 10}/10`,
      higherIsBetter: true
    },
    {
      key: 'education',
      label: t('compare.metrics.education', 'Éducation'),
      icon: <GraduationCap className="h-4 w-4" />,
      getValue: (c) => c.quality_of_life.educationIndex * 100,
      format: (v) => `${(v / 100).toFixed(2)}`,
      higherIsBetter: true
    },
    {
      key: 'volatility',
      label: t('compare.metrics.volatility', 'Volatilité'),
      icon: <Home className="h-4 w-4" />,
      getValue: (c) => c.risks.volatility,
      higherIsBetter: false
    }
  ];

  const getDifference = (metric: ComparisonMetric) => {
    if (!compareCountry) return null;
    const currentValue = metric.getValue(currentCountry);
    const compareValue = metric.getValue(compareCountry);
    const diff = compareValue - currentValue;
    const isBetter = metric.higherIsBetter ? diff > 0 : diff < 0;
    return { diff, isBetter, currentValue, compareValue };
  };

  const getDiffIcon = (isBetter: boolean | null, diff: number) => {
    if (diff === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (isBetter) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const otherCountries = useMemo(() => {
    return allCountries.filter(c => c.id !== currentCountry.id);
  }, [allCountries, currentCountry.id]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-5 w-5" />
          {t('compare.quick.title', 'Comparaison rapide')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Country Selector */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="px-3 py-1.5">
            {currentCountry.name}
          </Badge>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={compareCountryId} onValueChange={setCompareCountryId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('compare.quick.select', 'Choisir un pays')} />
            </SelectTrigger>
            <SelectContent>
              {otherCountries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!compareCountry ? (
          <div className="text-center py-6 text-muted-foreground">
            <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {t('compare.quick.selectPrompt', 'Sélectionnez un pays pour comparer')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.map((metric) => {
              const diff = getDifference(metric);
              if (!diff) return null;

              return (
                <div key={metric.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <span className="text-muted-foreground">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDiffIcon(diff.isBetter, diff.diff)}
                      <span className={cn(
                        "text-xs",
                        diff.diff === 0 ? 'text-muted-foreground' :
                        diff.isBetter ? 'text-green-500' : 'text-red-500'
                      )}>
                        {diff.diff > 0 ? '+' : ''}{diff.diff.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>{currentCountry.name}</span>
                        <span className="font-medium">
                          {metric.format 
                            ? metric.format(diff.currentValue)
                            : diff.currentValue.toFixed(0)
                          }
                        </span>
                      </div>
                      <Progress 
                        value={diff.currentValue} 
                        className="h-1.5"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>{compareCountry.name}</span>
                        <span className="font-medium">
                          {metric.format 
                            ? metric.format(diff.compareValue)
                            : diff.compareValue.toFixed(0)
                          }
                        </span>
                      </div>
                      <Progress 
                        value={diff.compareValue} 
                        className={cn(
                          "h-1.5",
                          diff.isBetter && "[&>div]:bg-green-500",
                          !diff.isBetter && diff.diff !== 0 && "[&>div]:bg-red-500"
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <Separator className="my-4" />

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-1">{t('compare.quick.budget', 'Budget solo')}</p>
                <p className="font-medium">
                  {currentCountry.cost_of_living.monthlyBudgetSingle}€ vs{' '}
                  <span className={cn(
                    compareCountry.cost_of_living.monthlyBudgetSingle < currentCountry.cost_of_living.monthlyBudgetSingle
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}>
                    {compareCountry.cost_of_living.monthlyBudgetSingle}€
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-1">{t('compare.quick.citizenship', 'Citoyenneté')}</p>
                <p className="font-medium">
                  {currentCountry.visa.citizenshipYears}y vs{' '}
                  <span className={cn(
                    compareCountry.visa.citizenshipYears < currentCountry.visa.citizenshipYears
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}>
                    {compareCountry.visa.citizenshipYears}y
                  </span>
                </p>
              </div>
            </div>

            {/* Full Compare Button */}
            {onFullCompare && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => onFullCompare([currentCountry.id, compareCountry.id])}
              >
                {t('compare.quick.fullCompare', 'Comparaison détaillée')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
