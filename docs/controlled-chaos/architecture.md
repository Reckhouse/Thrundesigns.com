# Controlled Chaos Poster Lab — Architecture

**Phase:** 0  
**Companion:** [`repository-audit.md`](./repository-audit.md)  
**Status:** Integration architecture locked for implementation after audit review

---

## 1. Goals

- Deliver an interactive 9:16 generative poster instrument as a portfolio case study.
- Preserve the existing Thrundesign marketing site and experience platform.
- Replace `@thrun-design/controlled-chaos` stub internals without breaking registry, CMS, lab, or creation APIs.
- Keep Three.js out of the homepage and unrelated route bundles.
- Balance authored control with seeded, deterministic chaos.

---

## 2. Integration model (locked)

Controlled Chaos is an **experience package**, not a set of portfolio page components.

```text
Sanity project (case study + projectThreeExperience)
        ↓
Next.js /work/[slug]  →  ExperienceClientBoundary (lazy)
        ↓
src/experiences registry
  registry.server.ts   manifests, schemas, URL builders
  registry.client.ts   dynamic import("@thrun-design/controlled-chaos/…")
        ↓
packages/controlled-chaos
  manifest + schemas (server-safe)
  react / react-preview / react-replay (client WebGL)
        ↓
Adapters in src/experiences/controlled-chaos/
  persistence → /api/creations*
  analytics → portfolio stub (console today)
        ↓
Vercel Blob + Upstash Redis
```

### Why not `src/components/poster-lab/`?

The platform already requires packages to export a stable map (`manifest`, `schemas`, `react`, `react-preview`, `react-replay`). Living Engraving proves the pattern. Duplicating UI under `src/components` would:

- Bypass the registry contract
- Risk SSR importing WebGL
- Fork two sources of truth for schemas

**Decision:** all renderer, systems, state, export, and lab chrome live in `packages/controlled-chaos`. Portfolio owns routes, storage, CMS mapping, and adapters only.

---

## 3. Route responsibilities

| Route | Owner | Responsibility |
|-------|-------|----------------|
| `/work/[slug]` | Portfolio + Sanity | SSR case study, SEO, poster/fallback, lazy preview, launch CTA |
| `/lab/controlled-chaos` | Portfolio shell + package `./react` | Fullscreen editor; query params via `parseLabSearchParams` |
| `/creation/[creationId]` | Portfolio + package `./react-replay` | Validate ID, fetch Blob payload, migrate in memory, replay / “Edit” |
| `/api/creations*` | Portfolio | Rate limit, Zod validate, immutable save/load/duplicate |

Case-study slug is CMS-authored (recommended: `controlled-chaos-poster-lab`). No dedicated hard-coded `/work/controlled-chaos-poster-lab` route is required.

---

## 4. Server / client / worker boundaries

### Server (Next.js Route Handlers + Server Components)

- Sanity GROQ and metadata
- Creation GET/POST/duplicate
- Payload size limits and Zod validation (server-safe schemas only)
- Rate limiting and security logging (hashed IDs)
- Compatibility checks (`stateSchemaVersion`, experience key)

### Client (package React entries)

- WebGL / R3F canvas
- Physics, audio analysis, pointer interaction
- Local file pickers (SVG, audio)
- Render-loop state (refs / uniforms — **never** React setState every frame)
- MediaRecorder / still export
- Zustand editor store
- Quality profiling

### Workers (add when measurable)

- SVG sanitize / normalize / path sampling
- Large particle target generation
- Thumbnail encoding
- Future WebCodecs export

Do **not** move the renderer to OffscreenCanvas in v1 unless profiling demands it.

### Dynamic import rule

Three.js entries load only from Client Components via the client registry (and lab/creation client wrappers), with SSR disabled for canvas trees — same pattern as Living Engraving’s `ssr: false` hero loader.

---

## 5. Package public contract

Keep exports stable while replacing the stub:

| Export | Server-safe? | Role |
|--------|--------------|------|
| `./manifest` | Yes | Experience key, presets, versions, capabilities, `labPath` |
| `./schemas` | Yes | Embed config + creation Zod schemas (**no Three imports**) |
| `./react-preview` | No | Inline / case-study preview |
| `./react` | No | Full lab |
| `./react-replay` | No | Shared creation replay |

Experience key (immutable): `controlled-chaos-poster-lab`

When WebGL lands, add peers matching Living Engraving:

- `three` `^0.185`
- `@react-three/fiber` `^9`
- `react` / `react-dom` `^19`
- `zod` `^4`

Plus later peers as systems need them: `@react-three/drei`, `@react-three/postprocessing`, `@react-three/rapier`, `zustand`.

---

## 6. Visual-system plugin architecture

Each system is independently registered, serializable, quality-aware, and disposable.

```ts
type VisualSystemKey =
  | 'particle-disintegration'
  | 'chrome-liquid'
  | 'inflatable-type'
  | 'crt-photocopy'
  | 'torn-paper'
  | 'elastic-type'
  | 'type-architecture'
  | 'audio-displacement'

interface VisualSystemDefinition<TConfig> {
  key: VisualSystemKey
  version: number
  title: string
  description: string
  capabilities: VisualSystemCapabilities
  schema: unknown // Zod schema
  defaultConfig: TConfig
  presets: Array<VisualSystemPreset<TConfig>>
  migrateConfig?: (previousVersion: number, value: unknown) => TConfig
}
```

Central registry lives in `packages/controlled-chaos/src/systems/registry.ts`.  
Scene host mounts **one** active system component; switching must dispose prior GPU/physics resources.

### MVP systems (product §39)

1. Particle disintegration  
2. Chrome liquid typography  
3. CRT / photocopy  
4. Audio-reactive displacement (applied to ≥2 systems)

### Version-one additions

Inflatable, torn paper, elastic, type-architecture, gesture record/replay polish.

---

## 7. State architecture

### 7.1 Serializable document state (shared)

Saved to Blob via `/api/creations`. Includes phrase, font, system + params, palette, camera, lighting, seed, loop duration, gestures, asset refs, postprocessing.

Expand stub schema from:

```ts
state: z.record(z.string(), z.unknown())
```

to a versioned **`PosterCreationV1`** object validated by Zod (see product §12), still wrapped by existing:

```ts
{
  stateSchemaVersion,
  experienceKey: 'controlled-chaos-poster-lab',
  presetKey?,
  createdAt,
  state: PosterCreationV1,
  thumbnailUrl?,
  title?
}
```

### 7.2 Session state (local only)

Inspector tab, dialogs, onboarding flags, panel sizes, last export format — Zustand persist optional; **not** in public creation JSON.

### 7.3 Ephemeral frame state

Particle positions, physics transforms, audio frequency arrays, pointer forces, shader uniforms — refs / typed arrays / engine buffers only.

### Store shape (Zustand slices inside package)

- `documentSlice` — serializable creation
- `sceneSlice` — active system runtime handles (non-serializable refs as needed)
- `timelineSlice` — playhead, loop duration, gesture record mode
- `interactionSlice` — force mode, overlays
- `audioSlice` — local buffer handles (non-serializable)
- `exportSlice` — export progress
- `uiSlice` — session chrome

Undo/redo records **document actions**, not frames. Cap history; reference large SVG payloads by id/checksum.

---

## 8. Persistence and sharing

```text
Serialize document
  → strip ephemeral
  → canonicalize
  → Zod validate
  → enforce CREATIONS_MAX_BYTES
  → POST /api/creations
  → rate limit
  → create cc_ + 24 hex id
  → put Blob creations/{id}.json
  → optional Redis meta
  → return /creation/{id}
```

**Immutable model:** edit a shared creation locally → save creates a **new** ID (`duplicate` API supports forking). Old links remain valid.

Load path migrates `stateSchemaVersion` in memory; never rewrite historical Blob objects solely because the app schema advanced.

---

## 9. Renderer capability layer

Production path: **WebGLRenderer** + GLSL + WebGL postprocessing.

```ts
type RendererMode = 'webgl' | 'webgpu'

interface RendererCapabilities {
  mode: RendererMode
  supportsWebGPU: boolean
  supportsFloatTextures: boolean
  supportsHalfFloatTextures: boolean
  maxTextureSize: number
  maxSamples: number
  recommendedQuality: 'low' | 'medium' | 'high'
}
```

WebGPU / TSL remain behind an adapter; unavailable environments must still run the lab.

---

## 10. Typography pipeline (MVP decision)

**Option A — preconverted typeface JSON** for the curated font registry.

Rationale: native Three `FontLoader` / `TextGeometry` / extrude path; predictable licensing via curated assets; matches Living Engraving’s baked-asset style.

Pipeline:

1. Immediate UI text update  
2. Lightweight preview while typing  
3. Debounced geometry rebuild  
4. LRU geometry cache keyed by phrase + font + layout + bevel  
5. Dispose evicted geometry  

No arbitrary user-font upload in v1.

---

## 11. SVG and audio boundaries

### SVG

Local file → size/MIME checks → sanitize (strip scripts, `foreignObject`, external URLs, event handlers) → normalize → `SVGLoader` shapes → contour / filled sampling → checksum. Never `dangerouslySetInnerHTML` on user SVG.

### Audio

- Curated built-in tracks under asset base path  
- Local upload stays in memory; not sent to analytics or auto-uploaded  
- Saved state may store mode/trackKey/gain/mapping for built-ins only  

---

## 12. Quality and performance

`DeviceProfiler` + `QualityManager` with tiers `low | medium | high`.

Degrade in order: DPR → postprocessing → particle count → shadows → physics bodies → subdivisions.

Targets (engineering, not guarantees): desktop ~55–60 FPS, mobile stable ≥30 FPS. Dev-only diagnostics panel behind a debug flag.

---

## 13. Export pipeline (high level)

| Output | Approach |
|--------|----------|
| Still PNG/JPEG | Offscreen/high-res render target → `toBlob` → download |
| Video | Reset to t=0 → `captureStream` → optional Web Audio destination → `MediaRecorder` with `isTypeSupported` MIME ladder |
| Thumbnail | Same still path at smaller size; store URL on creation meta |

If realtime 1080×1920 cannot hold target FPS: drop to 30 FPS, reduce effects, or fall back to still — never silent stutter. WebCodecs is a later enhancement path.

---

## 14. UI chrome

Reuse portfolio Dark Editorial language (gold/bronze, Libre + Plex, sharp `--radius: 0`, Sheet for mobile inspector).

### Desktop

Top toolbar · left content/system · center 9:16 canvas · right parameters · bottom timeline

### Mobile

Compact toolbar · canvas focus · bottom dock · expandable Sheet inspector

Overlays (safe area, reel chrome, thirds) never appear in exports.

Progressive onboarding (phrase → system → drag → save/export) — no blocking tutorial.

---

## 15. Analytics and security

- Map package events through existing `createControlledChaosAnalyticsAdapter`  
- Do not send phrase text, SVG/audio bytes, or raw state  
- Validate all persisted payloads server-side  
- Keep CSP worker/`blob:` allowances; retest when workers land  
- Dispose geometries, materials, textures, render targets, audio nodes, MediaRecorder tracks, physics worlds, listeners, workers  

---

## 16. Testing strategy (when code lands)

| Layer | Tools |
|-------|-------|
| Unit | Vitest — seed, serialize, sanitize, schemas, gestures, quality |
| Component | RTL — controls, dialogs, reduced motion |
| Scene | `@react-three/test-renderer` — registry, cleanup, quality |
| E2E | Wire existing Playwright — text→still, system switch, SVG reject, share, video, reduced motion |

`npm run validate:experiences` remains the contract gate after package upgrades.

---

## 17. Documentation set (full project)

| Doc | When |
|-----|------|
| `repository-audit.md` | Phase 0 (done) |
| `architecture.md` | Phase 0 (this file) |
| `state-schema.md` | Phase 2 |
| `visual-systems.md` | As systems land |
| `export-pipeline.md` | Phase 6 |
| `security.md` | Phase 7 / 12 |
| `performance-report.md` | Phase 12 |
| `accessibility-report.md` | Phase 12 |
| `browser-test-report.md` | Phase 12 |
| `content-authoring-guide.md` | Phase 11 |
| `launch-checklist.md` | Phase 12 |

Update root README when Poster Lab becomes runnable beyond the stub (env, migrate/test commands, font/system/preset contribution).

---

## 18. Phase 3 status

Particle disintegration is the active default system:

- Text + sanitized SVG point sampling
- Instanced particle field with seeded seamless loop
- Pointer force plane (push / pull / explode / …)
- Quality budgets and curated presets
- Docs: `visual-systems.md`

**Next (Phase 5):** Audio-reactive displacement applied across ≥2 systems; export polish.

---

## 19. Non-goals (v1)

User accounts, public galleries, collaborative editing, arbitrary fonts, true soft-body claims, mandatory WebGPU, AI generation, Illustrator-like multi-layer editing, Neon/Postgres introduction solely for creations.
