import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Country } from '@/lib/types';

interface RiskStackedBarChartProps {
  countries: Country[];
}

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function RiskStackedBarChart({ countries }: RiskStackedBarChartProps) {
  const { t } = useTranslation();

  const data = countries.map(country => ({
    name: `${getFlagEmoji(country.iso2)} ${country.name}`,
    legal: country.risks.legal,
    safety: country.risks.safety,
    corruption: country.risks.corruption,
    volatility: country.risks.volatility,
    bureaucracy: country.risks.bureaucracy,
    total: country.risks.legal + country.risks.safety + country.risks.corruption + country.risks.volatility + country.risks.bureaucracy,
  }));

  const riskColors = {
    legal: 'hsl(var(--chart-1))',
    safety: 'hsl(var(--chart-2))',
    corruption: 'hsl(var(--chart-3))',
    volatility: 'hsl(var(--chart-4))',
    bureaucracy: 'hsl(var(--chart-5))',
  };

  const riskLabels = {
    legal: t('risks.legal', 'Legal'),
    safety: t('risks.safety', 'Safety'),
    corruption: t('risks.corruption', 'Corruption'),
    volatility: t('risks.volatility', 'Volatility'),
    bureaucracy: t('risks.bureaucracy', 'Bureaucracy'),
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        📊 {t('multiCompare.riskComparison', 'Risk Comparison')}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              domain={[0, 50]} 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: number, name: string) => [
                `${value}/10`,
                riskLabels[name as keyof typeof riskLabels] || name,
              ]}
            />
            <Legend 
              formatter={(value) => riskLabels[value as keyof typeof riskLabels] || value}
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="legal" 
              stackId="a" 
              fill={riskColors.legal} 
              name="legal"
            />
            <Bar 
              dataKey="safety" 
              stackId="a" 
              fill={riskColors.safety} 
              name="safety"
            />
            <Bar 
              dataKey="corruption" 
              stackId="a" 
              fill={riskColors.corruption} 
              name="corruption"
            />
            <Bar 
              dataKey="volatility" 
              stackId="a" 
              fill={riskColors.volatility} 
              name="volatility"
            />
            <Bar 
              dataKey="bureaucracy" 
              stackId="a" 
              fill={riskColors.bureaucracy} 
              name="bureaucracy"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {t('multiCompare.riskChartNote', 'Lower total score = lower overall risk')}
      </p>
    </div>
  );
}