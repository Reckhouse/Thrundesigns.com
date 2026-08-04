# Launch checklist — Three.js experience CMS

## Pre-merge

- [ ] `npm run validate:experiences`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build` (with `SANITY_API_READ_TOKEN`)
- [ ] `npm --prefix studio run build`
- [ ] Docs present under `docs/three-experience-cms/`
- [ ] CSP headers present (`src/lib/security-headers.ts`)

## Content

- [x] Living Engraving project with `projectThreeExperience` + poster
- [x] Controlled Chaos project (`controlled-chaos-poster-lab`) with primary + modules + poster
- [ ] Primary experience launch link opens `/lab/controlled-chaos` with `from=` (verify on deploy)
- [ ] Featured creation IDs resolve (or gallery hides cleanly when empty)
- [ ] Studio warnings are clean on published drafts

## Runtime

- [ ] Case study readable without clicking load
- [ ] Interaction load mounts experience after visitor action
- [ ] Reduced-motion does not auto-start viewport/immediate embeds
- [ ] Lab back link returns to case study
- [ ] Creation replay page is `noindex`
- [ ] Creations API rate-limits and rejects oversized payloads
- [ ] `BLOB_READ_WRITE_TOKEN` or `CREATIONS_BLOB_READ_WRITE_TOKEN` configured in production
- [ ] Upstash Redis configured (metadata index + rate limits)

## After real Controlled Chaos package

- [x] Package shipped through Phase 10 (systems + audio)
- [x] Sanity case-study seed + authoring docs (Phase 11)
- [ ] Re-measure bundle / LCP / lab first frame
- [ ] Browser matrix smoke test
- [ ] Accessibility pass on package controls
