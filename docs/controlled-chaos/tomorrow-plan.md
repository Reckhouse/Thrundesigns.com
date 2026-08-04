## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Resume at **Phase 8**.

## Remaining roadmap

### Phase 8 — Inflatable + elastic

Primary goal:

- Add two new visual systems:
  - inflatable-type
  - elastic-type

Expected implementation areas:

- `packages/controlled-chaos/src/systems/inflatable-type/`
- `packages/controlled-chaos/src/systems/elastic-type/`
- `packages/controlled-chaos/src/systems/registry.ts`
- `packages/controlled-chaos/src/shell/PosterLabShell.tsx`
- `packages/controlled-chaos/src/serialization/posterCreation.schema.ts`
- `packages/controlled-chaos/src/state/usePosterLabStore.tsx`

Constraints:

- Prefer deterministic simulation/settings where practical
- Keep export compatibility in mind
- Keep server-safe modules free of physics/runtime imports
- Do not break existing preset/manifest/contracts

Suggested steps:

1. Install Rapier integration if needed
2. Define schemas/default configs/presets
3. Implement scene systems
4. Add inspector controls
5. Add tests for schemas/registry/store switching
6. Verify export and reduced-motion behavior still degrade safely

### Phase 9 — Torn paper + type-architecture

Likely work:

- new systems
- texture/shape/layout treatment
- stronger composition presets

### Phase 10 — Full audio mappings

Expand audio beyond current particle/chrome mappings:

- CRT/post stack modulation if tasteful
- future Phase 8/9 systems
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
- Do not put Three/R3F imports in server-safe files
- Do not silently weaken security checks added in Phase 7

## Quick context summary

- Current branch already contains Phases 0–7
- PR is open and updated
- Save/share, thumbnail upload, replay hydrate, and export are already working paths
- The next substantial feature work is physics-driven typography
