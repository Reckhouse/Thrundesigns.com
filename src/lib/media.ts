import { stegaClean } from "@sanity/client/stega";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

export type MediaDisplayWidth = "full" | "wide" | "half" | "third";
export type MediaAspectRatio =
  | "auto"
  | "16/9"
  | "4/3"
  | "3/2"
  | "1/1"
  | "9/16";
export type MediaObjectFit = "cover" | "contain";

export type MediaAssetValue = {
  _key?: string;
  alt?: string | null;
  blobUrl?: string | null;
  image?: SanityImageSource | null;
  displayWidth?: MediaDisplayWidth | string | null;
  aspectRatio?: MediaAspectRatio | string | null;
  objectFit?: MediaObjectFit | string | null;
} | null | undefined;

type ResolveMediaUrlOptions = {
  width?: number;
  aspectRatio?: MediaAspectRatio | string | null;
  objectFit?: MediaObjectFit | string | null;
};

const ASPECT_FRACTIONS: Record<Exclude<MediaAspectRatio, "auto">, number> = {
  "16/9": 16 / 9,
  "4/3": 4 / 3,
  "3/2": 3 / 2,
  "1/1": 1,
  "9/16": 9 / 16,
};

function cleanEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | undefined {
  if (!value) return undefined;
  const cleaned = stegaClean(value).trim() as T;
  return allowed.includes(cleaned) ? cleaned : undefined;
}

export function resolveDisplayWidth(
  media: MediaAssetValue,
): MediaDisplayWidth {
  return (
    cleanEnum(media?.displayWidth ?? undefined, [
      "full",
      "wide",
      "half",
      "third",
    ] as const) || "full"
  );
}

export function resolveAspectRatio(
  media: MediaAssetValue,
): MediaAspectRatio {
  return (
    cleanEnum(media?.aspectRatio ?? undefined, [
      "auto",
      "16/9",
      "4/3",
      "3/2",
      "1/1",
      "9/16",
    ] as const) || "auto"
  );
}

export function resolveObjectFit(media: MediaAssetValue): MediaObjectFit {
  return (
    cleanEnum(media?.objectFit ?? undefined, ["cover", "contain"] as const) ||
    "cover"
  );
}

/** Prefer Blob URL / site path, then Sanity CDN image. */
export function resolveMediaUrl(
  media: MediaAssetValue,
  widthOrOptions: number | ResolveMediaUrlOptions = 1600,
): string | null {
  if (!media) return null;

  const options: ResolveMediaUrlOptions =
    typeof widthOrOptions === "number"
      ? { width: widthOrOptions }
      : widthOrOptions;
  const width = options.width ?? 1600;
  const aspect =
    cleanEnum(options.aspectRatio ?? media.aspectRatio ?? undefined, [
      "auto",
      "16/9",
      "4/3",
      "3/2",
      "1/1",
      "9/16",
    ] as const) || "auto";
  const fit =
    cleanEnum(options.objectFit ?? media.objectFit ?? undefined, [
      "cover",
      "contain",
    ] as const) || "cover";

  if (media.blobUrl) {
    const cleaned = stegaClean(media.blobUrl).trim();
    if (cleaned) return cleaned;
  }
  if (media.image) {
    try {
      let builder = urlFor(media.image).width(width).auto("format");
      if (aspect !== "auto") {
        const height = Math.max(1, Math.round(width / ASPECT_FRACTIONS[aspect]));
        builder = builder.height(height).fit(fit === "contain" ? "max" : "crop");
      }
      return builder.url();
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
  const alt = media?.alt ? stegaClean(media.alt).trim() : "";
  return alt || fallback;
}

type HotspotLike = {
  x?: number;
  y?: number;
};

/** CSS object-position from Sanity image hotspot (0–1 coords). */
export function resolveMediaObjectPosition(
  media: MediaAssetValue,
): string | undefined {
  const image = media?.image;
  if (!image || typeof image !== "object") return undefined;
  const hotspot = (image as { hotspot?: HotspotLike | null }).hotspot;
  if (
    !hotspot ||
    typeof hotspot.x !== "number" ||
    typeof hotspot.y !== "number"
  ) {
    return undefined;
  }
  return `${hotspot.x * 100}% ${hotspot.y * 100}%`;
}

export function mediaDisplayWidthClass(
  width: MediaDisplayWidth,
  options?: { fullBleed?: boolean },
): string {
  if (options?.fullBleed && width === "full") return "w-full";
  switch (width) {
    case "wide":
      return "mx-auto w-full max-w-5xl";
    case "half":
      return "mx-auto w-full max-w-xl md:max-w-[50%]";
    case "third":
      return "mx-auto w-full max-w-md md:max-w-[33.333%]";
    case "full":
    default:
      return "w-full";
  }
}

export function mediaAspectRatioClass(
  aspect: MediaAspectRatio,
  fallback?: string,
): string | undefined {
  switch (aspect) {
    case "16/9":
      return "aspect-[16/9]";
    case "4/3":
      return "aspect-[4/3]";
    case "3/2":
      return "aspect-[3/2]";
    case "1/1":
      return "aspect-square";
    case "9/16":
      return "aspect-[9/16]";
    case "auto":
    default:
      return fallback;
  }
}

export function mediaObjectFitClass(fit: MediaObjectFit): string {
  return fit === "contain" ? "object-contain" : "object-cover";
}
