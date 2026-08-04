# Controlled Chaos Poster Lab — Repository Audit

**Phase:** 0 (audit only — no production feature implementation)  
**Audited:** 2026-08-04  
**Repo:** Thrundesigns.com (`thrundesign`) — single Next.js app + nested Sanity Studio + local experience packages  
**Branch context:** `cursor/controlled-chaos-phase0-4f75`

> **Stale docs note:** [`docs/three-experience-cms/repository-audit.md`](../three-experience-cms/repository-audit.md) still claims `/lab/*`, `/creation/[creationId]`, `/api/creations/*`, and the Controlled Chaos package are missing. Those surfaces **already exist**. Prefer this document for Poster Lab planning.

---

## 1. Current architecture summary

Thrundesigns.com is a Vercel-hosted Next.js **16.2.11** App Router portfolio with:

- Sanity CMS for marketing and case-study content (hosted Studio, not embedded)
- A reusable **Three.js experience platform** (registry, CMS module, lab routes, creation APIs)
- **Living Engraving** as the first real WebGL experience (`@thrun-design/living-engraving`)
- **Controlled Chaos Poster Lab** as a **stub** package (`@thrun-design/controlled-chaos@0.0.0-stub`) already wired end-to-end

The remaining work is to **replace the stub renderer** inside `packages/controlled-chaos` while preserving export paths, experience key, and persistence contracts — not to scaffold greenfield routes or replace Sanity.

```text
Sanity (project + projectThreeExperience)
        ↓
Next.js case study / lab / creation routes
        ↓
src/experiences registry (server manifests + client dynamic imports)
        ↓
@thrun-design/controlled-chaos  ← stub today; real WebGL next
        ↓
Vercel Blob (creation JSON) + Upstash Redis (meta + rate limits)
```

---

## 5.1 Application framework

| Item | Finding |
|------|---------|
| Next.js | **16.2.11** ([`package.json`](../../package.json)) |
| React / React DOM | **19.2.4** |
| Router | **App Router only** — [`src/app/`](../../src/app/). No `pages/` |
| TypeScript | `^5` → **5.9.3**; [`tsconfig.json`](../../tsconfig.json): `strict`, `moduleResolution: bundler`, path `@/*` → `./src/*`; Studio excluded |
| Package manager | **npm** (`package-lock.json` v3). Studio has its own lockfile |
| Node | No `engines` / `.nvmrc`. Environment reports Node **22.x** |
| Deployment | **Vercel** ([`vercel.json`](../../vercel.json)); prod URL `https://thrundesigns-com.vercel.app` |
| Structure | **Not an npm workspace**, but multi-package: root app + [`studio/`](../../studio/) + [`packages/controlled-chaos`](../../packages/controlled-chaos) + [`packages/living-engraving`](../../packages/living-engraving) via `file:` deps |
| Middleware | **None** (`middleware.ts` absent). Headers via [`src/lib/security-headers.ts`](../../src/lib/security-headers.ts) in `next.config.ts` |
| Route groups | **None** (no `(marketing)` groups) |

### Existing routes

| Route | Path | Role |
|-------|------|------|
| `/` | `src/app/page.tsx` | Marketing homepage |
| `/work` | `src/app/work/page.tsx` | Project index |
| `/work/[slug]` | `src/app/work/[slug]/page.tsx` | Case study (Sanity) |
| `/quote` | `src/app/quote/page.tsx` | Quote form |
| `/quote-attachments` | `src/app/quote-attachments/page.tsx` | Operator attachment unlock |
| `/lab/controlled-chaos` | `src/app/lab/controlled-chaos/page.tsx` | **Poster Lab fullscreen** |
| `/lab/living-engraving` | `src/app/lab/living-engraving/page.tsx` | Living Engraving lab |
| `/creation/[creationId]` | `src/app/creation/[creationId]/page.tsx` | Shared creation replay |
| `/capture/living-engraving` | `src/app/capture/living-engraving/page.tsx` | Capture helper |
| SEO | `robots.ts`, `sitemap.ts` | |

### Existing API architecture

App Router Route Handlers only (default Node serverless on Vercel):

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/draft-mode/enable` | GET | Sanity Presentation draft mode |
| `/api/draft-mode/disable` | GET | Exit draft mode |
| `/api/quote` | POST | Quote submit |
| `/api/quote/bootstrap` | GET | Form bootstrap |
| `/api/quote/attachments/download` | GET | Private Blob download |
| `/api/creations` | POST | Save Controlled Chaos creation |
| `/api/creations/[creationId]` | GET | Load creation |
| `/api/creations/[creationId]/duplicate` | POST | Duplicate (immutable model) |

**Not present:** `/api/assets/upload-intent`, `/api/assets/[assetId]` — add only if public SVG persistence is required later.

---

## 5.2 Sanity configuration

| Item | Finding |
|------|---------|
| Studio location | [`studio/`](../../studio/) — nested package |
| Studio version | `sanity@^6.6.0` + `@sanity/vision@^6.6.0` |
| Embedded vs separate | **Separate / hosted** (`studioHost: "thrundesign"` → `https://thrundesign.sanity.studio`). No `/studio` App Router route |
| Project / dataset | `fbuy6kak` / `production` |
| Frontend | `next-sanity@13.2.1`, API version `2025-01-01` |
| GROQ | Single file [`src/sanity/lib/queries.ts`](../../src/sanity/lib/queries.ts) |
| Live / Visual Editing | `defineLive`, `<SanityLive />`, draft mode + `<VisualEditing />` |
| Images | `mediaAsset` (Sanity image + optional `blobUrl` + required `alt`); resolver [`src/lib/media.ts`](../../src/lib/media.ts) |
| Video | YouTube/Vimeo embeds; experience `fallbackVideo` as Sanity `file` (`video/*`) |
| Draft mode | `/api/draft-mode/*` + Presentation Tool |

### Document / object types

**Documents:** `siteSettings`, `homePage`, `service`, `processStep`, `project`, `quoteForm`, `quoteSubmission`

**Page modules on `project.modules[]`:** `projectRichText`, `projectGallery`, `projectSplit`, `projectMetrics`, `projectProcess`, `projectQuote`, `projectVideo`, `projectThreeExperience`, `projectCta`, `projectCredits`

**Experience fields on `project`:**

- `primaryExperience` → `projectThreeExperience` (hero / fullscreen launch)
- `featuredCreations[]` → creation ID references only (payloads live in app store)

### Portable Text

- Full PT in `projectRichText` (styles, lists, link annotation)
- Restricted PT in `projectSplit`
- Frontend: `@portabletext/react` via [`src/components/project/portable-text.tsx`](../../src/components/project/portable-text.tsx)
- **No** need for a separate Portable Text `threeExperience` block — `projectThreeExperience` already covers the brainstorm’s intent

### `projectThreeExperience` (Controlled Chaos–ready)

Schema: [`studio/schemaTypes/blocks/projectThreeExperience.ts`](../../studio/schemaTypes/blocks/projectThreeExperience.ts)

Includes: `experienceKey`, embed config version, mode, presets/creation IDs, heading, description, required poster, fallback video, quality, controls, autoplay, load behavior, height, capability flags (`allowTextEditing`, `allowSvgUpload`, `allowAudio`, `allowExport`), fullscreen CTA.

Studio preview is non-WebGL ([`studio/components/ThreeExperiencePreview.tsx`](../../studio/components/ThreeExperiencePreview.tsx)).

---

## 5.3 Existing design system

| Item | Finding |
|------|---------|
| CSS | **Tailwind CSS v4.3.3** via [`src/app/globals.css`](../../src/app/globals.css) + PostCSS |
| CSS Modules | **Not used** |
| Component library | **shadcn/ui** (`radix-nova`) in [`src/components/ui/`](../../src/components/ui/) |
| Design tokens | CSS variables in `:root` — cinematic dark editorial (`--bg-deep`, `--gold`, `--bronze`, etc.); `@theme inline` bridges to Tailwind |
| Fonts | `next/font/google`: Libre Baskerville (display), IBM Plex Sans, IBM Plex Mono |
| Type scale | Display via `.text-display` / `SectionHeading` clamp; body ~15–16px; mono labels 11px uppercase |
| Spacing | `max-w-[1440px]`; gutters `px-5` → `md:px-10` → `lg:px-[74px]`; section py `py-16 md:py-24 lg:py-28` |
| Buttons | shadcn `Button` + brand `PrimaryButtonLink` |
| Dialogs | **Sheet** (Radix), not a separate Dialog component — used for mobile nav |
| Forms | `Input`, `Textarea`, `Label`; quote form uses react-hook-form + Zod |
| Breakpoints | Tailwind defaults; design targets 1440 / 768 / 390 |
| Reduced motion | Framer Motion `useReducedMotion()` across site/experiences; **no** global CSS `@media (prefers-reduced-motion)` utility |

**Design docs:** [`DESIGN.md`](../../DESIGN.md), [`.impeccable/design.json`](../../.impeccable/design.json)

**Poster Lab UI rule:** reuse these tokens and primitives. Artwork may be chaotic; chrome must stay controlled Dark Editorial — no purple/AI-tool look.

---

## 5.4 Existing infrastructure

| Concern | Status |
|---------|--------|
| Relational DB / ORM | **Absent** — no Prisma/Drizzle/Postgres |
| Object storage | **Vercel Blob** `@vercel/blob@2.6.1` |
| Creations persistence | Blob JSON (`creations/{id}.json`) + optional Upstash Redis meta ([`src/lib/creations/store.ts`](../../src/lib/creations/store.ts)) |
| Auth | No end-user accounts. Draft Mode + quote Turnstile/HMAC only |
| Rate limiting | `@upstash/ratelimit` + Redis; creations: 20/h IP, 400/h global ([`src/lib/creations/rate-limit.ts`](../../src/lib/creations/rate-limit.ts)); in-memory fallback |
| Analytics | Console stub [`src/experiences/analytics.ts`](../../src/experiences/analytics.ts) — no product SDK |
| Error monitoring | **None** in app (no Sentry init) |
| Feature flags | **None** |
| Unit tests | **None** (no Vitest/Jest) |
| E2E / visual | `playwright@1.62.1` listed but **unused** (no config/specs/CI) |
| Soft validation | `npm run validate:experiences` |
| CI workflows | **None** (no `.github/workflows`) |

---

## 5.5 Existing Three.js dependencies

| Package | Locked version | Notes |
|---------|----------------|-------|
| `three` | **0.185.1** | Root direct dep |
| `@react-three/fiber` | **9.6.1** | Root direct dep |
| `@react-three/drei` | **10.7.7** | Root; lightly used |
| `@types/three` | **0.185.1** | Dev |
| `@react-three/rapier` | — | **Not installed** |
| `@react-three/postprocessing` | — | **Not installed** |
| `postprocessing` | — | **Not installed** |
| `zustand` | — | **Not installed** |

### Existing WebGL code

| Location | Role |
|----------|------|
| [`packages/living-engraving/src/horse-particles.tsx`](../../packages/living-engraving/src/horse-particles.tsx) | Primary WebGL: R3F Canvas, custom GLSL, `useFrame`, particle buffers, GSAP, `preserveDrawingBuffer` |
| [`src/components/hero/horse-particles-lazy.tsx`](../../src/components/hero/horse-particles-lazy.tsx) | `next/dynamic` + `ssr: false` pattern |
| [`src/components/site/hero-scene.tsx`](../../src/components/site/hero-scene.tsx) | Small R3F + drei `Float` demo (wrapper appears unused) |
| [`packages/controlled-chaos`](../../packages/controlled-chaos) | **Stub only** — `StubShell`, no WebGL |

CSP already allows `worker-src` / `blob:` for experience workers ([`src/lib/security-headers.ts`](../../src/lib/security-headers.ts)).

---

## 5.6 Audit outputs

### 1. Architecture summary

Portfolio integration for Controlled Chaos is **complete at the platform layer**. Case studies can author `projectThreeExperience` / `primaryExperience`; lab and creation routes load the package via the client registry; creations persist to Blob with Redis indexing and rate limits. The package itself is a non-WebGL stub that preserves the public contract. Implementation replaces the stub internals without forking routes into `src/components/poster-lab/`.

### 2. Existing dependencies that can be reused

- Next.js / React / TypeScript / Tailwind / shadcn / Framer Motion
- `three`, `@react-three/fiber`, `@react-three/drei` (share root versions)
- Zod **4.4.3** (creation + embed schemas)
- `@vercel/blob`, `@upstash/redis`, `@upstash/ratelimit`
- Experience registry, adapters, compatibility checks, `ExperienceClientBoundary`
- Sanity `projectThreeExperience` + GROQ projections
- Living Engraving as the reference for peers, dynamic import, and dispose patterns
- Existing creations API + `cc_` ID generator ([`src/lib/creations/id.ts`](../../src/lib/creations/id.ts))

### 3. Dependency conflicts / risks

| Risk | Mitigation |
|------|------------|
| Second copy of `three` | Declare Three/R3F as **peers** on the package (like Living Engraving); rely on root installs |
| Zod 4 vs docs that assume Zod 3 | Stick to Zod 4 APIs already used in the repo |
| `@react-three/postprocessing` vs Three 0.185 | Pin compatible versions during Phase 4; document if peer ranges conflict |
| Rapier WASM size | Code-split; load only for inflatable/elastic systems (Phase 8) |
| Playwright present but unused | Wire properly later; do not add a second E2E runner |
| Stale three-experience-cms audit | Superseded by this doc for Poster Lab |

No alpha/beta deps recommended.

### 4. Proposed routes (exact — already exist)

Adapt brainstorm paths to **existing** conventions:

| Brainstorm | Actual |
|------------|--------|
| `/work/controlled-chaos-poster-lab` | `/work/[slug]` with Sanity slug (e.g. `controlled-chaos-poster-lab`) |
| `/lab/controlled-chaos` | **`/lab/controlled-chaos`** (exists) |
| `/creation/[creationId]` | **`/creation/[creationId]`** (exists; IDs are `cc_` + 24 hex) |
| `POST /api/creations` | Exists |
| `GET /api/creations/[creationId]` | Exists |
| `POST …/duplicate` | Exists |
| Asset upload APIs | **Defer** until public SVG persistence is required |

Share URLs look like `/creation/cc_a1b2c3…` (not bare `4fj29a`). Shortening further is optional polish; current IDs meet unguessability requirements.

### 5. Proposed file structure

Do **not** place the renderer under `src/components/poster-lab/`. Map the brainstorm into the package:

```text
packages/controlled-chaos/
  package.json                    # bump off 0.0.0-stub; add Three/R3F peers
  src/
    manifest.ts                   # server-safe (keep)
    schemas.ts                    # expand PosterCreationV1 (keep export)
    index.ts
    react.tsx                     # full lab entry
    react-preview.tsx
    react-replay.tsx

    shell/
      PosterLabShell.tsx
      PosterToolbar.tsx
      PosterInspector.tsx
      PosterTimeline.tsx
      PosterLoadingScreen.tsx
      PosterErrorBoundary.tsx
      PosterFallback.tsx
      controls/…

    scene/
      PosterCanvas.tsx
      PosterScene.tsx
      PosterCamera.tsx
      PosterLighting.tsx
      PosterPostprocessing.tsx
      InteractionPlane.tsx

    systems/
      registry.ts
      types.ts
      particle-disintegration/…
      chrome-liquid/…
      inflatable-type/…
      crt-photocopy/…
      torn-paper/…
      elastic-type/…
      type-architecture/…
      audio-displacement/…

    typography/
    svg/
    audio/
    interaction/
    export/
    state/                        # Zustand slices
    serialization/
    quality/
    analytics/

public/experiences/controlled-chaos/   # fonts, env maps, textures, curated audio

docs/controlled-chaos/                 # this audit + follow-on reports
```

Portfolio stays thin:

```text
src/app/lab/controlled-chaos/
src/app/creation/[creationId]/
src/app/api/creations/
src/experiences/controlled-chaos/      # adapters only
src/lib/creations/                     # store, rate limit, IDs
src/components/experiences/            # ExperienceClientBoundary
```

### 6. Proposed database strategy

**Reuse Blob + Upstash. Do not add Neon/Drizzle for MVP.**

| Concern | Approach |
|---------|----------|
| Immutable creations | Already: save new ID; duplicate creates a new record |
| Payload | Zod-validated JSON in Blob; soft max `CREATIONS_MAX_BYTES` (default 262144) |
| Meta index | Redis `creation:meta:{id}` when configured |
| Schema evolution | `stateSchemaVersion` on payload; migrate in memory on read; never mutate old Blob records |
| Assets table | Skip until public SVG persistence ships |

Rationale: infrastructure already ships; introducing Postgres would duplicate storage concerns and delay MVP.

### 7. Proposed storage strategy

| Asset | Strategy |
|-------|----------|
| Creation JSON | Vercel Blob (`CREATIONS_BLOB_READ_WRITE_TOKEN` or fallback `BLOB_READ_WRITE_TOKEN`) |
| Thumbnails | Blob URL on creation meta (generate in later phase) |
| Curated fonts / textures / env / audio | Static under `public/experiences/controlled-chaos/` |
| User SVG | Local-first; sanitize in browser/worker; persist sanitized SVG in creation state only when size budget allows |
| User audio | **Local only by default** — never auto-upload |

### 8. Proposed Sanity changes

| Change | Needed for MVP? |
|--------|-----------------|
| New document type | **No** — use existing `project` |
| New module type | **No** — `projectThreeExperience` exists |
| Case-study content | **Yes** — author Controlled Chaos project + modules + media |
| Extra fields (technical highlights, process copy) | Prefer existing modules (`projectRichText`, `projectProcess`, `projectMetrics`, etc.) before schema expansion |
| Executable CMS config | **Never** — Sanity must not store shaders/JS |

### 9. Risks

1. **Bundle isolation** — WebGL must stay behind client dynamic imports; registry split already exists and must be preserved.
2. **Creation schema tightness** — today `state: z.record(z.string(), z.unknown())` is too loose for production sharing; must tighten to `PosterCreationV1` before trusting shared links visually.
3. **MediaRecorder variance** — MP4 not universal; capability detection required.
4. **Physics nondeterminism** — inflatable/elastic need fixed timestep for export (Phase 8).
5. **Memory leaks** — system switching + repeated exports must dispose GPU/media resources (Living Engraving is a partial reference).
6. **Mobile thermal / DPR** — quality manager required before dense particle presets.
7. **SVG XSS** — sanitizer mandatory before any path parsing.
8. **No CI / tests yet** — regressions possible until Vitest + Playwright land with subsystems.
9. **Analytics / monitoring gaps** — console stub only; production incident visibility limited.

### 10. Assumptions

1. Controlled Chaos remains experience key `controlled-chaos-poster-lab`.
2. Export map (`./manifest`, `./schemas`, `./react`, `./react-preview`, `./react-replay`) stays stable.
3. Portfolio design system is the UI source of truth for lab chrome.
4. Typographic MVP uses **preconverted typeface JSON** (curated fonts only).
5. WebGPU is optional / experimental; WebGL is required for launch.
6. Immutable creations remain the sharing model (edit → save as new ID).
7. No user accounts or public gallery in v1.
8. Local audio stays local unless an explicit future upload policy is added.

### 11. Required environment variables

**Already documented** in [`.env.example`](../../.env.example):

| Variable | Role for Poster Lab |
|----------|---------------------|
| `NEXT_PUBLIC_SITE_URL` | Absolute share URLs / metadata |
| `NEXT_PUBLIC_SANITY_*` | Case study content |
| `SANITY_API_READ_TOKEN` | Draft / live |
| `BLOB_READ_WRITE_TOKEN` | Fallback creations storage |
| `CREATIONS_BLOB_READ_WRITE_TOKEN` | Optional dedicated Blob store |
| `CREATIONS_MAX_BYTES` | Payload soft cap (default 262144) |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` (or `KV_REST_*`) | Rate limits + creation meta |

**Proposed additions (later phases — document in `.env.example` when used):**

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_POSTER_LAB_ENABLED` | Optional kill switch (no flag system today) |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Gate product analytics when a real SDK lands |
| `ERROR_MONITORING_DSN` | If Sentry (or similar) is added in hardening |

Never expose Sanity write tokens, Blob write tokens, or Redis tokens to the client.

### 12. Recommended implementation order

Follow the brainstorm phases, adjusted for existing scaffolding:

| Phase | Focus | Notes |
|-------|-------|-------|
| **0** | Audit + architecture docs | **This deliverable** |
| **1** | Application shell in package | Replace `StubShell` with R3F test scene + editor chrome; keep contracts |
| **2** | State + typography foundation | Zustand, Zod `PosterCreationV1`, fonts, undo |
| **3** | Particle disintegration | First full visual system |
| **4** | Chrome liquid + CRT/photocopy | Add postprocessing deps |
| **5** | Audio engine | Local + curated tracks |
| **6** | Still + MediaRecorder export | |
| **7** | Persistence hardening | Tighten schema; thumbnails; shared-page lazy load polish |
| **8** | Inflatable + elastic | Add Rapier |
| **9** | Torn paper + architecture | |
| **10** | Full audio-displacement mappings | |
| **11** | Sanity case-study content polish | Mostly authoring |
| **12** | Hardening | A11y, perf, browser matrix, security, launch checklist |

**Do not begin Phase 1 until this audit has been reviewed.**

---

## Controlled Chaos integration status checklist

| Surface | Status |
|---------|--------|
| Package stub + export map | Present |
| Manifest + Zod embed/creation schemas | Present (creation `state` still loose) |
| Registry server/client | Present |
| Lab route | Present |
| Creation route | Present |
| Creations API + rate limit + Blob store | Present |
| Persistence / analytics adapters | Present |
| Sanity `projectThreeExperience` | Present |
| Real WebGL systems | **Missing** |
| Editor UI / export / SVG / audio | **Missing** |
| `docs/controlled-chaos/*` reports | Audit + architecture only (this phase) |

---

## Files consulted (non-exhaustive)

- [`package.json`](../../package.json), [`next.config.ts`](../../next.config.ts), [`.env.example`](../../.env.example)
- [`packages/controlled-chaos/**`](../../packages/controlled-chaos)
- [`packages/living-engraving/package.json`](../../packages/living-engraving/package.json)
- [`src/lib/creations/**`](../../src/lib/creations)
- [`src/experiences/**`](../../src/experiences)
- [`src/app/lab/controlled-chaos/**`](../../src/app/lab/controlled-chaos)
- [`studio/schemaTypes/blocks/projectThreeExperience.ts`](../../studio/schemaTypes/blocks/projectThreeExperience.ts)
- [`docs/three-experience-cms/repository-audit.md`](../three-experience-cms/repository-audit.md) (stale for route claims)
