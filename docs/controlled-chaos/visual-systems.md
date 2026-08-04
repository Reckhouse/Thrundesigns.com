# Controlled Chaos — Visual Systems

**Phase:** 8  
**Active systems:** Particle Disintegration · Chrome Liquid · CRT / Photocopy · Inflatable Type · Elastic Type  
**Cross-cutting:** Audio-reactive displacement · Hardened still/video export · Save & share · Rapier physics (code-split)

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

## Inflatable Type

| Concern | Implementation |
|---------|----------------|
| Geometry | Per-character extruded meshes (`buildPhysicsLetterMeshes`) |
| Physics | `@react-three/rapier` rigid bodies + hull colliders; fixed 60 Hz timestep |
| Motion | Cyclic inflate impulses + rest springs + visual puff scale; seeded phase offsets |
| Audio | Bass/energy/beat scale inflate pressure |
| Reduced motion | Static letter meshes; no Physics world |
| Bundle | Lazy-loaded from scene host so Rapier WASM stays out of other systems |
| Presets | Helium Drop, Balloon Grid, Soft Pressure |
| Note | Rigid bodies + inflate-like forces — **not** true soft-body |

## Elastic Type

| Concern | Implementation |
|---------|----------------|
| Geometry | Same per-character extruded meshes |
| Physics | Fixed-timestep Rapier cuboid bodies + spring forces toward rest |
| Coupling | Neighbor pull + max stretch clamp + optional pointer forces |
| Audio | Mid/energy/beat modulate oscillation |
| Pointer | Raycast plane → push/pull/attract modes |
| Reduced motion | Static letter meshes |
| Presets | Rubber Band, Spring Lattice, Rebound |

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
| Physics | Fixed timestep + velocity clamps keep loops exportable |

## Next systems

Torn paper, type-architecture; fuller audio mappings across physics systems; a11y/perf/launch hardening.
