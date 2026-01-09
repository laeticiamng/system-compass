import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Timer,
  BarChart3,
  Users
} from 'lucide-react';
import { useTraceOSApprovals, useTraceOSWorkflows } from '@/hooks/useTraceOSWorkflows';

interface Approval {
  id: string;
  decision_id: string;
  workflow_id: string | null;
  step_order: number;
  step_name: string;
  approver_id: string | null;
  approver_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  signature_hash: string | null;
  comment: string | null;
  approved_at: string | null;
  created_at: string;
}

interface WorkflowMetricsProps {
  allApprovals?: Approval[];
}

export function WorkflowMetrics({ allApprovals = [] }: WorkflowMetricsProps) {
  const { t } = useTranslation();
  const { workflows } = useTraceOSWorkflows();

  const metrics = useMemo(() => {
    if (allApprovals.length === 0) {
      return {
        totalApprovals: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0,
        approvalRate: 0,
        rejectionRate: 0,
        avgApprovalTimeHours: 0,
        avgApprovalTimeDays: 0,
        fastestApprovalHours: 0,
        slowestApprovalHours: 0,
        stepMetrics: [] as { name: string; approved: number; rejected: number; pending: number; avgTime: number }[],
        approverStats: [] as { name: string; count: number; avgTime: number }[],
      };
    }

    const approved = allApprovals.filter(a => a.status === 'approved');
    const rejected = allApprovals.filter(a => a.status === 'rejected');
    const pending = allApprovals.filter(a => a.status === 'pending');

    // Calculate approval times in hours
    const approvalTimes = approved
      .filter(a => a.approved_at && a.created_at)
      .map(a => {
        const created = new Date(a.created_at).getTime();
        const approvedAt = new Date(a.approved_at!).getTime();
        return (approvedAt - created) / (1000 * 60 * 60); // hours
      });

    const avgApprovalTimeHours = approvalTimes.length > 0
      ? approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length
      : 0;

    // Step-level metrics
    const stepNames = [...new Set(allApprovals.map(a => a.step_name))];
    const stepMetrics = stepNames.map(name => {
      const stepApprovals = allApprovals.filter(a => a.step_name === name);
      const stepApproved = stepApprovals.filter(a => a.status === 'approved');
      const stepTimes = stepApproved
        .filter(a => a.approved_at && a.created_at)
        .map(a => {
          const created = new Date(a.created_at).getTime();
          const approvedAt = new Date(a.approved_at!).getTime();
          return (approvedAt - created) / (1000 * 60 * 60);
        });

      return {
        name,
        approved: stepApproved.length,
        rejected: stepApprovals.filter(a => a.status === 'rejected').length,
        pending: stepApprovals.filter(a => a.status === 'pending').length,
        avgTime: stepTimes.length > 0 ? stepTimes.reduce((a, b) => a + b, 0) / stepTimes.length : 0,
      };
    });

    // Approver statistics
    const approverNames = [...new Set(approved.filter(a => a.approver_name).map(a => a.approver_name!))];
    const approverStats = approverNames.map(name => {
      const approverApprovals = approved.filter(a => a.approver_name === name);
      const times = approverApprovals
        .filter(a => a.approved_at && a.created_at)
        .map(a => {
          const created = new Date(a.created_at).getTime();
          const approvedAt = new Date(a.approved_at!).getTime();
          return (approvedAt - created) / (1000 * 60 * 60);
        });

      return {
        name,
        count: approverApprovals.length,
        avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      };
    }).sort((a, b) => b.count - a.count);

    return {
      totalApprovals: allApprovals.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      pendingCount: pending.length,
      approvalRate: allApprovals.length > 0 ? (approved.length / allApprovals.length) * 100 : 0,
      rejectionRate: allApprovals.length > 0 ? (rejected.length / allApprovals.length) * 100 : 0,
      avgApprovalTimeHours,
      avgApprovalTimeDays: avgApprovalTimeHours / 24,
      fastestApprovalHours: approvalTimes.length > 0 ? Math.min(...approvalTimes) : 0,
      slowestApprovalHours: approvalTimes.length > 0 ? Math.max(...approvalTimes) : 0,
      stepMetrics,
      approverStats,
    };
  }, [allApprovals]);

  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}j`;
  };

  if (allApprovals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{t('traceos.metrics.noData', 'Aucune donnée d\'approbation disponible')}</p>
          <p className="text-sm mt-2">{t('traceos.metrics.startWorkflow', 'Démarrez un workflow pour voir les métriques')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('traceos.metrics.approvalRate', 'Taux d\'approbation')}</p>
                <p className="text-2xl font-bold text-green-600">{metrics.approvalRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/20" />
            </div>
            <Progress value={metrics.approvalRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('traceos.metrics.rejectionRate', 'Taux de rejet')}</p>
                <p className="text-2xl font-bold text-red-600">{metrics.rejectionRate.toFixed(0)}%</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500/20" />
            </div>
            <Progress value={metrics.rejectionRate} className="mt-2 h-1 [&>div]:bg-red-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('traceos.metrics.avgTime', 'Temps moyen')}</p>
                <p className="text-2xl font-bold">{formatTime(metrics.avgApprovalTimeHours)}</p>
              </div>
              <Timer className="w-8 h-8 text-primary/20" />
            </div>
            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
              <span>Min: {formatTime(metrics.fastestApprovalHours)}</span>
              <span>•</span>
              <span>Max: {formatTime(metrics.slowestApprovalHours)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('traceos.metrics.pending', 'En attente')}</p>
                <p className="text-2xl font-bold text-amber-600">{metrics.pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/20" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              sur {metrics.totalApprovals} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Step-level metrics */}
      {metrics.stepMetrics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('traceos.metrics.byStep', 'Métriques par étape')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.stepMetrics.map((step, idx) => {
                const total = step.approved + step.rejected + step.pending;
                const approvalPercent = total > 0 ? (step.approved / total) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <span className="font-medium text-sm">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-green-600">{step.approved} ✓</span>
                        <span className="text-red-600">{step.rejected} ✗</span>
                        <span className="text-amber-600">{step.pending} ⏳</span>
                        {step.avgTime > 0 && (
                          <span className="text-muted-foreground">
                            ~{formatTime(step.avgTime)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div 
                        className="bg-green-500 transition-all"
                        style={{ width: `${approvalPercent}%` }}
                      />
                      <div 
                        className="bg-red-500 transition-all"
                        style={{ width: `${total > 0 ? (step.rejected / total) * 100 : 0}%` }}
                      />
                      <div 
                        className="bg-amber-500 transition-all"
                        style={{ width: `${total > 0 ? (step.pending / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top approvers */}
      {metrics.approverStats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('traceos.metrics.topApprovers', 'Top approbateurs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.approverStats.slice(0, 5).map((approver, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {approver.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{approver.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary">{approver.count} approbations</Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{formatTime(approver.avgTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow overview */}
      {workflows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('traceos.metrics.activeWorkflows', 'Workflows actifs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {workflows.filter(w => w.is_active).map(workflow => (
                <Badge key={workflow.id} variant="outline" className="gap-1">
                  {workflow.name}
                  <span className="text-muted-foreground">
                    ({workflow.steps.length} étapes)
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
