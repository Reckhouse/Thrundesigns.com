# Seed — Controlled Chaos Poster Lab case study

Use this content in Sanity Studio (or via MCP) once the local `project` schema (with `modules` + `primaryExperience`) is available.

Live document ID: `controlled-chaos-case-study`  
Slug: `controlled-chaos-poster-lab`  
Cover asset (repo): `/images/controlled-chaos-cover.jpg`

## Document fields

| Field | Value |
|-------|-------|
| Title | Controlled Chaos Poster Lab |
| Slug | `controlled-chaos-poster-lab` |
| Industry | Interactive poster systems |
| Services | Three.js · Generative typography · Audio-reactive design |
| Summary | An interactive 9:16 poster instrument — seven visual systems, seeded chaos, audio-reactive displacement, and shareable creations — built as a reusable experience package for the Thrundesign portfolio. |
| Cover `blobUrl` | `/images/controlled-chaos-cover.jpg` |
| Cover `alt` | Controlled Chaos Poster Lab vertical cover with disintegrating typography |
| Featured | true |
| Order | 1 |

## Primary experience

- Experience: **Controlled Chaos Poster Lab** (`controlled-chaos-poster-lab`)
- Mode: `preview`
- Preset: `signal-failure`
- Load behavior: `interaction` (visitor opts in on the case study)
- Poster: `/images/controlled-chaos-cover.jpg`
- Fullscreen label: `Launch Poster Lab`
- Show fullscreen action: yes
- Capabilities (text / SVG / audio / export): **off** on marketing embeds

## Suggested modules

1. **Rich text** — concept: authored control + seeded chaos; package boundary.
2. **Interactive 3D experience** — same key as primary, mode `preview`, load `interaction`, poster required.
3. **Rich text** — seven visual systems overview.
4. **Process steps** — experience package → serializable creations → case-study embed.
5. **Metrics** — 7 systems · 21 presets · 9:16 frame.
6. **Credits** — Thrun Design Co. + stack line.
7. **CTA** — Launch Poster Lab → `/lab/controlled-chaos?...&from=/work/controlled-chaos-poster-lab`.

## Lab URL

```text
/lab/controlled-chaos?mode=preview&preset=signal-failure&from=/work/controlled-chaos-poster-lab
```

## Regenerating the poster

Prefer a designed 9:16 still. Optional capture path:

```bash
npm run dev
# open /lab/controlled-chaos?preset=signal-failure
# export a still, then replace public/images/controlled-chaos-cover.jpg
```

## Related docs

- [content-authoring-guide.md](../controlled-chaos/content-authoring-guide.md)
- Shared CMS [authoring-guide.md](./authoring-guide.md)
