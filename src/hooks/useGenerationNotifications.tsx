import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GenerationJob {
  id: string;
  country_name: string;
  status: string;
  specificity_score: number | null;
  error_message: string | null;
}

interface BatchStatus {
  id: string;
  name: string;
  status: string;
  completed_countries: number;
  failed_countries: number;
  total_countries: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useGenerationNotifications() {
  const [activeJobs, setActiveJobs] = useState<GenerationJob[]>([]);
  const [activeBatch, setActiveBatch] = useState<BatchStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchActiveData = useCallback(async () => {
    // Fetch active batch
    const { data: batchData } = await supabase
      .from('country_generation_batches')
      .select('*')
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1);

    if (batchData && batchData.length > 0) {
      setActiveBatch(batchData[0] as BatchStatus);
    } else {
      setActiveBatch(null);
    }

    // Fetch recent jobs
    const { data: jobsData } = await supabase
      .from('country_generation_jobs')
      .select('id, country_name, status, specificity_score, error_message')
      .in('status', ['pending', 'running', 'validating'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (jobsData) {
      setActiveJobs(jobsData as GenerationJob[]);
    }
    
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    fetchActiveData();

    // Subscribe to job changes
    const jobsChannel = supabase
      .channel('generation-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'country_generation_jobs'
        },
        (payload) => {
          const newRecord = payload.new as GenerationJob;
          const eventType = payload.eventType;
          setLastUpdate(new Date());

          if (eventType === 'UPDATE' && newRecord) {
            // Show toast for status changes
            if (newRecord.status === 'done') {
              toast.success(`✅ ${newRecord.country_name} généré`, {
                description: `Score: ${newRecord.specificity_score || 'N/A'}/100`
              });
            } else if (newRecord.status === 'failed') {
              toast.error(`❌ ${newRecord.country_name} échoué`, {
                description: newRecord.error_message || 'Erreur inconnue'
              });
            } else if (newRecord.status === 'validating') {
              toast.info(`🔍 ${newRecord.country_name} en validation...`);
            } else if (newRecord.status === 'running') {
              toast.info(`🚀 ${newRecord.country_name} en cours de génération...`);
            }

            // Update active jobs list
            setActiveJobs(prev => {
              if (newRecord.status === 'done' || newRecord.status === 'failed') {
                return prev.filter(j => j.id !== newRecord.id);
              }
              const exists = prev.find(j => j.id === newRecord.id);
              if (exists) {
                return prev.map(j => j.id === newRecord.id ? newRecord : j);
              }
              return [newRecord, ...prev];
            });
          }
        }
      );

    // Track connection status
    jobsChannel.on('system', { event: '*' }, (payload) => {
      console.log('Realtime system event:', payload);
    });

    jobsChannel.subscribe((status) => {
      console.log('Jobs channel status:', status);
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionStatus('error');
      } else if (status === 'CLOSED') {
        setConnectionStatus('disconnected');
      } else {
        setConnectionStatus('connecting');
      }
    });

    // Subscribe to batch changes
    const batchChannel = supabase
      .channel('generation-batches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'country_generation_batches'
        },
        (payload) => {
          const newRecord = payload.new as BatchStatus;
          setLastUpdate(new Date());
          
          if (newRecord) {
            setActiveBatch(prev => {
              if (newRecord.status === 'completed' || newRecord.status === 'failed') {
                if (newRecord.status === 'completed') {
                  toast.success(`🎉 Batch terminé !`, {
                    description: `${newRecord.completed_countries}/${newRecord.total_countries} pays générés`
                  });
                } else {
                  toast.error(`⚠️ Batch terminé avec erreurs`, {
                    description: `${newRecord.completed_countries} succès, ${newRecord.failed_countries} échecs`
                  });
                }
                return null;
              }
              return newRecord;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(batchChannel);
    };
  }, [fetchActiveData]);

  return {
    activeJobs,
    activeBatch,
    connectionStatus,
    lastUpdate,
    refetch: fetchActiveData
  };
}
