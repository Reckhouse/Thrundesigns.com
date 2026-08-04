# @thrun-design/controlled-chaos

Controlled Chaos Poster Lab — interactive Three.js poster generator package for the Thrundesign portfolio.

## Status

**Phase 2.** Zustand document store, `PosterCreationV1` schema, curated typeface fonts, extruded typography, palette/seed controls, undo/redo. Visual systems begin in Phase 3.

## Entries

| Path | Server-safe? | Purpose |
|------|--------------|---------|
| `./manifest` | Yes | Experience metadata + presets |
| `./schemas` | Yes | Embed + creation Zod schemas |
| `./react-preview` | No (client) | Case-study / inline preview |
| `./react` | No (client) | Full Poster Lab |
| `./react-replay` | No (client) | Shared creation replay |

## Experience key

`controlled-chaos-poster-lab`

## Peers

- `react` / `react-dom` `^19`
- `three` `^0.185`
- `@react-three/fiber` `^9`
- `zod` `^4`
- `zustand` `^5`

Keep export paths stable. Do not import Three.js from `./manifest` or `./schemas`.
