import { describe, it, expect, beforeEach } from 'vitest';
import { useExitKeysBridge } from '../store';
import { useNavigationContext } from '../../_shared/navigationStore';

describe('exit-keys bridge store', () => {
  beforeEach(() => {
    useNavigationContext.setState({ context: null });
  });

  it('sendToDashboard forwards exit key + country', () => {
    useExitKeysBridge.getState().sendToDashboard('key-1', 'fr');
    const ctx = useNavigationContext.getState().context;
    expect(ctx?.sourceModule).toBe('exit-keys');
    expect(ctx?.targetModule).toBe('dashboard');
    expect(ctx?.data).toMatchObject({ exitKeyId: 'key-1', countryId: 'fr' });
  });

  it('sendProfileToEngine forwards profile snapshot', () => {
    useExitKeysBridge.getState().sendProfileToEngine({ age: 30 });
    const ctx = useNavigationContext.getState().context;
    expect(ctx?.targetModule).toBe('exit-keys');
    expect(ctx?.data).toMatchObject({ profile: { age: 30 } });
  });
});
