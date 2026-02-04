/**
 * Offline Sync Hook - Manages offline actions queue and synchronization
 * Provides graceful degradation when network is unavailable
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  lastSyncAt: Date | null;
}

const OFFLINE_QUEUE_KEY = 'pyramid_offline_queue';
const MAX_RETRY_COUNT = 3;

// Get queued actions from localStorage
function getQueuedActions(): QueuedAction[] {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save queued actions to localStorage
function saveQueuedActions(actions: QueuedAction[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Failed to save offline queue:', error);
  }
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingActions: getQueuedActions().length,
    lastSyncAt: null,
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Connexion rétablie', {
        description: 'Synchronisation en cours...',
      });
      syncPendingActions();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast.warning('Mode hors-ligne', {
        description: 'Les actions seront synchronisées lors du retour en ligne.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue an action for later sync
  const queueAction = useCallback((
    type: QueuedAction['type'],
    table: string,
    data: Record<string, unknown>
  ) => {
    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = getQueuedActions();
    queue.push(action);
    saveQueuedActions(queue);

    setState(prev => ({
      ...prev,
      pendingActions: queue.length,
    }));

    return action.id;
  }, []);

  // Sync pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!navigator.onLine) return;

    const queue = getQueuedActions();
    if (queue.length === 0) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    const failedActions: QueuedAction[] = [];
    const { supabase } = await import('@/integrations/supabase/client');

    for (const action of queue) {
      try {
        // Use type assertion for dynamic table names
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const table = supabase.from(action.table as any);
        
        switch (action.type) {
          case 'create':
            await table.insert(action.data as never);
            break;
          case 'update':
            if (action.data.id) {
              await table
                .update(action.data as never)
                .eq('id', action.data.id as string);
            }
            break;
          case 'delete':
            if (action.data.id) {
              await table
                .delete()
                .eq('id', action.data.id as string);
            }
            break;
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        
        if (action.retryCount < MAX_RETRY_COUNT) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          });
        }
      }
    }

    saveQueuedActions(failedActions);

    setState(prev => ({
      ...prev,
      isSyncing: false,
      pendingActions: failedActions.length,
      lastSyncAt: new Date(),
    }));

    if (failedActions.length > 0) {
      toast.warning(`${queue.length - failedActions.length} actions synchronisées`, {
        description: `${failedActions.length} actions en attente`,
      });
    } else if (queue.length > 0) {
      toast.success('Synchronisation terminée', {
        description: `${queue.length} actions synchronisées`,
      });
    }
  }, []);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    saveQueuedActions([]);
    setState(prev => ({ ...prev, pendingActions: 0 }));
  }, []);

  // Force sync now
  const forceSync = useCallback(() => {
    if (!navigator.onLine) {
      toast.error('Pas de connexion internet');
      return;
    }
    syncPendingActions();
  }, [syncPendingActions]);

  return {
    ...state,
    queueAction,
    syncPendingActions,
    clearPendingActions,
    forceSync,
  };
}

export default useOfflineSync;
