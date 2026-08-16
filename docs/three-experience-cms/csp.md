# CSP notes — experience platform

Implemented in [`src/lib/security-headers.ts`](../../src/lib/security-headers.ts) and applied via [`next.config.ts`](../../next.config.ts).

## Directives and reasons

| Directive | Why |
|-----------|-----|
| `default-src 'self'` | Deny-by-default |
| `script-src 'self' 'unsafe-inline' 'unsafe-eval' challenges.cloudflare.com` | Next hydration + Turnstile. Tighten with nonces later |
| `style-src 'self' 'unsafe-inline'` | Tailwind / runtime styles |
| `img-src ... cdn.sanity.io *.public.blob.vercel-storage.com data: blob:` | CMS posters, Blob media, canvas exports |
| `media-src ... blob: Sanity/Blob` | Fallback videos + future recordings |
| `connect-src` Sanity API/CDN, Blob, Turnstile, Vercel, Studio, Upstash | Live Content, Presentation, uploads |
| `worker-src 'self' blob:` | Experience workers / WASM bridges |
| `frame-src` Turnstile, YouTube-nocookie, Vimeo, Studio | Existing embeds + auth widgets |
| `frame-ancestors 'self' thrundesign.sanity.studio www.sanity.io admin.sanity.io` | Presentation Tool preview iframe |
| `object-src 'none'` | No plugins |
| `base-uri 'self'` / `form-action 'self'` | Reduce injection surface |

## What we intentionally did not do

- Did not set a global `upgrade-insecure-requests` separately (HTTPS is assumed on Vercel).
- Did not remove `'unsafe-inline'`/`'unsafe-eval'` yet — would break current Next + Turnstile without nonce plumbing.
- Did not allow arbitrary CDN script hosts for experiences — packages must ship with the app bundle.

## Validation

After deploy, verify in DevTools that:

1. Homepage and case studies load without CSP errors for Sanity images.
2. Quote form Turnstile still runs.
3. Lab route can create blob workers when the real package needs them.
4. Creation thumbnails from Blob hosts render.
