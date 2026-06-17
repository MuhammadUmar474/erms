interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = "erms_";

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function clearCached(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_PREFIX + key);
}
