/**
 * Governance domain store — TraceOS decisions, latent zones, irreversa.
 * Bridges send identifiers to TraceOS for documentation.
 */
import { create } from 'zustand';
import { setModuleContext } from '../_shared/navigationStore';

interface GovernanceBridgeState {
  /** Send a latent zone to TraceOS to start a decision. */
  sendLatentZoneToTraceOS: (zoneId: string, zoneName: string) => void;
  /** Send an irreversa threshold to TraceOS for documentation. */
  sendThresholdToTraceOS: (thresholdId: string, thresholdTitle: string) => void;
}

export const useGovernanceBridge = create<GovernanceBridgeState>(() => ({
  sendLatentZoneToTraceOS: (zoneId, zoneName) =>
    setModuleContext({
      sourceModule: 'latent',
      targetModule: 'traceos',
      data: { zoneId, zoneName, action: 'create_decision' },
    }),
  sendThresholdToTraceOS: (thresholdId, thresholdTitle) =>
    setModuleContext({
      sourceModule: 'irreversa',
      targetModule: 'traceos',
      data: { thresholdId, thresholdTitle, action: 'document_threshold' },
    }),
}));
