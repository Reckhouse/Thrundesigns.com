/**
 * Still + loop video export helpers.
 * Overlays must be hidden by the caller before capture.
 */

export type StillExportOptions = {
  canvas: HTMLCanvasElement;
  fileName?: string;
  mimeType?: "image/png" | "image/jpeg";
  quality?: number;
  /** When false, returns the blob without triggering a download. */
  download?: boolean;
  /** Optional output size (defaults to canvas buffer size). */
  width?: number;
  height?: number;
};

export type ThumbnailExportOptions = {
  canvas: HTMLCanvasElement;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export type VideoExportOptions = {
  canvas: HTMLCanvasElement;
  durationSeconds: number;
  fps?: number;
  /** Preferred FPS ladder tried in order when capture/record fails. */
  fpsLadder?: number[];
  fileName?: string;
  onProgress?: (ratio: number) => void;
  /** Fall back to a still PNG when video cannot be recorded. */
  fallbackToStill?: boolean;
  onFallback?: (reason: string) => void;
};

export type ExportResult =
  | { ok: true; blob: Blob; fileName: string; kind?: "still" | "video" }
  | { ok: false; message: string };

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export function resolveVideoFpsLadder(
  preferred = 30,
  quality?: "auto" | "low" | "medium" | "high",
): number[] {
  if (quality === "low") return [24, 15, 12];
  if (quality === "medium") return [preferred, 24, 15];
  const base = Math.max(12, Math.min(60, preferred));
  return [...new Set([base, 30, 24, 15])];
}

function drawScaledCanvas(
  source: HTMLCanvasElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(width));
  output.height = Math.max(1, Math.round(height));
  const ctx = output.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D context for export scaling.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, output.width, output.height);
  return output;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/png" | "image/jpeg" = "image/png",
  quality = 0.92,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((value) => resolve(value), mimeType, quality);
  });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read blob as data URL."));
    };
    reader.onerror = () => reject(new Error("Could not read blob as data URL."));
    reader.readAsDataURL(blob);
  });
}

export async function captureStill(
  options: StillExportOptions,
): Promise<ExportResult> {
  const {
    canvas,
    fileName = "controlled-chaos-poster.png",
    mimeType = "image/png",
    quality = 0.92,
    download = true,
    width,
    height,
  } = options;

  if (!canvas.width || !canvas.height) {
    return { ok: false, message: "Canvas is not ready to export." };
  }

  let target = canvas;
  try {
    if (width || height) {
      const aspect = canvas.height / canvas.width;
      const w = width ?? Math.round((height ?? canvas.height) / aspect);
      const h = height ?? Math.round(w * aspect);
      target = drawScaledCanvas(canvas, w, h);
    }
  } catch {
    return { ok: false, message: "Could not scale canvas for export." };
  }

  const blob = await canvasToBlob(target, mimeType, quality);
  if (target !== canvas) {
    target.width = 0;
    target.height = 0;
  }

  if (!blob) {
    return { ok: false, message: "Still export failed." };
  }

  if (download) {
    downloadBlob(blob, fileName);
  }
  return { ok: true, blob, fileName, kind: "still" };
}

/**
 * Capture a small JPEG suitable for Open Graph / creation meta thumbnails.
 * Does not download.
 */
export async function captureThumbnail(
  options: ThumbnailExportOptions,
): Promise<ExportResult> {
  const {
    canvas,
    maxWidth = 540,
    maxHeight = 960,
    quality = 0.82,
  } = options;

  if (!canvas.width || !canvas.height) {
    return { ok: false, message: "Canvas is not ready for a thumbnail." };
  }

  const scale = Math.min(
    1,
    maxWidth / canvas.width,
    maxHeight / canvas.height,
  );
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));

  return captureStill({
    canvas,
    width,
    height,
    mimeType: "image/jpeg",
    quality,
    download: false,
    fileName: "controlled-chaos-thumb.jpg",
  });
}

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return selectRecorderMimeType((type) => MediaRecorder.isTypeSupported(type));
}

/** Exported for unit tests — MIME preference ladder. */
export function selectRecorderMimeType(
  isTypeSupported: (type: string) => boolean,
): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((type) => isTypeSupported(type));
}

async function recordAtFps(
  canvas: HTMLCanvasElement,
  durationSeconds: number,
  fps: number,
  mimeType: string,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const stream = canvas.captureStream(fps);
  const chunks: BlobPart[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: fps >= 30 ? 6_000_000 : 3_500_000,
    });
  } catch (error) {
    for (const track of stream.getTracks()) track.stop();
    throw error;
  }

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => reject(new Error("MediaRecorder error"));
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start(100);
  const started = performance.now();
  const durationMs = Math.max(1, durationSeconds) * 1000;

  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - started;
      onProgress?.(Math.min(1, elapsed / durationMs));
      if (elapsed >= durationMs) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });

  if (recorder.state !== "inactive") {
    recorder.stop();
  }
  for (const track of stream.getTracks()) track.stop();

  const blob = await done;
  if (!blob.size) {
    throw new Error("Recorded video was empty.");
  }
  return blob;
}

export async function recordPosterLoop(
  options: VideoExportOptions,
): Promise<ExportResult> {
  const {
    canvas,
    durationSeconds,
    fps = 30,
    fpsLadder,
    fileName = "controlled-chaos-loop.webm",
    onProgress,
    fallbackToStill = true,
    onFallback,
  } = options;

  if (typeof MediaRecorder === "undefined") {
    if (fallbackToStill) {
      onFallback?.("MediaRecorder unavailable");
      return captureStill({
        canvas,
        fileName: fileName.replace(/\.(webm|mp4)$/i, ".png"),
        download: true,
      });
    }
    return {
      ok: false,
      message: "MediaRecorder is not available in this browser.",
    };
  }

  const mimeType = pickRecorderMimeType();
  if (!mimeType) {
    if (fallbackToStill) {
      onFallback?.("No supported video MIME type");
      return captureStill({
        canvas,
        fileName: fileName.replace(/\.(webm|mp4)$/i, ".png"),
        download: true,
      });
    }
    return {
      ok: false,
      message: "No supported video MIME type for MediaRecorder.",
    };
  }

  const ladder = fpsLadder?.length ? fpsLadder : resolveVideoFpsLadder(fps);
  let lastError = "Could not record video.";

  for (const attemptFps of ladder) {
    try {
      const blob = await recordAtFps(
        canvas,
        durationSeconds,
        attemptFps,
        mimeType,
        onProgress,
      );
      const extension = mimeType.includes("mp4") ? "mp4" : "webm";
      const finalName = fileName.replace(/\.(webm|mp4)$/i, `.${extension}`);
      downloadBlob(blob, finalName);
      return { ok: true, blob, fileName: finalName, kind: "video" };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Could not record video.";
    }
  }

  if (fallbackToStill) {
    onFallback?.(lastError);
    return captureStill({
      canvas,
      fileName: fileName.replace(/\.(webm|mp4)$/i, ".png"),
      download: true,
    });
  }

  return { ok: false, message: lastError };
}
