import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Bell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IrreversaThreshold, ThresholdStatus } from '@/hooks/useIrreversa';
import { cn } from '@/lib/utils';

interface ThresholdNotification {
  id: string;
  thresholdId: string;
  title: string;
  type: 'overdue' | 'pending' | 'warning';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  daysPending: number;
  status: ThresholdStatus;
}

interface ThresholdNotificationsProps {
  thresholds: IrreversaThreshold[];
  onViewThreshold?: (id: string) => void;
}

export function ThresholdNotifications({ 
  thresholds, 
  onViewThreshold 
}: ThresholdNotificationsProps) {
  const { t } = useTranslation();

  const notifications = useMemo<ThresholdNotification[]>(() => {
    const result: ThresholdNotification[] = [];
    const now = Date.now();

    thresholds.forEach(threshold => {
      if (threshold.status === 'sealed') return;

      const daysPending = Math.floor(
        (now - new Date(threshold.detection_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Critical: overdue for more than 30 days
      if (daysPending > 30) {
        result.push({
          id: `overdue-${threshold.id}`,
          thresholdId: threshold.id,
          title: threshold.title,
          type: 'overdue',
          severity: 'critical',
          message: t('irreversa.notifications.critical', 'Nécessite une action urgente'),
          daysPending,
          status: threshold.status,
        });
      }
      // High: overdue for more than 14 days
      else if (daysPending > 14) {
        result.push({
          id: `pending-${threshold.id}`,
          thresholdId: threshold.id,
          title: threshold.title,
          type: 'pending',
          severity: 'high',
          message: t('irreversa.notifications.high', 'En attente depuis trop longtemps'),
          daysPending,
          status: threshold.status,
        });
      }
      // Medium: detected but not marked after 7 days
      else if (threshold.status === 'detected' && daysPending > 7) {
        result.push({
          id: `warning-${threshold.id}`,
          thresholdId: threshold.id,
          title: threshold.title,
          type: 'warning',
          severity: 'medium',
          message: t('irreversa.notifications.medium', 'À traiter prochainement'),
          daysPending,
          status: threshold.status,
        });
      }
    });

    // Sort by severity and days pending
    return result.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.daysPending - a.daysPending;
    });
  }, [thresholds, t]);

  if (notifications.length === 0) {
    return null;
  }

  const severityStyles = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-500',
    },
    high: {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      badge: 'bg-orange-500',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-500',
    },
  };

  return (
    <Card className="border-amber-500/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          {t('irreversa.notifications.title', 'Alertes en attente')}
          <Badge variant="destructive" className="ml-2">
            {notifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.slice(0, 5).map(notification => {
          const styles = severityStyles[notification.severity];
          
          return (
            <div
              key={notification.id}
              className={cn(
                'p-3 rounded-lg border flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity',
                styles.bg,
                styles.border
              )}
              onClick={() => onViewThreshold?.(notification.thresholdId)}
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', styles.badge)} />
              
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium text-sm truncate', styles.text)}>
                  {notification.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>
                    {notification.daysPending} {t('common.days', 'jours')} • 
                    {t(`irreversa.status.${notification.status}`)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', styles.text)}
                >
                  {notification.severity === 'critical' && t('irreversa.severity.critical', 'Critique')}
                  {notification.severity === 'high' && t('irreversa.severity.high', 'Urgent')}
                  {notification.severity === 'medium' && t('irreversa.severity.medium', 'Attention')}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}

        {notifications.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            {t('irreversa.notifications.more', '+{{count}} autres alertes', { 
              count: notifications.length - 5 
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
