import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, Users, Eye, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickStatProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function QuickStat({
  label,
  value,
  previousValue,
  trend,
  trendLabel,
  icon,
  variant = 'default'
}: QuickStatProps) {
  const trendColors = {
    up: 'text-emerald-500 bg-emerald-500/10',
    down: 'text-red-500 bg-red-500/10',
    neutral: 'text-muted-foreground bg-muted'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const variantStyles = {
    default: 'border-border',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-destructive/30 bg-destructive/5'
  };

  return (
    <Card className={cn('', variantStyles[variant])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {(trend || previousValue) && (
              <div className="flex items-center gap-2 mt-1">
                {trend && (
                  <Badge variant="outline" className={cn('text-xs px-1.5 py-0', trendColors[trend])}>
                    <TrendIcon className="w-3 h-3 mr-0.5" />
                    {trendLabel}
                  </Badge>
                )}
                {previousValue && (
                  <span className="text-xs text-muted-foreground">
                    vs {previousValue}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsGridProps {
  stats: QuickStatProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function QuickStatsGrid({ stats, columns = 4, className }: QuickStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <QuickStat key={index} {...stat} />
      ))}
    </div>
  );
}

// Pre-configured stats for common use cases
interface DashboardQuickStatsProps {
  totalUsers?: number;
  activeUsers?: number;
  pageViews?: number;
  avgSessionTime?: string;
  className?: string;
}

export function DashboardQuickStats({
  totalUsers = 0,
  activeUsers = 0,
  pageViews = 0,
  avgSessionTime = '0m',
  className
}: DashboardQuickStatsProps) {
  const { t } = useTranslation();

  const stats: QuickStatProps[] = [
    {
      label: t('stats.totalUsers', 'Utilisateurs totaux'),
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      trend: 'up',
      trendLabel: '+12%'
    },
    {
      label: t('stats.activeUsers', 'Utilisateurs actifs'),
      value: activeUsers.toLocaleString(),
      icon: <Target className="w-5 h-5" />,
      trend: 'up',
      trendLabel: '+8%'
    },
    {
      label: t('stats.pageViews', 'Pages vues'),
      value: pageViews.toLocaleString(),
      icon: <Eye className="w-5 h-5" />,
      trend: 'neutral'
    },
    {
      label: t('stats.avgSession', 'Durée moyenne'),
      value: avgSessionTime,
      icon: <Clock className="w-5 h-5" />
    }
  ];

  return <QuickStatsGrid stats={stats} columns={4} className={className} />;
}
