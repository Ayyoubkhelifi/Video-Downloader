/**
 * Simple in-memory cache for repeated download requests.
 *
 * Stores results keyed by `${url}::${format}` with a configurable TTL.
 * This is intentionally lightweight – it lives per-process (serverless cold-start
 * clears it) so it avoids stale data while reducing duplicate API calls.
 *
 * Node.js serverless environments reuse warm instances briefly, so this
 * cache still provides meaningful savings in practice.
 */

import type { DownloadResult } from "./types";

interface CacheEntry {
  result: DownloadResult;
  expiresAt: number;
}

// Module-level map – shared across requests within the same process
const cache = new Map<string, CacheEntry>();

// Default TTL: 5 minutes (results don't change fast, but signed URLs can expire)
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function makeKey(url: string, format: string): string {
  return `${url}::${format}`;
}

/** Retrieve a cached result if it exists and hasn't expired. */
export function getCached(url: string, format: string): DownloadResult | null {
  const key = makeKey(url, format);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

/** Store a result in the cache. Only caches successful responses. */
export function setCached(
  url: string,
  format: string,
  result: DownloadResult,
  ttlMs = DEFAULT_TTL_MS
): void {
  if (!result.success) return; // Don't cache failures
  const key = makeKey(url, format);
  cache.set(key, { result, expiresAt: Date.now() + ttlMs });
}

/** Evict all entries whose TTL has elapsed. Call occasionally to prevent leaks. */
export function pruneCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}
