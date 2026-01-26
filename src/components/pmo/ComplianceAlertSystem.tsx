// Compliance Alert System Component
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, Shield, Clock, CheckCircle, XCircle,
  Bell, BellOff, ExternalLink, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ComplianceAlert {
  id: string;
  framework: string; // RGPD, AI_ACT, MDR, EHDS
  requirement_id: string;
  requirement_title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alert_type: 'deadline' | 'gap' | 'change' | 'audit';
  message: string;
  deadline?: string;
  is_acknowledged: boolean;
  created_at: string;
}

interface ComplianceAlertSystemProps {
  alerts: ComplianceAlert[];
  onAcknowledge?: (alertId: string) => Promise<void>;
  onDismiss?: (alertId: string) => Promise<void>;
  onViewDetails?: (alertId: string) => void;
}

export function ComplianceAlertSystem({
  alerts,
  onAcknowledge,
  onDismiss,
  onViewDetails,
}: ComplianceAlertSystemProps) {
  const { t, i18n } = useTranslation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-600 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-600 bg-blue-500/10 border-blue-500/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return Clock;
      case 'gap': return XCircle;
      case 'change': return AlertTriangle;
      case 'audit': return FileText;
      default: return Bell;
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'RGPD': return 'bg-blue-500/10 text-blue-600';
      case 'AI_ACT': return 'bg-purple-500/10 text-purple-600';
      case 'MDR': return 'bg-green-500/10 text-green-600';
      case 'EHDS': return 'bg-amber-500/10 text-amber-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleAcknowledge = async (alertId: string) => {
    if (!onAcknowledge) return;
    setProcessingId(alertId);
    try {
      await onAcknowledge(alertId);
      toast.success(t('compliance.acknowledged', 'Alert acknowledged'));
    } catch (error) {
      toast.error(t('compliance.acknowledgeError', 'Failed to acknowledge alert'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (alertId: string) => {
    if (!onDismiss) return;
    setProcessingId(alertId);
    try {
      await onDismiss(alertId);
      toast.success(t('compliance.dismissed', 'Alert dismissed'));
    } catch (error) {
      toast.error(t('compliance.dismissError', 'Failed to dismiss alert'));
    } finally {
      setProcessingId(null);
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.is_acknowledged);
  const criticalCount = unacknowledgedAlerts.filter(a => a.severity === 'critical').length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('compliance.alerts', 'Compliance Alerts')}
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Bell className="w-3 h-3" />
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </CardTitle>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} {t('compliance.critical', 'critical')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
            <p>{t('compliance.noAlerts', 'No compliance alerts')}</p>
            <p className="text-xs mt-1">{t('compliance.allGood', 'All requirements are on track')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const TypeIcon = getAlertTypeIcon(alert.alert_type);
                const daysUntil = getDaysUntilDeadline(alert.deadline);
                const isProcessing = processingId === alert.id;
                
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      getSeverityColor(alert.severity),
                      alert.is_acknowledged && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-full bg-background/50">
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={cn("text-xs", getFrameworkColor(alert.framework))}>
                              {alert.framework}
                            </Badge>
                            <span className="font-medium text-sm truncate">
                              {alert.requirement_title}
                            </span>
                            {alert.is_acknowledged && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {t('compliance.ack', 'Ack')}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(alert.created_at)}
                            </span>
                            {daysUntil !== null && (
                              <span className={cn(
                                "flex items-center gap-1 font-medium",
                                daysUntil <= 7 && "text-red-600",
                                daysUntil > 7 && daysUntil <= 30 && "text-orange-600"
                              )}>
                                <AlertTriangle className="w-3 h-3" />
                                {daysUntil > 0 
                                  ? `${daysUntil} ${t('compliance.daysLeft', 'days left')}`
                                  : t('compliance.overdue', 'Overdue')
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        {!alert.is_acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={isProcessing}
                            className="h-7 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('compliance.ack', 'Ack')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails?.(alert.id)}
                          className="h-7 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {t('compliance.view', 'View')}
                        </Button>
                        {alert.is_acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                            disabled={isProcessing}
                            className="h-7 text-xs text-muted-foreground"
                          >
                            <BellOff className="w-3 h-3 mr-1" />
                            {t('compliance.dismiss', 'Dismiss')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
