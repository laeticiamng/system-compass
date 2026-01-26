import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  TrendingUp,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { IrreversaThreshold, ThresholdStatus } from '@/hooks/useIrreversa';

interface ThresholdStatsProps {
  thresholds: IrreversaThreshold[];
}

export function ThresholdStats({ thresholds }: ThresholdStatsProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const counts: Record<ThresholdStatus, number> = {
      detected: 0,
      marked: 0,
      validated: 0,
      sealed: 0,
    };

    const domainCounts: Record<string, number> = {};
    const natureCounts: Record<string, number> = {};
    let totalDaysPending = 0;
    let pendingCount = 0;

    thresholds.forEach(t => {
      counts[t.status]++;
      
      domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
      natureCounts[t.threshold_nature] = (natureCounts[t.threshold_nature] || 0) + 1;

      if (t.status !== 'sealed') {
        const daysSinceDetection = Math.floor(
          (Date.now() - new Date(t.detection_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDaysPending += daysSinceDetection;
        pendingCount++;
      }
    });

    const total = thresholds.length;
    const sealedPercentage = total > 0 ? Math.round((counts.sealed / total) * 100) : 0;
    const avgDaysPending = pendingCount > 0 ? Math.round(totalDaysPending / pendingCount) : 0;

    // Find most common domain and nature
    const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];
    const topNature = Object.entries(natureCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      counts,
      total,
      sealedPercentage,
      avgDaysPending,
      topDomain: topDomain ? topDomain[0] : null,
      topNature: topNature ? topNature[0] : null,
      pendingActions: counts.detected + counts.marked + counts.validated,
    };
  }, [thresholds]);

  const statusConfig = [
    { status: 'detected' as const, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-500' },
    { status: 'marked' as const, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-500' },
    { status: 'validated' as const, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-500' },
    { status: 'sealed' as const, icon: Lock, color: 'text-red-600', bg: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total thresholds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            {t('irreversa.stats.total', 'Total des seuils')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="mt-3 space-y-1">
            {statusConfig.map(({ status, icon: Icon, color, bg }) => {
              const count = stats.counts[status];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-2">
                  <Icon className={`w-3 h-3 ${color}`} />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${bg} transition-all`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sealed percentage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            {t('irreversa.stats.sealed', 'Taux de scellement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{stats.sealedPercentage}%</div>
          <Progress value={stats.sealedPercentage} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.counts.sealed} {t('irreversa.stats.sealedOf', 'sur')} {stats.total} {t('irreversa.stats.thresholds', 'seuils')}
          </p>
        </CardContent>
      </Card>

      {/* Pending actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            {t('irreversa.stats.pendingActions', 'Actions en attente')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">{stats.pendingActions}</div>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('irreversa.stats.avgPending', 'Moy. {{days}} jours en attente', { days: stats.avgDaysPending })}
            </span>
          </div>
          {stats.pendingActions > 0 && (
            <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
              {t('irreversa.stats.requiresAttention', 'Requiert attention')}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Top categories */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {t('irreversa.stats.topCategories', 'Catégories dominantes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topDomain && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">{t('irreversa.fields.domain', 'Domaine')}</p>
              <Badge variant="secondary" className="mt-1">
                {t(`irreversa.domain.${stats.topDomain}`)}
              </Badge>
            </div>
          )}
          {stats.topNature && (
            <div>
              <p className="text-xs text-muted-foreground">{t('irreversa.fields.nature', 'Nature')}</p>
              <Badge variant="secondary" className="mt-1">
                {t(`irreversa.nature.${stats.topNature}`)}
              </Badge>
            </div>
          )}
          {!stats.topDomain && !stats.topNature && (
            <p className="text-sm text-muted-foreground">
              {t('irreversa.stats.noData', 'Aucune donnée')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
