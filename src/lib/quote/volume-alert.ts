import { Redis } from "@upstash/redis";
import { logQuoteSecurity } from "@/lib/quote/security-log";

/** Soft alert thresholds under the hard global cap of 150/h. */
const ALERT_THRESHOLDS = [40, 80, 120] as const;
const WINDOW_SECONDS = 60 * 60;

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Count accepted quotes for the current UTC hour and emit a redacted
 * `quote.volume_alert` when crossing soft thresholds (ops observability).
 */
export async function trackAcceptedQuoteVolume(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const hourBucket = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const key = `quote:accepted:${hourBucket}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS + 120);
    }

    for (const threshold of ALERT_THRESHOLDS) {
      if (count === threshold) {
        logQuoteSecurity("quote.volume_alert", {
          acceptedCount: count,
          threshold,
          hourBucket,
        });
      }
    }
  } catch {
    // Observability must never fail a successful submission.
  }
}
