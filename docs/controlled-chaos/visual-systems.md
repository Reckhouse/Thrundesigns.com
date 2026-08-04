# Controlled Chaos — Visual Systems

**Phase:** 3  
**Active system:** Particle Disintegration

## Plugin contract

Each system exposes a `VisualSystemDefinition` with capabilities, Zod config, defaults, and curated presets. Registry: `packages/controlled-chaos/src/systems/registry.ts`.

## Particle Disintegration

| Concern | Implementation |
|---------|----------------|
| Sampling | Font `generateShapes` + contour/fill sampling; SVG via sanitized markup + `SVGLoader` |
| Rendering | `InstancedMesh` + custom GLSL (refs/uniforms only in the frame loop) |
| Loop | Phase `time / loopDuration`, cosine envelope, reassembly near loop end |
| Pointer | Invisible interaction plane + raycast → `PointerForce` ref |
| Quality | low ~10k / medium ~28k / high ~70k × density |
| Presets | Signal Failure, Grid Bloom, Cold Open |

### Controls (basic)

- Density, disintegration, motion
- Particle shape (square / disc / shard)
- Palette / seed (shared document)
- Pointer force mode
- SVG import (sanitized)

### Privacy / security

- SVG scripts, handlers, foreignObject, and external URLs are rejected
- Local SVG markup may be stored in creation state when saved (checksummed)
- Pointer coordinates are not sent to analytics

## Next systems

Chrome liquid and CRT/photocopy land in Phase 4.
