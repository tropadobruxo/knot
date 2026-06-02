import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function createLimiter(
  prefix: string,
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h`,
) {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `knot:rl:${prefix}`,
  });
}

/** 5 requests per hour per IP — for registration/login */
export const authLimiter = createLimiter("auth", 5, "1 h");

/** 60 requests per minute per user — general API */
export const apiLimiter = createLimiter("api", 60, "1 m");

/** 30 requests per minute per user — likes */
export const likeLimiter = createLimiter("like", 30, "1 m");

/** 60 messages per minute per user */
export const messageLimiter = createLimiter("msg", 60, "1 m");

/** 10 reports per hour per user */
export const reportLimiter = createLimiter("report", 10, "1 h");

/**
 * Check rate limit and return 429 response if exceeded.
 * Returns null if allowed (or if Redis is not configured).
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }
  return null;
}
