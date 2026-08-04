/** Controlled Chaos case-study media helpers (poster vs work-card frames). */

export const CONTROLLED_CHAOS_SLUG = "controlled-chaos-poster-lab";

/** Full 9:16 poster still — case study hero, lab marketing. */
export const CONTROLLED_CHAOS_COVER_SRC = "/images/controlled-chaos-cover.jpg";

/**
 * Work-card still cropped to the shared card frame (286 / 390).
 * Use with object-cover so CC matches other project thumbs in the grid.
 */
export const CONTROLLED_CHAOS_CARD_SRC = "/images/controlled-chaos-card.jpg";

export function isControlledChaosSlug(
  slug: string | null | undefined,
): boolean {
  return slug === CONTROLLED_CHAOS_SLUG;
}

/** Prefer the card-aspect still for index / homepage grids. */
export function resolveControlledChaosCardSrc(
  slug: string | null | undefined,
  fallbackSrc: string | null | undefined,
): string | null | undefined {
  if (isControlledChaosSlug(slug)) return CONTROLLED_CHAOS_CARD_SRC;
  return fallbackSrc;
}

/** Prefer the full poster for the case-study hero. */
export function resolveControlledChaosCoverSrc(
  slug: string | null | undefined,
  fallbackSrc: string,
): string {
  if (isControlledChaosSlug(slug)) return CONTROLLED_CHAOS_COVER_SRC;
  return fallbackSrc;
}
