import { NextResponse } from "next/server";
import { MAX_FIELD_BYTES } from "@/lib/quote/options";

const GENERIC_BAD = "Invalid request";

export function genericError(
  status: number,
  retryAfterSec?: number,
): NextResponse {
  const headers = new Headers();
  if (retryAfterSec) {
    headers.set("Retry-After", String(retryAfterSec));
  }
  const message =
    status === 429 ? "Too many requests. Please try again later." : GENERIC_BAD;
  return NextResponse.json({ error: message }, { status, headers });
}

export function genericSuccess(): NextResponse {
  return NextResponse.json({ ok: true });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowedOrigins(): string[] {
  const origins = new Set<string>();
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      origins.add(new URL(site).origin);
    } catch {
      /* ignore */
    }
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) origins.add(`https://${vercel}`);
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) origins.add(`https://${vercelUrl}`);
  origins.add("https://www.thrundesigns.com");
  origins.add("https://thrundesigns.com");
  origins.add("https://thrundesigns-com.vercel.app");
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return [...origins];
}

function isAllowedHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return process.env.NODE_ENV !== "production";
  }
  if (
    hostname === "www.thrundesigns.com" ||
    hostname === "thrundesigns.com" ||
    hostname === "thrundesigns-com.vercel.app"
  ) {
    return true;
  }
  // Vercel preview deployments for this project
  if (
    hostname.endsWith(".vercel.app") &&
    hostname.includes("thrundesigns")
  ) {
    return true;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      return new URL(site).hostname === hostname;
    } catch {
      return false;
    }
  }
  return false;
}

export function assertQuoteRequestGuards(
  request: Request,
): NextResponse | null {
  if (request.method !== "POST") {
    return genericError(405);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return genericError(415);
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  // Allow large multipart for files; still reject absurd total bodies.
  if (contentLength > 45 * 1024 * 1024) {
    return genericError(413);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return genericError(403);
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (!isAllowedHost(originUrl.hostname)) {
        return genericError(403);
      }
    } catch {
      return genericError(403);
    }
  } else {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (!isAllowedHost(refererUrl.hostname)) {
          return genericError(403);
        }
      } catch {
        return genericError(403);
      }
    } else if (process.env.NODE_ENV === "production" && !fetchSite) {
      // Missing both Origin/Referer and Sec-Fetch-Site in production is suspicious.
      return genericError(403);
    }
  }

  // Prefer allowlisted origins when Origin is present.
  if (origin && !allowedOrigins().includes(origin)) {
    try {
      const host = new URL(origin).hostname;
      if (!isAllowedHost(host)) return genericError(403);
    } catch {
      return genericError(403);
    }
  }

  return null;
}

export function estimateFieldBytes(values: Record<string, string>): number {
  return Object.values(values).reduce(
    (sum, value) => sum + new TextEncoder().encode(value).length,
    0,
  );
}

export function fieldsTooLarge(values: Record<string, string>): boolean {
  return estimateFieldBytes(values) > MAX_FIELD_BYTES;
}
