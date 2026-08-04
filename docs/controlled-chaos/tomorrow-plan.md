## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Resume at **Phase 12**.

## Remaining roadmap

### Phase 12 — Hardening

- accessibility report (`docs/controlled-chaos/accessibility-report.md`)
- browser report
- performance report
- launch checklist (Controlled Chaos–specific)
- final security polish
- smoke `/work/controlled-chaos-poster-lab` + lab launch

## Known good commands

```bash
npm run test:controlled-chaos
node --import tsx --test src/lib/creations/*.test.ts
npm run validate:experiences
npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json
```

## Things to avoid

- Do not move the experience out of `packages/controlled-chaos`
- Do not add database dependencies for creations
- Do not persist local audio bytes
- Do not put Three/R3F/Rapier imports in server-safe files
- Do not claim true soft-body for inflatable/elastic
- Do not silently weaken security checks added in Phase 7

## Quick context summary

- Phases 0–11 complete; package `0.11.0`
- Sanity case study published: slug `controlled-chaos-poster-lab`
- Cover: `/images/controlled-chaos-cover.jpg`
- Next: launch hardening reports + checklist
