import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Country } from './types';
import { countriesSeed } from './countries-seed';

const listeners = new Set<() => void>();
let countriesCache: Country[] = countriesSeed;
let hasLoaded = false;

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
  // Use local seed data - no database table exists for countries
  // The countries are defined in countries-seed.ts
  if (!hasLoaded) {
    countriesCache = countriesSeed;
    hasLoaded = true;
    notifyListeners();
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
