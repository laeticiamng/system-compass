/**
 * usePushNotifications - Browser push notification management
 * Handles permission, subscription, and notification delivery
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
}

export function usePushNotifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
  });

  // Check browser support
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error(t('push.notSupported', 'Notifications non supportées'), {
        description: t('push.notSupportedDesc', 'Votre navigateur ne supporte pas les notifications push.'),
      });
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        toast.success(t('push.enabled', 'Notifications activées'), {
          description: t('push.enabledDesc', 'Vous recevrez désormais les notifications importantes.'),
        });
        return true;
      } else if (permission === 'denied') {
        toast.error(t('push.denied', 'Notifications bloquées'), {
          description: t('push.deniedDesc', 'Vous pouvez les réactiver dans les paramètres du navigateur.'),
        });
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      toast.error(t('push.loginRequired', 'Connexion requise'), {
        description: t('push.loginRequiredDesc', 'Connectez-vous pour activer les notifications.'),
      });
      return false;
    }

    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // For now, we store subscription status in user preferences
      // In production, you'd use a service worker and push subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: 'browser-notification',
          p256dh: 'placeholder-key',
          auth: 'placeholder-auth',
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) throw error;

      setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false }));
      toast.success(t('push.enabled', 'Notifications activées'));
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      toast.error(t('push.activationError', 'Erreur lors de l\'activation des notifications'));
      return false;
    }
  }, [user?.id, state.permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', 'browser-notification');

      if (error) throw error;

      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
      toast.success(t('push.disabled', 'Notifications désactivées'));
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user?.id]);

  // Show a local notification
  const showNotification = useCallback(
    async (payload: NotificationPayload): Promise<boolean> => {
      if (state.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      try {
        const notification = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
          data: payload.data,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          if (payload.data?.url) {
            window.location.href = payload.data.url as string;
          }
        };

        return true;
      } catch (error) {
        console.error('Failed to show notification:', error);
        return false;
      }
    },
    [state.permission]
  );

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', 'browser-notification')
          .maybeSingle();

        setState((prev) => ({ ...prev, isSubscribed: !!data }));
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    };

    checkSubscription();
  }, [user?.id]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Utility function to send notifications for specific events
export function useEventNotifications() {
  const { showNotification } = usePushNotifications();

  const notifyEventReminder = useCallback(
    (eventTitle: string, _eventDate?: string) => {
      showNotification({
        title: '📅 Rappel d\'événement',
        body: `${eventTitle} commence dans 1 heure`,
        tag: 'event-reminder',
        data: { url: '/community' },
      });
    },
    [showNotification]
  );

  const notifyNewMessage = useCallback(
    (senderName: string) => {
      showNotification({
        title: '💬 Nouveau message',
        body: `${senderName} vous a envoyé un message`,
        tag: 'new-message',
        data: { url: '/dashboard' },
      });
    },
    [showNotification]
  );

  const notifyDeadline = useCallback(
    (actionName: string, daysRemaining: number) => {
      showNotification({
        title: '⏰ Échéance proche',
        body: `"${actionName}" expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`,
        tag: 'deadline',
        data: { url: '/dashboard' },
      });
    },
    [showNotification]
  );

  return {
    notifyEventReminder,
    notifyNewMessage,
    notifyDeadline,
  };
}
