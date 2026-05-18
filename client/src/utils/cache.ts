/**
 * Robust Client-Side Caching Utility
 * Implements Cache-Aside with Time-To-Live (TTL) Eviction
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class MemoryCache {
  private store: Map<string, CacheItem<any>> = new Map();
  private defaultTTLMs: number;

  /**
   * @param defaultTTLMs Default Time-To-Live in milliseconds (default: 5 minutes)
   */
  constructor(defaultTTLMs: number = 5 * 60 * 1000) {
    this.defaultTTLMs = defaultTTLMs;
  }

  /**
   * Gets an item from the cache if it exists and hasn't expired.
   */
  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.defaultTTLMs) {
      this.store.delete(key); // TTL Eviction
      console.debug(`[Cache] Evicted expired key: ${key}`);
      return null;
    }

    return item.data as T;
  }

  /**
   * Sets an item in the cache.
   */
  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Explicitly removes a key from the cache (used for data mutation invalidation).
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidates multiple keys matching a prefix (e.g., 'products:').
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cache-Aside Helper: 
   * Fetches data from cache if valid, otherwise executes the fetcher, caches, and returns.
   */
  async fetchOrCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`[Cache] HIT for key: ${key}`);
      return cached;
    }

    console.log(`[Cache] MISS for key: ${key}. Fetching fresh data...`);
    const freshData = await fetcher();
    this.set(key, freshData);
    return freshData;
  }
}

// Global cache instance for the entire application
export const apiCache = new MemoryCache();
