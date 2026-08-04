# Controlled Chaos — Launch checklist

**Phase:** 12  
**Package:** `@thrun-design/controlled-chaos` `0.12.0`  
**Case study slug:** `controlled-chaos-poster-lab`

## Pre-merge

- [x] `npm run test:controlled-chaos`
- [x] Creations unit tests (`src/lib/creations/*.test.ts`)
- [x] `npm run validate:experiences` (includes `@react-three/rapier` forbid on server-safe paths)
- [x] `npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json`
- [ ] `npm run build` with `SANITY_API_READ_TOKEN` (deploy / local with secrets)
- [x] Hardening docs: accessibility, performance, browser, security appendix
- [x] CSP allowances documented for workers / blob media

## Content

- [x] Sanity project `controlled-chaos-case-study` published, featured
- [x] Cover `/images/controlled-chaos-cover.jpg`
- [x] Authoring guide + seed docs
- [ ] Primary launch link opens `/lab/controlled-chaos` with `from=` on deploy
- [ ] Studio warnings clean on published draft

## Runtime

- [ ] Case study readable without clicking load
- [ ] Interaction load mounts experience after visitor action
- [ ] Reduced motion does not auto-start viewport/immediate embeds
- [ ] Lab back link returns to case study
- [ ] Creation replay is `noindex`; thumbnail has meaningful alt
- [ ] Creations API rate-limits + rejects oversized / bad thumbnails
- [ ] `CREATIONS_BLOB_READ_WRITE_TOKEN` or `BLOB_READ_WRITE_TOKEN` in production
- [ ] Upstash Redis configured (meta + rate limits)
- [ ] Context-lost / error boundary retry works without full reload

## Package hardening (Phase 12)

- [x] Canvas `aria-describedby` + focus-visible rings
- [x] Live regions for export / errors; no raw exception strings in UI
- [x] Quality-budget DPR / shadows; audio RAF skipped when mode off
- [x] Export button labels clarified
- [x] Server-safe validation forbids Rapier imports

## Post-deploy smoke

- [ ] Desktop Chromium: all 7 systems + PNG export
- [ ] Desktop Safari: canvas + still export
- [ ] Mobile: lab usable, quality feels capped
- [ ] Save & share round-trip
