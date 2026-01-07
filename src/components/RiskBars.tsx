import { useTranslation } from 'react-i18next';
import { CountryRisks } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskBarsProps {
  risks: CountryRisks;
  className?: string;
}

const riskKeys: (keyof CountryRisks)[] = ['legal', 'safety', 'corruption', 'volatility', 'bureaucracy'];

const getRiskColor = (value: number): string => {
  if (value <= 25) return 'bg-risk-low';
  if (value <= 50) return 'bg-risk-medium';
  if (value <= 75) return 'bg-risk-high';
  return 'bg-risk-critical';
};

const getRiskLevelKey = (value: number): string => {
  if (value <= 25) return 'low';
  if (value <= 50) return 'medium';
  if (value <= 75) return 'high';
  return 'critical';
};

export function RiskBars({ risks, className }: RiskBarsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-4', className)}>
      {riskKeys.map((key) => {
        const value = risks[key];
        return (
          <div key={key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t(`risks.${key}`)}</span>
              <span className="font-medium">{t(`risks.levels.${getRiskLevelKey(value)}`)}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', getRiskColor(value))}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
