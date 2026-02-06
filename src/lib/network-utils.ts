/**
 * Network Utilities
 * 
 * Utilities for handling network state, offline detection, and connection quality.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Get current network status
 */
export function getNetworkStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof navigator === 'undefined') {
    return { online: true };
  }

  const connection = (navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  }).connection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}

/**
 * Check if connection is slow (2G or slow-2g)
 */
export function isSlowConnection(): boolean {
  const status = getNetworkStatus();
  return status.effectiveType === '2g' || status.effectiveType === 'slow-2g';
}

/**
 * Check if user is offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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

  return isOnline;
}

/**
 * Hook to track network quality
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'good' | 'slow' | 'offline'>('good');

  useEffect(() => {
    const updateQuality = () => {
      if (!navigator.onLine) {
        setQuality('offline');
      } else if (isSlowConnection()) {
        setQuality('slow');
      } else {
        setQuality('good');
      }
    };

    updateQuality();

    const connection = (navigator as Navigator & {
      connection?: EventTarget;
    }).connection;

    window.addEventListener('online', updateQuality);
    window.addEventListener('offline', updateQuality);
    connection?.addEventListener('change', updateQuality);

    return () => {
      window.removeEventListener('online', updateQuality);
      window.removeEventListener('offline', updateQuality);
      connection?.removeEventListener('change', updateQuality);
    };
  }, []);

  return quality;
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const { timeoutMs = 10000, ...fetchOptions } = options ?? {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check server reachability
 */
export async function checkServerReachability(url?: string): Promise<boolean> {
  try {
    const targetUrl = url ?? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`;
    const response = await fetchWithTimeout(targetUrl, { 
      method: 'HEAD',
      timeoutMs: 5000 
    });
    return response.ok || response.status === 401; // 401 is expected without auth
  } catch {
    return false;
  }
}

/**
 * Wait for network to be available
 */
export function waitForNetwork(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }

    const timeout = setTimeout(() => {
      window.removeEventListener('online', onOnline);
      resolve(false);
    }, timeoutMs);

    const onOnline = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', onOnline);
      resolve(true);
    };

    window.addEventListener('online', onOnline);
  });
}

/**
 * Queue operations for when network is available
 */
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  add(operation: () => Promise<void>): void {
    this.queue.push(operation);
    this.processIfOnline();
  }

  private async processIfOnline(): Promise<void> {
    if (this.processing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('[OfflineQueue] Operation failed:', error);
        }
      }
    }

    this.processing = false;
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();

// Auto-process queue when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Small delay to ensure connection is stable
    setTimeout(() => {
      // Queue will be processed automatically
    }, 1000);
  });
}

/**
 * Hook for offline-first operations
 */
export function useOfflineFirst<T>(
  onlineAction: () => Promise<T>,
  offlineAction: () => T | Promise<T>
) {
  const isOnline = useOnlineStatus();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isOnline) {
        const result = await onlineAction();
        setData(result);
      } else {
        const result = await offlineAction();
        setData(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [isOnline, onlineAction, offlineAction]);

  return { data, loading, error, execute, isOnline };
}
