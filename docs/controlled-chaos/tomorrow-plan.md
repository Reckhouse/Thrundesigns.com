## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Optional residual launch checks only. CRT hotfix re-smoke is done.

## Remaining (optional)

1. Confirm Save & share dock status + `/creation/{id}` round-trip
2. Safari / mobile smoke if available
3. Optional: investigate occasional CRT blank frame until first slider/preset nudge (non-crash)

## Known good commands

```bash
npm run test:controlled-chaos
node --import tsx --test src/lib/creations/*.test.ts
npm run validate:experiences
npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json
```

## Things to avoid

- Do not reintroduce object `ref`s on `@react-three/postprocessing` wrapEffect components under React 19
- Do not persist local audio bytes
- Do not put Three/R3F/Rapier imports in server-safe files
