import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';


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
  const { t } = useTranslation();
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
      // Fetch zones with tensions in a single query using JOIN
      const { data: zonesData, error: zonesError } = await supabase
        .from('latent_zones')
        .select(`
          *,
          latent_zone_tensions (*)
        `)
        .order('updated_at', { ascending: false });

      if (zonesError) throw zonesError;

      // Transform data to match expected structure
      const zonesWithTensions = (zonesData || []).map((zone: any) => ({
        ...zone,
        tensions: zone.latent_zone_tensions || []
      })) as LatentZone[];

      setZones(zonesWithTensions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch zones');
      toast.error(t('toast.error.zones.load', 'Erreur lors du chargement des zones'));
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
      toast.error(t('toast.error.zones.create', 'Erreur lors de la création de la zone'));
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
      toast.error(t('toast.error.zones.statusUpdate', 'Erreur lors de la mise à jour du statut'));
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
      toast.error(t('toast.error.zones.addTension', 'Erreur lors de l\'ajout de la tension'));
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
      toast.error(t('toast.error.delete', 'Erreur lors de la suppression'));
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
      toast.error(t('toast.error.zones.evolve', 'Erreur lors de l\'évolution de la zone'));
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
      toast.error(t('toast.error.zones.delete', 'Erreur lors de la suppression de la zone'));
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
      return [];
    }
  };

  const updateZone = async (zoneId: string, title: string, description?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('latent_zones')
        .update({ 
          title, 
          description: description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', zoneId);

      if (error) throw error;

      setZones(prev => prev.map(z => 
        z.id === zoneId ? { ...z, title, description: description || null, updated_at: new Date().toISOString() } : z
      ));
      return true;
    } catch (err) {
      toast.error(t('toast.error.zones.update', 'Erreur lors de la mise à jour de la zone'));
      return false;
    }
  };

  const duplicateZone = async (zoneId: string): Promise<LatentZone | null> => {
    if (!user) return null;

    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return null;

    try {
      // Create duplicate zone
      const { data, error } = await supabase
        .from('latent_zones')
        .insert({
          user_id: user.id,
          title: `${zone.title} (copie)`,
          description: zone.description,
          status: zone.status
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate tensions
      if (zone.tensions && zone.tensions.length > 0) {
        const tensionInserts = zone.tensions.map(t => ({
          zone_id: data.id,
          tension_type: t.tension_type,
          content: t.content
        }));
        await supabase.from('latent_zone_tensions').insert(tensionInserts);
      }

      // Create history entry
      await supabase.from('latent_zone_history').insert({
        zone_id: data.id,
        action: 'created',
        new_status: zone.status,
        notes: `Dupliquée depuis: ${zone.title}`,
        user_id: user.id
      });

      // Fetch tensions for new zone
      const { data: tensions } = await supabase
        .from('latent_zone_tensions')
        .select('*')
        .eq('zone_id', data.id);

      const newZone = { ...data, tensions: tensions || [] } as LatentZone;
      setZones(prev => [newZone, ...prev]);
      return newZone;
    } catch (err) {
      toast.error(t('toast.error.zones.duplicate', 'Erreur lors de la duplication de la zone'));
      return null;
    }
  };

  const mergeZones = async (
    sourceZoneIds: string[], 
    newTitle: string, 
    newDescription: string, 
    tensionIdsToKeep: string[]
  ): Promise<LatentZone | null> => {
    if (!user || sourceZoneIds.length < 2) return null;

    try {
      // 1. Create the new merged zone
      const { data: newZone, error: createError } = await supabase
        .from('latent_zones')
        .insert({
          user_id: user.id,
          title: newTitle,
          description: newDescription,
          status: 'emergent' as ZoneStatus // Merged zones start as emergent
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Copy selected tensions to the new zone
      const sourceZones = zones.filter(z => sourceZoneIds.includes(z.id));
      const allTensions = sourceZones.flatMap(z => z.tensions || []);
      const tensionsToKeep = allTensions.filter(t => tensionIdsToKeep.includes(t.id));

      if (tensionsToKeep.length > 0) {
        const tensionInserts = tensionsToKeep.map(t => ({
          zone_id: newZone.id,
          tension_type: t.tension_type,
          content: t.content
        }));

        await supabase.from('latent_zone_tensions').insert(tensionInserts);
      }

      // 3. Create history entry for the new zone
      await supabase.from('latent_zone_history').insert({
        zone_id: newZone.id,
        action: 'created',
        new_status: 'emergent',
        notes: `Fusionnée à partir de: ${sourceZones.map(z => z.title).join(', ')}`,
        user_id: user.id
      });

      // 4. Mark source zones as merged (archive them)
      for (const sourceId of sourceZoneIds) {
        await supabase.from('latent_zone_history').insert({
          zone_id: sourceId,
          action: 'merged',
          notes: `Fusionnée dans: ${newTitle}`,
          user_id: user.id
        });

        await supabase
          .from('latent_zones')
          .update({ status: 'dormant' as ZoneStatus })
          .eq('id', sourceId);
      }

      // 5. Fetch the new zone with its tensions
      const { data: tensions } = await supabase
        .from('latent_zone_tensions')
        .select('*')
        .eq('zone_id', newZone.id);

      const mergedZone = { ...newZone, tensions: tensions || [] } as LatentZone;

      // 6. Update local state
      setZones(prev => [
        mergedZone,
        ...prev.map(z => 
          sourceZoneIds.includes(z.id) 
            ? { ...z, status: 'dormant' as ZoneStatus }
            : z
        )
      ]);

      toast.success(t('toast.zones.merged', 'Zones fusionnées avec succès'));
      return mergedZone;
    } catch (err) {
      toast.error(t('toast.error.zones.merge', 'Erreur lors de la fusion des zones'));
      return null;
    }
  };

  return {
    zones,
    loading,
    error,
    isLoggedIn,
    createZone,
    updateZone,
    updateZoneStatus,
    addTension,
    removeTension,
    evolveZone,
    deleteZone,
    duplicateZone,
    getZoneHistory,
    mergeZones,
    refetch: fetchZones
  };
}
