import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  serializePushSubscription,
  subscribeToPushNotifications,
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

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        const subscription = await subscribeToPushNotifications();
        const payload = serializePushSubscription(subscription);

        const { error } = await supabase.functions.invoke('push-subscribe', {
          body: {
            subscription: payload,
            userAgent: navigator.userAgent,
          },
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Failed to register push subscription:', error);
        return false;
      }
      await updateSettings({ push_enabled: true });
      return true;
    }
    return false;
  }, [updateSettings]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    requestPushPermission,
    refetch: fetchSettings,
    isLoggedIn: !!user
  };
}
