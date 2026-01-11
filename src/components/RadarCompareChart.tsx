import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Country } from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RadarCompareChartProps {
  countries: Country[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function getFlagEmoji(iso2: string): string {
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Normalize values to 0-100 scale for radar chart
function normalizeValue(value: number, min: number, max: number, invert = false): number {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return invert ? 100 - normalized : normalized;
}

export function RadarCompareChart({ countries }: RadarCompareChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (countries.length === 0) return [];

    // Define metrics with their ranges and whether lower is better
    const metrics = [
      { 
        key: 'gdpPerCapita', 
        label: t('countryDetail.snapshot.gdpPerCapita'),
        getValue: (c: Country) => c.snapshot.gdpPerCapita,
        min: 0, max: 100000, invert: false 
      },
      { 
        key: 'freedomIndex', 
        label: t('countryDetail.snapshot.freedomIndex'),
        getValue: (c: Country) => c.snapshot.freedomIndex,
        min: 0, max: 100, invert: false 
      },
      { 
        key: 'safetyIndex', 
        label: t('qualityOfLife.safetyIndex'),
        getValue: (c: Country) => c.qualityOfLife.safetyIndex,
        min: 0, max: 100, invert: false 
      },
      { 
        key: 'corruptionIndex', 
        label: t('countryDetail.snapshot.corruptionIndex'),
        getValue: (c: Country) => 100 - c.snapshot.corruptionIndex,
        min: 0, max: 100, invert: false 
      },
      { 
        key: 'costOfLiving', 
        label: t('costOfLiving.affordability', 'Affordability'),
        getValue: (c: Country) => c.costOfLiving.index,
        min: 0, max: 100, invert: true // Lower cost = higher affordability
      },
      { 
        key: 'internetSpeed', 
        label: t('qualityOfLife.internetSpeed'),
        getValue: (c: Country) => c.qualityOfLife.internetSpeed,
        min: 0, max: 300, invert: false 
      },
    ];

    return metrics.map(metric => {
      const dataPoint: Record<string, string | number> = {
        metric: metric.label,
      };

      countries.forEach((country, index) => {
        const value = metric.getValue(country);
        const normalized = normalizeValue(value, metric.min, metric.max, metric.invert);
        dataPoint[`country${index}`] = Math.round(normalized);
        dataPoint[`country${index}Name`] = country.name;
        dataPoint[`country${index}Raw`] = value;
      });

      return dataPoint;
    });
  }, [countries, t]);

  if (countries.length < 2) return null;

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4 text-center">
        {t('multiCompare.radarComparison', 'Radar Comparison')}
      </h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={false}
            />
            {countries.map((country, index) => (
              <Radar
                key={country.id}
                name={`${getFlagEmoji(country.iso2)} ${country.name}`}
                dataKey={`country${index}`}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                color: 'hsl(var(--foreground))',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        {t('multiCompare.radarNote', 'Values normalized to 0-100 scale for comparison. Higher is better.')}
      </p>
    </div>
  );
}
