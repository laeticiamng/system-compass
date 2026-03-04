import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GeopoliticalAlertAI {
  id: string;
  region: string;
  title: string;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
  countries_affected: string[];
  country_codes: string[];
  conflict_type: string | null;
  impact_assessment: string | null;
  citations: string[];
  ai_model: string | null;
  ai_confidence: number | null;
  is_active: boolean;
  detected_at: string;
  created_at: string;
}

export function useGeopoliticalAlerts() {
  const [alerts, setAlerts] = useState<GeopoliticalAlertAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('geopolitical_alerts_ai')
      .select('*')
      .eq('is_active', true)
      .order('detected_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAlerts((data as unknown as GeopoliticalAlertAI[]) || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const triggerScan = useCallback(async () => {
    setScanning(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('geopolitical-scanner');
      if (fnError) throw fnError;
      if (data?.success) {
        toast.success(`${data.inserted} alertes géopolitiques détectées par l'IA`);
        await fetchAlerts();
      } else {
        throw new Error(data?.error || 'Scan failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur du scanner';
      toast.error('Échec du scan géopolitique', { description: msg });
      setError(msg);
    } finally {
      setScanning(false);
    }
  }, [fetchAlerts]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('geo-alerts-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'geopolitical_alerts_ai',
      }, (payload) => {
        const newAlert = payload.new as unknown as GeopoliticalAlertAI;
        if (newAlert.is_active) {
          setAlerts(prev => [newAlert, ...prev]);
          if (newAlert.severity === 'critical') {
            toast.error(`🔴 ${newAlert.title}`, { description: newAlert.region });
          }
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  return { alerts, loading, scanning, error, triggerScan, refetch: fetchAlerts };
}
