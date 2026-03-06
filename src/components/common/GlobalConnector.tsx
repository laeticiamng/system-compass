/**
 * GlobalConnector - Connects inter-module data flows
 * Addresses: "Connexions inter-modules faibles" identified in audit
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';

interface ModuleContext {
  sourceModule: string;
  targetModule: string;
  data: Record<string, unknown>;
}

const MODULE_CONTEXT_KEY = 'pyramid_module_context';

export function setModuleContext(context: ModuleContext) {
  sessionStorage.setItem(MODULE_CONTEXT_KEY, JSON.stringify({
    ...context,
    timestamp: Date.now(),
  }));
}

export function getModuleContext(): ModuleContext | null {
  try {
    const stored = sessionStorage.getItem(MODULE_CONTEXT_KEY);
    if (!stored) return null;
    
    const context = JSON.parse(stored);
    // Context expires after 30 minutes
    if (Date.now() - context.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(MODULE_CONTEXT_KEY);
      return null;
    }
    return context;
  } catch {
    return null;
  }
}

export function clearModuleContext() {
  sessionStorage.removeItem(MODULE_CONTEXT_KEY);
}

// Hook to use module context in target modules
export function useModuleContext() {
  const location = useLocation();
  const context = getModuleContext();
  
  // Auto-clear context when navigating away from target
  useEffect(() => {
    if (context && !location.pathname.includes(context.targetModule)) {
      // Keep context if still navigating
    }
  }, [location.pathname, context]);

  return {
    context,
    hasContext: !!context,
    clearContext: clearModuleContext,
  };
}

// Sync user activity across modules (for dashboard)
export async function syncUserActivity(userId: string, activity: {
  module: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabase.from('analytics_events').insert([{
      user_id: userId,
      session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
      event_name: activity.action,
      event_category: activity.module,
      metadata: (activity.metadata || null) as Json,
      page_path: window.location.pathname,
    }]);
  } catch (e) {
    console.warn('Failed to sync activity:', e);
  }
}

// Navigation helpers with context preservation
export function useContextualNavigation() {
  const navigate = useLocalizedNavigate();
  const { user } = useAuth();
  
  const navigateWithContext = (
    targetPath: string,
    sourceModule: string,
    data: Record<string, unknown> = {}
  ) => {
    setModuleContext({
      sourceModule,
      targetModule: targetPath.split('/')[1] || targetPath,
      data,
    });
    
    if (user?.id) {
      syncUserActivity(user.id, {
        module: sourceModule,
        action: 'navigate_to_module',
        metadata: { targetPath, ...data },
      });
    }
    
    navigate(targetPath);
  };
  
  return { navigateWithContext };
}

// Connect Exit Keys results to Dashboard
export function connectExitKeysToDashboard(exitKeyId: string, countryId: string) {
  setModuleContext({
    sourceModule: 'exit-keys',
    targetModule: 'dashboard',
    data: { exitKeyId, countryId, action: 'track_exit_key' },
  });
}

// Connect Country Detail to Compare
export function connectCountryToCompare(countryId: string, countryName: string) {
  const existing = getModuleContext();
  const countries = existing?.data?.countries as string[] || [];
  
  if (!countries.includes(countryId)) {
    countries.push(countryId);
  }
  
  setModuleContext({
    sourceModule: 'country-detail',
    targetModule: 'compare',
    data: { countries, latestCountry: { id: countryId, name: countryName } },
  });
}

// Connect Profile Test to Exit Keys
export function connectProfileToExitKeys(profileData: Record<string, unknown>) {
  setModuleContext({
    sourceModule: 'profile-test',
    targetModule: 'exit-keys',
    data: { profile: profileData },
  });
}

// Connect Latent Zones to TraceOS
export function connectLatentToTraceOS(zoneId: string, zoneName: string) {
  setModuleContext({
    sourceModule: 'latent',
    targetModule: 'traceos',
    data: { zoneId, zoneName, action: 'create_decision' },
  });
}

// Connect Irreversa to TraceOS
export function connectIrreversaToTraceOS(thresholdId: string, thresholdTitle: string) {
  setModuleContext({
    sourceModule: 'irreversa',
    targetModule: 'traceos',
    data: { thresholdId, thresholdTitle, action: 'document_threshold' },
  });
}
