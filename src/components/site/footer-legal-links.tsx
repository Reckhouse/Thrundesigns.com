"use client";

import Link from "next/link";
import { openCookiePreferences } from "@/lib/cookie-consent";

const linkClass =
  "transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60";

/** Small legal links + cookie preference control for the footer bar. */
export function FooterLegalLinks() {
  return (
    <nav
      aria-label="Legal"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-caption uppercase tracking-[0.12em] text-fg-muted"
    >
      <Link href="/privacy" className={linkClass}>
        Privacy Policy
      </Link>
      <span aria-hidden className="text-line">
        ·
      </span>
      <Link href="/accessibility" className={linkClass}>
        Accessibility
      </Link>
      <span aria-hidden className="text-line">
        ·
      </span>
      <button
        type="button"
        onClick={openCookiePreferences}
        className={linkClass}
      >
        Cookie settings
      </button>
    </nav>
  );
}
