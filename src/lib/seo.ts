import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";

import { urlFor } from "@/sanity/lib/image";
import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "Thrun Design Co.";

/** Default meta description — keep identical in layout + homepage generateMetadata. */
export const DEFAULT_DESCRIPTION =
  "Thrun Design Co. is a Colorado Springs brand and web design studio for startups and growing businesses—identity systems, websites, graphic design, and campaign assets with clear scope.";

/** Homepage document title (absolute — includes brand; do not wrap with template). */
export const HOME_PAGE_TITLE =
  "Brand & Web Design in Colorado Springs | Thrun Design Co.";

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Thrun Design Co. — brand & web design in Colorado Springs",
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
  /** When true, emit robots noindex. Follow defaults to true unless `noFollow`. */
  noIndex?: boolean;
  noFollow?: boolean;
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

/** Absolute URL for a site-relative path (root keeps a trailing slash). */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Absolute URL for schema/OG image values that may already be absolute. */
export function absoluteAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
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
  noFollow = false,
}: BuildPageMetadataInput): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const url = absoluteUrl(canonical);
  const pageTitle = normalizePageTitle(title);
  const openGraphTitle =
    typeof pageTitle === "string" ? `${pageTitle} · ${SITE_NAME}` : pageTitle.absolute;
  const resolvedImageUrl = absoluteAssetUrl(imageUrl) || DEFAULT_OG_IMAGE.url;
  const image = {
    url: resolvedImageUrl,
    width: imageUrl ? imageWidth : DEFAULT_OG_IMAGE.width,
    height: imageUrl ? imageHeight : DEFAULT_OG_IMAGE.height,
    alt:
      imageAlt ||
      (imageUrl
        ? typeof pageTitle === "string"
          ? pageTitle
          : openGraphTitle
        : DEFAULT_OG_IMAGE.alt),
  };

  return {
    title: pageTitle,
    description,
    alternates: {
      // Root uses trailing slash to match the live URL and sitemap.
      canonical: canonical === "/" ? absoluteUrl("/") : canonical,
    },
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
      images: [resolvedImageUrl],
    },
    ...(noIndex || noFollow
      ? {
          robots: {
            index: !noIndex,
            follow: !noFollow,
          },
        }
      : {}),
  };
}
