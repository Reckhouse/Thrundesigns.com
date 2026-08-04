# Controlled Chaos — Security

**Phase:** 7

This document covers creation persistence, analytics redaction, and client/server trust boundaries for the Poster Lab.

## Threat model (v1)

| Asset | Risk | Mitigation |
|-------|------|------------|
| Creation JSON | Oversized / malicious SVG / unexpected fields | Zod envelope + `hardenPosterCreationForPersist` (re-sanitize SVG, scrub titles, drop `audio.mode=local`) |
| Thumbnail URL | Open-redirect / OG SSRF via attacker-controlled URL | HTTPS + Vercel Blob hostname allowlist only |
| Thumbnail bytes | Polyglot / mismatched MIME | Magic-byte detection must match declared type |
| Creation IDs | Enumeration | `cc_` + 96-bit random; invalid IDs logged without echoing raw probes beyond hash on known formats |
| Rate abuse | Save/thumbnail floods | Separate IP + global sliding windows (save 20/h, thumb 30/h per IP) |
| Analytics | Phrase / SVG / audio leakage | Adapter events only; no content payloads |
| Secrets | Blob/Redis tokens | Server-only env; never in package client bundles |

Non-goals: authenticated accounts, private creations, signed blob URLs for JSON (public immutable share links by design).

## Persistence flow

```
Lab Save & share
  → harden + serialize (client)
  → POST /api/creations/thumbnail (optional JPEG/PNG/WebP data URL)
  → POST /api/creations (Zod + harden + size + thumbnail allowlist)
  → Blob creations/{id}.json + Redis meta
  → /creation/{id} (noindex; OG image only if allowlisted)
```

Saves are **immutable**: each save allocates a new `cc_` id. Edits create a new link; old links remain valid.

## API surfaces

| Route | Guards |
|-------|--------|
| `POST /api/creations` | Rate limit, Content-Length budget, Zod, harden, `CREATIONS_MAX_BYTES`, experience key pin |
| `POST /api/creations/thumbnail` | Separate rate limit, Content-Length, data-URL parse, magic bytes, 1.5 MB cap |
| `GET /api/creations/{id}` | ID format check, `Cache-Control: private, no-store`, redacted security logs |
| `POST /api/creations/{id}/duplicate` | Rate limit + load + new immutable save |

## Logging

`logCreationsSecurity` emits JSON lines with hashed IPs / creation id hashes only:

- `creations.rate_limited` (surface: save \| thumbnail)
- `creations.saved` / `creations.save_failed`
- `creations.thumbnail_uploaded` / `creations.thumbnail_rejected`
- `creations.invalid_id` / `creations.load_failed`
- `creations.duplicated`

Never log phrase text, SVG markup, audio bytes, or full creation JSON.

## Environment

| Variable | Purpose |
|----------|---------|
| `CREATIONS_BLOB_READ_WRITE_TOKEN` | Preferred Blob token for creations (falls back to `BLOB_READ_WRITE_TOKEN`) |
| `CREATIONS_MAX_BYTES` | Soft JSON payload cap (default `262144`) |
| `UPSTASH_REDIS_REST_*` / `KV_REST_API_*` | Rate limits + creation meta index |

## Client package rules

- Server-safe modules: `manifest`, `schemas`, `persistence` (harden), SVG sanitizer, seeds, serialization
- Analytics must not receive phrase / SVG / audio
- Local audio never leaves the browser; persist path forces `audio.mode` off when local
- Dispose GPU / audio / MediaRecorder resources on unmount and system switch

## CSP

Portfolio CSP already allows `worker-src` / `blob:` for experience workers. Re-test headers when dedicated export workers land (Phase 12).
