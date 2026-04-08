/**
 * IN-MEMORY RATE LIMITER
 * Note: For production scale, replace this with a Redis-base limiter (e.g., @upstash/ratelimit)
 * to handle multiple server instances and persistent state.
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const cache = new Map<string, RateLimitRecord>();

export async function rateLimit(ip: string, endpoint: string, limit: number, windowMs: number) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const record = cache.get(key);

  if (!record || now > record.resetAt) {
    cache.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  cache.set(key, record);

  return { success: true, remaining: limit - record.count };
}
