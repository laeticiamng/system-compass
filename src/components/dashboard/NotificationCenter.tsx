import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, CheckCircle, AlertTriangle, Calendar, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'deadline' | 'reminder' | 'achievement' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
  onClearAll: () => void;
}

const STORAGE_KEY = 'pyramid_notifications_settings';

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClearAll,
}: NotificationCenterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableDeadlineReminders: true,
    enableAchievements: true,
    reminderDays: 3,
  });

  // Load settings
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notification settings');
      }
    }
  }, []);

  // Save settings
  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (!settings.enableNotifications) return [];
    return notifications.filter(n => {
      if (n.type === 'deadline' && !settings.enableDeadlineReminders) return false;
      if (n.type === 'achievement' && !settings.enableAchievements) return false;
      return true;
    });
  }, [notifications, settings]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline': return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'reminder': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'achievement': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info': return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.justNow', 'À l\'instant');
    if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    return t('notifications.daysAgo', { count: days });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          {settings.enableNotifications ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground" />
          )}
          {unreadCount > 0 && settings.enableNotifications && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">{t('notifications.title', 'Notifications')}</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkAllAsRead}>
                {t('notifications.markAllRead', 'Tout lire')}
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-[300px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {t('notifications.empty', 'Aucune notification')}
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-muted">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{notification.title}</span>
                        <span className={cn("w-2 h-2 rounded-full", getPriorityColor(notification.priority))} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClear(notification.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Settings */}
        <div className="border-t p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('notifications.enable', 'Activer les notifications')}</span>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={checked => updateSettings({ ...settings, enableNotifications: checked })}
            />
          </div>
          {settings.enableNotifications && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('notifications.deadlines', 'Rappels deadlines')}</span>
                <Switch
                  checked={settings.enableDeadlineReminders}
                  onCheckedChange={checked => updateSettings({ ...settings, enableDeadlineReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('notifications.achievements', 'Achievements')}</span>
                <Switch
                  checked={settings.enableAchievements}
                  onCheckedChange={checked => updateSettings({ ...settings, enableAchievements: checked })}
                />
              </div>
            </>
          )}
        </div>

        {/* Clear all */}
        {filteredNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground"
              onClick={onClearAll}
            >
              {t('notifications.clearAll', 'Effacer toutes les notifications')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
