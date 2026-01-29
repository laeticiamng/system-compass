import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface TrendData {
  year: number;
  stability: number;
  economy: number;
  safety: number;
}

interface CountryTrendHistoryProps {
  countryName: string;
  trends?: TrendData[];
}

const DEFAULT_TRENDS: TrendData[] = [
  { year: 2019, stability: 65, economy: 70, safety: 72 },
  { year: 2020, stability: 58, economy: 55, safety: 70 },
  { year: 2021, stability: 62, economy: 60, safety: 71 },
  { year: 2022, stability: 68, economy: 68, safety: 73 },
  { year: 2023, stability: 72, economy: 74, safety: 75 },
  { year: 2024, stability: 75, economy: 78, safety: 77 },
];

export function CountryTrendHistory({ countryName, trends = DEFAULT_TRENDS }: CountryTrendHistoryProps) {
  const getTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 3) return { icon: TrendingUp, color: 'text-emerald-500', label: 'Hausse' };
    if (diff < -3) return { icon: TrendingDown, color: 'text-red-500', label: 'Baisse' };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Stable' };
  };

  const latestTrend = trends[trends.length - 1];
  const previousTrend = trends[trends.length - 2];

  const stabilityTrend = getTrend(latestTrend?.stability || 0, previousTrend?.stability || 0);
  const economyTrend = getTrend(latestTrend?.economy || 0, previousTrend?.economy || 0);
  const safetyTrend = getTrend(latestTrend?.safety || 0, previousTrend?.safety || 0);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Tendances historiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <stabilityTrend.icon className={`h-4 w-4 ${stabilityTrend.color}`} />
              <span className="text-xs text-muted-foreground">Stabilité</span>
            </div>
            <p className="text-xl font-bold">{latestTrend?.stability || '-'}</p>
            <Badge variant="outline" className="text-xs mt-1">{stabilityTrend.label}</Badge>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <economyTrend.icon className={`h-4 w-4 ${economyTrend.color}`} />
              <span className="text-xs text-muted-foreground">Économie</span>
            </div>
            <p className="text-xl font-bold">{latestTrend?.economy || '-'}</p>
            <Badge variant="outline" className="text-xs mt-1">{economyTrend.label}</Badge>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <safetyTrend.icon className={`h-4 w-4 ${safetyTrend.color}`} />
              <span className="text-xs text-muted-foreground">Sécurité</span>
            </div>
            <p className="text-xl font-bold">{latestTrend?.safety || '-'}</p>
            <Badge variant="outline" className="text-xs mt-1">{safetyTrend.label}</Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Évolution sur {trends.length} ans ({trends[0]?.year} - {latestTrend?.year})
          </p>
          <div className="flex gap-1 mt-2">
            {trends.map((t, idx) => (
              <div 
                key={t.year}
                className="flex-1 h-8 rounded bg-gradient-to-t from-primary/20 to-primary/60"
                style={{ 
                  opacity: 0.3 + (idx / trends.length) * 0.7,
                }}
                title={`${t.year}: ${Math.round((t.stability + t.economy + t.safety) / 3)}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
