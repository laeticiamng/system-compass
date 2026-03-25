/**
 * CacheService - Centralized caching for API responses and computed data
 * 
 * Features:
 * - TTL-based expiration
 * - Memory + localStorage hybrid
 * - Automatic cleanup
 * - Type-safe getters/setters
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persist?: boolean; // Store in localStorage
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'pc_cache_';

class CacheServiceClass {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = DEFAULT_TTL, persist = false } = options;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Optionally persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(
          `${CACHE_PREFIX}${key}`,
          JSON.stringify(entry)
        );
      } catch (error) {
        console.warn('Failed to persist cache entry:', error);
      }
    }
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    let entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    // Fall back to localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
          // Restore to memory cache
          this.memoryCache.set(key, entry);
        }
      } catch {
        // Ignore parsing errors
      }
    }

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    
    // Clear localStorage entries
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    // Memory cache
    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    });

    // LocalStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const cacheKey = key.replace(CACHE_PREFIX, '');
          if (regex.test(cacheKey)) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get cache stats
   */
  getStats(): { memoryEntries: number; totalSize: number } {
    let totalSize = 0;
    
    this.memoryCache.forEach((entry) => {
      totalSize += JSON.stringify(entry).length;
    });

    return {
      memoryEntries: this.memoryCache.size,
      totalSize,
    };
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Run every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    this.memoryCache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    });
  }

  /**
   * Stop cleanup interval (for testing)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const CacheService = new CacheServiceClass();

// Export cache keys for type safety
export const CACHE_KEYS = {
  COUNTRIES: 'countries',
  COUNTRY_DETAIL: (id: string) => `country_${id}`,
  USER_PROFILE: (userId: string) => `profile_${userId}`,
  EXIT_KEYS: (userId: string) => `exit_keys_${userId}`,
  COMPARISONS: 'comparisons',
  FINANCIAL_INTEL: (country: string) => `financial_${country}`,
  TERRAIN_REALITIES: (country: string) => `terrain_${country}`,
} as const;

// Export TTL presets
export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;
