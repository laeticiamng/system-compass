import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TrendDataPoint {
  date: string;
  scamIndex: number;
  legitimateIndex: number;
  overallRisk: number;
}

interface HistoricalTrendsProps {
  countryName: string;
  data?: TrendDataPoint[];
}

export function HistoricalTrends({ countryName, data: externalData }: HistoricalTrendsProps) {
  const { t } = useTranslation();

  // Mock data for demonstration
  const defaultData: TrendDataPoint[] = useMemo(() => [
    { date: '2025-07', scamIndex: 45, legitimateIndex: 62, overallRisk: 38 },
    { date: '2025-08', scamIndex: 42, legitimateIndex: 65, overallRisk: 35 },
    { date: '2025-09', scamIndex: 48, legitimateIndex: 58, overallRisk: 42 },
    { date: '2025-10', scamIndex: 52, legitimateIndex: 55, overallRisk: 48 },
    { date: '2025-11', scamIndex: 47, legitimateIndex: 60, overallRisk: 40 },
    { date: '2025-12', scamIndex: 44, legitimateIndex: 68, overallRisk: 36 },
    { date: '2026-01', scamIndex: 40, legitimateIndex: 72, overallRisk: 32 },
  ], []);

  const data = externalData || defaultData;

  const trend = useMemo(() => {
    if (data.length < 2) return { direction: 'stable' as const, change: 0 };
    const first = data[0].overallRisk;
    const last = data[data.length - 1].overallRisk;
    const change = ((last - first) / first) * 100;
    return {
      direction: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'stable' as const,
      change: Math.abs(change)
    };
  }, [data]);

  const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;
  const trendColor = trend.direction === 'up' ? 'text-red-500' : trend.direction === 'down' ? 'text-green-500' : 'text-muted-foreground';
  const trendBg = trend.direction === 'up' ? 'bg-red-500/10' : trend.direction === 'down' ? 'bg-green-500/10' : 'bg-muted';

  const latestData = data[data.length - 1];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('financialIntel.trends.title', 'Tendances Historiques')}
          </CardTitle>
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            {t('financialIntel.trends.period', '6 derniers mois')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{countryName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${trendBg}`}>
              <TrendIcon className={`w-5 h-5 ${trendColor}`} />
            </div>
            <div>
              <p className="font-medium">
                {trend.direction === 'up' 
                  ? t('financialIntel.trends.increasing', 'Risque en hausse')
                  : trend.direction === 'down'
                  ? t('financialIntel.trends.decreasing', 'Risque en baisse')
                  : t('financialIntel.trends.stable', 'Risque stable')}
              </p>
              <p className="text-sm text-muted-foreground">
                {trend.change.toFixed(1)}% {t('financialIntel.trends.variation', 'de variation')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{latestData.overallRisk}</p>
            <p className="text-xs text-muted-foreground">{t('financialIntel.trends.riskIndex', 'Indice de risque')}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.split('-')[1]}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => `${t('common.date', 'Date')}: ${value}`}
              />
              <Area 
                type="monotone" 
                dataKey="overallRisk" 
                stroke="hsl(var(--destructive))" 
                fillOpacity={1} 
                fill="url(#colorRisk)"
                name={t('financialIntel.trends.riskIndex', 'Indice de risque')}
              />
              <Area 
                type="monotone" 
                dataKey="legitimateIndex" 
                stroke="hsl(142, 76%, 36%)" 
                fillOpacity={1} 
                fill="url(#colorLegit)"
                name={t('financialIntel.trends.legitIndex', 'Indice légitimité')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">{t('financialIntel.trends.riskIndex', 'Risque')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">{t('financialIntel.trends.legitIndex', 'Légitimité')}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-lg font-bold text-red-600">{latestData.scamIndex}</p>
            <p className="text-xs text-muted-foreground">{t('financialIntel.trends.scamIndex', 'Indice Arnaques')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{latestData.legitimateIndex}</p>
            <p className="text-xs text-muted-foreground">{t('financialIntel.trends.legitOps', 'Ops. Légitimes')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{latestData.overallRisk}</p>
            <p className="text-xs text-muted-foreground">{t('financialIntel.trends.globalRisk', 'Risque Global')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
