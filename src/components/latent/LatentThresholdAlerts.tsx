import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TrendingUp, AlertCircle, Bell, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface LatentZone {
  id: string;
  title: string;
  description?: string;
  status: 'dormant' | 'emerging' | 'active' | 'resolved' | 'blocked' | 'fragile';
  tensions?: Array<{ id: string; tension_type: string; content: string }>;
  created_at: string;
  updated_at: string;
}

interface ThresholdAlert {
  id: string;
  zoneId: string;
  zoneTitle: string;
  alertType: 'critical' | 'warning' | 'info';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  suggestedAction: string;
}

interface LatentThresholdAlertsProps {
  zones: LatentZone[];
  onZoneClick?: (zoneId: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export function LatentThresholdAlerts({ zones, onZoneClick, onDismissAlert }: LatentThresholdAlertsProps) {
  const { t } = useTranslation();

  // Generate threshold alerts based on zone analysis
  const alerts = useMemo((): ThresholdAlert[] => {
    const generatedAlerts: ThresholdAlert[] = [];

    zones.forEach(zone => {
      const tensionCount = zone.tensions?.length || 0;
      const daysSinceUpdate = Math.floor((Date.now() - new Date(zone.updated_at).getTime()) / (1000 * 60 * 60 * 24));

      // Critical: Fragile zones with high tension count
      if (zone.status === 'fragile' && tensionCount >= 3) {
        generatedAlerts.push({
          id: `alert-fragile-${zone.id}`,
          zoneId: zone.id,
          zoneTitle: zone.title,
          alertType: 'critical',
          message: t('latent.alerts.fragileCritical', 'Zone fragile avec tensions multiples'),
          metric: t('latent.alerts.tensionCount', 'Nombre de tensions'),
          currentValue: tensionCount,
          threshold: 3,
          trend: 'up',
          suggestedAction: t('latent.alerts.actionReview', 'Revue immédiate recommandée')
        });
      }

      // Critical: Blocked zones inactive for too long
      if (zone.status === 'blocked' && daysSinceUpdate > 14) {
        generatedAlerts.push({
          id: `alert-blocked-${zone.id}`,
          zoneId: zone.id,
          zoneTitle: zone.title,
          alertType: 'critical',
          message: t('latent.alerts.blockedStale', 'Zone bloquée sans action depuis 14+ jours'),
          metric: t('latent.alerts.daysSinceUpdate', 'Jours sans mise à jour'),
          currentValue: daysSinceUpdate,
          threshold: 14,
          trend: 'up',
          suggestedAction: t('latent.alerts.actionUnblock', 'Identifier et lever le blocage')
        });
      }

      // Warning: Emerging zones accelerating
      if (zone.status === 'emerging' && tensionCount >= 2) {
        generatedAlerts.push({
          id: `alert-emerging-${zone.id}`,
          zoneId: zone.id,
          zoneTitle: zone.title,
          alertType: 'warning',
          message: t('latent.alerts.emergingAccel', 'Zone émergente en accélération'),
          metric: t('latent.alerts.tensionCount', 'Nombre de tensions'),
          currentValue: tensionCount,
          threshold: 2,
          trend: 'up',
          suggestedAction: t('latent.alerts.actionMonitor', 'Surveillance renforcée recommandée')
        });
      }

      // Warning: Active zones with many tensions
      if (zone.status === 'active' && tensionCount >= 4) {
        generatedAlerts.push({
          id: `alert-overload-${zone.id}`,
          zoneId: zone.id,
          zoneTitle: zone.title,
          alertType: 'warning',
          message: t('latent.alerts.tensionOverload', 'Surcharge de tensions détectée'),
          metric: t('latent.alerts.tensionCount', 'Nombre de tensions'),
          currentValue: tensionCount,
          threshold: 4,
          trend: 'stable',
          suggestedAction: t('latent.alerts.actionPrioritize', 'Prioriser et traiter les tensions')
        });
      }

      // Info: Dormant zones for too long
      if (zone.status === 'dormant' && daysSinceUpdate > 30) {
        generatedAlerts.push({
          id: `alert-dormant-${zone.id}`,
          zoneId: zone.id,
          zoneTitle: zone.title,
          alertType: 'info',
          message: t('latent.alerts.dormantLong', 'Zone dormante depuis longtemps'),
          metric: t('latent.alerts.daysSinceUpdate', 'Jours sans mise à jour'),
          currentValue: daysSinceUpdate,
          threshold: 30,
          trend: 'stable',
          suggestedAction: t('latent.alerts.actionArchive', 'Considérer archivage ou réactivation')
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return generatedAlerts.sort((a, b) => severityOrder[a.alertType] - severityOrder[b.alertType]);
  }, [zones, t]);

  const criticalCount = alerts.filter(a => a.alertType === 'critical').length;
  const warningCount = alerts.filter(a => a.alertType === 'warning').length;
  const infoCount = alerts.filter(a => a.alertType === 'info').length;

  const getAlertIcon = (type: ThresholdAlert['alertType']) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (type: ThresholdAlert['alertType']) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
    }
  };

  const getTrendIcon = (trend: ThresholdAlert['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-destructive" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
      case 'stable': return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <Zap className="w-5 h-5" />
            <span className="font-medium">{t('latent.alerts.noAlerts', 'Aucune alerte de seuil active')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t('latent.alerts.title', 'Alertes de seuils')}
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} {t('latent.alerts.critical', 'critique(s)')}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                {warningCount} {t('latent.alerts.warning', 'avertissement(s)')}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {infoCount} {t('latent.alerts.info', 'info(s)')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={alert.id}>
            {index > 0 && <Separator className="my-3" />}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.alertType)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{alert.zoneTitle}</span>
                      <Badge variant={getAlertBadgeVariant(alert.alertType) as any} className="text-xs">
                        {alert.alertType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
                {onDismissAlert && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => onDismissAlert(alert.id)}
                  >
                    {t('common.dismiss', 'Ignorer')}
                  </Button>
                )}
              </div>

              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{alert.metric}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{alert.currentValue}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-mono text-muted-foreground">{alert.threshold}</span>
                    {getTrendIcon(alert.trend)}
                  </div>
                </div>
                <Progress 
                  value={Math.min((alert.currentValue / alert.threshold) * 100, 100)} 
                  className="h-1.5"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground italic">
                    💡 {alert.suggestedAction}
                  </span>
                  {onZoneClick && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={() => onZoneClick(alert.zoneId)}
                    >
                      {t('latent.alerts.viewZone', 'Voir la zone')} →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
