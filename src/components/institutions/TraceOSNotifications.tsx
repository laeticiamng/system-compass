import { useState, useEffect, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  actionUrl: string;
  date: Date;
  read: boolean;
}

type NotificationFilter = 'all' | Notification['type'];
type ReadFilter = 'all' | 'read' | 'unread';
type SortOrder = 'newest' | 'oldest' | 'title';

const TRACEOS_NOTIFICATION_TYPES: Notification['type'][] = ['pending_reminder', 'old_pending', 'deadline_soon'];

interface TraceOSNotificationsProps {
  decisions: DecisionNodeData[];
  onNavigateToDecision?: (decisionId: string) => void;
}

export function TraceOSNotifications({ decisions, onNavigateToDecision }: TraceOSNotificationsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('traceos_notifications_enabled');
    return stored !== 'false';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

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

  const buildNotificationKey = (decisionId: string, type: Notification['type']) =>
    `traceos://decision/${decisionId}?type=${type}`;

  const buildNotifications = () => {
    if (!notificationsEnabled) {
      return [];
    }

    const allDecisions = flattenDecisions(decisions);
    const now = new Date();
    const newNotifications: Notification[] = [];

    allDecisions.forEach(decision => {
      if (decision.status !== 'pending') return;

      const decisionDate = parseISO(decision.date);
      const daysSince = differenceInDays(now, decisionDate);

      if (daysSince > 30) {
        const actionUrl = buildNotificationKey(decision.id, 'old_pending');
        newNotifications.push({
          id: actionUrl,
          type: 'old_pending',
          title: t('traceOS.notifications.oldPending', 'Décision en attente depuis longtemps'),
          message: t('traceOS.notifications.oldPendingMsg', 'Cette décision est en attente depuis {{days}} jours', { days: daysSince }),
          decisionId: decision.id,
          decisionTitle: decision.title,
          actionUrl,
          date: now,
          read: false
        });
      } else if (daysSince >= 7) {
        const actionUrl = buildNotificationKey(decision.id, 'pending_reminder');
        newNotifications.push({
          id: actionUrl,
          type: 'pending_reminder',
          title: t('traceOS.notifications.pendingReminder', 'Rappel de décision'),
          message: t('traceOS.notifications.pendingReminderMsg', 'Décision en attente depuis {{days}} jours', { days: daysSince }),
          decisionId: decision.id,
          decisionTitle: decision.title,
          actionUrl,
          date: now,
          read: false
        });
      }
    });

    newNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
    return newNotifications;
  };

  // Generate notifications based on decisions
  useEffect(() => {
    let isActive = true;
    const syncNotifications = async () => {
      if (!notificationsEnabled) {
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      const derived = buildNotifications();
      if (!user || derived.length === 0) {
        setNotifications(derived);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const actionUrls = derived.map(notification => notification.actionUrl);
        const { data: existingData, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .in('type', TRACEOS_NOTIFICATION_TYPES.map(type => `traceos_${type}`))
          .in('action_url', actionUrls);

        if (error) {
          console.error('Error loading TraceOS notifications:', error);
        }

        const existingByAction = new Map(
          (existingData ?? []).map(entry => [entry.action_url ?? entry.id, entry])
        );

        const missing = derived.filter(notification => !existingByAction.has(notification.actionUrl));
        if (missing.length > 0) {
          const { data: inserted, error: insertError } = await supabase
            .from('user_notifications')
            .insert(
              missing.map(notification => ({
                user_id: user.id,
                type: `traceos_${notification.type}`,
                title: notification.title,
                message: notification.message,
                priority: notification.type === 'old_pending' ? 'high' : 'medium',
                action_url: notification.actionUrl,
              }))
            )
            .select();

          if (insertError) {
            console.error('Error persisting TraceOS notifications:', insertError);
          } else {
            (inserted ?? []).forEach(entry => {
              if (entry.action_url) {
                existingByAction.set(entry.action_url, entry);
              }
            });
          }
        }

        const merged = derived.map(notification => {
          const persisted = existingByAction.get(notification.actionUrl);
          return {
            ...notification,
            id: persisted?.id ?? notification.id,
            read: persisted?.read ?? false,
            date: persisted ? new Date(persisted.created_at) : notification.date,
          };
        });

        merged.sort((a, b) => b.date.getTime() - a.date.getTime());
        if (isActive) {
          setNotifications(merged);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    syncNotifications();

    return () => {
      isActive = false;
    };
  }, [decisions, notificationsEnabled, t, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    if (user && !id.startsWith('traceos://')) {
      try {
        await supabase
          .from('user_notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating TraceOS notification:', error);
      }
    }

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (user) {
      try {
        const actionUrls = notifications.map(notification => notification.actionUrl);
        if (actionUrls.length > 0) {
          await supabase
            .from('user_notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .in('type', TRACEOS_NOTIFICATION_TYPES.map(type => `traceos_${type}`))
            .in('action_url', actionUrls)
            .eq('read', false);
        }
      } catch (error) {
        console.error('Error updating TraceOS notifications:', error);
      }
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismiss = async (id: string) => {
    if (user && !id.startsWith('traceos://')) {
      try {
        await supabase
          .from('user_notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting TraceOS notification:', error);
      }
    }

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

  const filteredNotifications = useMemo(() => {
    let items = [...notifications];
    if (typeFilter !== 'all') {
      items = items.filter(notification => notification.type === typeFilter);
    }
    if (readFilter === 'read') {
      items = items.filter(notification => notification.read);
    }
    if (readFilter === 'unread') {
      items = items.filter(notification => !notification.read);
    }

    items.sort((a, b) => {
      if (sortOrder === 'title') {
        return a.decisionTitle.localeCompare(b.decisionTitle, 'fr');
      }
      if (sortOrder === 'oldest') {
        return a.date.getTime() - b.date.getTime();
      }
      return b.date.getTime() - a.date.getTime();
    });

    return items;
  }, [notifications, readFilter, sortOrder, typeFilter]);

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
          <div className="grid grid-cols-3 gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t('traceOS.notifications.filterType', 'Type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('traceOS.notifications.filterAll', 'Tous')}</SelectItem>
                <SelectItem value="pending_reminder">{t('traceOS.notifications.pendingReminder', 'Rappel de décision')}</SelectItem>
                <SelectItem value="old_pending">{t('traceOS.notifications.oldPending', 'Décision en attente depuis longtemps')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={(value) => setReadFilter(value as ReadFilter)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t('traceOS.notifications.filterRead', 'Lecture')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('traceOS.notifications.filterAll', 'Tous')}</SelectItem>
                <SelectItem value="unread">{t('traceOS.notifications.filterUnread', 'Non lus')}</SelectItem>
                <SelectItem value="read">{t('traceOS.notifications.filterReadLabel', 'Lus')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t('traceOS.notifications.sort', 'Tri')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('traceOS.notifications.sortNewest', 'Récents')}</SelectItem>
                <SelectItem value="oldest">{t('traceOS.notifications.sortOldest', 'Anciens')}</SelectItem>
                <SelectItem value="title">{t('traceOS.notifications.sortTitle', 'Titre')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-64">
            {!notificationsEnabled ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('traceOS.notifications.disabled', 'Notifications désactivées')}</p>
              </div>
            ) : isLoading && notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('traceOS.notifications.loading', 'Chargement...')}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('traceOS.notifications.empty', 'Aucune notification')}</p>
                <p className="text-xs mt-1">{t('traceOS.notifications.allGood', 'Tout est à jour !')}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {t('traceOS.notifications.noResults', 'Aucune notification pour ce filtre')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
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
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(notification.date, 'dd MMM yyyy', { locale: fr })}
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
