# Seed — Living Engraving case study

Use this content in Sanity Studio once the local `project` schema (with `modules` + `primaryExperience`) is deployed via:

```bash
npm --prefix studio run deploy-schema
# or: npx sanity@latest schema deploy --cwd studio
```

## Document fields

| Field | Value |
|-------|-------|
| Title | Living Engraving |
| Slug | `living-engraving` |
| Industry | Interactive brand systems |
| Services | Three.js · Particle systems · Brand mark motion |
| Summary | A particle cameo of the Thrun horse mark — edge-weighted engraving that breathes, tilts, and orbits under the pointer. |
| Cover `blobUrl` | `/images/horse-head.png` (live today) or `/images/living-engraving-cover.png` after deploy |
| Cover `alt` | Living Engraving horse-head particle cameo |
| Featured | true |
| Order | 0 |

## Primary experience

- Experience: **Living Engraving** (`living-engraving-horse`)
- Mode: `inline`
- Preset: `centered-cameo`
- Load behavior: `immediate` (WebGL starts on case-study load; no click gate)
- Poster: WebGL-captured cover (`/images/living-engraving-cover.png`)
- Fullscreen label: `Open Living Engraving`
- Show fullscreen action: yes

## Suggested modules

1. **Rich text** — process / technique notes (bake from SVG/PNG, edge weighting, cameo relief shader).
2. **Interactive 3D experience** — same key as primary, mode `preview`, load `immediate`.
3. **Rich text** — outcomes / where it lives on the homepage hero.

## Regenerating the poster

```bash
npm run dev
# then capture canvas:
# open /capture/living-engraving and export canvas.toDataURL
```

Lab: `/lab/living-engraving?mode=inline&preset=centered-cameo&from=/work/living-engraving`
