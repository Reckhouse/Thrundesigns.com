/**
 * Still + loop video export helpers.
 * Overlays must be hidden by the caller before capture.
 */

export type StillExportOptions = {
  canvas: HTMLCanvasElement;
  fileName?: string;
  mimeType?: "image/png" | "image/jpeg";
  quality?: number;
};

export type VideoExportOptions = {
  canvas: HTMLCanvasElement;
  durationSeconds: number;
  fps?: number;
  fileName?: string;
  onProgress?: (ratio: number) => void;
};

export type ExportResult =
  | { ok: true; blob: Blob; fileName: string }
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

export async function captureStill(
  options: StillExportOptions,
): Promise<ExportResult> {
  const {
    canvas,
    fileName = "controlled-chaos-poster.png",
    mimeType = "image/png",
    quality = 0.92,
  } = options;

  if (!canvas.width || !canvas.height) {
    return { ok: false, message: "Canvas is not ready to export." };
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), mimeType, quality);
  });

  if (!blob) {
    return { ok: false, message: "Still export failed." };
  }

  downloadBlob(blob, fileName);
  return { ok: true, blob, fileName };
}

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
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

export async function recordPosterLoop(
  options: VideoExportOptions,
): Promise<ExportResult> {
  const {
    canvas,
    durationSeconds,
    fps = 30,
    fileName = "controlled-chaos-loop.webm",
    onProgress,
  } = options;

  if (typeof MediaRecorder === "undefined") {
    return {
      ok: false,
      message: "MediaRecorder is not available in this browser.",
    };
  }

  const mimeType = pickRecorderMimeType() ?? selectRecorderMimeType(() => false);
  if (!mimeType) {
    return {
      ok: false,
      message: "No supported video MIME type for MediaRecorder.",
    };
  }

  let stream: MediaStream;
  try {
    stream = canvas.captureStream(fps);
  } catch {
    return { ok: false, message: "Could not capture the canvas stream." };
  }

  const chunks: BlobPart[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6_000_000,
    });
  } catch {
    for (const track of stream.getTracks()) track.stop();
    return { ok: false, message: "Could not start MediaRecorder." };
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

  try {
    const blob = await done;
    if (!blob.size) {
      return { ok: false, message: "Recorded video was empty." };
    }
    const extension = mimeType.includes("mp4") ? "mp4" : "webm";
    const finalName = fileName.replace(/\.(webm|mp4)$/i, `.${extension}`);
    downloadBlob(blob, finalName);
    return { ok: true, blob, fileName: finalName };
  } catch {
    return { ok: false, message: "Video export failed." };
  }
}
