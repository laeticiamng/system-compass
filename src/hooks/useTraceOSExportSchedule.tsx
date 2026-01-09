import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type ExportFrequency = 'daily' | 'weekly' | 'monthly';

interface ExportSchedule {
  id: string;
  user_id: string;
  frequency: ExportFrequency;
  last_export_at: string | null;
  next_export_at: string | null;
  is_active: boolean;
  include_history: boolean;
  created_at: string;
  updated_at: string;
}

interface ExportFile {
  name: string;
  created_at: string;
  size: number;
}

export function useTraceOSExportSchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ExportSchedule | null>(null);
  const [exports, setExports] = useState<ExportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchSchedule = useCallback(async () => {
    if (!user) {
      setSchedule(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('traceos_export_schedules')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSchedule(data as ExportSchedule | null);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchExports = useCallback(async () => {
    if (!user) {
      setExports([]);
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('traceos-exports')
        .list(user.id, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      
      setExports(
        (data || []).map(f => ({
          name: f.name,
          created_at: f.created_at || '',
          size: f.metadata?.size || 0,
        }))
      );
    } catch (err) {
      console.error('Error fetching exports:', err);
    }
  }, [user]);

  const createOrUpdateSchedule = useCallback(async (
    frequency: ExportFrequency,
    includeHistory: boolean = true
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const now = new Date();
      let nextExport = new Date(now);
      
      switch (frequency) {
        case 'daily':
          nextExport.setDate(nextExport.getDate() + 1);
          break;
        case 'weekly':
          nextExport.setDate(nextExport.getDate() + 7);
          break;
        case 'monthly':
          nextExport.setMonth(nextExport.getMonth() + 1);
          break;
      }

      if (schedule) {
        const { error } = await supabase
          .from('traceos_export_schedules')
          .update({
            frequency,
            include_history: includeHistory,
            next_export_at: nextExport.toISOString(),
            is_active: true,
          })
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('traceos_export_schedules')
          .insert([{
            user_id: user.id,
            frequency,
            include_history: includeHistory,
            next_export_at: nextExport.toISOString(),
          }]);

        if (error) throw error;
      }

      await fetchSchedule();
      toast.success('Planification d\'export mise à jour');
      return true;
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  }, [user, schedule, fetchSchedule]);

  const toggleSchedule = useCallback(async (): Promise<boolean> => {
    if (!user || !schedule) return false;

    try {
      const { error } = await supabase
        .from('traceos_export_schedules')
        .update({ is_active: !schedule.is_active })
        .eq('id', schedule.id);

      if (error) throw error;

      await fetchSchedule();
      toast.success(schedule.is_active ? 'Export automatique désactivé' : 'Export automatique activé');
      return true;
    } catch (err) {
      console.error('Error toggling schedule:', err);
      toast.error('Erreur');
      return false;
    }
  }, [user, schedule, fetchSchedule]);

  const triggerManualExport = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('traceos-auto-export', {
        body: { userId: user.id, scheduled: false },
      });

      if (error) throw error;

      await fetchExports();
      toast.success(`Export créé: ${data.summary.totalDecisions} décisions`);
      return true;
    } catch (err) {
      console.error('Error exporting:', err);
      toast.error('Erreur lors de l\'export');
      return false;
    } finally {
      setExporting(false);
    }
  }, [user, fetchExports]);

  const downloadExport = useCallback(async (filename: string): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from('traceos-exports')
        .download(`${user.id}/${filename}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
      toast.error('Erreur lors du téléchargement');
    }
  }, [user]);

  const deleteExport = useCallback(async (filename: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from('traceos-exports')
        .remove([`${user.id}/${filename}`]);

      if (error) throw error;

      await fetchExports();
      toast.success('Export supprimé');
      return true;
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [user, fetchExports]);

  useEffect(() => {
    fetchSchedule();
    fetchExports();
  }, [fetchSchedule, fetchExports]);

  return {
    schedule,
    exports,
    loading,
    exporting,
    createOrUpdateSchedule,
    toggleSchedule,
    triggerManualExport,
    downloadExport,
    deleteExport,
    refreshExports: fetchExports,
  };
}
