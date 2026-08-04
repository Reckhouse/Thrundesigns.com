# Controlled Chaos — Visual Systems

**Phase:** 10  
**Active systems:** Particle Disintegration · Chrome Liquid · CRT / Photocopy · Inflatable Type · Elastic Type · Torn Paper · Type Architecture  
**Cross-cutting:** Full audio-reactive displacement · Hardened still/video export · Save & share · Rapier physics (code-split)

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
| Audio | Scan/grain/chroma/bloom/vignette modulated via effect refs |
| Presets | Static Channel, Xerox Draft, Broadcast Bleed |

## Inflatable Type

| Concern | Implementation |
|---------|----------------|
| Geometry | Per-character extruded meshes |
| Physics | `@react-three/rapier` hull rigid bodies; fixed 60 Hz timestep |
| Motion | Cyclic inflate impulses + rest springs + visual puff scale |
| Presets | Helium Drop, Balloon Grid, Soft Pressure |
| Note | Rigid bodies + inflate-like forces — **not** true soft-body |

## Elastic Type

| Concern | Implementation |
|---------|----------------|
| Geometry | Per-character extruded meshes |
| Physics | Fixed-timestep Rapier cuboid bodies + spring forces toward rest |
| Pointer | Raycast plane → push/pull/attract modes |
| Presets | Rubber Band, Spring Lattice, Rebound |

## Torn Paper

| Concern | Implementation |
|---------|----------------|
| Shards | Seeded jagged `Shape` → `ExtrudeGeometry` paper plates |
| Type | Shallow extruded ink type above the collage |
| Motion | Curl/drift loop on shard transforms; audio scales drift |
| Reduced motion | Shards hold rest poses |
| Presets | Rough Tear, Collage Stack, Edge Fray |

## Type Architecture

| Concern | Implementation |
|---------|----------------|
| Slabs | Extruded line floors with elevation + cantilever offsets |
| Structure | Seeded columns and beams as supporting massing |
| Motion | Subtle rhythmic floor drift; audio scales amplitude |
| Presets | Brutal Stack, Column Grid, Cantilever |

## Audio engine

| Concern | Implementation |
|---------|----------------|
| Curated | Procedural looped buffers: Pulse Drone, Grid Click, Signal Hum |
| Local | File decode in memory only — never analytics / auto-upload |
| Persisted | `document.audio` mode/trackKey/gain/sensitivity/weights/displacement/beatBoost (no local bytes) |
| Routing | Shared `audioMapping` helpers + inspector routing presets |
| Coverage | All seven active systems including CRT post stack |
| Reduced motion | Displacement disabled; playback still optional |

## Export

| Output | Approach |
|--------|----------|
| PNG | `canvas.toBlob` with `preserveDrawingBuffer` |
| Video | One loop via `captureStream` + MediaRecorder MIME ladder |
| Overlays | Hidden while `data-exporting` is set |
| Physics | Fixed timestep + velocity clamps keep loops exportable |

## Next

Sanity case-study polish; a11y/perf/browser/launch hardening.
