import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import {
  GovernanceStakeholder,
  GovernanceRedFlag,
  GovernanceSchema,
  GovernanceStakeholderSchema,
} from '@/lib/schemas/governance';

interface GovernanceInput {
  map?: GovernanceStakeholder[];
  notes?: string;
}

const DEFAULT_GOVERNANCE = {
  map: [],
  notes: '',
};

const deriveRedFlags = (map: GovernanceStakeholder[]): GovernanceRedFlag[] => {
  const redFlags: GovernanceRedFlag[] = [];
  const influentialCount = map.filter((stakeholder) => stakeholder.level === 'influential').length;
  const lowTransparencyCount = map.filter(
    (stakeholder) => stakeholder.reliability === 'unknown' || stakeholder.reliability === 'low'
  ).length;

  if (influentialCount === 1 && map.length > 1) {
    redFlags.push({
      id: 'single-intermediary',
      label: 'Dépendance à un seul intermédiaire',
      severity: 'high',
    });
  }

  if (map.length > 0 && lowTransparencyCount > map.length / 2) {
    redFlags.push({
      id: 'high-opacity',
      label: 'Opacité élevée (fiabilité non vérifiée)',
      severity: 'medium',
    });
  }

  if (map.some((stakeholder) => stakeholder.level === 'blocker' || stakeholder.power === 'block')) {
    redFlags.push({
      id: 'blocking-actors',
      label: 'Présence d\'acteurs pouvant bloquer le projet',
      severity: 'high',
    });
  }

  return redFlags;
};

const parseGovernanceMap = (data: unknown): GovernanceStakeholder[] => {
  const result = GovernanceStakeholderSchema.array().safeParse(data);
  return result.success ? result.data : [];
};

export function useGovernance(countryId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [governanceMap, setGovernanceMap] = useState<GovernanceStakeholder[]>(DEFAULT_GOVERNANCE.map);
  const [notes, setNotes] = useState<string>(DEFAULT_GOVERNANCE.notes);

  const { data, isLoading } = useQuery({
    queryKey: ['user-governance', countryId, user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_GOVERNANCE;

      const { data: row, error } = await supabase
        .from('user_governance_notes')
        .select('governance_map, notes')
        .eq('country_id', countryId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!row) return DEFAULT_GOVERNANCE;

      const parsed = GovernanceSchema.safeParse({
        map: parseGovernanceMap(row.governance_map),
        notes: row.notes ?? '',
        redFlags: [],
      });

      if (!parsed.success) {
        return DEFAULT_GOVERNANCE;
      }

      return {
        map: parsed.data.map,
        notes: parsed.data.notes ?? '',
      };
    },
    enabled: !!countryId && !!user,
  });

  useEffect(() => {
    if (data) {
      setGovernanceMap(data.map);
      setNotes(data.notes ?? '');
    }
  }, [data]);

  const saveGovernance = useMutation({
    mutationFn: async (updates: GovernanceInput) => {
      if (!user) throw new Error('Not authenticated');

      const nextMap = updates.map ?? governanceMap;
      const nextNotes = updates.notes ?? notes;

      const { data: saved, error } = await supabase
        .from('user_governance_notes')
        .upsert(
          {
            user_id: user.id,
            country_id: countryId,
            governance_map: nextMap,
            notes: nextNotes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,country_id' }
        )
        .select('governance_map, notes')
        .single();

      if (error) throw error;

      return {
        map: parseGovernanceMap(saved?.governance_map),
        notes: saved?.notes ?? '',
      };
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['user-governance', countryId, user?.id] });
      if (saved) {
        setGovernanceMap(saved.map);
        setNotes(saved.notes ?? '');
      }
    },
  });

  const updateGovernance = (updates: GovernanceInput) => {
    if (updates.map) {
      setGovernanceMap(updates.map);
    }
    if (updates.notes !== undefined) {
      setNotes(updates.notes);
    }
    if (!user) return;
    saveGovernance.mutate(updates);
  };

  const redFlags = useMemo(() => deriveRedFlags(governanceMap), [governanceMap]);

  return {
    governanceMap,
    notes,
    redFlags,
    isLoading,
    updateGovernance,
    isSaving: saveGovernance.isPending,
  };
}
