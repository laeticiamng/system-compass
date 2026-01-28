import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatentZone {
  id: string;
  title: string;
  status: 'latent' | 'emerging' | 'active' | 'resolved';
  created_at: string;
}

interface LatentProgressIndicatorProps {
  zones: LatentZone[];
  className?: string;
}

const statusConfig = {
  latent: {
    label: 'Latent',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    icon: Clock,
    weight: 0,
  },
  emerging: {
    label: 'Émergent',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: AlertTriangle,
    weight: 1,
  },
  active: {
    label: 'Actif',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Zap,
    weight: 2,
  },
  resolved: {
    label: 'Résolu',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: CheckCircle2,
    weight: 3,
  },
};

export function LatentProgressIndicator({ zones, className }: LatentProgressIndicatorProps) {
  const { t } = useTranslation();

  const statusCounts = zones.reduce((acc, zone) => {
    acc[zone.status] = (acc[zone.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalZones = zones.length;
  const resolvedCount = statusCounts['resolved'] || 0;

  // Calculate average progress score
  const averageProgress = totalZones > 0
    ? Math.round(zones.reduce((sum, zone) => sum + statusConfig[zone.status].weight, 0) / totalZones * 33.33)
    : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {t('latent.progress.title', 'Progression globale')}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {averageProgress}%
        </span>
      </div>

      <Progress value={averageProgress} className="h-2" />

      {/* Status Distribution */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
          const config = statusConfig[status];
          const count = statusCounts[status] || 0;
          const Icon = config.icon;
          
          if (count === 0) return null;
          
          return (
            <Badge
              key={status}
              variant="outline"
              className={cn("gap-1", config.bgColor, config.color)}
            >
              <Icon className="w-3 h-3" />
              <span>{count}</span>
              <span className="text-xs opacity-70">{config.label}</span>
            </Badge>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{totalZones}</p>
          <p className="text-xs text-muted-foreground">
            {t('latent.progress.totalZones', 'Zones totales')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{resolvedCount}</p>
          <p className="text-xs text-muted-foreground">
            {t('latent.progress.resolved', 'Résolues')}
          </p>
        </div>
      </div>
    </div>
  );
}
