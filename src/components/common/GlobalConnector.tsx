/**
 * @deprecated Use `@/domains/_shared` (navigationStore) and the per-domain
 * bridge stores in `@/domains/<name>` instead. This shim re-exports the new
 * APIs with the old names for backwards compatibility and will be removed
 * after one stable sprint.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Json } from '@/integrations/supabase/types';
import {
  setModuleContext as _setModuleContext,
  getModuleContext as _getModuleContext,
  clearModuleContext as _clearModuleContext,
  useNavigationContext,
} from '@/domains/_shared/navigationStore';
import { useCountryStore } from '@/domains/country';
import { useExitKeysBridge } from '@/domains/exit-keys';
import { useGovernanceBridge } from '@/domains/governance';

let warned = false;
const warnDeprecated = (api: string) => {
  if (warned || typeof console === 'undefined') return;
  warned = true;
  console.warn(
    `[deprecated] GlobalConnector.${api} — migrate to @/domains/* (see src/domains/README.md)`
  );
};

export function setModuleContext(context: Parameters<typeof _setModuleContext>[0]) {
  warnDeprecated('setModuleContext');
  _setModuleContext(context);
}

export function getModuleContext() {
  warnDeprecated('getModuleContext');
  return _getModuleContext();
}

export function clearModuleContext() {
  warnDeprecated('clearModuleContext');
  _clearModuleContext();
}

export function useModuleContext() {
  const location = useLocation();
  const context = useNavigationContext((s) => s.context);
  const clearContext = useNavigationContext((s) => s.clearContext);

  useEffect(() => {
    if (context && !location.pathname.includes(context.targetModule)) {
      // Keep context if still navigating
    }
  }, [location.pathname, context]);

  return { context, hasContext: !!context, clearContext };
}

export async function syncUserActivity(
  userId: string,
  activity: { module: string; action: string; metadata?: Record<string, unknown> }
) {
  try {
    await supabase.from('analytics_events').insert([
      {
        user_id: userId,
        session_id: sessionStorage.getItem('session_id') || crypto.randomUUID(),
        event_name: activity.action,
        event_category: activity.module,
        metadata: (activity.metadata || null) as Json,
        page_path: window.location.pathname,
      },
    ]);
  } catch (e) {
    console.warn('Failed to sync activity:', e);
  }
}

export function useContextualNavigation() {
  const navigate = useLocalizedNavigate();
  const { user } = useAuth();

  const navigateWithContext = (
    targetPath: string,
    sourceModule: string,
    data: Record<string, unknown> = {}
  ) => {
    _setModuleContext({
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

// ─── Deprecated bridge helpers (delegate to domain stores) ────────────────
export function connectExitKeysToDashboard(exitKeyId: string, countryId: string) {
  warnDeprecated('connectExitKeysToDashboard');
  useExitKeysBridge.getState().sendToDashboard(exitKeyId, countryId);
}

export function connectCountryToCompare(countryId: string, countryName: string) {
  warnDeprecated('connectCountryToCompare');
  useCountryStore.getState().sendToCompare({ id: countryId, name: countryName });
}

export function connectProfileToExitKeys(profileData: Record<string, unknown>) {
  warnDeprecated('connectProfileToExitKeys');
  useExitKeysBridge.getState().sendProfileToEngine(profileData);
}

export function connectLatentToTraceOS(zoneId: string, zoneName: string) {
  warnDeprecated('connectLatentToTraceOS');
  useGovernanceBridge.getState().sendLatentZoneToTraceOS(zoneId, zoneName);
}

export function connectIrreversaToTraceOS(thresholdId: string, thresholdTitle: string) {
  warnDeprecated('connectIrreversaToTraceOS');
  useGovernanceBridge.getState().sendThresholdToTraceOS(thresholdId, thresholdTitle);
}
