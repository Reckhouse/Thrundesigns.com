/**
 * Canonical public origin (no trailing slash).
 * Apex `thrundesigns.com` 308s to `www` on Vercel — keep metadata on www.
 */
export const CANONICAL_SITE_URL = "https://www.thrundesigns.com";

const LEGACY_SITE_HOSTS = new Set([
  "thrundesigns-com.vercel.app",
  "thrundesigns.com",
]);

function withHttps(hostOrUrl: string): string {
  const raw = hostOrUrl.trim().replace(/\/$/, "");
  if (!raw) return CANONICAL_SITE_URL;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
  return `https://${raw}`;
}

/** Map legacy / non-canonical hosts to the production www origin. */
export function normalizeSiteUrl(hostOrUrl: string): string {
  try {
    const url = new URL(withHttps(hostOrUrl));
    if (LEGACY_SITE_HOSTS.has(url.hostname.toLowerCase())) {
      return CANONICAL_SITE_URL;
    }
    return url.origin;
  } catch {
    return CANONICAL_SITE_URL;
  }
}

/** Canonical public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalizeSiteUrl(explicit);

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  return CANONICAL_SITE_URL;
}
