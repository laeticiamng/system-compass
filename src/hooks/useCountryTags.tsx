import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CountryTags {
  country_id: string;
  network_weight: number;
  diploma_weight: number;
  risk_tolerance: number;
  admin_speed: number;
  authority_verticality: number;
  mental_friction: number;
  social_mobility: number;
  predictability: number;
  reputation_requirement: number;
  compliance_sensitivity: number;
}

export function useCountryTags(countryIds?: string[]) {
  const [tags, setTags] = useState<CountryTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      setError(null);

      let query = supabase.from('country_tags').select('*');

      if (countryIds && countryIds.length > 0) {
        query = query.in('country_id', countryIds);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setTags([]);
      } else {
        setTags((data || []) as CountryTags[]);
      }

      setLoading(false);
    }

    fetchTags();
  }, [countryIds?.join(',')]);

  return { tags, loading, error };
}

export function useCountryTagById(countryId: string) {
  const [tag, setTag] = useState<CountryTags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTag() {
      if (!countryId) {
        setTag(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('country_tags')
        .select('*')
        .eq('country_id', countryId)
        .maybeSingle();

      if (!error && data) {
        setTag(data as CountryTags);
      } else {
        setTag(null);
      }

      setLoading(false);
    }

    fetchTag();
  }, [countryId]);

  return { tag, loading };
}
