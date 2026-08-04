import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { getClientIp } from "@/lib/quote/request-guards";

type LimitResult = {
  success: boolean;
  retryAfterSec?: number;
};

type MemoryBucket = { count: number; resetAt: number };
const memoryStore = new Map<string, MemoryBucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): LimitResult {
  const now = Date.now();
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }
  if (current.count >= limit) {
    return {
      success: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  memoryStore.set(key, current);
  return { success: true };
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let ipHour: Ratelimit | null = null;
let globalHour: Ratelimit | null = null;

function ensureLimiters(redis: Redis) {
  if (!ipHour) {
    ipHour = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "creations:ip:1h",
    });
    globalHour = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(400, "1 h"),
      prefix: "creations:global:1h",
    });
  }
}

export async function enforceCreationsRateLimits(
  request: Request,
): Promise<LimitResult> {
  const ip = getClientIp(request);
  const redis = getRedis();

  if (!redis) {
    const ipResult = memoryLimit(`creations:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!ipResult.success) return ipResult;
    return memoryLimit("creations:global", 400, 60 * 60 * 1000);
  }

  ensureLimiters(redis);
  const ipRes = await ipHour!.limit(ip);
  if (!ipRes.success) {
    return {
      success: false,
      retryAfterSec: Math.max(1, Math.ceil((ipRes.reset - Date.now()) / 1000)),
    };
  }
  const globalRes = await globalHour!.limit("global");
  if (!globalRes.success) {
    return {
      success: false,
      retryAfterSec: Math.max(
        1,
        Math.ceil((globalRes.reset - Date.now()) / 1000),
      ),
    };
  }
  return { success: true };
}
