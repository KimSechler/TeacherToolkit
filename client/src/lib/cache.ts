interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private storage = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.storage.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  // Get cache size for debugging
  size(): number {
    return this.storage.size;
  }

  // Get all keys for cache invalidation
  keys(): string[] {
    return Array.from(this.storage.keys());
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    this.storage.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key);
      }
    });
  }
}

// Global cache instance
export const cache = new Cache();

// Cache keys
export const CACHE_KEYS = {
  CLASSES: (teacherId: string) => `classes:${teacherId}`,
  STUDENTS: (classId: number) => `students:${classId}`,
  ATTENDANCE: (classId: number, date: string) => `attendance:${classId}:${date}`,
  QUESTIONS: (teacherId: string) => `questions:${teacherId}`,
  THEMES: 'themes',
} as const;

// Cache utilities
export function getCachedData<T>(key: string): T | null {
  return cache.get<T>(key);
}

export function setCachedData<T>(key: string, data: T, ttl?: number): void {
  cache.set(key, data, ttl);
}

export function invalidateCache(pattern: string): void {
  // Simple pattern matching for cache invalidation
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Auto-cleanup every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000); 