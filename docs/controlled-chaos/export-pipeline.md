# Controlled Chaos — Export Pipeline

**Phase:** 6

## Still export

| Path | Behavior |
|------|----------|
| PNG / JPEG download | `captureStill` — optional scale via offscreen canvas |
| Thumbnail | `captureThumbnail` — max 540×960 JPEG, no download |
| High-res option | Pass `width` / `height` into `captureStill` |

Canvas uses `preserveDrawingBuffer: true`. Editor chrome lives outside the WebGL canvas, so overlays are not captured.

## Video export

| Concern | Behavior |
|---------|----------|
| Capture | `canvas.captureStream(fps)` + `MediaRecorder` |
| MIME ladder | vp9 → vp8 → webm → mp4 (`selectRecorderMimeType`) |
| FPS ladder | Quality-aware (`resolveVideoFpsLadder`); retries lower FPS on failure |
| Fallback | Still PNG when MediaRecorder/MIME/fps attempts fail (`fallbackToStill`) |

Never silently stutter: failed video paths surface a dock message and fall back to a still.

## Save & share

1. Capture JPEG thumbnail from the live canvas  
2. `POST /api/creations/thumbnail` → public Blob HTTPS URL  
3. Serialize `PosterCreationV1` envelope with `thumbnailUrl`  
4. `POST /api/creations` → immutable `/creation/{id}`  
5. Copy share link to clipboard (`share_link_copied` analytics)

Local audio bytes and SVG markup follow existing privacy rules: audio bytes never persist; SVG may persist when the user imported one.

## Shared creation page

- Thumbnail uses 9:16 frame and lazy-loaded `next/image`  
- Replay hydrates from stored state; lab `?creation=` loads via persistence adapter  

## Limits

- Creation JSON: `CREATIONS_MAX_BYTES` (default 256 KiB)  
- Thumbnail upload: 1.5 MB decoded  
- Thumbnail URL schema: HTTPS only  
