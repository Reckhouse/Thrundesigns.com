# Controlled Chaos — Audio + Export

**Phase:** 5–6, 10

## Audio

- **Curated tracks** are procedural Web Audio loops (no binary assets required).
- **Local uploads** decode in memory only; never sent to analytics or auto-uploaded.
- Serializable `document.audio` stores mode, trackKey, gain, sensitivity, band weights (`bass` / `mid` / `treble` / `energy` / `beat`), `displacementAmount`, `beatBoost`, and `reactive`.
- Shared helpers in `audio/audioMapping.ts` (`audioDriveGain`, `audioMul`, `audioInfluence`, mix profiles).
- **Routing presets** (Bass Led, Balanced, Treble Spark, Beat Punch) apply weight/boost patches from the inspector.
- Displacement / modulation applied across **all active systems**:
  - Particle disintegration (shader uniforms + beat boost)
  - Chrome liquid
  - CRT / photocopy post stack (scan / grain / chroma / bloom / vignette via effect refs)
  - Inflatable + elastic (physics impulses)
  - Torn paper + type architecture
- Frozen when `prefers-reduced-motion`.
- Analyser uses stronger beat attack/decay scaled by `beatBoost`.

## Export

- **PNG** via `captureStill` (optional scale).
- **Video** via FPS + MIME ladders; falls back to still when recording fails.
- **Thumbnail** JPEG on Save & share → Blob HTTPS URL.
- See `export-pipeline.md` for the full Phase 6 pipeline.
