import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Generate or retrieve session ID
const getSessionId = (): string => {
  const key = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Check if returning visitor (J+7 retention)
const checkRetention = (): { isReturning: boolean; daysSinceFirst: number } => {
  const key = 'analytics_first_visit';
  const firstVisit = localStorage.getItem(key);
  const now = Date.now();
  
  if (!firstVisit) {
    localStorage.setItem(key, now.toString());
    return { isReturning: false, daysSinceFirst: 0 };
  }
  
  const daysSinceFirst = Math.floor((now - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
  return { isReturning: true, daysSinceFirst };
};

// Event categories
export type EventCategory = 
  | 'navigation'
  | 'simulation'
  | 'engagement'
  | 'conversion'
  | 'retention';

// Event names (MVP tracking)
export type EventName =
  | 'home_opened'
  | 'filter_clicked'
  | 'simulation_started'
  | 'simulation_completed'
  | 'simulation_dropped'
  | 'alternative_scenario_clicked'
  | 'exit_keys_clicked'
  | 'universal_errors_clicked'
  | 'return_visit'
  | 'account_created'
  | 'page_view';

interface TrackEventParams {
  event: EventName;
  category: EventCategory;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export function useAnalytics() {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());
  const hasTrackedRetention = useRef(false);

  // Track event function
  const trackEvent = useCallback(async ({ event, category, metadata = {} }: TrackEventParams) => {
    try {
      await supabase.from('analytics_events').insert([{
        event_name: event,
        event_category: category,
        session_id: sessionId.current,
        user_id: user?.id || null,
        page_path: location.pathname,
        metadata
      }]);
    } catch (error) {
      // Silent fail - analytics should never break the app
      console.debug('Analytics event failed:', error);
    }
  }, [user?.id, location.pathname]);

  // Update session tracking
  const updateSession = useCallback(async () => {
    try {
      const { data: existing } = await supabase
        .from('analytics_sessions')
        .select('id, visit_count')
        .eq('session_id', sessionId.current)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('analytics_sessions')
          .update({
            last_seen_at: new Date().toISOString(),
            visit_count: existing.visit_count + 1,
            user_id: user?.id || null
          })
          .eq('session_id', sessionId.current);
      } else {
        // Only insert if we have a valid session - skip for anonymous if RLS blocks
        const { error } = await supabase.from('analytics_sessions').insert({
          session_id: sessionId.current,
          user_id: user?.id || null
        });
        // Ignore RLS errors for anonymous sessions - this is expected behavior
        if (error && error.code !== '42501' && error.code !== 'PGRST301') {
          console.debug('Session insert failed:', error.message);
        }
      }
    } catch (error) {
      // Silent fail - analytics should never break the app
      console.debug('Session tracking failed:', error);
    }
  }, [user?.id]);

  // Track page views automatically
  useEffect(() => {
    trackEvent({
      event: 'page_view',
      category: 'navigation',
      metadata: { path: location.pathname }
    });
  }, [location.pathname, trackEvent]);

  // Track retention on mount
  useEffect(() => {
    if (hasTrackedRetention.current) return;
    hasTrackedRetention.current = true;

    const { isReturning, daysSinceFirst } = checkRetention();
    
    if (isReturning && daysSinceFirst >= 7) {
      trackEvent({
        event: 'return_visit',
        category: 'retention',
        metadata: { days_since_first: daysSinceFirst }
      });
    }

    updateSession();
  }, [trackEvent, updateSession]);

  // Convenience methods for MVP events
  const trackHomeOpened = useCallback(() => {
    trackEvent({ event: 'home_opened', category: 'navigation' });
  }, [trackEvent]);

  const trackFilterClicked = useCallback(() => {
    trackEvent({ event: 'filter_clicked', category: 'engagement' });
  }, [trackEvent]);

  const trackSimulationStarted = useCallback((simulationType?: string) => {
    trackEvent({ 
      event: 'simulation_started', 
      category: 'simulation',
      metadata: { type: simulationType }
    });
  }, [trackEvent]);

  const trackSimulationCompleted = useCallback((simulationType?: string, duration?: number) => {
    trackEvent({ 
      event: 'simulation_completed', 
      category: 'simulation',
      metadata: { type: simulationType, duration_seconds: duration }
    });
  }, [trackEvent]);

  const trackSimulationDropped = useCallback((simulationType?: string, step?: string) => {
    trackEvent({ 
      event: 'simulation_dropped', 
      category: 'simulation',
      metadata: { type: simulationType, dropped_at_step: step }
    });
  }, [trackEvent]);

  const trackAlternativeScenarioClicked = useCallback((scenarioId?: string) => {
    trackEvent({ 
      event: 'alternative_scenario_clicked', 
      category: 'engagement',
      metadata: { scenario_id: scenarioId }
    });
  }, [trackEvent]);

  const trackExitKeysClicked = useCallback(() => {
    trackEvent({ event: 'exit_keys_clicked', category: 'engagement' });
  }, [trackEvent]);

  const trackUniversalErrorsClicked = useCallback(() => {
    trackEvent({ event: 'universal_errors_clicked', category: 'engagement' });
  }, [trackEvent]);

  const trackAccountCreated = useCallback(() => {
    trackEvent({ event: 'account_created', category: 'conversion' });
  }, [trackEvent]);

  return {
    trackEvent,
    trackHomeOpened,
    trackFilterClicked,
    trackSimulationStarted,
    trackSimulationCompleted,
    trackSimulationDropped,
    trackAlternativeScenarioClicked,
    trackExitKeysClicked,
    trackUniversalErrorsClicked,
    trackAccountCreated
  };
}
