"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { scrollStoryTokens } from "@/lib/scroll-story/tokens";

/**
 * When true, skip ScrollTrigger pins/scrubs and render static stacked sections.
 * Also treats narrow viewports as "short scrub" via tokens (still animated, lighter).
 */
export function useReducedScrollStory(): boolean {
  const reduceMotion = useReducedMotion();
  return Boolean(reduceMotion);
}

export function useIsMobileScrollStory(): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      `(max-width: ${scrollStoryTokens.mobileBreakpoint - 1}px)`,
    );
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}
