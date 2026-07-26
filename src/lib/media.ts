import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

export type MediaAssetValue = {
  alt?: string | null;
  blobUrl?: string | null;
  image?: SanityImageSource | null;
} | null | undefined;

/** Prefer Blob URL, then Sanity CDN image. */
export function resolveMediaUrl(
  media: MediaAssetValue,
  width = 1600,
): string | null {
  if (!media) return null;
  if (media.blobUrl) return media.blobUrl;
  if (media.image) {
    try {
      return urlFor(media.image).width(width).auto("format").url();
    } catch {
      return null;
    }
  }
  return null;
}

export function resolveMediaAlt(
  media: MediaAssetValue,
  fallback = "",
): string {
  return media?.alt?.trim() || fallback;
}
