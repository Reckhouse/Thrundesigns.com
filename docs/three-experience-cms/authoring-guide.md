# Authoring guide — interactive Three.js experiences

How editors configure Living Engraving, Controlled Chaos, and future experiences in Sanity Studio without loading WebGL in the CMS.

## Add an experience block to a case study

1. Open a **Project** in Studio.
2. Go to **Page modules**.
3. Insert **Interactive 3D experience**.
4. Choose the **Experience** (Living Engraving or Controlled Chaos Poster Lab).
5. Set **Display mode**:
   - **Preview** — lightweight case-study embed (recommended default)
   - **Inline** — fuller controls (use sparingly on marketing pages)
   - **Replay** — requires a saved creation ID (Controlled Chaos only)
6. For preview/inline, pick an **Initial preset** from the manifest list.
7. Upload a required **Loading poster** (`mediaAsset` with alt text). Prefer a designed vertical frame, not a random screenshot.
8. Optionally upload a muted **Fallback video**.
9. Keep **Loading behavior** on **Load after visitor action** for full project pages.
10. Leave advanced permissions (text/SVG/audio/export) **off** on case-study previews (Living Engraving does not support them).

## Living Engraving presets

| Preset | Use |
|--------|-----|
| Centered cameo | Case study / lab default |
| Hero offset | Homepage-style right-offset composition |
| Print / static | Reduced motion / static particle frame |

Lab: `/lab/living-engraving`. Seed notes: [seed-living-engraving.md](./seed-living-engraving.md).

## Primary experience vs module

- **Experience → Primary experience** — drives the hero “launch” link and project-level metadata.
- **Page module** — places the interactive section inside the case-study narrative.

They may share the same experience key with different modes (for example primary launch + module preview).

## Loading behavior

| Value | Use when |
|-------|----------|
| Interaction (default) | Marketing case studies — visitor opts in |
| Viewport | Long pages where the section is below the fold |
| Immediate | Dedicated lab routes only |

Immediate loading is **not** recommended on homepage-adjacent marketing pages.

## Fullscreen launch

Enable **Show full experience button** and set the label (for example “Open Living Engraving” or “Launch Poster Lab”). The site opens the package lab path with validated query params and a return path back to the case study.

## Feature a saved creation

1. Create or obtain a creation ID from the lab (`cc_…`).
2. On the project **Experience** tab, add a **Featured creation**.
3. Store **only the ID** plus optional display title, curator note, and thumbnail override.
4. Do **not** paste creation JSON into Sanity.

The website fetches and validates the payload from the application store.

## Compatibility warnings

Studio preview cards show warnings such as:

- Unknown experience key
- Preset not available in installed package
- Embed configuration requires migration
- Fallback image is missing
- Replay mode requires a creation ID
- Capability not supported

Fix warnings before publishing. Frontend validation still runs even if Studio is green.

## Settings that should stay disabled on case studies

- Full controls in **preview** mode
- Text editing / SVG upload / audio / export on public marketing embeds
- Immediate load on dense case-study pages
- Autoplay with sound (audio capability should remain off unless explicitly required)

## Deploy Studio after schema changes

```bash
npm run typegen
npm run studio:deploy
```
