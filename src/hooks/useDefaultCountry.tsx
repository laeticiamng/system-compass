import { useState, useEffect, useCallback } from 'react';
import { useCountries } from '@/lib/countries-data';

const STORAGE_KEY = 'pyramid-compass-default-country';
const DEFAULT_COUNTRY_ID = 'nigeria'; // Nigeria par défaut

export function useDefaultCountry() {
  const { countries } = useCountries();
  const [defaultCountryId, setDefaultCountryId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_COUNTRY_ID;
    }
    return DEFAULT_COUNTRY_ID;
  });

  // Sauvegarder dans localStorage quand ça change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, defaultCountryId);
    }
  }, [defaultCountryId]);

  const setCountry = useCallback((countryId: string) => {
    // Vérifier que le pays existe
    const exists = countries.some(c => c.id === countryId);
    if (exists) {
      setDefaultCountryId(countryId);
    }
  }, [countries]);

  const getDefaultCountry = useCallback(() => {
    return countries.find(c => c.id === defaultCountryId) || countries.find(c => c.id === DEFAULT_COUNTRY_ID);
  }, [countries, defaultCountryId]);

  return {
    defaultCountryId,
    setDefaultCountry: setCountry,
    getDefaultCountry,
  };
}
