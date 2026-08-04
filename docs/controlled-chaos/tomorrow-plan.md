## Controlled Chaos Poster Lab — Tomorrow Plan

## Goal

**No next roadmap phase.** Phases 0–12 are complete (`0.12.0`).

## Remaining work (ops / deploy only)

Complete **needs deploy** items on `docs/controlled-chaos/launch-checklist.md`:

- Production build with `SANITY_API_READ_TOKEN`
- Blob + Upstash env on Vercel
- Manual browser smoke (desktop + mobile)
- Save & share round-trip

Code-side launch wiring (launch `from=`, noindex, rate limits, reduced-motion load gate, retry UIs) is already verified in-repo.

## Known good commands

```bash
npm run test:controlled-chaos
node --import tsx --test src/lib/creations/*.test.ts
npm run validate:experiences
npx tsc --noEmit -p packages/controlled-chaos/tsconfig.json
```

## Things to avoid

- Do not invent a Phase 13 without an explicit v1.1 scope
- Do not move the experience out of `packages/controlled-chaos`
- Do not add database dependencies for creations
- Do not persist local audio bytes
- Do not put Three/R3F/Rapier imports in server-safe files
- Do not claim true soft-body for inflatable/elastic
- Do not silently weaken security checks added in Phase 7

## Quick context summary

- Phases 0–12 complete; package `0.12.0`
- PR: https://github.com/Reckhouse/Thrundesigns.com/pull/26
- Next human step: ship + post-deploy smoke
