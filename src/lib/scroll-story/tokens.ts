/** Shared timing for GSAP ScrollTrigger pinned scrub scenes. */

export const scrollStoryTransitions = [
  "wipe-up",
  "wipe-left",
  "scale",
  "clip-morph",
  "rise",
] as const;

export type ScrollStoryTransition =
  (typeof scrollStoryTransitions)[number];

/** @deprecated Prefer ScrollStoryTransition */
export type ScrollTransitionName = ScrollStoryTransition;

export const scrollStoryEase = "power3.inOut";

export const scrollStoryTokens = {
  ease: scrollStoryEase,
  /** Desktop scrub distance as a multiple of viewport height. */
  pinSpanDesktop: 1.65,
  /** Mobile: short scrub, no multi-screen pins. */
  pinSpanMobile: 0.55,
  /** Soft pin (cover/hero handoff) as a multiple of viewport height. */
  pinSpanSoftDesktop: 1.1,
  pinSpanSoftMobile: 0.4,
  mobileBreakpoint: 768,
  /** Enter occupies the first portion of scrub progress. */
  enterEnd: 0.32,
  /** Hold in the middle; exit after this progress. */
  exitStart: 0.62,
  anticipatePin: 1,
} as const;

export function resolvePinSpan(
  viewportWidth: number,
  options?: { soft?: boolean },
): number {
  const mobile = viewportWidth < scrollStoryTokens.mobileBreakpoint;
  if (options?.soft) {
    return mobile
      ? scrollStoryTokens.pinSpanSoftMobile
      : scrollStoryTokens.pinSpanSoftDesktop;
  }
  return mobile
    ? scrollStoryTokens.pinSpanMobile
    : scrollStoryTokens.pinSpanDesktop;
}

/** Pixel end distance for ScrollTrigger (`+=N`). */
export function getPinSpan(options?: { soft?: boolean }): string {
  if (typeof window === "undefined") {
    return options?.soft ? "110%" : "165%";
  }
  const mult = resolvePinSpan(window.innerWidth, options);
  return `${Math.round(window.innerHeight * mult)}`;
}
