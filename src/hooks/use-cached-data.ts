"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getCached, setCached } from "@/lib/cache";

interface UseCachedDataOptions<T> {
  cacheKey: string;
  fetcher: () => Promise<T>;
}

interface UseCachedDataResult<T> {
  data: T | null;
  isLoading: boolean;       // true only when no cache AND fetching
  isRevalidating: boolean;  // true when fetching in background (cache exists)
  error: Error | null;
  refresh: () => void;
}

export function useCachedData<T>({
  cacheKey,
  fetcher,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasMounted = useRef(false);

  const fetchFresh = useCallback(async (hasCachedData: boolean) => {
    if (hasCachedData) {
      setIsRevalidating(true);
    }

    try {
      const freshData = await fetcher();
      setData(freshData);
      setCached(cacheKey, freshData);
      setError(null);
    } catch (err) {
      // Only set error if we have no data at all
      if (!hasCachedData) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      }
    } finally {
      setIsLoading(false);
      setIsRevalidating(false);
    }
  }, [cacheKey, fetcher]);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Step 1: Try to load from cache immediately
    const cached = getCached<T>(cacheKey);

    if (cached) {
      // Cache hit — show data instantly, fetch fresh in background
      setData(cached);
      setIsLoading(false);
      fetchFresh(true);
    } else {
      // Cache miss — show loading, wait for API
      setIsLoading(true);
      fetchFresh(false);
    }
  }, [cacheKey, fetchFresh]);

  const refresh = useCallback(() => {
    fetchFresh(data !== null);
  }, [fetchFresh, data]);

  return { data, isLoading, isRevalidating, error, refresh };
}
