import { describe, it, expect, beforeEach } from 'vitest';
import { useGovernanceBridge } from '../store';
import { useNavigationContext } from '../../_shared/navigationStore';

describe('governance bridge store', () => {
  beforeEach(() => {
    useNavigationContext.setState({ context: null });
  });

  it('sendLatentZoneToTraceOS routes properly', () => {
    useGovernanceBridge.getState().sendLatentZoneToTraceOS('z-1', 'Zone Alpha');
    const ctx = useNavigationContext.getState().context;
    expect(ctx?.sourceModule).toBe('latent');
    expect(ctx?.targetModule).toBe('traceos');
    expect(ctx?.data).toMatchObject({ zoneId: 'z-1', action: 'create_decision' });
  });

  it('sendThresholdToTraceOS routes properly', () => {
    useGovernanceBridge.getState().sendThresholdToTraceOS('t-1', 'Threshold');
    const ctx = useNavigationContext.getState().context;
    expect(ctx?.sourceModule).toBe('irreversa');
    expect(ctx?.data).toMatchObject({ thresholdId: 't-1', action: 'document_threshold' });
  });
});
