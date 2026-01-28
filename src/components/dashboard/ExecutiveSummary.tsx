// Dashboard Executive Summary - Global platform synthesis
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Target,
  Shield,
  FileText,
  Download,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, isAfter } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface ModuleStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    total: number;
    active: number;
    completed: number;
    overdue?: number;
  };
  trend?: 'up' | 'down' | 'stable';
  lastActivity?: string;
}

interface ExecutiveSummaryProps {
  moduleStatuses: ModuleStatus[];
  onExportPdf?: () => void;
  periodDays?: number;
}

export function ExecutiveSummary({
  moduleStatuses,
  onExportPdf,
  periodDays = 7
}: ExecutiveSummaryProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const summary = useMemo(() => {
    const healthy = moduleStatuses.filter(m => m.status === 'healthy').length;
    const warning = moduleStatuses.filter(m => m.status === 'warning').length;
    const critical = moduleStatuses.filter(m => m.status === 'critical').length;
    
    const totalItems = moduleStatuses.reduce((sum, m) => sum + m.metrics.total, 0);
    const completedItems = moduleStatuses.reduce((sum, m) => sum + m.metrics.completed, 0);
    const overdueItems = moduleStatuses.reduce((sum, m) => sum + (m.metrics.overdue || 0), 0);
    
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const recentlyActive = moduleStatuses.filter(m => 
      m.lastActivity && isAfter(new Date(m.lastActivity), subDays(new Date(), periodDays))
    ).length;

    return {
      healthy,
      warning,
      critical,
      totalItems,
      completedItems,
      overdueItems,
      completionRate,
      recentlyActive,
      healthScore: Math.round(((healthy * 3 + warning * 1) / (moduleStatuses.length * 3)) * 100)
    };
  }, [moduleStatuses, periodDays]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10';
      case 'warning':
        return 'text-amber-500 bg-amber-500/10';
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t('dashboard.summary.title', 'Synthèse Exécutive')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.summary.period', 'Période')}: {t('dashboard.summary.lastDays', 'Derniers {{days}} jours', { days: periodDays })}
              </CardDescription>
            </div>
            {onExportPdf && (
              <Button variant="outline" size="sm" onClick={onExportPdf}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={cn("text-3xl font-bold", getHealthScoreColor(summary.healthScore))}>
                {summary.healthScore}%
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.summary.healthScore', 'Score de santé')}
              </p>
            </div>

            {/* Completion Rate */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">
                {summary.completionRate}%
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.summary.completion', 'Taux de complétion')}
              </p>
            </div>

            {/* Active Items */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">
                {summary.totalItems - summary.completedItems}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.summary.activeItems', 'Éléments actifs')}
              </p>
            </div>

            {/* Overdue Items */}
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className={cn("text-3xl font-bold", summary.overdueItems > 0 ? 'text-red-500' : 'text-green-500')}>
                {summary.overdueItems}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.summary.overdue', 'En retard')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('dashboard.summary.moduleStatus', 'État des modules')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Summary Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {summary.healthy} {t('dashboard.summary.healthy', 'Sains')}
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summary.warning} {t('dashboard.summary.warning', 'Attention')}
            </Badge>
            {summary.critical > 0 && (
              <Badge variant="destructive">
                <Zap className="h-3 w-3 mr-1" />
                {summary.critical} {t('dashboard.summary.critical', 'Critiques')}
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          {/* Module List */}
          <div className="space-y-3">
            {moduleStatuses.map((module) => (
              <div 
                key={module.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={cn("p-2 rounded-lg", getStatusColor(module.status))}>
                  {module.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{module.name}</h4>
                    {getTrendIcon(module.trend)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {module.metrics.total} {t('dashboard.summary.total', 'total')}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {module.metrics.completed}
                    </span>
                    {module.metrics.overdue && module.metrics.overdue > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <Clock className="h-3 w-3" />
                        {module.metrics.overdue}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Progress 
                    value={module.metrics.total > 0 
                      ? (module.metrics.completed / module.metrics.total) * 100 
                      : 0
                    } 
                    className="w-20 h-2"
                  />
                  {module.lastActivity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(module.lastActivity), 'dd MMM', { locale: dateLocale })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('dashboard.summary.quickActions', 'Actions rapides')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.summary.viewCalendar', 'Calendrier')}</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.summary.viewAlerts', 'Alertes')}</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.summary.viewReports', 'Rapports')}</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.summary.viewGoals', 'Objectifs')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
