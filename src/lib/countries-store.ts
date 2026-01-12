import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Country } from './types';
import { countriesSeed } from './countries-seed';

const listeners = new Set<() => void>();
let countriesCache: Country[] = countriesSeed;
let hasLoaded = false;
let loadingPromise: Promise<void> | null = null;

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function getCountriesSnapshot(): Country[] {
  return countriesCache;
}

export function subscribeCountries(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadCountries(): Promise<void> {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('country_id, data, tags, version')
      .order('country_id', { ascending: true });

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      countriesCache = data
        .map(row => {
          const payload = (row.data || {}) as Country;
          return {
            ...payload,
            id: row.country_id || payload.id,
            tags: row.tags || payload.tags,
            version: row.version ?? payload.version,
          };
        })
        .filter(country => country.id);
    }

    hasLoaded = true;
    notifyListeners();
  })();

  try {
    await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

export function getCountryById(id: string): Country | undefined {
  return getCountriesSnapshot().find(country => country.id === id);
}

export function useCountries() {
  const countries = useSyncExternalStore(subscribeCountries, getCountriesSnapshot);
  const [isLoading, setIsLoading] = useState(!hasLoaded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!hasLoaded) {
      setIsLoading(true);
      loadCountries()
        .catch(loadError => {
          if (isMounted) {
            setError(loadError as Error);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    countries,
    isLoading,
    error,
  };
}

export function useCountryById(countryId?: string | null) {
  const { countries, isLoading, error } = useCountries();
  const country = useMemo(() => {
    if (!countryId) return undefined;
    return countries.find(item => item.id === countryId);
  }, [countries, countryId]);

  return {
    country,
    isLoading,
    error,
  };
}
