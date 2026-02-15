import { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, TrendingUp, Shield, Bell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RiskAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  source: 'traceos' | 'pmo' | 'latent' | 'irreversa' | 'exit-keys';
  title: string;
  description: string;
  timestamp: Date;
  actionUrl?: string;
}

interface ConsolidatedRiskAlertsProps {
  alerts?: RiskAlert[];
  onNavigate?: (url: string) => void;
}

export const ConsolidatedRiskAlerts = memo(function ConsolidatedRiskAlerts({ alerts: externalAlerts, onNavigate }: ConsolidatedRiskAlertsProps) {
  const { t } = useTranslation();

  // Mock alerts for demonstration - in production, these would come from hooks
  const defaultAlerts: RiskAlert[] = useMemo(() => [
    {
      id: '1',
      type: 'critical',
      source: 'pmo',
      title: t('dashboard.alerts.budgetOverrun', 'Dépassement budget détecté'),
      description: t('dashboard.alerts.budgetOverrunDesc', 'Le projet Alpha dépasse le budget prévu de 15%'),
      timestamp: new Date(Date.now() - 3600000),
      actionUrl: '/pmo'
    },
    {
      id: '2',
      type: 'warning',
      source: 'traceos',
      title: t('dashboard.alerts.pendingDecision', 'Décision en attente'),
      description: t('dashboard.alerts.pendingDecisionDesc', '3 décisions stratégiques attendent validation depuis 7+ jours'),
      timestamp: new Date(Date.now() - 86400000),
      actionUrl: '/institutions'
    },
    {
      id: '3',
      type: 'warning',
      source: 'latent',
      title: t('dashboard.alerts.zoneActivation', 'Zone latente proche activation'),
      description: t('dashboard.alerts.zoneActivationDesc', 'La zone "Expansion Asie" montre des signaux forts'),
      timestamp: new Date(Date.now() - 7200000),
      actionUrl: '/latent'
    },
    {
      id: '4',
      type: 'info',
      source: 'irreversa',
      title: t('dashboard.alerts.thresholdReminder', 'Rappel seuil irréversible'),
      description: t('dashboard.alerts.thresholdReminderDesc', 'Revue programmée dans 5 jours'),
      timestamp: new Date(Date.now() - 172800000),
      actionUrl: '/irreversa'
    }
  ], [t]);

  const alerts = externalAlerts || defaultAlerts;

  const sortedAlerts = useMemo(() => {
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    return [...alerts].sort((a, b) => {
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [alerts]);

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  const typeConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    warning: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
    info: { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' }
  };

  const sourceLabels: Record<string, string> = {
    traceos: 'TraceOS',
    pmo: 'PMO',
    latent: 'Latent',
    irreversa: 'Irreversa',
    'exit-keys': 'Stratégies'
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}j`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('dashboard.alerts.title', 'Alertes Consolidées')}
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} {t('dashboard.alerts.critical', 'critique(s)')}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-700">
                {warningCount} {t('dashboard.alerts.warnings', 'avertissement(s)')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {sortedAlerts.map((alert) => {
              const config = typeConfig[alert.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${config.bg} cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => alert.actionUrl && onNavigate?.(alert.actionUrl)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {sourceLabels[alert.source]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                      {alert.actionUrl && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <p className="text-muted-foreground">
              {t('dashboard.alerts.noAlerts', 'Aucune alerte active')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
