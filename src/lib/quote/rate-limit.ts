import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";

export type LimitResult = {
  success: boolean;
  retryAfterSec?: number;
  limiter?: string;
  unavailable?: boolean;
};
type Bucket = { name: string; key: string; limit: number; minutes: number };
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token, retry: { retries: 0 } });
  if (process.env.NODE_ENV === "production")
    throw new Error("Shared rate limit storage required");
  return null;
}

function memoryLimit(bucket: Bucket): LimitResult {
  const now = Date.now();
  for (const [key, value] of memoryStore)
    if (value.resetAt <= now) memoryStore.delete(key);
  const key = `${bucket.name}:${bucket.key}`;
  const current = memoryStore.get(key);
  if (!current) {
    if (memoryStore.size >= 10_000)
      return { success: false, unavailable: true };
    memoryStore.set(key, { count: 1, resetAt: now + bucket.minutes * 60_000 });
    return { success: true };
  }
  if (current.count >= bucket.limit) {
    return {
      success: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { success: true };
}

/** A denied early bucket must never consume a later/global budget. */
export async function runLimitChecks(
  checks: { name: string; check: () => Promise<LimitResult> }[],
): Promise<LimitResult> {
  for (const { name, check } of checks) {
    const result = await check();
    if (!result.success) return { ...result, limiter: name };
  }
  return { success: true };
}

async function enforce(buckets: Bucket[]): Promise<LimitResult> {
  try {
    const redis = getRedis();
    return await runLimitChecks(
      buckets.map((bucket) => ({
        name: bucket.name,
        check: async () => {
          if (!redis) return memoryLimit(bucket);
          const limiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(
              bucket.limit,
              `${bucket.minutes} m`,
            ),
            prefix: `quote:v2:${bucket.name}`,
            timeout: 3000,
            ephemeralCache: false,
          });
          const result = await limiter.limit(bucket.key);
          // Upstash grants access on timeout by default; fail closed instead.
          if (result.reason === "timeout")
            return { success: false, unavailable: true };
          return {
            success: result.success,
            retryAfterSec: Math.max(
              1,
              Math.ceil((result.reset - Date.now()) / 1000),
            ),
          };
        },
      })),
    );
  } catch {
    return { success: false, unavailable: true, retryAfterSec: 60 };
  }
}

export function fingerprintEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}

/** Before body parsing, CMS requests, or challenge verification. */
export function enforceQuoteRequestRateLimit(ip: string) {
  return enforce([{ name: "request_ip", key: ip, limit: 20, minutes: 10 }]);
}

/** Call after field, form-token, CAPTCHA and attachment validation. */
export function enforceQuoteRateLimits({
  ip,
  email,
}: {
  ip: string;
  email: string;
}) {
  const key = fingerprintEmail(email);
  return enforce([
    { name: "ip_10m", key: ip, limit: 3, minutes: 10 },
    { name: "ip_1d", key: ip, limit: 10, minutes: 1440 },
    { name: "email_1h", key, limit: 3, minutes: 60 },
    { name: "email_1d", key, limit: 5, minutes: 1440 },
    { name: "global_1h", key: "global", limit: 150, minutes: 60 },
  ]);
}

export function enforceAttachmentUnlockRateLimits(ip: string) {
  return enforce([
    { name: "unlock_ip", key: ip, limit: 5, minutes: 15 },
    { name: "unlock_global", key: "global", limit: 300, minutes: 15 },
  ]);
}

function duplicateKey(options: {
  email: string;
  message: string;
  projectType: string;
}): string {
  const digest = createHash("sha256")
    .update(`${options.email}\n${options.projectType}\n${options.message}`)
    .digest("hex");
  return `quote:dup:${digest}`;
}

export async function releaseDuplicateSubmission(options: {
  email: string;
  message: string;
  projectType: string;
}) {
  const key = duplicateKey(options);
  const redis = getRedis();
  if (redis) await redis.del(key);
  else memoryStore.delete(`duplicate:${key}`);
}

export async function isDuplicateSubmission(options: {
  email: string;
  message: string;
  projectType: string;
}): Promise<boolean> {
  const key = duplicateKey(options);
  const redis = getRedis();
  if (redis)
    return (await redis.set(key, "1", { nx: true, ex: 3600 })) === null;
  return !memoryLimit({ name: "duplicate", key, limit: 1, minutes: 60 })
    .success;
}
