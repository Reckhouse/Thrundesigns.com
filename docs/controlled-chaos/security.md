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

## Persistence flow (visitor)

```
Lab Save locally
  → harden + serialize (client)
  → download PNG still + creation JSON (browser only)
```

Public write APIs are disabled:

```
POST /api/creations → 403
POST /api/creations/thumbnail → 403
POST /api/creations/{id}/duplicate → 403
```

Existing creation IDs remain readable via `GET /api/creations/{id}` and `/creation/{id}` for curated / historical replays. Thumbnail URLs on those records still require HTTPS + Blob hostname allowlist for OG.

## API surfaces

| Route | Guards |
|-------|--------|
| `POST /api/creations` | **403** — public uploads disabled |
| `POST /api/creations/thumbnail` | **403** — public uploads disabled |
| `GET /api/creations/{id}` | ID format check, `Cache-Control: private, no-store`, redacted security logs |
| `POST /api/creations/{id}/duplicate` | **403** — public uploads disabled |

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

Portfolio CSP already allows `worker-src` / `blob:` for experience workers and `blob:` for media/img used by recordings and thumbnails. Phase 12 re-checked headers in `src/lib/security-headers.ts` against still export, MediaRecorder video fallback, and Rapier WASM lazy load — no CSP expansion required for v1.

## Phase 12 appendix — final polish

| Item | Change |
|------|--------|
| Error UI | Renderer boundary and context-lost screens expose Retry; raw `error.message` is not shown to visitors |
| Thumbnail alt | Creation pages use a title-derived `alt` (still `noindex`) |
| Server import gate | `validate-experience-compatibility` forbids `@react-three/rapier` on server-safe paths |
| Audio idle | Analyser RAF does not run when `audio.mode === "off"` |
| Trust boundary | Persist harden + analytics redaction from Phase 7 unchanged |

Non-goals remain: accounts, private creations, signed JSON blob URLs.
