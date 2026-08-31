"use client";

import { useVisualEditingEnvironment } from "next-sanity/hooks";

export function DisableDraftMode() {
  const environment = useVisualEditingEnvironment();

  // Hide inside Presentation Tool; show for standalone draft browsing.
  if (
    environment === "presentation-iframe" ||
    environment === "presentation-window"
  ) {
    return null;
  }

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 border border-line bg-bg-raised px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] text-gold shadow-lg"
    >
      Exit draft mode
    </a>
  );
}
