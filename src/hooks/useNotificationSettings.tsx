import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  getPushSubscription,
  isPushSupported,
  serializeSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/pushNotifications';

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

export function useNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const upsertPushSubscription = useCallback(async (subscription: PushSubscription) => {
    if (!user) return false;
    const serialized = serializeSubscription(subscription);
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: serialized.endpoint,
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth,
        expires_at: serialized.expirationTime
          ? new Date(serialized.expirationTime).toISOString()
          : null,
        revoked_at: null,
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Failed to upsert push subscription:', error);
      return false;
    }
    return true;
  }, [user]);

  const revokePushSubscription = useCallback(async (subscription: PushSubscription | null) => {
    if (!user || !subscription) return;
    const serialized = serializeSubscription(subscription);
    const { error } = await supabase
      .from('push_subscriptions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('endpoint', serialized.endpoint);

    if (error) {
      console.error('Failed to revoke push subscription:', error);
    }
  }, [user]);

  const ensurePushSubscription = useCallback(async () => {
    if (!user || !isPushSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    let subscription = await getPushSubscription();
    if (subscription?.expirationTime && subscription.expirationTime <= Date.now()) {
      await subscription.unsubscribe();
      subscription = null;
    }

    if (!subscription) {
      subscription = await subscribeToPush();
    }

    if (!subscription) return false;
    return upsertPushSubscription(subscription);
  }, [upsertPushSubscription, user]);

  const enablePushNotifications = useCallback(async () => {
    if (!isPushSupported()) {
      console.log('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      await updateSettings({ push_enabled: false });
      return false;
    }

    const synced = await ensurePushSubscription();
    if (synced) {
      await updateSettings({ push_enabled: true });
    }
    return synced;
  }, [ensurePushSubscription, updateSettings]);

  const disablePushNotifications = useCallback(async () => {
    if (!isPushSupported()) {
      await updateSettings({ push_enabled: false });
      return false;
    }

    const subscription = await unsubscribeFromPush();
    await revokePushSubscription(subscription);
    await updateSettings({ push_enabled: false });
    return true;
  }, [revokePushSubscription, updateSettings]);

  useEffect(() => {
    if (settings?.push_enabled) {
      ensurePushSubscription();
    }
  }, [ensurePushSubscription, settings?.push_enabled]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        ensurePushSubscription();
      }
    };
    navigator.serviceWorker.addEventListener('message', listener);
    return () => navigator.serviceWorker.removeEventListener('message', listener);
  }, [ensurePushSubscription]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    enablePushNotifications,
    disablePushNotifications,
    refetch: fetchSettings,
    isLoggedIn: !!user
  };
}
