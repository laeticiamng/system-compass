import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type WebhookEvent = 'decision_created' | 'decision_updated' | 'decision_validated' | 'decision_abandoned';
export type WebhookPlatform = 'slack' | 'teams' | 'notion' | 'custom';

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  platform: WebhookPlatform;
  events: WebhookEvent[];
  headers: Record<string, string>;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useTraceOSWebhooks() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = useCallback(async () => {
    if (!user) {
      setWebhooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traceos_webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []).map(w => ({
        ...w,
        platform: w.platform as WebhookPlatform,
        events: (w.events as unknown as WebhookEvent[]) || [],
        headers: (w.headers as Record<string, string>) || {},
      }));
      
      setWebhooks(typedData);
    } catch (err) {
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createWebhook = useCallback(async (
    name: string,
    url: string,
    platform: WebhookPlatform,
    events: WebhookEvent[],
    headers?: Record<string, string>
  ): Promise<Webhook | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('traceos_webhooks')
        .insert({
          user_id: user.id,
          name,
          url,
          platform,
          events: events as unknown as string[],
          headers: headers || {},
        })
        .select()
        .single();

      if (error) throw error;

      await fetchWebhooks();
      toast.success('Webhook créé avec succès');
      return {
        ...data,
        platform: data.platform as WebhookPlatform,
        events: (data.events as unknown as WebhookEvent[]) || [],
        headers: (data.headers as Record<string, string>) || {},
      };
    } catch (err) {
      console.error('Error creating webhook:', err);
      toast.error('Erreur lors de la création du webhook');
      return null;
    }
  }, [user, fetchWebhooks]);

  const updateWebhook = useCallback(async (
    webhookId: string,
    updates: Partial<Pick<Webhook, 'name' | 'url' | 'platform' | 'events' | 'headers' | 'is_active'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.url !== undefined) updateData.url = updates.url;
      if (updates.platform !== undefined) updateData.platform = updates.platform;
      if (updates.events !== undefined) updateData.events = updates.events;
      if (updates.headers !== undefined) updateData.headers = updates.headers;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { error } = await supabase
        .from('traceos_webhooks')
        .update(updateData)
        .eq('id', webhookId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWebhooks();
      toast.success('Webhook mis à jour');
      return true;
    } catch (err) {
      console.error('Error updating webhook:', err);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, [user, fetchWebhooks]);

  const deleteWebhook = useCallback(async (webhookId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('traceos_webhooks')
        .delete()
        .eq('id', webhookId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWebhooks();
      toast.success('Webhook supprimé');
      return true;
    } catch (err) {
      console.error('Error deleting webhook:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [user, fetchWebhooks]);

  const testWebhook = useCallback(async (webhookId: string): Promise<boolean> => {
    if (!user) return false;

    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return false;

    try {
      // Call the edge function to test the webhook
      const { error } = await supabase.functions.invoke('traceos-webhooks', {
        body: {
          webhookId,
          event: 'test',
          payload: {
            type: 'test',
            message: 'Test de webhook TraceOS',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      toast.success('Test de webhook envoyé');
      return true;
    } catch (err) {
      console.error('Error testing webhook:', err);
      toast.error('Erreur lors du test du webhook');
      return false;
    }
  }, [user, webhooks]);

  // Trigger webhooks for a specific event
  const triggerWebhooksForEvent = useCallback(async (
    event: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke('traceos-webhooks', {
        body: {
          userId: user.id,
          event,
          payload,
        },
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error triggering webhooks:', err);
      return false;
    }
  }, [user]);

  // Get webhooks for a specific event
  const getWebhooksForEvent = useCallback((event: WebhookEvent): Webhook[] => {
    return webhooks.filter(w => w.is_active && w.events.includes(event));
  }, [webhooks]);

  // Check if there are active webhooks for an event
  const hasWebhooksForEvent = useCallback((event: WebhookEvent): boolean => {
    return webhooks.some(w => w.is_active && w.events.includes(event));
  }, [webhooks]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  return {
    webhooks,
    loading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    triggerWebhooksForEvent,
    getWebhooksForEvent,
    hasWebhooksForEvent,
    refreshWebhooks: fetchWebhooks,
  };
}

// Utility to trigger webhooks for an event (standalone function)
export async function triggerWebhooks(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
) {
  try {
    await supabase.functions.invoke('traceos-webhooks', {
      body: {
        userId,
        event,
        payload,
      },
    });
  } catch (err) {
    console.error('Error triggering webhooks:', err);
  }
}
