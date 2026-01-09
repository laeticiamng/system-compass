import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
  BellRing,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DecisionNodeData } from './DecisionNode';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'pending_reminder' | 'old_pending' | 'deadline_soon';
  title: string;
  message: string;
  decisionId: string;
  decisionTitle: string;
  date: Date;
  read: boolean;
}

interface TraceOSNotificationsProps {
  decisions: DecisionNodeData[];
  onNavigateToDecision?: (decisionId: string) => void;
}

export function TraceOSNotifications({ decisions, onNavigateToDecision }: TraceOSNotificationsProps) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('traceos_notifications_enabled');
    return stored !== 'false';
  });
  const [isOpen, setIsOpen] = useState(false);

  // Flatten decisions to get all including children
  const flattenDecisions = (nodes: DecisionNodeData[]): DecisionNodeData[] => {
    let result: DecisionNodeData[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result = [...result, ...flattenDecisions(node.children)];
      }
    });
    return result;
  };

  // Generate notifications based on decisions
  useEffect(() => {
    if (!notificationsEnabled) {
      setNotifications([]);
      return;
    }

    const allDecisions = flattenDecisions(decisions);
    const now = new Date();
    const newNotifications: Notification[] = [];

    allDecisions.forEach(decision => {
      if (decision.status !== 'pending') return;

      const decisionDate = parseISO(decision.date);
      const daysSince = differenceInDays(now, decisionDate);

      // Notification for pending decisions older than 30 days
      if (daysSince > 30) {
        newNotifications.push({
          id: `old-pending-${decision.id}`,
          type: 'old_pending',
          title: t('traceOS.notifications.oldPending', 'Décision en attente depuis longtemps'),
          message: t('traceOS.notifications.oldPendingMsg', 'Cette décision est en attente depuis {{days}} jours', { days: daysSince }),
          decisionId: decision.id,
          decisionTitle: decision.title,
          date: now,
          read: false
        });
      }
      // Reminder for pending decisions between 7-30 days
      else if (daysSince >= 7) {
        newNotifications.push({
          id: `reminder-${decision.id}`,
          type: 'pending_reminder',
          title: t('traceOS.notifications.pendingReminder', 'Rappel de décision'),
          message: t('traceOS.notifications.pendingReminderMsg', 'Décision en attente depuis {{days}} jours', { days: daysSince }),
          decisionId: decision.id,
          decisionTitle: decision.title,
          date: now,
          read: false
        });
      }
    });

    // Sort by date descending
    newNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
    setNotifications(newNotifications);
  }, [decisions, notificationsEnabled, t]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    onNavigateToDecision?.(notification.decisionId);
    setIsOpen(false);
  };

  const toggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('traceos_notifications_enabled', String(enabled));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'old_pending':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'pending_reminder':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'deadline_soon':
        return <Calendar className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {notificationsEnabled ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          {unreadCount > 0 && notificationsEnabled && (
            <Badge 
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t('traceOS.notifications.title', 'Notifications')}
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                id="notifications-toggle"
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                className="scale-75"
              />
              <Label htmlFor="notifications-toggle" className="text-xs text-muted-foreground">
                {notificationsEnabled ? t('traceOS.notifications.on', 'On') : t('traceOS.notifications.off', 'Off')}
              </Label>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="w-full text-xs h-7"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t('traceOS.notifications.markAllRead', 'Tout marquer comme lu')}
            </Button>
          )}

          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-64">
            {!notificationsEnabled ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('traceOS.notifications.disabled', 'Notifications désactivées')}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('traceOS.notifications.empty', 'Aucune notification')}</p>
                <p className="text-xs mt-1">{t('traceOS.notifications.allGood', 'Tout est à jour !')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.decisionTitle}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
