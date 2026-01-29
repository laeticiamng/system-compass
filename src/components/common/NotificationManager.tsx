/**
 * NotificationManager - Centralized notification system
 * Addresses: "Notifications pas assez actionnables" from audit
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'reminder' | 'alert' | 'success' | 'info';
  title: string;
  message: string;
  actionable: boolean;
  actionLabel?: string;
  actionHref?: string;
  actionHandler?: () => void;
  expiresAt?: string;
  createdAt: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Profil incomplet',
    message: 'Complétez votre profil pour des recommandations plus précises.',
    actionable: true,
    actionLabel: 'Compléter',
    actionHref: '/profile-test',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'alert',
    title: 'Mise à jour pays disponible',
    message: 'De nouvelles données sont disponibles pour l\'Allemagne.',
    actionable: true,
    actionLabel: 'Voir les changements',
    actionHref: '/countries/germany',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Analyse terminée',
    message: 'Votre analyse Financial Safety Intel pour le Portugal est prête.',
    actionable: true,
    actionLabel: 'Consulter',
    actionHref: '/financial-safety-intel',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // In a real implementation, this would fetch from database
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    dismissNotification,
  };
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { notifications, markAsRead, dismissNotification } = useNotifications();

  const handleAction = (notification: Notification) => {
    if (notification.actionHandler) {
      notification.actionHandler();
    } else if (notification.actionHref) {
      window.location.href = notification.actionHref;
    }
    markAsRead(notification.id);
    onClose();
  };

  const typeIcons: Record<Notification['type'], React.ReactNode> = {
    reminder: <Calendar className="w-4 h-4 text-amber-500" />,
    alert: <AlertTriangle className="w-4 h-4 text-destructive" />,
    success: <CheckCircle className="w-4 h-4 text-primary" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  const typeColors: Record<Notification['type'], string> = {
    reminder: 'border-l-amber-500',
    alert: 'border-l-destructive',
    success: 'border-l-primary',
    info: 'border-l-blue-500',
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg z-50">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {t('notifications.title', 'Notifications')}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-2">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('notifications.empty', 'Aucune notification')}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-3 rounded-lg border-l-2 mb-2 bg-muted/30 hover:bg-muted/50 transition-colors",
                typeColors[notification.type],
                !notification.read && "bg-primary/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {typeIcons[notification.type]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{notification.title}</span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {notification.actionable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(notification)}
                      className="text-xs px-2 py-1 h-auto"
                    >
                      {notification.actionLabel || t('common.view', 'Voir')}
                    </Button>
                  )}
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="p-1"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const { notifications, markAsRead, dismissNotification } = useNotifications();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          {t('notifications.center', 'Centre de notifications')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('notifications.empty', 'Aucune notification')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={() => markAsRead(notification.id)}
                onDismiss={() => dismissNotification(notification.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onDismiss,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  const typeIcons: Record<Notification['type'], React.ReactNode> = {
    reminder: <Calendar className="w-4 h-4 text-amber-500" />,
    alert: <AlertTriangle className="w-4 h-4 text-destructive" />,
    success: <CheckCircle className="w-4 h-4 text-primary" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };

  const typeColors: Record<Notification['type'], string> = {
    reminder: 'border-l-amber-500',
    alert: 'border-l-destructive',
    success: 'border-l-primary',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-l-2 bg-muted/30",
        typeColors[notification.type],
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {typeIcons[notification.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{notification.title}</span>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {notification.actionable && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                if (notification.actionHref) {
                  window.location.href = notification.actionHref;
                }
                if (notification.actionHandler) {
                  notification.actionHandler();
                }
                onMarkRead();
              }}
            >
              {notification.actionLabel || t('common.view', 'Voir')}
            </Button>
          )}
          
          {!notification.read && (
            <Button variant="ghost" size="sm" onClick={onMarkRead}>
              <Check className="w-4 h-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}