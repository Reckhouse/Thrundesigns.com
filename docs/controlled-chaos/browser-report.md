# Controlled Chaos — Browser report

**Phase:** 12  
**Package:** `@thrun-design/controlled-chaos` `0.12.0`

Also tracked in architecture as the Phase 12 browser matrix (`browser-test-report.md` naming).

## Supported baseline

| Surface | Expectation |
|---------|-------------|
| Desktop Chromium / Firefox / Safari | Full lab: systems, export still, video when MediaRecorder allows |
| Mobile Safari / Chrome Android | Interaction load; quality auto → low; reduced motion respected |
| No WebGL / context lost | PosterFallback / context-lost retry / error boundary; case study static path remains |
| JS disabled | Server-rendered case study readable; lab controls absent |

## Feature matrix notes

| Feature | Notes |
|---------|-------|
| WebGL2 | Required for full canvas; missing → fallback UI |
| MediaRecorder / WebM | Video export; falls back to still with status message |
| Web Audio | Curated + local; local never persisted |
| Offscreen / workers | CSP allows `worker-src 'self' blob:` and `blob:` media |
| Pointer events | Force plane + `touch-action: none` on canvas |
| Rapier WASM | Lazy-loaded for inflatable / elastic only |

## CSP

Portfolio headers (`src/lib/security-headers.ts`) allow:

- `worker-src 'self' blob:`
- `media-src` / `img-src` with `blob:` for recordings and thumbnails
- Sanity + Vercel Blob host allowlists

Re-verified conceptually for Phase 12: export still uses canvas `toBlob` / data URL; video uses MediaRecorder → blob download; no additional worker surface beyond existing allowances.

## Smoke checklist (manual post-deploy)

- [ ] `/work/controlled-chaos-poster-lab` loads poster + modules without WebGL
- [ ] Launch → `/lab/controlled-chaos` mounts canvas
- [ ] Switch each visual system once (incl. Rapier systems)
- [ ] Export PNG; attempt video (accept still fallback)
- [ ] Save & share → `/creation/{id}` replay + thumbnail alt
- [ ] Toggle reduced motion / Pause
- [ ] Safari iOS + Chrome Android smoke

## Known variances

- Safari video codec support may force still fallback more often than Chromium.
- Low-power / thermal throttling may drop to demand frameloop feel under pause + quality low.
- React 19 + `@react-three/postprocessing@3.0.4`: object refs on wrapEffect components throw on re-render; CRT stack uses callback refs (`0.12.1`).
