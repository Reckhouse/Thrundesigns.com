# Controlled Chaos — State Schema

**Phase:** 2  
**Package:** `@thrun-design/controlled-chaos@0.2.0`

## Envelope

Creations saved through `/api/creations` use:

```ts
{
  stateSchemaVersion: 1,
  experienceKey: "controlled-chaos-poster-lab",
  presetKey?: string,
  createdAt: string,
  state: PosterCreationV1,
  title?: string,
  thumbnailUrl?: string
}
```

`state` is validated with Zod (`posterCreationV1Schema`). Legacy loose objects are migrated in memory via `deserializePosterCreation` / `migratePosterCreation`.

## PosterCreationV1 (summary)

| Field | Notes |
|-------|-------|
| `schemaVersion` | Literal `1` |
| `seed` | Deterministic PRNG input for accents / later systems |
| `document` | 9:16, loop duration `6 \| 8 \| 12` |
| `typography` | Phrase (≤120 chars, ≤5 lines), curated `fontKey`, layout, depth, bevel |
| `composition` | Position / rotation / scale |
| `visualSystem` | Key + version + opaque `config` (tightened per system later) |
| `palette` | background / primary / secondary / accent |
| `camera` | Perspective defaults + motion preset |
| `lighting` | Key / fill / rim / exposure |
| `postprocessing` | Reserved; mostly unused until Phase 4 |

## Fonts

Curated typeface.json files under `/experiences/controlled-chaos/fonts/`:

- `helvetiker-regular` / `helvetiker-bold`
- `optimer-regular` / `optimer-bold`
- `gentilis-regular`

Registry: `packages/controlled-chaos/src/typography/font-manifest.ts`

## Editor state split

| Kind | Storage |
|------|---------|
| Document | Zustand per-shell store → serialized creation `state` |
| Session | `draftPhrase`, `userPaused`, `onboardingStep`, history stacks |
| Ephemeral | Geometry buffers, shader uniforms, frame clock — never React-per-frame |

## History

Action-based undo/redo (cap 40). Phrase commits are debounced by explicit submit; font / palette / seed changes push history immediately.

## Tests

```bash
npm run test:controlled-chaos
```
