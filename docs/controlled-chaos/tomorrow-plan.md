## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Resume at **Phase 10**.

## Remaining roadmap

### Phase 10 — Full audio mappings

Expand audio beyond current particle/chrome/inflatable/elastic/torn/architecture mappings:

- CRT/post stack modulation if tasteful
- Weighted routing controls across all active systems
- Stronger beat-reactive envelopes where they improve composition

### Phase 11 — Sanity case-study polish

- authoring and presentation polish
- experience metadata/content integration

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

- Current branch contains Phases 0–9
- All seven active visual systems are registered
- Package version `0.9.0`
- Next substantial work is fuller audio-displacement mappings
