/**
 * Exit-Keys domain store — bridges from profile/results to dashboard.
 * The actual profile persistence still lives in `useExitKeysProfile` (hook
 * tied to Supabase). This store only handles cross-module hand-offs.
 */
import { create } from 'zustand';
import { setModuleContext } from '../_shared/navigationStore';

interface ExitKeysBridgeState {
  /** Send an exit-key result to the dashboard for tracking. */
  sendToDashboard: (exitKeyId: string, countryId: string) => void;
  /** Send a completed profile snapshot to the exit-keys engine. */
  sendProfileToEngine: (profile: Record<string, unknown>) => void;
}

export const useExitKeysBridge = create<ExitKeysBridgeState>(() => ({
  sendToDashboard: (exitKeyId, countryId) =>
    setModuleContext({
      sourceModule: 'exit-keys',
      targetModule: 'dashboard',
      data: { exitKeyId, countryId, action: 'track_exit_key' },
    }),
  sendProfileToEngine: (profile) =>
    setModuleContext({
      sourceModule: 'profile-test',
      targetModule: 'exit-keys',
      data: { profile },
    }),
}));
