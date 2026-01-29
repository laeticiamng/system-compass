/**
 * OfflineIndicator - Shows offline status and queues actions
 * Addresses: "Gestion offline basique" from audit
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueuedAction {
  id: string;
  action: string;
  data: unknown;
  timestamp: number;
}

const QUEUE_KEY = 'pyramid_offline_queue';

function getQueue(): QueuedAction[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToQueue(action: string, data: unknown) {
  const queue = getQueue();
  queue.push({
    id: crypto.randomUUID(),
    action,
    data,
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>(getQueue());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = (action: string, data: unknown) => {
    addToQueue(action, data);
    setQueue(getQueue());
  };

  const processQueue = async (processor: (action: QueuedAction) => Promise<boolean>) => {
    const currentQueue = getQueue();
    const failed: QueuedAction[] = [];

    for (const item of currentQueue) {
      try {
        const success = await processor(item);
        if (!success) {
          failed.push(item);
        }
      } catch {
        failed.push(item);
      }
    }

    if (failed.length > 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } else {
      clearQueue();
    }
    
    setQueue(failed);
    return { processed: currentQueue.length - failed.length, failed: failed.length };
  };

  return {
    isOnline,
    queue,
    queueLength: queue.length,
    queueAction,
    processQueue,
    clearQueue: () => {
      clearQueue();
      setQueue([]);
    },
  };
}

export function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline, queueLength } = useOfflineQueue();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all",
        isOnline
          ? "bg-primary/90 text-primary-foreground"
          : "bg-destructive/90 text-destructive-foreground"
      )}
    >
      {isOnline ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('common.reconnected', 'Connexion rétablie')}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('common.offline', 'Hors ligne')}
          </span>
          {queueLength > 0 && (
            <span className="text-xs opacity-80">
              ({queueLength} {t('common.pendingActions', 'actions en attente')})
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Wrapper for actions that should work offline
export function withOfflineSupport<T>(
  action: () => Promise<T>,
  fallbackAction: string,
  fallbackData: unknown
): Promise<T | null> {
  if (!navigator.onLine) {
    addToQueue(fallbackAction, fallbackData);
    return Promise.resolve(null);
  }
  return action();
}
