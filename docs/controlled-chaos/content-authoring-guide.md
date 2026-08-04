# Controlled Chaos — Content Authoring Guide

**Phase:** 11  
**Experience key:** `controlled-chaos-poster-lab` (immutable)  
**Case-study slug:** `controlled-chaos-poster-lab`  
**Seed:** [seed-controlled-chaos.md](../three-experience-cms/seed-controlled-chaos.md)

## What editors own in Sanity

| Surface | Purpose |
|---------|---------|
| Project identity | Title, slug, summary, cover, industry/services, SEO |
| Primary experience | Hero launch CTA + project-level experience metadata |
| Page modules | Narrative blocks (systems, process, metrics, credits, CTA). Skip in-page experience embeds when lab CTAs already exist. |
| Featured creations | Creation IDs only (`cc_…`) — never paste JSON |

WebGL, audio bytes, and export stay in the package / lab — not in Sanity.

## Recommended case-study pattern

1. Cover + summary introduce the instrument.
2. Primary experience → Launch Poster Lab CTA (fullscreen launch always opens `mode=inline`).
3. Narrative modules (systems / process / metrics / credits) — **no** in-page interactive embed when multiple lab CTAs already exist.
4. CTA points at `/lab/controlled-chaos?mode=inline&from=/work/controlled-chaos-poster-lab`.

Cover stills are **9:16** for the case-study hero (`controlled-chaos-cover.jpg`). The case-study page uses a **9:16 frame** for Controlled Chaos so the poster fills edge-to-edge (no pillarboxing). Work cards use a separate **286×390** crop (`controlled-chaos-card.jpg`) so the homepage / work grid can stay `object-cover` for other projects.

## Presets by visual system

Use these when choosing **Initial preset** on `projectThreeExperience`:

| System | Presets |
|--------|---------|
| Particle disintegration | `signal-failure`, `grid-bloom`, `cold-open` |
| Chrome liquid | `molten-signal`, `mirror-grid`, `black-ice` |
| CRT / photocopy | `static-channel`, `xerox-draft`, `broadcast-bleed` |
| Inflatable type | `helium-drop`, `balloon-grid`, `soft-pressure` |
| Elastic type | `rubber-band`, `spring-lattice`, `rebound` |
| Torn paper | `rough-tear`, `collage-stack`, `edge-fray` |
| Type architecture | `brutal-stack`, `column-grid`, `cantilever` |

**Default marketing preset:** `signal-failure`.

## Modes

| Mode | Case study embed | Lab route (`/lab/controlled-chaos`) |
|------|------------------|-------------------------------------|
| `preview` | Preferred embed — minimal chrome | Do **not** use for Launch CTAs |
| `inline` | Rare on the page | **Required** for Launch Poster Lab / fullscreen |
| `replay` | Only with a real creation ID | Shared creation pages |

`buildControlledChaosLaunchUrl` always emits `mode=inline` so marketing embeds can stay lightweight while CTAs open the full instrument.

## Loading behavior

| Value | Case study guidance |
|-------|---------------------|
| `interaction` | **Default** — visitor clicks to load WebGL |
| `viewport` | Long pages where the embed is below the fold |
| `immediate` | Avoid on marketing pages; lab routes only |

## Capability flags on marketing embeds

Keep **off**:

- Text editing
- SVG upload
- Audio
- Export

Those belong in `/lab/controlled-chaos`. Public embeds should show the poster until the visitor opts in, then a minimal preview.

## Poster / cover assets

- Prefer a designed **9:16** still, not a random lab screenshot.
- Repo path used by the seed: `/images/controlled-chaos-cover.jpg`
- `mediaAsset.alt` is required for accessibility.
- Optional muted fallback video may be added later; poster remains mandatory.

## Featured creations

1. Save a poster in the lab (creates `cc_…`).
2. On the project **Experience** tab, add Featured creation → ID + optional title/note.
3. Do **not** paste creation payloads into Sanity.
4. Thumbnails come from the app store (Blob), with optional Studio override.

## Studio warnings to fix before publish

- Unknown experience key
- Preset not in installed package manifest
- Embed config version mismatch
- Missing poster
- Replay without creation ID
- Capability not supported by the package

## Verify after publish

```bash
# Case study route (after deploy / local with Sanity env)
# /work/controlled-chaos-poster-lab

npm run validate:experiences
npm run test:controlled-chaos
```

Confirm:

- Cover + modules render
- Preview loads after interaction
- Launch opens `/lab/controlled-chaos` with validated query params and `from=`
- Back navigation returns to the case study

## Package boundary reminder

All renderer work stays in `packages/controlled-chaos`. Portfolio owns routes, Sanity mapping, Blob persistence adapters, and this content only.
