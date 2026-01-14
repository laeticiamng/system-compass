import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Country, PyramidType } from './types';
import { countriesSeed } from './countries-seed';
import { supabase } from '@/integrations/supabase/client';

const listeners = new Set<() => void>();
let countriesCache: Country[] = [];
let hasLoaded = false;
let dataVersion = 0;

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

// Transform database row to Country type
function transformDbCountry(row: Record<string, unknown>): Country {
  return {
    id: row.id as string,
    name: row.name as string,
    nameLocal: row.name_local as string,
    iso2: row.iso2 as string,
    region: row.region as string,
    pyramidType: row.pyramid_type as PyramidType,
    ruleOfGold: row.rule_of_gold as string,
    pyramid: row.pyramid as Country['pyramid'],
    risks: row.risks as Country['risks'],
    whoWins: row.who_wins as string[],
    whoLoses: row.who_loses as string[],
    playbook: row.playbook as Country['playbook'],
    snapshot: row.snapshot as Country['snapshot'],
    visa: row.visa as Country['visa'],
    costOfLiving: row.cost_of_living as Country['costOfLiving'],
    qualityOfLife: row.quality_of_life as Country['qualityOfLife'],
    naturalRisks: row.natural_risks as Country['naturalRisks'],
    healthcare: row.healthcare as Country['healthcare'],
    lgbtqRights: row.lgbtq_rights as Country['lgbtqRights'],
    positivePoints: row.positive_points as Country['positivePoints'],
    lastUpdated: row.last_updated as string,
    sources: row.sources as string[],
  };
}

export async function loadCountries(): Promise<void> {
  if (hasLoaded) return;

  try {
    // Try to load from database first
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Failed to load countries from database, using seed data:', error.message);
      countriesCache = countriesSeed;
    } else if (data && data.length > 0) {
      countriesCache = data.map(transformDbCountry);
      dataVersion = Math.max(...data.map(d => (d as Record<string, unknown>).data_version as number || 1));
      console.log(`Loaded ${data.length} countries from database (version ${dataVersion})`);
    } else {
      // Database empty, use seed data
      console.log('Database empty, using seed data');
      countriesCache = countriesSeed;
    }
  } catch (err) {
    console.warn('Error loading countries, falling back to seed:', err);
    countriesCache = countriesSeed;
  }

  hasLoaded = true;
  notifyListeners();
}

export function getCountryById(id: string): Country | undefined {
  return getCountriesSnapshot().find(country => country.id === id);
}

export function getDataVersion(): number {
  return dataVersion;
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
