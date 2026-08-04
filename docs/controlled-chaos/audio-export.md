# Controlled Chaos — Audio + Export

**Phase:** 5

## Audio

- **Curated tracks** are procedural Web Audio loops (no binary assets required).
- **Local uploads** decode in memory only; never sent to analytics or auto-uploaded.
- Serializable `document.audio` stores mode, trackKey, gain, sensitivity, band weights, and `reactive`.
- Displacement applied to **particle disintegration** and **chrome liquid**; frozen when `prefers-reduced-motion`.

## Export

- **PNG** via `canvas.toBlob` (`preserveDrawingBuffer: true`).
- **Video** records one poster loop with `captureStream` + MediaRecorder MIME ladder (webm/mp4).
- Toolbar actions: PNG / Video. Status shown in the bottom dock.
- Editor overlays should stay off the canvas capture surface (viewport chrome is outside the WebGL canvas).
