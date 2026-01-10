import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type ZoneStatus = 'dormant' | 'emergent' | 'fragile' | 'blocked';
export type TensionType = 'nourishing' | 'blocking' | 'fragility' | 'premature_crushing';
export type HistoryAction = 'created' | 'status_changed' | 'transformed' | 'merged' | 'archived' | 'put_to_sleep';

export interface LatentZone {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ZoneStatus;
  created_at: string;
  updated_at: string;
  tensions?: ZoneTension[];
}

export interface ZoneTension {
  id: string;
  zone_id: string;
  tension_type: TensionType;
  content: string;
  created_at: string;
}

export interface ZoneHistory {
  id: string;
  zone_id: string;
  action: HistoryAction;
  previous_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
}

export function useLatentZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState<LatentZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  const fetchZones = useCallback(async () => {
    if (!user) {
      setZones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: zonesData, error: zonesError } = await supabase
        .from('latent_zones')
        .select('*')
        .order('updated_at', { ascending: false });

      if (zonesError) throw zonesError;

      // Fetch tensions for each zone
      const zonesWithTensions = await Promise.all(
        (zonesData || []).map(async (zone) => {
          const { data: tensions } = await supabase
            .from('latent_zone_tensions')
            .select('*')
            .eq('zone_id', zone.id);
          return { ...zone, tensions: tensions || [] } as LatentZone;
        })
      );

      setZones(zonesWithTensions);
      setError(null);
    } catch (err) {
      console.error('Error fetching latent zones:', err);
      setError('Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const createZone = async (title: string, description?: string): Promise<LatentZone | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('latent_zones')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          status: 'dormant' as ZoneStatus
        })
        .select()
        .single();

      if (error) throw error;

      // Create history entry
      await supabase.from('latent_zone_history').insert({
        zone_id: data.id,
        action: 'created',
        new_status: 'dormant',
        user_id: user.id
      });

      const newZone = { ...data, tensions: [] } as LatentZone;
      setZones(prev => [newZone, ...prev]);
      return newZone;
    } catch (err) {
      console.error('Error creating zone:', err);
      toast.error('Erreur lors de la création de la zone');
      return null;
    }
  };

  const updateZoneStatus = async (zoneId: string, newStatus: ZoneStatus, notes?: string) => {
    if (!user) return false;

    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return false;

    try {
      const { error } = await supabase
        .from('latent_zones')
        .update({ status: newStatus })
        .eq('id', zoneId);

      if (error) throw error;

      // Create history entry
      await supabase.from('latent_zone_history').insert({
        zone_id: zoneId,
        action: 'status_changed',
        previous_status: zone.status,
        new_status: newStatus,
        notes,
        user_id: user.id
      });

      setZones(prev => prev.map(z => 
        z.id === zoneId ? { ...z, status: newStatus } : z
      ));
      return true;
    } catch (err) {
      console.error('Error updating zone status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  const addTension = async (zoneId: string, tensionType: TensionType, content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('latent_zone_tensions')
        .insert({
          zone_id: zoneId,
          tension_type: tensionType,
          content
        })
        .select()
        .single();

      if (error) throw error;

      setZones(prev => prev.map(z => 
        z.id === zoneId 
          ? { ...z, tensions: [...(z.tensions || []), data as ZoneTension] }
          : z
      ));
      return data as ZoneTension;
    } catch (err) {
      console.error('Error adding tension:', err);
      toast.error('Erreur lors de l\'ajout de la tension');
      return null;
    }
  };

  const removeTension = async (tensionId: string, zoneId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('latent_zone_tensions')
        .delete()
        .eq('id', tensionId);

      if (error) throw error;

      setZones(prev => prev.map(z => 
        z.id === zoneId 
          ? { ...z, tensions: (z.tensions || []).filter(t => t.id !== tensionId) }
          : z
      ));
      return true;
    } catch (err) {
      console.error('Error removing tension:', err);
      return false;
    }
  };

  const evolveZone = async (zoneId: string, action: HistoryAction, notes?: string) => {
    if (!user) return false;

    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return false;

    try {
      // Create history entry for the evolution
      await supabase.from('latent_zone_history').insert({
        zone_id: zoneId,
        action,
        previous_status: zone.status,
        notes,
        user_id: user.id
      });

      // If archiving or putting to sleep, we might want to update status
      if (action === 'archived' || action === 'put_to_sleep') {
        await supabase
          .from('latent_zones')
          .update({ status: 'dormant' as ZoneStatus })
          .eq('id', zoneId);
        
        setZones(prev => prev.map(z => 
          z.id === zoneId ? { ...z, status: 'dormant' as ZoneStatus } : z
        ));
      }

      return true;
    } catch (err) {
      console.error('Error evolving zone:', err);
      toast.error('Erreur lors de l\'évolution de la zone');
      return false;
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('latent_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      setZones(prev => prev.filter(z => z.id !== zoneId));
      return true;
    } catch (err) {
      console.error('Error deleting zone:', err);
      toast.error('Erreur lors de la suppression de la zone');
      return false;
    }
  };

  const getZoneHistory = async (zoneId: string): Promise<ZoneHistory[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('latent_zone_history')
        .select('*')
        .eq('zone_id', zoneId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ZoneHistory[];
    } catch (err) {
      console.error('Error fetching zone history:', err);
      return [];
    }
  };

  return {
    zones,
    loading,
    error,
    isLoggedIn,
    createZone,
    updateZoneStatus,
    addTension,
    removeTension,
    evolveZone,
    deleteZone,
    getZoneHistory,
    refetch: fetchZones
  };
}
