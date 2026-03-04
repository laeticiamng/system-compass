import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Country, PyramidType } from './types';
import { countriesSeed } from './countries-seed';
import { supabase } from '@/integrations/supabase/client';

const listeners = new Set<() => void>();
let countriesCache: Country[] = countriesSeed; // Start with seed data immediately
let hasLoaded = false;
let isUpgrading = false;
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
  if (hasLoaded || isUpgrading) return;
  isUpgrading = true;

  try {
    // Seed data is already in cache, try to upgrade from DB
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (!error && data && data.length > 0) {
      countriesCache = data.map(transformDbCountry);
      dataVersion = Math.max(...data.map(d => (d as Record<string, unknown>).data_version as number || 1));
    }
    // If DB fails or is empty, seed data is already in cache
  } catch (err) {
    console.warn('DB upgrade failed, using seed data:', err);
  }

  hasLoaded = true;
  isUpgrading = false;
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
  const isLoading = false; // Never show loading — seed data is instant
  const error = null as Error | null;

  useEffect(() => {
    if (!hasLoaded) {
      loadCountries().catch(e => console.warn('Countries load error:', e));
    }
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
