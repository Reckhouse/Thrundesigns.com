## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Resume at **Phase 11**.

## Remaining roadmap

### Phase 11 — Sanity case-study polish

- authoring and presentation polish
- experience metadata/content integration
- case-study copy / modules for Controlled Chaos

### Phase 12 — Hardening

- accessibility report
- browser report
- performance report
- launch checklist
- final security polish

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

- Current branch contains Phases 0–10
- Package version `0.10.0`
- Audio maps across all seven systems including CRT
- Next work is Sanity case-study polish, then launch hardening
