# Launch checklist — Three.js experience CMS

## Pre-merge

- [ ] `npm run validate:experiences`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build` (with `SANITY_API_READ_TOKEN`)
- [ ] `npm --prefix studio run build`
- [ ] Docs present under `docs/three-experience-cms/`
- [ ] CSP headers present (`src/lib/security-headers.ts`)

## Content

- [ ] At least one project with `projectThreeExperience` module + required poster
- [ ] Primary experience launch link opens `/lab/controlled-chaos` with `from=`
- [ ] Featured creation IDs resolve (or gallery hides cleanly when empty)
- [ ] Studio warnings are clean on published drafts

## Runtime

- [ ] Case study readable without clicking load
- [ ] Interaction load mounts stub/real experience
- [ ] Reduced-motion does not auto-start viewport/immediate embeds
- [ ] Lab back link returns to case study
- [ ] Creation replay page is `noindex`
- [ ] Creations API rate-limits and rejects oversized payloads
- [ ] `BLOB_READ_WRITE_TOKEN` or `CREATIONS_BLOB_READ_WRITE_TOKEN` configured in production
- [ ] Upstash Redis configured (metadata index + rate limits)

## After real Controlled Chaos package

- [ ] Re-run integration contract review
- [ ] Re-measure bundle / LCP / lab first frame
- [ ] Browser matrix smoke test
- [ ] Accessibility pass on package controls
