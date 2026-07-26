import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";

type LimitResult = {
  success: boolean;
  retryAfterSec?: number;
  /** Which bucket rejected the request (for abuse logs). */
  limiter?:
    | "ip_10m"
    | "ip_1d"
    | "email_1h"
    | "email_1d"
    | "global_1h";
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
  // Prefer explicit Upstash vars; also accept Vercel Marketplace KV_* aliases.
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

let ipShort: Ratelimit | null = null;
let ipDay: Ratelimit | null = null;
let emailHour: Ratelimit | null = null;
let emailDay: Ratelimit | null = null;
let globalHour: Ratelimit | null = null;

function ensureLimiters(redis: Redis) {
  if (!ipShort) {
    ipShort = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      prefix: "quote:ip:10m",
    });
    ipDay = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      prefix: "quote:ip:1d",
    });
    emailHour = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "quote:email:1h",
    });
    emailDay = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 d"),
      prefix: "quote:email:1d",
    });
    globalHour = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(150, "1 h"),
      prefix: "quote:global:1h",
    });
  }
}

async function checkUpstash(
  limiter: Ratelimit,
  key: string,
): Promise<LimitResult> {
  const result = await limiter.limit(key);
  if (result.success) return { success: true };
  const retryAfterSec = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );
  return { success: false, retryAfterSec };
}

export function fingerprintEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex").slice(0, 32);
}

export async function enforceQuoteRateLimits(options: {
  ip: string;
  email: string;
}): Promise<LimitResult> {
  const emailKey = fingerprintEmail(options.email);
  const redis = getRedis();

  const labels = [
    "ip_10m",
    "ip_1d",
    "email_1h",
    "email_1d",
    "global_1h",
  ] as const;

  if (!redis) {
    // Dev / misconfigured production still gets process-local protection.
    const checks = [
      memoryLimit(`ip:10m:${options.ip}`, 3, 10 * 60 * 1000),
      memoryLimit(`ip:1d:${options.ip}`, 10, 24 * 60 * 60 * 1000),
      memoryLimit(`email:1h:${emailKey}`, 3, 60 * 60 * 1000),
      memoryLimit(`email:1d:${emailKey}`, 5, 24 * 60 * 60 * 1000),
      memoryLimit("global:1h", 150, 60 * 60 * 1000),
    ];
    const index = checks.findIndex((check) => !check.success);
    if (index < 0) return { success: true };
    return { ...checks[index], limiter: labels[index] };
  }

  ensureLimiters(redis);

  const results = await Promise.all([
    checkUpstash(ipShort!, options.ip),
    checkUpstash(ipDay!, options.ip),
    checkUpstash(emailHour!, emailKey),
    checkUpstash(emailDay!, emailKey),
    checkUpstash(globalHour!, "global"),
  ]);

  const index = results.findIndex((result) => !result.success);
  if (index < 0) return { success: true };
  return { ...results[index], limiter: labels[index] };
}

export async function isDuplicateSubmission(options: {
  email: string;
  message: string;
  projectType: string;
}): Promise<boolean> {
  const material = `${options.email}\n${options.projectType}\n${options.message}`;
  const digest = createHash("sha256").update(material).digest("hex");
  const key = `quote:dup:${digest}`;
  const redis = getRedis();

  if (!redis) {
    const hit = memoryStore.get(key);
    const now = Date.now();
    if (hit && hit.resetAt > now) return true;
    memoryStore.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  const created = await redis.set(key, "1", { nx: true, ex: 60 * 60 });
  return created === null;
}
