import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "@/sanity/lib/image";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "Thrun Design Co.";

export const DEFAULT_DESCRIPTION =
  "Strategic brand systems, websites, marketing audits, and print & digital assets for founders and owners facing a rebrand, launch, or outdated site.";

export const DEFAULT_OG_IMAGE = {
  url: "/images/hero-mountain.jpg",
  width: 2400,
  height: 1350,
  alt: "Snow-capped mountain ridge under a pale dawn sky",
} as const;

type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Site-relative path, e.g. `/work/cs-athletics`. */
  path: string;
  /** Absolute or site-relative image URL. */
  imageUrl?: string | null;
  imageAlt?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  type?: "website" | "article";
  noIndex?: boolean;
};

/**
 * Normalize CMS/page titles so the root `%s · Site` template only appends once.
 * Strips trailing `| Site`, `· Site`, `- Site` suffixes; uses absolute when the
 * brand is already embedded mid-title.
 */
export function normalizePageTitle(
  title: string,
): string | { absolute: string } {
  const trimmed = title.trim();
  if (!trimmed || trimmed === SITE_NAME) {
    return { absolute: SITE_NAME };
  }

  const escaped = SITE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = trimmed
    .replace(new RegExp(`\\s*[|·\\-]\\s*${escaped}\\s*$`, "i"), "")
    .trim();

  if (!stripped || stripped === SITE_NAME) {
    return { absolute: SITE_NAME };
  }
  if (new RegExp(escaped, "i").test(stripped)) {
    return { absolute: stripped };
  }
  return stripped;
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build a 1200×630 Sanity CDN URL for Open Graph when an image is present. */
export function seoImageUrl(
  source: SanityImageSource | null | undefined,
): string | undefined {
  if (!source) return undefined;
  try {
    return urlFor(source).width(1200).height(630).fit("crop").auto("format").url();
  } catch {
    return undefined;
  }
}

/**
 * Shared marketing-page metadata: canonical, Open Graph, and Twitter cards.
 * Pass a site-relative `path` so each route owns its canonical (do not set a
 * root-layout canonical — it leaks onto child routes that omit one).
 */
export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
  type = "website",
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const url = absoluteUrl(canonical);
  const pageTitle = normalizePageTitle(title);
  const openGraphTitle =
    typeof pageTitle === "string" ? `${pageTitle} · ${SITE_NAME}` : pageTitle.absolute;
  const image = imageUrl
    ? {
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        alt: imageAlt || (typeof pageTitle === "string" ? pageTitle : openGraphTitle),
      }
    : { ...DEFAULT_OG_IMAGE };

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: openGraphTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      images: [typeof image.url === "string" ? image.url : DEFAULT_OG_IMAGE.url],
    },
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
