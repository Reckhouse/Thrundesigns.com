# @thrun-design/controlled-chaos

Controlled Chaos Poster Lab — interactive Three.js poster generator package for the Thrundesign portfolio.

## Status

**Phase 1 shell.** R3F canvas, vertical 9:16 viewport, responsive editor chrome, WebGL fallback, and error boundary. Visual systems, typography pipeline, export, and persistence UI land in later phases.

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

Keep export paths stable when adding systems. Do not import Three.js from `./manifest` or `./schemas`.
