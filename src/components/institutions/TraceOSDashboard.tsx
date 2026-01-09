import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  GitBranch,
  Users,
  Target
} from 'lucide-react';
import { DecisionNodeData } from './DecisionNode';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TraceOSDashboardProps {
  decisions: DecisionNodeData[];
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: color ? `${color}20` : undefined }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function flattenDecisions(decisions: DecisionNodeData[]): DecisionNodeData[] {
  const result: DecisionNodeData[] = [];
  
  const traverse = (items: DecisionNodeData[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };
  
  traverse(decisions);
  return result;
}

export function TraceOSDashboard({ decisions }: TraceOSDashboardProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const allDecisions = flattenDecisions(decisions);
    
    // Status counts
    const statusCounts = {
      validated: allDecisions.filter(d => d.status === 'validated').length,
      pending: allDecisions.filter(d => d.status === 'pending').length,
      abandoned: allDecisions.filter(d => d.status === 'abandoned').length
    };

    // Scope distribution
    const scopeCounts: Record<string, number> = {};
    allDecisions.forEach(d => {
      scopeCounts[d.scope] = (scopeCounts[d.scope] || 0) + 1;
    });

    // Author distribution
    const authorCounts: Record<string, number> = {};
    allDecisions.forEach(d => {
      authorCounts[d.author] = (authorCounts[d.author] || 0) + 1;
    });

    // Timeline data (last 6 months)
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: startOfMonth(sixMonthsAgo), end: now });
    
    const timelineData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthDecisions = allDecisions.filter(d => {
        const decisionDate = parseISO(d.date);
        return startOfMonth(decisionDate).getTime() === monthStart.getTime();
      });
      
      return {
        month: format(month, 'MMM', { locale: fr }),
        total: monthDecisions.length,
        validated: monthDecisions.filter(d => d.status === 'validated').length,
        pending: monthDecisions.filter(d => d.status === 'pending').length,
        abandoned: monthDecisions.filter(d => d.status === 'abandoned').length
      };
    });

    // Abandoned branches count
    const totalAbandonedBranches = allDecisions.reduce(
      (sum, d) => sum + (d.abandonedBranches?.length || 0), 
      0
    );

    // Average depth
    const getMaxDepth = (items: DecisionNodeData[], depth = 0): number => {
      if (!items.length) return depth;
      return Math.max(...items.map(item => 
        item.children?.length ? getMaxDepth(item.children, depth + 1) : depth + 1
      ));
    };
    const maxDepth = getMaxDepth(decisions);

    return {
      total: allDecisions.length,
      statusCounts,
      scopeCounts,
      authorCounts,
      timelineData,
      totalAbandonedBranches,
      maxDepth,
      topAuthors: Object.entries(authorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topScopes: Object.entries(scopeCounts)
        .sort((a, b) => b[1] - a[1])
    };
  }, [decisions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'abandoned': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('traceos.dashboard.title', 'Tableau de bord analytique')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('traceos.dashboard.subtitle', 'Vue d\'ensemble de vos décisions')}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('traceos.dashboard.totalDecisions', 'Total décisions')}
          value={stats.total}
          icon={<GitBranch className="h-5 w-5 text-primary" />}
          color="hsl(var(--primary))"
        />
        <StatsCard
          title={t('traceos.dashboard.validated', 'Validées')}
          value={stats.statusCounts.validated}
          subtitle={`${stats.total > 0 ? Math.round((stats.statusCounts.validated / stats.total) * 100) : 0}%`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          color="#22c55e"
        />
        <StatsCard
          title={t('traceos.dashboard.pending', 'En attente')}
          value={stats.statusCounts.pending}
          subtitle={`${stats.total > 0 ? Math.round((stats.statusCounts.pending / stats.total) * 100) : 0}%`}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          color="#f59e0b"
        />
        <StatsCard
          title={t('traceos.dashboard.abandoned', 'Abandonnées')}
          value={stats.statusCounts.abandoned}
          subtitle={`${stats.total > 0 ? Math.round((stats.statusCounts.abandoned / stats.total) * 100) : 0}%`}
          icon={<XCircle className="h-5 w-5 text-rose-600" />}
          color="#ef4444"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title={t('traceos.dashboard.abandonedBranches', 'Branches abandonnées')}
          value={stats.totalAbandonedBranches}
          subtitle={t('traceos.dashboard.documentedAlternatives', 'Alternatives documentées')}
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
          color="#8b5cf6"
        />
        <StatsCard
          title={t('traceos.dashboard.maxDepth', 'Profondeur max')}
          value={stats.maxDepth}
          subtitle={t('traceos.dashboard.decisionLevels', 'niveaux de décision')}
          icon={<Target className="h-5 w-5 text-blue-600" />}
          color="#3b82f6"
        />
        <StatsCard
          title={t('traceos.dashboard.authors', 'Contributeurs')}
          value={Object.keys(stats.authorCounts).length}
          subtitle={t('traceos.dashboard.uniqueAuthors', 'auteurs uniques')}
          icon={<Users className="h-5 w-5 text-teal-600" />}
          color="#14b8a6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('traceos.dashboard.timeline', 'Évolution (6 derniers mois)')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {stats.timelineData.map((month, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '140px' }}>
                    {month.validated > 0 && (
                      <div 
                        className="w-full rounded-t-sm bg-emerald-500"
                        style={{ 
                          height: `${(month.validated / Math.max(...stats.timelineData.map(m => m.total), 1)) * 100}%`,
                          minHeight: month.validated > 0 ? '4px' : 0
                        }}
                        title={`Validées: ${month.validated}`}
                      />
                    )}
                    {month.pending > 0 && (
                      <div 
                        className="w-full bg-amber-500"
                        style={{ 
                          height: `${(month.pending / Math.max(...stats.timelineData.map(m => m.total), 1)) * 100}%`,
                          minHeight: month.pending > 0 ? '4px' : 0
                        }}
                        title={`En attente: ${month.pending}`}
                      />
                    )}
                    {month.abandoned > 0 && (
                      <div 
                        className="w-full bg-rose-500"
                        style={{ 
                          height: `${(month.abandoned / Math.max(...stats.timelineData.map(m => m.total), 1)) * 100}%`,
                          minHeight: month.abandoned > 0 ? '4px' : 0
                        }}
                        title={`Abandonnées: ${month.abandoned}`}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground capitalize">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-xs text-muted-foreground">{t('traceos.status.validated', 'Validées')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-xs text-muted-foreground">{t('traceos.status.pending', 'En attente')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-xs text-muted-foreground">{t('traceos.status.abandoned', 'Abandonnées')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              {t('traceos.dashboard.byScope', 'Par périmètre')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topScopes.map(([scope, count], idx) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={scope} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{scope}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {stats.topScopes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t('traceos.dashboard.noData', 'Aucune donnée disponible')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Authors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('traceos.dashboard.topContributors', 'Principaux contributeurs')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topAuthors.map(([author, count]) => (
              <Badge key={author} variant="secondary" className="px-3 py-1">
                {author}
                <span className="ml-2 text-muted-foreground">({count})</span>
              </Badge>
            ))}
            {stats.topAuthors.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('traceos.dashboard.noContributors', 'Aucun contributeur')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
