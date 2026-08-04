/**
 * Thumbnail URL allowlist + image magic-byte checks for creations.
 */

const BLOB_HOST =
  /^[a-z0-9.-]+\.public\.blob\.vercel-storage\.com$/i;

export function isAllowedCreationThumbnailUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    return BLOB_HOST.test(parsed.hostname);
  } catch {
    return false;
  }
}

export type ImageKind = "jpeg" | "png" | "webp";

export function detectImageKind(bytes: Buffer): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export function contentTypeForImageKind(kind: ImageKind): string {
  if (kind === "png") return "image/png";
  if (kind === "webp") return "image/webp";
  return "image/jpeg";
}

export function extensionForImageKind(kind: ImageKind): string {
  if (kind === "png") return "png";
  if (kind === "webp") return "webp";
  return "jpg";
}

/** Reject createdAt values that are absurdly skewed (clock skew / tampering). */
export function isPlausibleCreatedAt(iso: string, now = Date.now()): boolean {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return false;
  const day = 24 * 60 * 60 * 1000;
  if (ms > now + day) return false;
  if (ms < now - 10 * 365 * day) return false;
  return true;
}
