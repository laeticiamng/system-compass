/**
 * useRealtimeNotifications - Push notifications for real-time alerts
 * Revolutionary: Live alerts for country risks and deadlines
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';


interface RealtimeAlert {
  id: string;
  type: 'risk' | 'deadline' | 'opportunity' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  countryId?: string;
  timestamp: Date;
  isRead: boolean;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check browser support
  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success(t('toast.notifications.enabled', 'Notifications activées !'));
      }
      return result === 'granted';
    } catch {
      return false;
    }
  }, [isSupported]);

  // Show notification
  const showNotification = useCallback((alert: RealtimeAlert) => {
    // Always show in-app toast
    
    if (alert.severity === 'critical') {
      toast.error(alert.title, { description: alert.message });
    } else if (alert.severity === 'warning') {
      toast.warning(alert.title, { description: alert.message });
    } else {
      toast.info(alert.title, { description: alert.message });
    }

    // Browser push notification if permitted
    if (permission === 'granted' && document.hidden) {
      try {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/icons/icon-192x192.png',
          tag: alert.id,
          requireInteraction: alert.severity === 'critical',
        });
      } catch (e) {
        console.warn('Failed to show notification:', e);
      }
    }
  }, [permission]);

  // Add new alert
  const addAlert = useCallback((alert: Omit<RealtimeAlert, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: RealtimeAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isRead: false,
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount(prev => prev + 1);
    showNotification(newAlert);
  }, [showNotification]);

  // Mark as read
  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    setUnreadCount(0);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

    // Listen to country risk updates
    const countriesChannel = supabase
      .channel('country-risks')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'countries',
        },
        (payload) => {
          const country = payload.new as Record<string, unknown>;
          const risks = country.risks as Record<string, unknown> || {};
          
          // Check for critical risks
          if (risks.overall_risk === 'critical') {
            addAlert({
              type: 'risk',
              title: `Alerte Risque: ${country.name}`,
              message: 'Niveau de risque critique détecté pour ce pays.',
              severity: 'critical',
              countryId: country.id as string,
            });
          }
        }
      )
      .subscribe();

    // Listen to deadline reminders from event registrations
    const eventsChannel = supabase
      .channel('event-reminders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_registrations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const event = payload.new as Record<string, unknown>;
          addAlert({
            type: 'deadline',
            title: `Rappel: ${event.event_title}`,
            message: `Événement prévu le ${new Date(event.event_date as string).toLocaleDateString('fr-FR')}`,
            severity: 'info',
          });
        }
      )
      .subscribe();

    return () => {
      countriesChannel.unsubscribe();
      eventsChannel.unsubscribe();
    };
  }, [user?.id, addAlert]);

  // Simulate deadline reminders check
  useEffect(() => {
    if (!user?.id) return;

    const checkDeadlines = async () => {
      // Check for upcoming exit key deadlines
      const { data: exitKeys } = await supabase
        .from('exit_keys_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (exitKeys && exitKeys.length > 0) {
        // Would implement deadline checking logic
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000); // Check hourly

    return () => clearInterval(interval);
  }, [user?.id]);

  return {
    alerts,
    unreadCount,
    isSupported,
    permission,
    requestPermission,
    addAlert,
    markAsRead,
    markAllAsRead,
  };
}
