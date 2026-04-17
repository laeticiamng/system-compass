/**
 * Country domain store — comparison & saved selections.
 * Cross-domain bridges (e.g. send selection to /compare) go through
 * `_shared/navigationStore`, never by importing another domain directly.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setModuleContext } from '../_shared/navigationStore';

interface CountrySelection {
  id: string;
  name: string;
}

interface CountryState {
  selectedCountries: CountrySelection[];
  addToCompare: (country: CountrySelection) => void;
  removeFromCompare: (id: string) => void;
  clearComparison: () => void;
  /** Bridge: queue selection for the /compare page via shared nav context. */
  sendToCompare: (country: CountrySelection) => void;
}

export const useCountryStore = create<CountryState>()(
  persist(
    (set, get) => ({
      selectedCountries: [],
      addToCompare: (country) =>
        set((s) =>
          s.selectedCountries.some((c) => c.id === country.id)
            ? s
            : { selectedCountries: [...s.selectedCountries, country] }
        ),
      removeFromCompare: (id) =>
        set((s) => ({
          selectedCountries: s.selectedCountries.filter((c) => c.id !== id),
        })),
      clearComparison: () => set({ selectedCountries: [] }),
      sendToCompare: (country) => {
        get().addToCompare(country);
        const ids = get().selectedCountries.map((c) => c.id);
        setModuleContext({
          sourceModule: 'country-detail',
          targetModule: 'compare',
          data: { countries: ids, latestCountry: country },
        });
      },
    }),
    { name: 'domain_country' }
  )
);
