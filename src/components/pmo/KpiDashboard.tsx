// PMO KPI Dashboard - Real-time project metrics
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  FileText,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiData {
  initiatives: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    overdue: number;
  };
  milestones: {
    total: number;
    achieved: number;
    upcoming: number;
    overdue: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    burnRate: number;
    runwayMonths: number;
  };
  risks: {
    total: number;
    high: number;
    medium: number;
    mitigated: number;
  };
  compliance: {
    frameworks: number;
    mappedItems: number;
    gapCount: number;
    coveragePercent: number;
  };
  team?: {
    total: number;
    assigned: number;
    utilization: number;
  };
}

interface KpiDashboardProps {
  data: KpiData;
  period?: string;
  showTrends?: boolean;
}

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  progress?: number;
}

function KpiCard({ title, value, subtitle, icon, trend, trendValue, status = 'neutral', progress }: KpiCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'danger':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-border';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Activity className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", getStatusColor())}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{value}</span>
              {trendValue && (
                <span className="flex items-center gap-0.5 text-xs">
                  {getTrendIcon()}
                  {trendValue}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="mt-2 h-1.5" />
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiDashboard({ data, period, showTrends = true }: KpiDashboardProps) {
  const { t } = useTranslation();

  const calculations = useMemo(() => {
    const initiativeCompletion = data.initiatives.total > 0
      ? Math.round((data.initiatives.completed / data.initiatives.total) * 100)
      : 0;

    const milestoneCompletion = data.milestones.total > 0
      ? Math.round((data.milestones.achieved / data.milestones.total) * 100)
      : 0;

    const budgetUtilization = data.budget.allocated > 0
      ? Math.round((data.budget.spent / data.budget.allocated) * 100)
      : 0;

    const riskScore = data.risks.total > 0
      ? Math.round(((data.risks.high * 3 + data.risks.medium * 2) / (data.risks.total * 3)) * 100)
      : 0;

    return {
      initiativeCompletion,
      milestoneCompletion,
      budgetUtilization,
      riskScore
    };
  }, [data]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`;
    return `${value}€`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {t('pmo.kpi.title', 'Tableau de bord KPI')}
          </h2>
        </div>
        {period && (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {period}
          </Badge>
        )}
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title={t('pmo.kpi.initiativeProgress', 'Progression Initiatives')}
          value={`${calculations.initiativeCompletion}%`}
          subtitle={`${data.initiatives.completed}/${data.initiatives.total}`}
          icon={<Target className="h-5 w-5" />}
          status={calculations.initiativeCompletion >= 75 ? 'success' : calculations.initiativeCompletion >= 50 ? 'warning' : 'danger'}
          progress={calculations.initiativeCompletion}
          trend={showTrends ? 'up' : undefined}
          trendValue={showTrends ? '+5%' : undefined}
        />

        <KpiCard
          title={t('pmo.kpi.milestones', 'Jalons atteints')}
          value={`${calculations.milestoneCompletion}%`}
          subtitle={`${data.milestones.achieved}/${data.milestones.total}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          status={data.milestones.overdue > 0 ? 'warning' : 'success'}
          progress={calculations.milestoneCompletion}
        />

        <KpiCard
          title={t('pmo.kpi.budgetUsed', 'Budget consommé')}
          value={formatCurrency(data.budget.spent)}
          subtitle={`${calculations.budgetUtilization}% de ${formatCurrency(data.budget.allocated)}`}
          icon={<DollarSign className="h-5 w-5" />}
          status={calculations.budgetUtilization > 90 ? 'danger' : calculations.budgetUtilization > 75 ? 'warning' : 'success'}
          progress={calculations.budgetUtilization}
        />

        <KpiCard
          title={t('pmo.kpi.runway', 'Runway')}
          value={`${data.budget.runwayMonths}m`}
          subtitle={t('pmo.kpi.burnRate', 'Burn rate: {{rate}}/m', { rate: formatCurrency(data.budget.burnRate) })}
          icon={<Zap className="h-5 w-5" />}
          status={data.budget.runwayMonths < 3 ? 'danger' : data.budget.runwayMonths < 6 ? 'warning' : 'success'}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-lg font-bold">{data.initiatives.blocked}</p>
                    <p className="text-xs text-muted-foreground">{t('pmo.kpi.blocked', 'Bloquées')}</p>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              {t('pmo.kpi.blockedDesc', 'Initiatives nécessitant une intervention')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-lg font-bold">{data.initiatives.overdue}</p>
                    <p className="text-xs text-muted-foreground">{t('pmo.kpi.overdue', 'En retard')}</p>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              {t('pmo.kpi.overdueDesc', 'Initiatives dépassant leur deadline')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-lg font-bold">{data.risks.high}</p>
                    <p className="text-xs text-muted-foreground">{t('pmo.kpi.highRisks', 'Risques élevés')}</p>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              {t('pmo.kpi.highRisksDesc', 'Risques critiques à traiter')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-lg font-bold">{data.risks.mitigated}</p>
                    <p className="text-xs text-muted-foreground">{t('pmo.kpi.mitigated', 'Mitigés')}</p>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              {t('pmo.kpi.mitigatedDesc', 'Risques avec plan de mitigation')}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-lg font-bold">{data.compliance.coveragePercent}%</p>
                    <p className="text-xs text-muted-foreground">{t('pmo.kpi.compliance', 'Conformité')}</p>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              {t('pmo.kpi.complianceDesc', 'Couverture des exigences réglementaires')}
            </TooltipContent>
          </Tooltip>

          {data.team && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-3 cursor-help">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold">{data.team.utilization}%</p>
                      <p className="text-xs text-muted-foreground">{t('pmo.kpi.utilization', 'Utilisation')}</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                {t('pmo.kpi.utilizationDesc', 'Taux d\'occupation de l\'équipe')}
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {/* Alert Section */}
      {(data.initiatives.overdue > 0 || data.risks.high > 2 || data.budget.runwayMonths < 3) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t('pmo.kpi.alertsTitle', 'Alertes actives')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1 text-sm">
              {data.initiatives.overdue > 0 && (
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-red-500" />
                  {t('pmo.kpi.alertOverdue', '{{count}} initiatives en retard', { count: data.initiatives.overdue })}
                </li>
              )}
              {data.risks.high > 2 && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  {t('pmo.kpi.alertHighRisks', '{{count}} risques élevés nécessitent attention', { count: data.risks.high })}
                </li>
              )}
              {data.budget.runwayMonths < 3 && (
                <li className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-amber-500" />
                  {t('pmo.kpi.alertRunway', 'Runway inférieur à 3 mois')}
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
