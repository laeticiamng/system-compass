/**
 * Performance Utilities
 * 
 * Utilities for improving application performance:
 * - Debounce and throttle
 * - Memoization
 * - Lazy loading helpers
 */

/**
 * Debounce a function - delays execution until after wait ms have elapsed
 * since the last time the function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, waitMs);
  };
}

/**
 * Throttle a function - ensures it runs at most once per wait ms
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= waitMs) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = undefined;
        fn(...args);
      }, waitMs - timeSinceLastCall);
    }
  };
}

/**
 * Simple memoization for functions with primitive arguments
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options?: { maxSize?: number }
): T {
  const maxSize = options?.maxSize ?? 100;
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args) as ReturnType<T>;
    
    // Evict oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch multiple calls into a single execution
 */
export function batcher<T, R>(
  fn: (items: T[]) => Promise<R[]>,
  options?: { maxBatchSize?: number; maxWaitMs?: number }
): (item: T) => Promise<R> {
  const maxBatchSize = options?.maxBatchSize ?? 10;
  const maxWaitMs = options?.maxWaitMs ?? 50;
  
  let batch: T[] = [];
  let resolvers: Array<(value: R) => void> = [];
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  const executeBatch = async () => {
    const currentBatch = batch;
    const currentResolvers = resolvers;
    
    batch = [];
    resolvers = [];
    timeoutId = undefined;
    
    try {
      const results = await fn(currentBatch);
      currentResolvers.forEach((resolve, i) => resolve(results[i]));
    } catch (error) {
      // If batch fails, individual items don't get resolved
      console.error('Batch execution failed:', error);
    }
  };
  
  return (item: T): Promise<R> => {
    return new Promise<R>((resolve) => {
      batch.push(item);
      resolvers.push(resolve);
      
      if (batch.length >= maxBatchSize) {
        if (timeoutId) clearTimeout(timeoutId);
        executeBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(executeBatch, maxWaitMs);
      }
    });
  };
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).requestIdleCallback(callback, options);
  }
  
  // Fallback: use setTimeout with minimal delay
  return setTimeout(callback, options?.timeout ?? 1) as unknown as number;
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallback(handle: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Intersection Observer hook helper for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  
  if (label) {
    console.debug(`[Performance] ${label}: ${durationMs}ms`);
  }
  
  return { result, durationMs };
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the device is a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }
  
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
}
