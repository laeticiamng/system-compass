// Shortlist Comparison Component - Multi-criteria comparison view
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Scale, TrendingUp, Clock, Shield, DollarSign, 
  Users, Heart, Briefcase, X, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonCountry {
  id: string;
  name: string;
  score: number;
  metrics: {
    costOfLiving: number;
    visaComplexity: number;
    jobMarket: number;
    qualityOfLife: number;
    safety: number;
    healthcare: number;
    networkDensity: number;
    timeToSettle: number;
  };
}

interface ShortlistComparisonProps {
  countries: ComparisonCountry[];
  onRemove?: (countryId: string) => void;
  weights?: {
    costOfLiving: number;
    visaComplexity: number;
    jobMarket: number;
    qualityOfLife: number;
    safety: number;
    healthcare: number;
    networkDensity: number;
    timeToSettle: number;
  };
}

const defaultWeights = {
  costOfLiving: 1,
  visaComplexity: 1,
  jobMarket: 1,
  qualityOfLife: 1,
  safety: 1,
  healthcare: 1,
  networkDensity: 1,
  timeToSettle: 1,
};

export function ShortlistComparison({ countries, onRemove, weights = defaultWeights }: ShortlistComparisonProps) {
  const { t } = useTranslation();

  const metrics = [
    { key: 'costOfLiving' as const, label: t('comparison.costOfLiving', 'Cost of Living'), icon: DollarSign, inverted: true },
    { key: 'visaComplexity' as const, label: t('comparison.visaComplexity', 'Visa Complexity'), icon: Clock, inverted: true },
    { key: 'jobMarket' as const, label: t('comparison.jobMarket', 'Job Market'), icon: Briefcase, inverted: false },
    { key: 'qualityOfLife' as const, label: t('comparison.qualityOfLife', 'Quality of Life'), icon: Heart, inverted: false },
    { key: 'safety' as const, label: t('comparison.safety', 'Safety'), icon: Shield, inverted: false },
    { key: 'healthcare' as const, label: t('comparison.healthcare', 'Healthcare'), icon: Heart, inverted: false },
    { key: 'networkDensity' as const, label: t('comparison.network', 'Expat Network'), icon: Users, inverted: false },
    { key: 'timeToSettle' as const, label: t('comparison.timeToSettle', 'Time to Settle'), icon: Clock, inverted: true },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-600';
  };

  const getBestForMetric = (metricKey: keyof ComparisonCountry['metrics'], inverted: boolean) => {
    if (countries.length === 0) return null;
    return countries.reduce((best, country) => {
      const currentValue = country.metrics[metricKey];
      const bestValue = best.metrics[metricKey];
      if (inverted) {
        return currentValue < bestValue ? country : best;
      }
      return currentValue > bestValue ? country : best;
    });
  };

  if (countries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('comparison.noCountries', 'Add countries to compare')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="w-5 h-5" />
          {t('comparison.title', 'Shortlist Comparison')}
          <Badge variant="outline">{countries.length} {t('comparison.countries', 'countries')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Country Headers */}
        <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `200px repeat(${countries.length}, 1fr)` }}>
          <div className="font-medium text-sm text-muted-foreground">
            {t('comparison.metric', 'Metric')}
          </div>
          {countries.map((country) => (
            <div key={country.id} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-semibold text-sm">{country.name}</span>
                {onRemove && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5"
                    onClick={() => onRemove(country.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Badge className={cn("text-xs", getScoreColor(country.score))}>
                {country.score}% {t('comparison.match', 'match')}
              </Badge>
            </div>
          ))}
        </div>

        {/* Metrics Rows */}
        <div className="space-y-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const best = getBestForMetric(metric.key, metric.inverted);
            const weight = weights[metric.key];

            return (
              <div 
                key={metric.key}
                className="grid gap-2 items-center"
                style={{ gridTemplateColumns: `200px repeat(${countries.length}, 1fr)` }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{metric.label}</span>
                  {weight > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      x{weight}
                    </Badge>
                  )}
                </div>
                {countries.map((country) => {
                  const value = country.metrics[metric.key];
                  const isBest = best?.id === country.id;
                  
                  return (
                    <div key={country.id} className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        {isBest && <Star className="w-3 h-3 text-amber-500" />}
                        <span className={cn(
                          "text-sm font-medium",
                          isBest && "text-amber-600"
                        )}>
                          {value}%
                        </span>
                      </div>
                      <Progress 
                        value={value} 
                        className="h-1.5 w-full max-w-[100px]" 
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">
              {t('comparison.recommendation', 'Recommendation')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {countries.length > 0 && (
              <>
                {t('comparison.bestMatch', 'Best overall match')}: 
                <strong className="text-foreground ml-1">
                  {countries.reduce((a, b) => a.score > b.score ? a : b).name}
                </strong>
                {' '}({countries.reduce((a, b) => a.score > b.score ? a : b).score}%)
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
