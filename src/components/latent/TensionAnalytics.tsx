/**
 * TensionAnalytics - Analytics dashboard for latent zone tensions
 * Provides insights into tension patterns and trends
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';

interface TensionStat {
  type: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  avgIntensity: number;
}

interface ZoneSummary {
  totalZones: number;
  activeZones: number;
  resolvedThisMonth: number;
  escalatedThisMonth: number;
  avgResolutionDays: number;
}

interface TensionAnalyticsProps {
  tensionStats: TensionStat[];
  zoneSummary: ZoneSummary;
}

export function TensionAnalytics({ tensionStats, zoneSummary }: TensionAnalyticsProps) {
  const getTrendIcon = (trend: TensionStat['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const resolutionRate = zoneSummary.totalZones > 0 
    ? (zoneSummary.resolvedThisMonth / zoneSummary.totalZones) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Zones actives</span>
          </div>
          <p className="text-2xl font-bold">{zoneSummary.activeZones}</p>
          <p className="text-xs text-muted-foreground">
            sur {zoneSummary.totalZones} totales
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Résolues</span>
          </div>
          <p className="text-2xl font-bold">{zoneSummary.resolvedThisMonth}</p>
          <p className="text-xs text-muted-foreground">ce mois-ci</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">Escaladées</span>
          </div>
          <p className="text-2xl font-bold">{zoneSummary.escalatedThisMonth}</p>
          <p className="text-xs text-muted-foreground">ce mois-ci</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Délai moyen</span>
          </div>
          <p className="text-2xl font-bold">{zoneSummary.avgResolutionDays}</p>
          <p className="text-xs text-muted-foreground">jours</p>
        </Card>
      </div>

      {/* Tension Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Types de tensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tensionStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{stat.type}</span>
                  {getTrendIcon(stat.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stat.count}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stat.avgIntensity}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`absolute inset-y-0 left-0 ${getIntensityColor(stat.avgIntensity)} transition-all`}
                  style={{ width: `${stat.avgIntensity}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Taux de résolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={resolutionRate} className="h-3" />
            </div>
            <span className="text-lg font-bold">
              {resolutionRate.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {zoneSummary.resolvedThisMonth} zones résolues sur {zoneSummary.totalZones} ce mois
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
