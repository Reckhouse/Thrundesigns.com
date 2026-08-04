# Controlled Chaos — Visual Systems

**Phase:** 4  
**Active systems:** Particle Disintegration · Chrome Liquid · CRT / Photocopy

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

## Chrome Liquid

| Concern | Implementation |
|---------|----------------|
| Geometry | Debounced extruded `TextGeometry` with depth/bevel boosts |
| Material | `MeshPhysicalMaterial` — metalness, clearcoat, fresnel-tinted emissive |
| Motion | Seeded liquid rotation/offset on the type group; frozen under reduced motion |
| Lighting | Local key/fill/rim presets: studio-warm, cold-chrome, gallery-spot, rim-heavy |
| Presets | Molten Signal, Mirror Grid, Black Ice |

### Controls

- Liquid amplitude, fresnel, roughness
- Lighting preset
- Shared phrase / font / palette / seed

## CRT / Photocopy

| Concern | Implementation |
|---------|----------------|
| Type | Shallower extrusion + high-contrast ink bias |
| Stack | `@react-three/postprocessing` EffectComposer |
| Passes | Scanline, Noise, BrightnessContrast (threshold), ChromaticAberration, Vignette, Bloom |
| Quality | `postprocessingBudget` — low drops chromatic/bloom and lowers resolution scale |
| Reduced motion | Static grain (no premultiply animation), softened chromatic offset |
| Presets | Static Channel, Xerox Draft, Broadcast Bleed |

Document `postprocessing` fields sync from CRT config so saves capture the look.

## Next systems

Inflatable type, torn paper, elastic type, type-architecture, and audio-reactive displacement.
