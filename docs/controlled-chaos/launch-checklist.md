# Controlled Chaos — Launch checklist

**Phase:** 12 (complete) + production smoke  
**Package:** `@thrun-design/controlled-chaos` `0.12.1` (CRT hotfix)  
**Case study slug:** `controlled-chaos-poster-lab`  
**Production:** https://thrundesigns-com.vercel.app · deploy `dpl_HFweRQoGf1ESGC6DY5NjnoG3nQSX` (PR #26 merge)

Status legend: **done**, **code-verified**, **smoke-pass**, **needs follow-up**.

## Pre-merge

- [x] `npm run test:controlled-chaos`
- [x] Creations unit tests (`src/lib/creations/*.test.ts`)
- [x] `npm run validate:experiences`
- [x] `npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json`
- [x] Production Vercel build for merge commit — **smoke-pass** (READY)
- [x] Hardening docs + CSP documented

## Content

- [x] Sanity project published, featured, 7 modules, `loadBehavior: interaction`
- [x] Cover `/images/controlled-chaos-cover.jpg`
- [x] Authoring guide + seed docs
- [x] Launch link includes `from=/work/controlled-chaos-poster-lab` — **smoke-pass**
- [ ] Studio warnings clean on published draft — optional human check

## Runtime

- [x] Case study readable without WebGL — **smoke-pass**
- [x] Interaction / launch mounts lab — **smoke-pass**
- [x] Reduced motion load gate — **code-verified**
- [x] Lab back link returns to case study when `from=` present — **smoke-pass**
- [x] Creation replay `noindex` + thumbnail alt — **code-verified**
- [x] Creations API validation / thumbnail rejects — **smoke-pass** (400 on bad input)
- [x] Blob storage configured — **smoke-pass** (`POST /api/creations/thumbnail` → 201)
- [ ] Upstash Redis configured — **needs follow-up** (not directly verified; saves may work via Blob head fallback)
- [x] Context-lost / error boundary Retry UI — **smoke-pass** (seen on CRT crash)

## Package hardening (Phase 12)

- [x] Canvas `aria-describedby` + focus-visible rings
- [x] Live regions; no raw exception strings in UI
- [x] Quality-budget DPR / shadows; audio RAF skipped when mode off
- [x] Export labels clarified
- [x] Server-safe validation forbids Rapier imports

## Post-deploy smoke (2026-08-04, desktop Chromium)

- [x] Case study + lab launch + `from=` — **smoke-pass**
- [x] Particle Disintegration + Chrome Liquid render — **smoke-pass**
- [x] Export PNG downloads — **smoke-pass**
- [x] Pause / Play — **smoke-pass**
- [ ] CRT / Photocopy — **needs follow-up** (crashed on React 19 + postprocessing object refs; fixed in `0.12.1`)
- [ ] Safari / mobile — **needs follow-up** (not exercised in agent smoke)
- [ ] Save & share round-trip — **needs follow-up** (button present; share confirmation not clearly observed)

## Hotfix note

CRT crash root cause: object `ref`s on `@react-three/postprocessing` `wrapEffect` components under React 19 (`JSON.stringify(props)` circular structure). Fix: callback refs in `CrtPostStack.tsx` (package `0.12.1`).
