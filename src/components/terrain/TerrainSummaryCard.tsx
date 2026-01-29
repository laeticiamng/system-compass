import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mountain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerrainMetric {
  label: string;
  value: number;
  maxValue?: number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
}

interface TerrainSummaryCardProps {
  countryName: string;
  overallScore: number;
  metrics: TerrainMetric[];
  lastUpdated?: string;
  className?: string;
}

const statusColors = {
  good: 'text-emerald-500',
  warning: 'text-amber-500',
  critical: 'text-red-500',
};

const statusBg = {
  good: 'bg-emerald-500/10',
  warning: 'bg-amber-500/10',
  critical: 'bg-red-500/10',
};

export function TerrainSummaryCard({ 
  countryName, 
  overallScore, 
  metrics, 
  lastUpdated,
  className 
}: TerrainSummaryCardProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return t('terrain.favorable', 'Favorable');
    if (score >= 40) return t('terrain.moderate', 'Modéré');
    return t('terrain.challenging', 'Difficile');
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  const getStatusIcon = (status?: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mountain className="w-5 h-5 text-primary" />
            {t('terrain.summary', 'Synthèse terrain')}
          </CardTitle>
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              {t('terrain.updated', 'Mis à jour')}: {lastUpdated}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center p-4 rounded-xl bg-muted/50">
          <h4 className="text-sm text-muted-foreground mb-2">{countryName}</h4>
          <div className={cn("text-4xl font-bold mb-1", getScoreColor(overallScore))}>
            {overallScore}/100
          </div>
          <Badge variant="outline" className={cn(getScoreColor(overallScore))}>
            {getScoreLabel(overallScore)}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {metric.status && (
                    <span className={cn(statusColors[metric.status])}>
                      {getStatusIcon(metric.status)}
                    </span>
                  )}
                  <span>{metric.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{metric.value}</span>
                  {metric.maxValue && (
                    <span className="text-muted-foreground">/{metric.maxValue}</span>
                  )}
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              <Progress 
                value={(metric.value / (metric.maxValue || 100)) * 100} 
                className={cn(
                  "h-1.5",
                  metric.status && statusBg[metric.status]
                )}
              />
            </div>
          ))}
        </div>

        {/* Warning note */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          {t('terrain.disclaimer', 'Données indicatives. Vérifiez les sources officielles.')}
        </p>
      </CardContent>
    </Card>
  );
}
