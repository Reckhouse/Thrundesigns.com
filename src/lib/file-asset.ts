import type { SanityFileValue } from "@/types/three-experience";

/** Resolve a Sanity file asset URL from a projected file field. */
export function resolveFileUrl(file: SanityFileValue): string | null {
  const url = file?.asset?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export function resolveFileLabel(
  file: SanityFileValue,
  fallback = "Fallback video",
): string {
  return file?.asset?.originalFilename?.trim() || fallback;
}
