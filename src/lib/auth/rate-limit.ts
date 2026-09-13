import "server-only";

/**
 * In-process rate limiting for the login endpoint.
 *
 * Deliberately not Redis. A portfolio runs as a single Node process on one
 * host, so a Map is the correct data structure — adding a network service to
 * count failed logins would cost more than it protects.
 *
 * The trade-off is explicit: counters reset if the process restarts. That is
 * acceptable for slowing down guessing; it is not a DDoS defence, and the
 * host's own protections cover that layer.
 */

type Bucket = { count: number; resetAt: number };

declare global {
  var __loginBuckets: Map<string, Bucket> | undefined;
}

const buckets = (globalThis.__loginBuckets ??= new Map<string, Bucket>());

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const MAX_BUCKETS = 5000; // bound the map so it can't grow without limit

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  // Opportunistic sweep — cheaper than a timer, and bounded.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Called after a successful sign-in so a legitimate user isn't left throttled. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}
