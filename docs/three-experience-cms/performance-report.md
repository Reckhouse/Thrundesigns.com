# Performance report — experience platform

Phase 10 baseline for the interactive experience integration (stub renderer).

## Goals

- Case-study pages remain useful and fast without loading WebGL.
- Three.js (or the stub package chunk) loads only after opt-in / viewport / explicit lab routes.
- Homepage horse-particles WebGL stays isolated from Controlled Chaos package chunks.

## Architecture that protects performance

| Mechanism | Effect |
|-----------|--------|
| Server Components for case study copy | HTML without experience JS |
| `ExperienceClientBoundary` | Defers dynamic import until interaction/viewport/immediate |
| Split `registry.server` / `registry.client` | Manifest/schemas never pull canvas code into SSR graph |
| Poster-first UI | LCP can be the designed poster image |
| Lab/creation routes | Heavy loaders only on dedicated URLs |

## Measured locally (this environment)

- `next build` succeeds with routes for `/`, `/work/[slug]`, `/lab/controlled-chaos`, `/creation/[id]`.
- Source boundary checks (`npm run validate:experiences`) confirm homepage and work index do not import `@thrun-design/controlled-chaos/react*`.
- Stub package has **no** `three` dependency — real package upgrade must re-measure async chunk size.

## Re-measure when the real package lands

1. Production build + bundle analyzer (or Next build output chunk list).
2. Confirm `/` and `/work` (without experience modules) do not download Controlled Chaos chunks.
3. On a project with an experience module: measure bytes after clicking “Try the interactive version”.
4. Lab route: time to first frame after navigation.
5. Unmount on client navigation: ensure no retained WebGL contexts (real package responsibility).

## Targets (guidance)

| Metric | Target |
|--------|--------|
| Initial case-study JS attributable to experiences | ~0 until load action |
| Poster → first interactive frame | Subjective QA on mid-tier mobile |
| Memory after leaving lab | No continuous RAF after unmount |

## Known homepage note

The marketing homepage already lazy-loads horse particles (`three` / R3F). That is separate from the experience registry. Do not treat homepage Three.js presence as a Controlled Chaos leak.
