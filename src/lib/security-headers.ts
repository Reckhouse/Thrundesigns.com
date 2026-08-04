/**
 * Content Security Policy for Thrun Design Co.
 *
 * Directives are intentional and documented. Prefer tightening later with
 * nonces once Visual Editing / Turnstile flows are measured under Report-Only.
 */

const SANITY_IMG = "https://cdn.sanity.io";
const SANITY_API = "https://*.api.sanity.io https://*.apicdn.sanity.io";
const SANITY_STUDIO = "https://thrundesign.sanity.studio";
const BLOB = "https://*.public.blob.vercel-storage.com";
const TURNSTILE = "https://challenges.cloudflare.com";
const VERCEL = "https://vercel.live https://*.vercel.app";

/**
 * Enforceable baseline CSP.
 *
 * Reasons per directive:
 * - default-src 'self' — deny by default
 * - script-src — Next bundles + Turnstile widget; 'unsafe-inline' retained for
 *   Next/React hydration until nonce wiring lands
 * - style-src — Tailwind/runtime styles require 'unsafe-inline' today
 * - img-src — Sanity CDN, Vercel Blob posters/thumbnails, data/blob for canvases
 * - media-src — Sanity/Blob fallback videos + blob: recordings from experiences
 * - font-src — self + data (next/font)
 * - connect-src — Live Content API, Blob, Turnstile, Upstash via server only
 *   (browser may hit Sanity CDN / presentation endpoints)
 * - worker-src — Three.js / experience workers + blob workers
 * - frame-src — Turnstile + optional Vimeo/YouTube already used in project video
 * - object-src 'none' — no plugins
 * - base-uri 'self' — block base-tag hijacks
 * - form-action 'self' — quotes/creations post to same origin
 */
export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${SANITY_IMG} ${BLOB}`,
    `media-src 'self' blob: ${SANITY_IMG} ${BLOB}`,
    `font-src 'self' data:`,
    `connect-src 'self' ${SANITY_API} ${SANITY_IMG} ${BLOB} ${TURNSTILE} ${VERCEL} ${SANITY_STUDIO} https://*.upstash.io`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `frame-src 'self' ${TURNSTILE} https://www.youtube-nocookie.com https://player.vimeo.com ${SANITY_STUDIO}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

/** Extra security headers shared across routes. */
export function securityHeaders(): { key: string; value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
  ];
}
