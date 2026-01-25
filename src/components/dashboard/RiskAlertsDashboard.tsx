import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  ChevronRight,
  Calendar,
  MapPin,
  FileText,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserCases } from '@/hooks/useUserCases';
import { useLatentZones } from '@/hooks/useLatentZones';
import { useIrreversa } from '@/hooks/useIrreversa';
import { useNotifications } from '@/hooks/useNotifications';

interface RiskAlert {
  id: string;
  type: 'deadline' | 'threshold' | 'zone' | 'case' | 'notification';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dueDate?: Date;
  link?: string;
  source: string;
}

export function RiskAlertsDashboard() {
  const { t } = useTranslation();
  const { cases } = useUserCases();
  const { zones } = useLatentZones();
  const { thresholds } = useIrreversa();
  const { notifications } = useNotifications();

  // Aggregate all risks into alerts
  const alerts = useMemo<RiskAlert[]>(() => {
    const result: RiskAlert[] = [];
    const now = new Date();

    // 1. Case milestones with deadlines
    (cases || []).forEach(caseItem => {
      const milestones = caseItem.milestones || [];
      milestones.filter(m => m.deadline && !m.completed).forEach(milestone => {
        const dueDate = new Date(milestone.deadline!);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 14 && daysUntil >= 0) {
          result.push({
            id: `case-${caseItem.id}-${milestone.id}`,
            type: 'deadline',
            severity: daysUntil <= 3 ? 'critical' : daysUntil <= 7 ? 'high' : 'medium',
            title: milestone.title,
            description: `${caseItem.title} - ${daysUntil} ${t('common.days', 'jours')}`,
            dueDate,
            link: `/case/${caseItem.id}`,
            source: 'cases',
          });
        }
      });
    });

    // 2. Escalating latent zones
    (zones || []).filter(z => z.status === 'fragile' || z.status === 'emergent').forEach(zone => {
      const tensionCount = (zone.tensions || []).length;
      result.push({
        id: `zone-${zone.id}`,
        type: 'zone',
        severity: zone.status === 'fragile' && tensionCount >= 3 ? 'high' : 'medium',
        title: zone.title,
        description: t('dashboard.alerts.zoneEscalating', 'Zone en tension - {{count}} signaux', { count: tensionCount }),
        link: '/latent',
        source: 'latent',
      });
    });

    // 3. Unvalidated thresholds
    (thresholds || []).filter(th => th.status === 'detected' || th.status === 'marked').forEach(threshold => {
      const daysSinceDetection = Math.ceil(
        (now.getTime() - new Date(threshold.detection_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceDetection >= 7) {
        result.push({
          id: `threshold-${threshold.id}`,
          type: 'threshold',
          severity: daysSinceDetection >= 30 ? 'high' : 'medium',
          title: threshold.title,
          description: t('dashboard.alerts.thresholdPending', 'En attente depuis {{days}} jours', { days: daysSinceDetection }),
          link: '/irreversa',
          source: 'irreversa',
        });
      }
    });

    // 4. Unread notifications
    const unreadNotifs = (notifications || []).filter(n => !n.read);
    if (unreadNotifs.length >= 5) {
      result.push({
        id: 'notifications-backlog',
        type: 'notification',
        severity: 'low',
        title: t('dashboard.alerts.notificationsBacklog', 'Notifications en attente'),
        description: t('dashboard.alerts.notificationsCount', '{{count}} notifications non lues', { count: unreadNotifs.length }),
        source: 'notifications',
      });
    }

    // Sort by severity then by date
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return result.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    });
  }, [cases, zones, thresholds, notifications, t]);

  const severityConfig: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
    critical: { color: 'text-red-600', bg: 'bg-red-500/10', icon: AlertTriangle },
    high: { color: 'text-orange-600', bg: 'bg-orange-500/10', icon: TrendingUp },
    medium: { color: 'text-amber-600', bg: 'bg-amber-500/10', icon: Clock },
    low: { color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Bell },
  };

  const sourceIcons: Record<string, typeof AlertTriangle> = {
    cases: FileText,
    latent: MapPin,
    irreversa: Shield,
    notifications: Bell,
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  if (alerts.length === 0) {
    return (
      <Card className="border-green-500/20">
        <CardContent className="py-8 text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 text-green-600" />
          <h3 className="font-medium text-green-700">{t('dashboard.alerts.allClear', 'Tout est en ordre')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.alerts.noAlerts', 'Aucune alerte prioritaire pour le moment')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t('dashboard.alerts.title', 'Alertes prioritaires')}
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-500">{criticalCount} {t('dashboard.alerts.critical', 'critiques')}</Badge>
            )}
            {highCount > 0 && (
              <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                {highCount} {t('dashboard.alerts.high', 'élevées')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Risk summary */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/30">
          {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
            const count = alerts.filter(a => a.severity === severity).length;
            const config = severityConfig[severity];
            return (
              <div key={severity} className="text-center">
                <p className={`text-xl font-bold ${config.color}`}>{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{severity}</p>
              </div>
            );
          })}
        </div>

        {/* Alerts list */}
        <div className="space-y-2">
          {alerts.slice(0, 5).map(alert => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const SourceIcon = sourceIcons[alert.source] || FileText;

            return (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg ${config.bg} flex items-start gap-3`}
              >
                <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs gap-1">
                      <SourceIcon className="w-3 h-3" />
                      {alert.source}
                    </Badge>
                  </div>
                  {alert.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {alert.dueDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
                {alert.link && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <Link to={alert.link}>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {alerts.length > 5 && (
          <p className="text-xs text-center text-muted-foreground">
            +{alerts.length - 5} {t('dashboard.alerts.moreAlerts', 'autres alertes')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
