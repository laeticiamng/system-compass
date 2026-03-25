/**
 * Activation Tracking Hook
 * Tracks user activation milestones and feature discovery.
 * Stores activation state in localStorage + reports to analytics.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';

export type ActivationMilestone =
  | 'viewed_country'
  | 'completed_quick_test'
  | 'compared_countries'
  | 'created_account'
  | 'viewed_pricing'
  | 'used_exit_keys'
  | 'used_dashboard';

interface ActivationState {
  milestones: ActivationMilestone[];
  firstSeen: string;
  lastActive: string;
  sessionCount: number;
}

const STORAGE_KEY = 'sc_activation';

function getState(): ActivationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return {
    milestones: [],
    firstSeen: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    sessionCount: 1,
  };
}

function saveState(state: ActivationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* empty */ }
}

export function useActivationTracking() {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const stateRef = useRef(getState());

  // Increment session count on mount
  useEffect(() => {
    const state = stateRef.current;
    state.sessionCount += 1;
    state.lastActive = new Date().toISOString();
    saveState(state);
  }, []);

  const trackMilestone = useCallback((milestone: ActivationMilestone) => {
    const state = stateRef.current;
    if (state.milestones.includes(milestone)) return;

    state.milestones.push(milestone);
    state.lastActive = new Date().toISOString();
    saveState(state);

    trackEvent({
      event: 'simulation_completed',
      category: 'conversion',
      metadata: {
        milestone,
        total_milestones: state.milestones.length,
        is_authenticated: !!user,
        session_count: state.sessionCount,
      },
    });
  }, [trackEvent, user]);

  const getActivationScore = useCallback((): number => {
    // Score: percentage of key milestones completed (out of 7)
    return Math.round((stateRef.current.milestones.length / 7) * 100);
  }, []);

  const hasMilestone = useCallback((milestone: ActivationMilestone): boolean => {
    return stateRef.current.milestones.includes(milestone);
  }, []);

  return {
    trackMilestone,
    getActivationScore,
    hasMilestone,
    milestones: stateRef.current.milestones,
    sessionCount: stateRef.current.sessionCount,
  };
}
