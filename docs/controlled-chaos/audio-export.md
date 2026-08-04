# Controlled Chaos — Audio + Export

**Phase:** 5–6

## Audio

- **Curated tracks** are procedural Web Audio loops (no binary assets required).
- **Local uploads** decode in memory only; never sent to analytics or auto-uploaded.
- Serializable `document.audio` stores mode, trackKey, gain, sensitivity, band weights, and `reactive`.
- Displacement applied to **particle disintegration** and **chrome liquid**; frozen when `prefers-reduced-motion`.

## Export

- **PNG** via `captureStill` (optional scale).
- **Video** via FPS + MIME ladders; falls back to still when recording fails.
- **Thumbnail** JPEG on Save & share → Blob HTTPS URL.
- See `export-pipeline.md` for the full Phase 6 pipeline.
