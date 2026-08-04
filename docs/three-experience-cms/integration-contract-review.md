# Integration contract review — Controlled Chaos

Phase 0 comparison of the **Master Spec expected contract** against what exists in this repository today.

**Status:** Controlled Chaos has **not been created yet**. There is no installable package, no sibling workspace, and no public npm package `@thrun-design/controlled-chaos`. This review defines the **target contract** the portfolio will code against via a local stub until the real package lands.

---

## 1. Experience key

| | Value |
|-|-------|
| Expected | `controlled-chaos-poster-lab` |
| Actual | **Missing** — no registry, no CMS field, no package |
| Decision | Use `controlled-chaos-poster-lab` as the first registry key and stub manifest `id` |

---

## 2. Package identity

| | Value |
|-|-------|
| Expected package | `@thrun-design/controlled-chaos` |
| Actual | **Not installed** (absent from root and studio `package.json`, `node_modules`, npm registry) |
| Decision | Phase 1 ships a local stub at `packages/controlled-chaos` with package name `@thrun-design/controlled-chaos`, linked via `file:` / workspace dependency |

Optional later: publish `@thrun-design/controlled-chaos-manifest` (manifest + schemas only) for Studio if the full package becomes heavy. Until then, Studio imports `./manifest` and `./schemas` entries only.

---

## 3. Expected vs actual exports

### Expected (Master Spec)

```ts
import {
  ControlledChaosExperience,
  ControlledChaosPreview,
  ControlledChaosReplay,
} from '@thrun-design/controlled-chaos'

import { controlledChaosManifest } from '@thrun-design/controlled-chaos/manifest'

import {
  controlledChaosCreationSchema,
  controlledChaosEmbedConfigSchema,
} from '@thrun-design/controlled-chaos/schemas'
```

Also referenced for dynamic import paths:

- `@thrun-design/controlled-chaos/react-preview`
- `@thrun-design/controlled-chaos/react`
- `@thrun-design/controlled-chaos/react-replay`

### Actual

| Export / entry | Actual |
|----------------|--------|
| Named React components | **None** |
| `/manifest` | **None** |
| `/schemas` | **None** |
| `/react`, `/react-preview`, `/react-replay` | **None** |

### Stub export map (Phase 1 target)

Align stub `package.json` `exports` with the dynamic-import paths the registry will use (preferred over barrel-only imports for code-splitting):

| Entry | Stub responsibility |
|-------|---------------------|
| `.` | Optional named re-exports for non-bundled tooling |
| `./manifest` | `controlledChaosManifest` — **server-safe**, no Three.js |
| `./schemas` | Zod embed + creation schemas — **server-safe**, no Three.js |
| `./react-preview` | default export preview component (client) |
| `./react` | default export full experience (client) |
| `./react-replay` | default export replay (client) |

Named exports `ControlledChaosExperience` / `Preview` / `Replay` may re-export the same defaults for DX; the portfolio registry must use the **entry paths**, not guess undocumented names.

**Rule:** Do not invent additional public APIs beyond this contract until the real package documents them.

---

## 4. Manifest shape

### Expected (inferred from Master Spec)

Manifest must supply at least:

- Experience key / id  
- Display title  
- Presets (`{ key, title, … }`)  
- Supported modes (`preview` \| `inline` \| `replay`)  
- Supported controls / quality / capabilities  
- Default dimensions  
- `packageVersion`, `stateSchemaVersion`, `embedConfigVersion`  
- Asset base path / asset requirements  

### Actual

**None.**

### Stub manifest (Phase 1 baseline)

```ts
export const controlledChaosManifest = {
  experienceKey: 'controlled-chaos-poster-lab',
  title: 'Controlled Chaos Poster Lab',
  packageVersion: '0.0.0-stub',
  stateSchemaVersion: 1,
  embedConfigVersion: 1,
  assetBasePath: '/experiences/controlled-chaos',
  presets: [
    { key: 'signal-failure', title: 'Signal Failure' },
    { key: 'grid-bloom', title: 'Grid Bloom' },
    { key: 'cold-open', title: 'Cold Open' },
  ],
  modes: ['preview', 'inline', 'replay'] as const,
  quality: ['auto', 'low', 'medium', 'high'] as const,
  controls: ['none', 'minimal', 'full'] as const,
  capabilities: {
    textEditing: true,
    svgUpload: true,
    audio: true,
    export: true,
  },
  defaultHeight: 720,
  labPath: '/lab/controlled-chaos',
}
```

Preset keys are placeholders for Studio option wiring. The real package may replace titles/keys; migration guidance belongs in the package upgrade guide.

---

## 5. Embed configuration schema

### Expected

`controlledChaosEmbedConfigSchema` validates props passed into the embedded experience (mode, preset, quality, controls, autoplay, height, capability flags). CMS fields are mapped then validated — raw Sanity objects never enter the renderer.

### Actual

**None.**

### Stub schema (Phase 1 baseline)

Validate at least:

```ts
{
  mode: 'preview' | 'inline' | 'replay'
  initialPresetKey?: string
  initialCreationId?: string
  quality: 'auto' | 'low' | 'medium' | 'high'
  controls: 'none' | 'minimal' | 'full'
  autoplay: boolean
  height: number // 400–1400
  allowTextEditing: boolean
  allowSvgUpload: boolean
  allowAudio: boolean
  allowExport: boolean
  embedConfigVersion: number
}
```

Cross-rules (schema + registry):

- `replay` requires `initialCreationId`  
- `preview` / `inline` may use `initialPresetKey`  
- Capability flags must be `false` when manifest `capabilities.*` is false  
- `controls: 'full'` disallowed in `preview` mode  

---

## 6. Creation schema

### Expected

`controlledChaosCreationSchema` validates saved poster-creation state for persistence and replay. Creations are versioned (`stateSchemaVersion`).

### Actual

**None.** No creations API or store.

### Stub schema (Phase 1 baseline)

Minimal durable shape for API scaffolding:

```ts
{
  stateSchemaVersion: 1
  experienceKey: 'controlled-chaos-poster-lab'
  presetKey?: string
  createdAt: string // ISO
  // opaque experience state — structure owned by the package
  state: Record<string, unknown>
  // optional derived preview
  thumbnailUrl?: string
  title?: string
}
```

Real package will tighten `state`. Portfolio stores payloads in Blob after server-side `safeParse`; rejects oversize / invalid bodies.

---

## 7. Asset base path

| | Value |
|-|-------|
| Expected | Package-defined asset base (textures, WASM, audio, etc.) |
| Actual | **None** |
| Stub decision | `assetBasePath: '/experiences/controlled-chaos'` served from `public/experiences/controlled-chaos/` (empty placeholder dir until real assets exist) |
| Lab route | Passes absolute asset base URL into package props |

Hero horse particles use `/public/data/horse-particles*` — **out of scope**; do not reuse that path for Controlled Chaos.

---

## 8. Versioning

| Dimension | Expected | Actual | Stub |
|-----------|----------|--------|------|
| Package version | Semver from installed package | Missing | `0.0.0-stub` |
| State schema version | Integer in creation payloads | Missing | `1` |
| Embed config version | Integer stored in CMS + validated | Missing | `1` (CMS field read-only, set from manifest) |

Portfolio must detect mismatches and show editor/dev warnings + visitor fallbacks.

---

## 9. Compatibility problems (current)

| Problem | Severity | Mitigation |
|---------|----------|------------|
| Package not created | Blocker for real WebGL | Stub package for platform build |
| No export map to verify | High | Lock stub exports to this doc; re-run review when real package lands |
| No creations store | High | Phase 7 Blob + Redis |
| No CSP for workers/blob media | Medium | Phase 9 headers review |
| No analytics pipeline | Medium | Adapter interface + no-op |
| No automated tests/CI | Medium | Add Vitest for mapper/registry early |
| Spec names (`portfolioProject`, PT body) diverge from repo | Low | Map to `project` + modules (see architecture.md) |
| Homepage already loads R3F for horse particles | Note | Experience chunks must still not load on unrelated project pages; horse remains separate |

---

## 10. Required environment variables (projected)

Existing (reuse):

- Sanity public + read/write tokens  
- `BLOB_READ_WRITE_TOKEN` (or dedicated creations store token if isolated)  
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (rate limits + creation index)  
- `NEXT_PUBLIC_SITE_URL`

Likely new:

| Variable | Purpose |
|----------|---------|
| `CREATIONS_BLOB_READ_WRITE_TOKEN` | Optional dedicated Blob store for creation JSON (fallback: public media token with path prefix `creations/`) |
| `CREATIONS_MAX_BYTES` | Payload size cap (default e.g. 256KB) |
| `NEXT_PUBLIC_CONTROLLED_CHAOS_ASSET_BASE` | Optional override for asset CDN/base |

No Sanity Studio secrets for the experience package — Studio only needs manifest-safe imports.

---

## 11. Proposed package configuration (Phase 1)

```json
// root package.json (conceptual)
{
  "dependencies": {
    "@thrun-design/controlled-chaos": "file:packages/controlled-chaos"
  }
}
```

```json
// packages/controlled-chaos/package.json (conceptual)
{
  "name": "@thrun-design/controlled-chaos",
  "version": "0.0.0-stub",
  "type": "module",
  "exports": {
    "./manifest": "./src/manifest.ts",
    "./schemas": "./src/schemas.ts",
    "./react-preview": "./src/react-preview.tsx",
    "./react": "./src/react.tsx",
    "./react-replay": "./src/react-replay.tsx"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

Next.js: add package to `transpilePackages` if required for TSX from `packages/`.

Studio: depend on the same package but import **only** `manifest` / `schemas` in schema option helpers.

---

## 12. Proposed registry structure

```ts
// registry.server.ts — conceptual
export const experienceRegistryServer = {
  'controlled-chaos-poster-lab': {
    manifest: controlledChaosManifest,
    validateEmbedConfig: (v) => controlledChaosEmbedConfigSchema.parse(v),
    buildLaunchUrl: (config) => buildControlledChaosLaunchUrl(config),
  },
}

// registry.client.ts — conceptual
export const experienceRegistryClient = {
  'controlled-chaos-poster-lab': {
    loadPreview: () => import('@thrun-design/controlled-chaos/react-preview'),
    loadExperience: () => import('@thrun-design/controlled-chaos/react'),
    loadReplay: () => import('@thrun-design/controlled-chaos/react-replay'),
  },
}
```

---

## 13. Proposed routes

| Route | Phase |
|-------|-------|
| `/work/[slug]` + `projectThreeExperience` module | 4–5 |
| `/lab/controlled-chaos` | 6 |
| `/creation/[creationId]` | 7 |
| `/api/creations`, `/api/creations/[id]`, `.../duplicate` | 7 |

---

## 14. Existing schemas to extend (not replace)

- [`studio/schemaTypes/documents.ts`](../../studio/schemaTypes/documents.ts) — `project`  
- [`studio/schemaTypes/blocks/`](../../studio/schemaTypes/blocks/) — add `projectThreeExperience.ts`  
- [`studio/schemaTypes/index.ts`](../../studio/schemaTypes/index.ts) — register type  
- [`src/sanity/lib/queries.ts`](../../src/sanity/lib/queries.ts) — project projections  
- [`src/types/project-modules.ts`](../../src/types/project-modules.ts) + typegen  
- [`src/components/project/project-modules.tsx`](../../src/components/project/project-modules.tsx) — module case  

Do **not** edit these in Phase 0.

---

## 15. Recommended Phase 1 implementation

After this audit is reviewed:

1. Create `packages/controlled-chaos` stub with manifest, schemas, and non-WebGL placeholder React entries.  
2. Add root dependency + `transpilePackages` as needed.  
3. Implement `src/experiences/types.ts`, `registry.server.ts`, `registry.client.ts`, `compatibility.ts`.  
4. Prove production `next build` still succeeds and server registry does not pull `three`.  
5. Add a small `validate-experience-compatibility` script that asserts registry keys match stub manifest.  
6. Stop before Sanity schema edits until Phase 1 exit criteria pass — or proceed to Phase 2 in the same PR only if Phase 1 is green.

---

## 16. Re-review trigger

Re-run this document when the real Controlled Chaos package is available. Diff:

- Expected experience key ↔ actual  
- Expected package exports ↔ actual export map  
- Expected manifest shape ↔ actual  
- Expected embed schema ↔ actual  
- Expected creation schema ↔ actual  
- Expected asset base path ↔ actual  
- Expected versioning ↔ actual  

Until then, the stub contract above is the source of truth for portfolio work.
