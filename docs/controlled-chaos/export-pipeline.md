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

## Save locally

1. Capture PNG still from the live canvas (`download: false`, then browser download)  
2. Serialize `PosterCreationV1` envelope (no thumbnail upload)  
3. Download PNG + JSON to the visitor’s device  

Public `POST /api/creations` and thumbnail write routes return **403** — visitors must not write to object storage.

Local audio bytes and SVG markup follow existing privacy rules: audio bytes never persist; SVG may be included in the downloaded JSON when the user imported one.

## Shared creation page

- Existing curated / previously saved IDs still load via `GET`  
- Thumbnail uses 9:16 frame and lazy-loaded `next/image` when present  
- Lab `?creation=` may still load via the read-only persistence adapter  

## Limits

- Historical creation JSON: `CREATIONS_MAX_BYTES` (default 256 KiB) on read path  
- Public visitor saves no longer hit Blob write quotas  
