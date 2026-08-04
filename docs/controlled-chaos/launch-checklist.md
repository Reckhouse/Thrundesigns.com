# Controlled Chaos — Launch checklist

**Phase:** 12 (complete)  
**Package:** `@thrun-design/controlled-chaos` `0.12.0`  
**Case study slug:** `controlled-chaos-poster-lab`

Status legend: **done** (merged/code), **code-verified** (confirmed in repo), **needs deploy** (requires production secrets / live smoke).

## Pre-merge

- [x] `npm run test:controlled-chaos`
- [x] Creations unit tests (`src/lib/creations/*.test.ts`)
- [x] `npm run validate:experiences` (includes `@react-three/rapier` forbid on server-safe paths)
- [x] `npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json`
- [ ] `npm run build` with `SANITY_API_READ_TOKEN` — **needs deploy** (token not available in agent env)
- [x] Hardening docs: accessibility, performance, browser, security appendix
- [x] CSP allowances documented for workers / blob media

## Content

- [x] Sanity project `controlled-chaos-case-study` published, featured
- [x] Cover `/images/controlled-chaos-cover.jpg`
- [x] Authoring guide + seed docs
- [x] Primary launch link builds `/lab/controlled-chaos` with `from=` — **code-verified** (`withLabReturnPath` on work page / three-experience module)
- [ ] Studio warnings clean on published draft — **needs deploy**

## Runtime

- [x] Case study readable without clicking load — **code-verified** (`ExperienceClientBoundary` idle until interaction; default `loadBehavior: interaction`)
- [x] Interaction load mounts experience after visitor action — **code-verified**
- [x] Reduced motion does not auto-start viewport/immediate embeds — **code-verified** (`ExperienceClientBoundary` forces interaction)
- [x] Lab back link returns to case study — **code-verified** (`returnHref` from safe `from` param)
- [x] Creation replay is `noindex`; thumbnail has meaningful alt — **code-verified**
- [x] Creations API rate-limits + rejects oversized / bad thumbnails — **code-verified** (routes + `rate-limit.ts` + `thumbnail-policy.ts`)
- [ ] `CREATIONS_BLOB_READ_WRITE_TOKEN` or `BLOB_READ_WRITE_TOKEN` in production — **needs deploy**
- [ ] Upstash Redis configured (meta + rate limits) — **needs deploy**
- [x] Context-lost / error boundary retry works without full reload — **code-verified** (package Retry UIs)

## Package hardening (Phase 12)

- [x] Canvas `aria-describedby` + focus-visible rings
- [x] Live regions for export / errors; no raw exception strings in UI
- [x] Quality-budget DPR / shadows; audio RAF skipped when mode off
- [x] Export button labels clarified
- [x] Server-safe validation forbids Rapier imports

## Post-deploy smoke

- [ ] Desktop Chromium: all 7 systems + PNG export — **needs deploy**
- [ ] Desktop Safari: canvas + still export — **needs deploy**
- [ ] Mobile: lab usable, quality feels capped — **needs deploy**
- [ ] Save & share round-trip — **needs deploy**
