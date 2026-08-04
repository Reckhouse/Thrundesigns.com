## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

Roadmap complete through **Phase 12**. No further planned phases for v1.

## Remaining work (ops / deploy)

- Complete unchecked items on `docs/controlled-chaos/launch-checklist.md`
- Production build with Sanity token
- Manual browser smoke (desktop + mobile)
- Confirm Blob + Upstash env on Vercel

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

- Phases 0–12 complete; package `0.12.0`
- Sanity case study published: slug `controlled-chaos-poster-lab`
- Cover: `/images/controlled-chaos-cover.jpg`
- Hardening reports + launch checklist landed in Phase 12
