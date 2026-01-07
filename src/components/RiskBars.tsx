import { CountryRisks } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskBarsProps {
  risks: CountryRisks;
  className?: string;
}

const riskLabels: Record<keyof CountryRisks, string> = {
  legal: 'Legal Risk',
  safety: 'Safety Risk',
  corruption: 'Corruption',
  volatility: 'Volatility',
  bureaucracy: 'Bureaucracy',
};

const getRiskColor = (value: number): string => {
  if (value <= 25) return 'bg-risk-low';
  if (value <= 50) return 'bg-risk-medium';
  if (value <= 75) return 'bg-risk-high';
  return 'bg-risk-critical';
};

const getRiskLevel = (value: number): string => {
  if (value <= 25) return 'Low';
  if (value <= 50) return 'Medium';
  if (value <= 75) return 'High';
  return 'Critical';
};

export function RiskBars({ risks, className }: RiskBarsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(Object.entries(risks) as [keyof CountryRisks, number][]).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{riskLabels[key]}</span>
            <span className="font-medium">{getRiskLevel(value)}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getRiskColor(value))}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
