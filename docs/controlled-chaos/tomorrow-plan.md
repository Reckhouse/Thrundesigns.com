## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Ship CRT hotfix (`0.12.1`), re-smoke CRT on production, then optional Safari/mobile + Save & share confirmation.

## Remaining work

1. Merge `cursor/controlled-chaos-crt-fix-4f75` (callback refs in `CrtPostStack`)
2. Re-test CRT / Photocopy on https://thrundesigns-com.vercel.app/lab/controlled-chaos
3. Confirm Save & share shows dock status + round-trips `/creation/{id}`
4. Safari / mobile smoke if available

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
