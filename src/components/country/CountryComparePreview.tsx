import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Country } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CountryComparePreviewProps {
  countries: Country[];
}

const compareMetrics = [
  { key: 'costOfLiving', labelKey: 'compare.costOfLiving', type: 'lower_better' },
  { key: 'qualityOfLife', labelKey: 'compare.qualityOfLife', type: 'higher_better' },
  { key: 'healthcare', labelKey: 'compare.healthcare', type: 'higher_better' },
];

export function CountryComparePreview({ countries }: CountryComparePreviewProps) {
  const { t } = useTranslation();

  if (countries.length < 2) {
    return null;
  }

  const [countryA, countryB] = countries;

  const getComparisonIcon = (valueA: number, valueB: number, type: string) => {
    const diff = valueA - valueB;
    if (Math.abs(diff) < 5) return { icon: Minus, color: 'text-muted-foreground' };
    
    if (type === 'higher_better') {
      return diff > 0 
        ? { icon: TrendingUp, color: 'text-emerald-500' }
        : { icon: TrendingDown, color: 'text-red-500' };
    } else {
      return diff < 0 
        ? { icon: TrendingUp, color: 'text-emerald-500' }
        : { icon: TrendingDown, color: 'text-red-500' };
    }
  };

  const getMetricValue = (country: Country, key: string): number => {
    switch (key) {
      case 'costOfLiving':
        return country.costOfLiving?.index || 50;
      case 'qualityOfLife':
        return country.qualityOfLife?.safetyIndex || 50;
      case 'healthcare':
        return country.healthcare?.qualityScore || 50;
      default:
        return 50;
    }
  };

  const getFlagEmoji = (iso2: string) => {
    return iso2
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="w-5 h-5 text-primary" />
          {t('compare.quickPreview', 'Aperçu comparatif')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Country headers */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-left">
            <Badge variant="outline" className="gap-1">
              {getFlagEmoji(countryA.iso2)} {countryA.name}
            </Badge>
          </div>
          <div className="text-muted-foreground text-xs">vs</div>
          <div className="text-right">
            <Badge variant="outline" className="gap-1">
              {getFlagEmoji(countryB.iso2)} {countryB.name}
            </Badge>
          </div>
        </div>

        {/* Metrics comparison */}
        <div className="space-y-3">
          {compareMetrics.map((metric) => {
            const valueA = getMetricValue(countryA, metric.key);
            const valueB = getMetricValue(countryB, metric.key);
            const comparison = getComparisonIcon(valueA, valueB, metric.type);
            const CompIcon = comparison.icon;

            return (
              <div key={metric.key} className="grid grid-cols-3 gap-2 items-center text-sm">
                <div className="text-left font-medium">{valueA}</div>
                <div className="text-center flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">
                    {t(metric.labelKey, metric.key)}
                  </span>
                  <CompIcon className={cn("w-4 h-4", comparison.color)} />
                </div>
                <div className="text-right font-medium">{valueB}</div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Link to={`/compare?countries=${countryA.id},${countryB.id}`}>
          <Button variant="outline" size="sm" className="w-full gap-2">
            {t('compare.fullComparison', 'Comparaison complète')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
