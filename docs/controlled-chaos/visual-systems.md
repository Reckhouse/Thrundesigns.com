# Controlled Chaos — Visual Systems

**Phase:** 6  
**Active systems:** Particle Disintegration · Chrome Liquid · CRT / Photocopy  
**Cross-cutting:** Audio-reactive displacement · Hardened still/video export · Save & share

## Plugin contract

Each system exposes a `VisualSystemDefinition` with capabilities, Zod config, defaults, and curated presets. Registry: `packages/controlled-chaos/src/systems/registry.ts`.

## Particle Disintegration

| Concern | Implementation |
|---------|----------------|
| Sampling | Font `generateShapes` + contour/fill sampling; SVG via sanitized markup + `SVGLoader` |
| Rendering | `InstancedMesh` + custom GLSL (refs/uniforms only in the frame loop) |
| Loop | Phase `time / loopDuration`, cosine envelope, reassembly near loop end |
| Pointer | Invisible interaction plane + raycast → `PointerForce` ref |
| Audio | Bass/mid/treble/energy/beat uniforms displace particles |
| Quality | low ~10k / medium ~28k / high ~70k × density |
| Presets | Signal Failure, Grid Bloom, Cold Open |

## Chrome Liquid

| Concern | Implementation |
|---------|----------------|
| Geometry | Debounced extruded `TextGeometry` with depth/bevel boosts |
| Material | `MeshPhysicalMaterial` — metalness, clearcoat, fresnel-tinted emissive |
| Motion | Seeded liquid rotation/offset; audio scales amplitude + emissive |
| Lighting | Local key/fill/rim presets |
| Presets | Molten Signal, Mirror Grid, Black Ice |

## CRT / Photocopy

| Concern | Implementation |
|---------|----------------|
| Type | Shallower extrusion + high-contrast ink bias |
| Stack | EffectComposer (scanlines, grain, threshold, chromatic, vignette, bloom) |
| Audio | Not mapped in Phase 5 (supportsAudio: false) |
| Presets | Static Channel, Xerox Draft, Broadcast Bleed |

## Audio engine

| Concern | Implementation |
|---------|----------------|
| Curated | Procedural looped buffers: Pulse Drone, Grid Click, Signal Hum |
| Local | File decode in memory only — never analytics / auto-upload |
| Persisted | `document.audio` mode/trackKey/gain/sensitivity/weights (no local bytes) |
| Reduced motion | Displacement disabled; playback still optional |

## Export

| Output | Approach |
|--------|----------|
| PNG | `canvas.toBlob` with `preserveDrawingBuffer` |
| Video | One loop via `captureStream` + MediaRecorder MIME ladder |
| Overlays | Hidden while `data-exporting` is set |

## Next systems

Inflatable type, torn paper, elastic type, type-architecture; fuller audio mappings; export hardening (FPS fallbacks, thumbnails).
