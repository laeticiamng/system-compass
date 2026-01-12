import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  slack_webhook_url: string | null;
  deadline_reminder_days: number;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

type PushStatus = 'idle' | 'unsupported' | 'denied' | 'granted' | 'subscribed' | 'saving' | 'error';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export function useNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState<PushStatus>('idle');
  const [pushError, setPushError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification settings:', error);
      }

      setSettings(data as NotificationSettings | null);
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!user) {
      setPushStatus('idle');
      return;
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setPushStatus('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      setPushStatus(prev => (prev === 'subscribed' ? prev : 'granted'));
      return;
    }

    setPushStatus('idle');
  }, [user]);

  const registerPushSubscription = useCallback(async () => {
    if (!user) return false;

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setPushError('Clé VAPID manquante');
      setPushStatus('error');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      setPushStatus('unsupported');
      return false;
    }

    setPushStatus('saving');
    setPushError(null);

    try {
      const registration = await navigator.serviceWorker.register('/push-sw.js');
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const subscriptionJson = subscription.toJSON();
      if (!subscriptionJson.endpoint || !subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
        throw new Error('Abonnement push invalide');
      }

      // Save push subscription to database
      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth,
        }, { onConflict: 'user_id,endpoint' });

      if (upsertError) {
        console.error('Failed to save push subscription:', upsertError);
        throw new Error('Erreur lors de l\'enregistrement');
      }

      console.log('Push subscription registered:', subscriptionJson.endpoint);
      
      // Also store in localStorage as fallback
      localStorage.setItem('push_subscription', JSON.stringify(subscriptionJson));

      setPushStatus('subscribed');
      setPushError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Failed to register push subscription:', err);
      setPushError(message);
      setPushStatus('error');
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (!settings?.push_enabled) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'granted') return;
    if (pushStatus === 'subscribed' || pushStatus === 'saving') return;

    void registerPushSubscription();
  }, [pushStatus, registerPushSubscription, settings?.push_enabled]);

  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!user) return false;

    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('notification_settings')
          .update(updates)
          .eq('user_id', user.id);

        if (error) throw error;
        setSettings(prev => prev ? { ...prev, ...updates } : null);
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('notification_settings')
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();

        if (error) throw error;
        setSettings(data as NotificationSettings);
      }
      return true;
    } catch (err) {
      console.error('Failed to update notification settings:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, settings]);

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      setPushStatus('unsupported');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const subscribed = await registerPushSubscription();
      if (!subscribed) {
        return false;
      }
      await updateSettings({ push_enabled: true });
      return true;
    }
    setPushStatus('denied');
    return false;
  }, [registerPushSubscription, updateSettings]);

  return {
    settings,
    loading,
    saving,
    pushStatus,
    pushError,
    updateSettings,
    requestPushPermission,
    refetch: fetchSettings,
    isLoggedIn: !!user
  };
}
