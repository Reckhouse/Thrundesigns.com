/**
 * Content Security Policy for Thrun Design Co.
 *
 * Directives are intentional and documented. Prefer tightening later with
 * nonces once Visual Editing / Turnstile flows are measured under Report-Only.
 */

const SANITY_IMG = "https://cdn.sanity.io";
const SANITY_API = "https://*.api.sanity.io https://*.apicdn.sanity.io";
const SANITY_STUDIO = "https://thrundesign.sanity.studio";
/** Hosted Studio redirects into the Sanity manage / app shell. */
const SANITY_STUDIO_SHELL = "https://www.sanity.io https://admin.sanity.io";
const BLOB = "https://*.public.blob.vercel-storage.com";
const TURNSTILE = "https://challenges.cloudflare.com";
const VERCEL = "https://vercel.live https://*.vercel.app";
/** Google tag (gtag.js) — Analytics / Ads measurement after cookie consent. */
const GOOGLE_TAG_SCRIPTS = "https://www.googletagmanager.com";
const GOOGLE_TAG_BEACONS =
  "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com";

/**
 * Enforceable baseline CSP.
 *
 * Reasons per directive:
 * - default-src 'self' — deny by default
 * - script-src — Next bundles + Turnstile + Google tag; 'unsafe-inline' retained
 *   for Next/React hydration until nonce wiring lands; 'wasm-unsafe-eval' for
 *   KTX2/Basis and Meshopt GLB transcoders
 * - style-src — Tailwind/runtime styles require 'unsafe-inline' today
 * - img-src — Sanity CDN, Vercel Blob posters/thumbnails, Google tag pixels,
 *   data/blob for canvases
 * - media-src — Sanity/Blob fallback videos + blob: recordings from experiences
 * - font-src — self + data (next/font)
 * - connect-src — Live Content API, Blob, Turnstile, Google tag beacons, Upstash
 *   via server only (browser may hit Sanity CDN / presentation endpoints);
 *   blob: for KTX2 transcode round-trips if a loader still uses object URLs
 * - worker-src — Three.js / experience workers + blob workers
 * - frame-src — Turnstile + optional Vimeo/YouTube already used in project video
 * - object-src 'none' — no plugins
 * - base-uri 'self' — block base-tag hijacks
 * - form-action 'self' — quotes/creations post to same origin
 * - frame-ancestors — allow Presentation Tool iframe from hosted Studio
 */
export function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} 'wasm-unsafe-eval' ${TURNSTILE} ${GOOGLE_TAG_SCRIPTS}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${SANITY_IMG} ${BLOB} ${GOOGLE_TAG_BEACONS}`,
    `media-src 'self' blob: ${SANITY_IMG} ${BLOB}`,
    `font-src 'self' data:`,
    `connect-src 'self' blob: ${SANITY_API} ${SANITY_IMG} ${BLOB} ${TURNSTILE} ${VERCEL} ${SANITY_STUDIO} ${GOOGLE_TAG_BEACONS} https://*.upstash.io`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `frame-src 'self' ${TURNSTILE} https://www.youtube-nocookie.com https://player.vimeo.com ${SANITY_STUDIO}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors 'self' ${SANITY_STUDIO} ${SANITY_STUDIO_SHELL}`,
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
