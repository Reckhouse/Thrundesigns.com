# Controlled Chaos — Performance report

**Phase:** 12  
**Package:** `@thrun-design/controlled-chaos` `0.12.0`

## Goals

- Case-study pages stay useful without downloading Three.js until opt-in / lab routes.
- Frame loop never writes React state; uniforms/refs only.
- Quality budgets cap DPR, particles, shadows, and postprocessing by tier.
- Idle audio must not burn RAF when mode is `off`.

## Architecture that protects performance

| Mechanism | Effect |
|-----------|--------|
| Server / client registry split | Manifest + schemas stay SSR-safe |
| `ExperienceClientBoundary` | Defers package chunk until interaction / viewport / immediate |
| Dynamic Rapier import | Inflatable / elastic physics not in the base canvas graph until needed |
| `qualityBudget` / `postprocessingBudget` | low: DPR 1, no shadows, fewer particles; medium/high capped |
| Demand frameloop | Pause + reduced motion stop continuous RAF on the Canvas |
| Audio RAF gate | Sampling loop skipped when `enabled === false` or `mode === "off"` |
| Export path | Still/video capture uses existing canvas; FPS ladder by quality |

## Quality tiers (guidance)

| Tier | Particles (base) | DPR cap | Shadows | Notes |
|------|------------------|---------|---------|-------|
| low | ~10k × density | 1 | off | Mobile / reduced motion / auto low |
| medium | ~28k × density | 1.5 | on (512) | Mid cores |
| high | ~70k × density | 2 | on (1024) | Desktop high |

## Measured / gated in CI

- `npm run validate:experiences` — homepage / work index must not import `/react*` surfaces; server-safe paths forbid Three / R3F / Rapier / postprocessing.
- `npm run test:controlled-chaos` — schemas, harden, seeds, quality helpers.
- Package `tsc --noEmit` for the experience package.

## Re-measure on deploy

1. Production build chunk list: confirm `/` and `/work` (no experience module) do not pull Controlled Chaos canvas code.
2. Case study: bytes after “Try the interactive version”.
3. Lab: time to first frame; switch all 7 systems once.
4. Leave lab: confirm no continuous RAF / retained WebGL context after unmount.
5. Audio off vs curated play: CPU delta on mid-tier mobile.

## Targets

| Metric | Target |
|--------|--------|
| Case-study experience JS before load | ~0 |
| Memory after leaving lab | No continuous RAF |
| Context loss | Recoverable via Retry without full page reload |
