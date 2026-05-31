import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

let upstashRatelimit: Ratelimit | null = null;

function getRatelimiter(): Ratelimit {
  if (upstashRatelimit) return upstashRatelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_URL ?? process.env.KV_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) {
    const redis = new Redis({ url, token });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      prefix: "hiresight",
      analytics: true,
    });
    return upstashRatelimit;
  }
  upstashRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "hiresight",
    analytics: true,
  });
  return upstashRatelimit;
}

type InMemoryEntry = { count: number; resetAt: number };
const inMemory = new Map<string, InMemoryEntry>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function checkInMemory(key: string): RateLimitResult {
  const now = Date.now();
  const entry = inMemory.get(key);
  if (!entry || entry.resetAt < now) {
    inMemory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemory) {
    if (entry.resetAt < now) inMemory.delete(key);
  }
}, 300_000);

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  try {
    const ratelimit = getRatelimiter();
    const { success, remaining, reset } = await ratelimit.limit(key);
    return { allowed: success, remaining, resetAt: reset };
  } catch {
    return checkInMemory(key);
  }
}

export function rateLimitKey(request: Request): string {
  return request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
}
