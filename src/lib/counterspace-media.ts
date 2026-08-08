/** Counterspace Field Laboratory media helpers. */

export const COUNTERSPACE_SLUG = "counterspace-field-laboratory";

/** Color chamber still for case-study hero and posters. */
export const COUNTERSPACE_COVER_SRC = "/images/counterspace-cover.jpg";

/** Work-card crop matched to the shared 286/390 frame. */
export const COUNTERSPACE_CARD_SRC = "/images/counterspace-card.jpg";

export function isCounterspaceSlug(
  slug: string | null | undefined,
): boolean {
  return slug === COUNTERSPACE_SLUG;
}

/** Prefer the card-aspect still for index / homepage grids. */
export function resolveCounterspaceCardSrc(
  slug: string | null | undefined,
  fallbackSrc: string | null | undefined,
): string | null | undefined {
  if (isCounterspaceSlug(slug)) return COUNTERSPACE_CARD_SRC;
  return fallbackSrc;
}

/** Prefer the full color chamber still for the case-study hero. */
export function resolveCounterspaceCoverSrc(
  slug: string | null | undefined,
  fallbackSrc: string,
): string {
  if (isCounterspaceSlug(slug)) return COUNTERSPACE_COVER_SRC;
  return fallbackSrc;
}
