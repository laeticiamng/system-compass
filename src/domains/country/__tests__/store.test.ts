import { describe, it, expect, beforeEach } from 'vitest';
import { useCountryStore } from '../store';
import { useNavigationContext } from '../../_shared/navigationStore';

describe('country store', () => {
  beforeEach(() => {
    useCountryStore.setState({ selectedCountries: [] });
    useNavigationContext.setState({ context: null });
  });

  it('adds a country to comparison', () => {
    useCountryStore.getState().addToCompare({ id: 'fr', name: 'France' });
    expect(useCountryStore.getState().selectedCountries).toHaveLength(1);
  });

  it('does not duplicate countries', () => {
    const c = { id: 'fr', name: 'France' };
    useCountryStore.getState().addToCompare(c);
    useCountryStore.getState().addToCompare(c);
    expect(useCountryStore.getState().selectedCountries).toHaveLength(1);
  });

  it('removes a country', () => {
    useCountryStore.getState().addToCompare({ id: 'fr', name: 'France' });
    useCountryStore.getState().addToCompare({ id: 'de', name: 'Germany' });
    useCountryStore.getState().removeFromCompare('fr');
    expect(useCountryStore.getState().selectedCountries.map((c) => c.id)).toEqual(['de']);
  });

  it('clears selection', () => {
    useCountryStore.getState().addToCompare({ id: 'fr', name: 'France' });
    useCountryStore.getState().clearComparison();
    expect(useCountryStore.getState().selectedCountries).toHaveLength(0);
  });

  it('sendToCompare bridges to navigation context', () => {
    useCountryStore.getState().sendToCompare({ id: 'jp', name: 'Japan' });
    const ctx = useNavigationContext.getState().context;
    expect(ctx?.targetModule).toBe('compare');
    expect(ctx?.sourceModule).toBe('country-detail');
  });
});
