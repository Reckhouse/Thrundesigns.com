# @thrun-design/controlled-chaos (stub)

Local stub of the Controlled Chaos Poster Lab experience package.

- **Does not** include Three.js / WebGL rendering.
- Exposes the public contract the portfolio registry expects.
- Replace this package with the real renderer when it is ready; keep export paths stable.

## Entries

| Path | Server-safe? | Purpose |
|------|--------------|---------|
| `./manifest` | Yes | Experience metadata + presets |
| `./schemas` | Yes | Embed + creation Zod schemas |
| `./react-preview` | No (client) | Preview component |
| `./react` | No (client) | Full experience component |
| `./react-replay` | No (client) | Replay component |

## Experience key

`controlled-chaos-poster-lab`
