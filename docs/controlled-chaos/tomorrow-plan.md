## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Resume at **Phase 9**.

## Remaining roadmap

### Phase 9 — Torn paper + type-architecture

Primary goal:

- Add two new visual systems:
  - torn-paper
  - type-architecture

Expected implementation areas:

- `packages/controlled-chaos/src/systems/torn-paper/`
- `packages/controlled-chaos/src/systems/type-architecture/`
- `packages/controlled-chaos/src/systems/registry.ts`
- shell inspector + schema presets + store helpers

### Phase 10 — Full audio mappings

Expand audio beyond current particle/chrome/inflatable/elastic mappings:

- CRT/post stack modulation if tasteful
- Phase 9 systems
- more routing controls and weighted mappings

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

- Current branch contains Phases 0–8
- PR is open and updated
- Inflatable + elastic use fixed-timestep Rapier, lazy-loaded from the scene host
- Save/share, thumbnail upload, replay hydrate, and export remain working paths
