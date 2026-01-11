import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle2,
  Calendar,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePersistedNotifications, PersistedNotification } from '@/hooks/usePersistedNotifications';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const notificationIcons: Record<string, React.ReactNode> = {
  deadline: <Calendar className="w-4 h-4 text-amber-500" />,
  achievement: <Trophy className="w-4 h-4 text-yellow-500" />,
  reminder: <Bell className="w-4 h-4 text-blue-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-gray-400',
};

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = usePersistedNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  const handleMarkAsRead = async (notification: PersistedNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await clearNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">{t('notifications.title', 'Notifications')}</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1 h-7"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-3 h-3" />
              {t('notifications.markAllRead', 'Tout lire')}
            </Button>
          )}
        </div>

        <ScrollArea className="h-72">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="w-10 h-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('notifications.empty', 'Aucune notification')}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {notificationIcons[notification.type] || notificationIcons.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium line-clamp-1",
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <span className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            priorityColors[notification.priority] || priorityColors.low
                          )} />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                              {t('common.new', 'Nouveau')}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => handleDelete(e, notification.id)}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: i18n.language === 'fr' ? fr : undefined,
                          })}
                        </span>
                        {notification.actionUrl && (
                          <Link 
                            to={notification.actionUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-primary hover:underline flex items-center gap-1"
                          >
                            {t('common.view', 'Voir')}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Link to="/settings/notifications" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              {t('notifications.settings', 'Paramètres de notifications')}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
