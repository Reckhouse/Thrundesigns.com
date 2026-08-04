# Repository audit — Three.js experience CMS

Phase 0 audit of Thrundesigns.com for the interactive Three.js portfolio platform. No production schemas or application code were changed for this document.

**Audited:** 2026-08-04  
**Repo:** single Next.js app + nested Sanity Studio (`studio/`)  
**Branch context:** `cursor/three-experience-cms-47b3`

---

## 1. Next.js

| Item | Finding |
|------|---------|
| Version | `16.2.11` ([package.json](../../package.json)) |
| React | `19.2.4` |
| Router | **App Router** (`src/app/`) — no Pages Router |
| Deployment | Vercel (`vercel.json`: framework `nextjs`) |
| Production URL | `https://thrundesigns-com.vercel.app` (custom domain deferred) |

### Route structure

| Route | Role |
|-------|------|
| `/` | Marketing homepage |
| `/work` | Project index |
| `/work/[slug]` | Case study detail |
| `/quote` | Multi-step quote form |
| `/quote-attachments` | Operator attachment unlock |
| `/api/draft-mode/*` | Sanity Presentation draft mode |
| `/api/quote/*` | Quote submit, bootstrap, attachment download |
| `/robots.ts`, `/sitemap.ts` | SEO |

**Not present yet:** `/lab/*`, `/creation/[creationId]`, `/api/creations/*`.

### Server / Client patterns

- Pages and sections are primarily **Server Components** that call `sanityFetch` then pass props into presentational components.
- Client islands: Framer Motion sections, quote form, header sheet, hero WebGL.
- Metadata via `generateMetadata` on project detail ([`src/app/work/[slug]/page.tsx`](../../src/app/work/[slug]/page.tsx)).

### Image handling

- `next/image` with remote patterns for `cdn.sanity.io` and `*.public.blob.vercel-storage.com` ([`next.config.ts`](../../next.config.ts)).
- Shared resolver prefers Blob URL, then Sanity CDN ([`src/lib/media.ts`](../../src/lib/media.ts)).
- CMS type: `mediaAsset` (`image` + optional `blobUrl` + required `alt`).

### Lazy-loading patterns

Only two `next/dynamic` + `ssr: false` usages today:

1. [`src/components/hero/horse-particles-lazy.tsx`](../../src/components/hero/horse-particles-lazy.tsx)
2. [`src/components/site/hero-canvas.tsx`](../../src/components/site/hero-canvas.tsx)

These are the templates for `ExperienceClientBoundary`.

### Cache / revalidation

- Live Content via `defineLive` → `sanityFetch` / `SanityLive` ([`src/sanity/lib/live.ts`](../../src/sanity/lib/live.ts)).
- Draft Mode + Presentation Tool for Visual Editing.
- No explicit `revalidate` / `cacheLife` / `unstable_cache` on project routes observed.
- Fallback content in [`src/lib/default-content.ts`](../../src/lib/default-content.ts) when CMS fetch fails.

---

## 2. Sanity

| Item | Finding |
|------|---------|
| Studio package | `sanity` `^6.6.0` ([studio/package.json](../../studio/package.json)) |
| Studio location | Nested app at [`studio/`](../../studio/) (`npm run studio:dev`) |
| Hosted Studio | `https://thrundesign.sanity.studio` (`studioHost: thrundesign`) |
| Project / dataset | `fbuy6kak` / `production` |
| API version | `2025-01-01` |
| Frontend client | `next-sanity` `^13.2.1` |

### Plugins

- `structureTool` — custom desk ([`studio/structure.ts`](../../studio/structure.ts))
- `presentationTool` — Visual Editing ([`studio/presentation/resolve.ts`](../../studio/presentation/resolve.ts))
- `visionTool`

### Document types

| Type | Role |
|------|------|
| `project` | Case study (identity + `modules[]` + SEO) |
| `service` | Offer cards |
| `processStep` | Process timeline |
| `quoteSubmission` | Form submissions (write API) |
| `siteSettings` | Singleton nav/footer/SEO |
| `homePage` | Singleton homepage sections |
| `quoteForm` | Singleton form copy/options |

### Portfolio project schema (current)

[`studio/schemaTypes/documents.ts`](../../studio/schemaTypes/documents.ts) — `project`:

- Identity: `title`, `slug`, `industry`, `services`, `summary`, `cover` (`mediaAsset`), `featured`, `order`
- **Page modules** array (not a mixed Portable Text body)
- Deprecated hidden: `gallery`, `body` (migrated to modules)
- `seo`

**There is no `portfolioProject`, `caseStudyBody`, `threeExperience`, or `primaryExperience` today.**

### Module / block types

Under [`studio/schemaTypes/blocks/`](../../studio/schemaTypes/blocks/):

`projectRichText` · `projectGallery` · `projectSplit` · `projectMetrics` · `projectProcess` · `projectQuote` · `projectVideo` · `projectCta` · `projectCredits`

Frontend switch: [`src/components/project/project-modules.tsx`](../../src/components/project/project-modules.tsx).  
Shared chrome: [`src/components/project/module-shell.tsx`](../../src/components/project/module-shell.tsx).

Rich text: Portable Text inside `projectRichText` / `projectSplit` only (`@portabletext/react`).

### GROQ organization

Centralized in [`src/sanity/lib/queries.ts`](../../src/sanity/lib/queries.ts) with `defineQuery`. Project detail query already special-cases gallery/split/video asset projections.

### Type generation

Studio script `typegen` → extracts schema → writes [`src/sanity/types.ts`](../../src/sanity/types.ts). Manual module unions in [`src/types/project-modules.ts`](../../src/types/project-modules.ts).

### Draft / Visual Editing

- Enable/disable draft-mode API routes
- `SANITY_API_READ_TOKEN` for Live + Presentation
- Stega via `sanityFetch` when draft mode is on

---

## 3. Design system

| Concern | Location / pattern |
|---------|-------------------|
| Spec | [`DESIGN.md`](../../DESIGN.md), [`.impeccable/design.json`](../../.impeccable/design.json) |
| Tokens | [`src/app/globals.css`](../../src/app/globals.css) — charcoal/gold, `--radius: 0` |
| Fonts | Libre Baskerville + IBM Plex Sans/Mono ([`layout.tsx`](../../src/app/layout.tsx)) |
| Brand primitives | [`src/components/site/primitives.tsx`](../../src/components/site/primitives.tsx) — `Eyebrow`, `SectionHeading`, `PrimaryButtonLink`, `TextLink` |
| shadcn/ui | [`src/components/ui/*`](../../src/components/ui/) — button, sheet, input, card, accordion, etc. |
| Dialogs | Sheet (Radix); no dedicated `dialog.tsx` |
| Loading | Ad-hoc bordered placeholders (horse lazy); no shared Skeleton |
| Motion | Framer Motion + [`src/lib/motion-tokens.ts`](../../src/lib/motion-tokens.ts) |
| Reduced motion | `useReducedMotion()` throughout; no global CSS utility class |
| Breakpoints | Tailwind defaults; marketing layouts target 1440 / 768 / 390 |

Experience UI should reuse `ModuleShell`, site primitives, and zero-radius editorial language — not introduce a separate visual system.

---

## 4. Infrastructure

| Area | Status |
|------|--------|
| Database / ORM | **None.** No Prisma/Drizzle/Postgres/SQLite |
| CMS store | Sanity documents |
| Object storage | Vercel Blob — public media (`BLOB_READ_WRITE_TOKEN`) + private quote attachments (`QUOTE_READ_WRITE_TOKEN`) |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` for quotes ([`src/lib/quote/rate-limit.ts`](../../src/lib/quote/rate-limit.ts)) |
| Email | Resend for quote notify |
| Analytics | **None** (only structured `console.warn` security logs for quotes) |
| Error monitoring | **None** (no Sentry) |
| Auth | Draft Mode + quote HMAC/Turnstile/attachment secret — no end-user accounts |
| Testing | **No** Vitest/Playwright/Jest; no `.github/workflows` |
| CI | **None** in-repo |
| CSP | **None** — no `headers()`, no middleware CSP |
| Env template | [`.env.example`](../../.env.example) |

### Existing Three.js

Inlined hero only — not a reusable experience package:

- [`src/components/hero/horse-particles.tsx`](../../src/components/hero/horse-particles.tsx) (R3F + custom GLSL)
- Bake script → `public/data/horse-particles*`
- Simpler rings demo: [`src/components/site/hero-scene.tsx`](../../src/components/site/hero-scene.tsx)

**Missing for experience platform:** `@thrun-design/controlled-chaos` (or any experience package), experience registry, lab/creation routes, creations persistence API.

---

## 5. Implications for the experience CMS

1. Extend **`project.modules[]`** with `projectThreeExperience` — do not reintroduce a competing Portable Text `caseStudyBody` (body was already migrated away).
2. Creations persistence should use **Blob + Upstash** (existing stack), not a new SQL database.
3. Lazy-load experiences with the same `dynamic(..., { ssr: false })` pattern as the horse particles.
4. Studio is nested; manifest options live under `studio/lib/`, not a top-level `sanity/lib/`.
5. Phase 0 must treat Controlled Chaos as **not installed** and define a stub contract before schema work.
6. CSP, analytics, and automated tests are greenfield and should be added carefully in later phases.

---

## 6. Files created / modified (Phase 0)

| Action | Path |
|--------|------|
| Created | `docs/three-experience-cms/repository-audit.md` |
| Created | `docs/three-experience-cms/architecture.md` |
| Created | `docs/three-experience-cms/integration-contract-review.md` |
| Modified | *(none — Phase 0 docs only)* |
