"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookie-consent";

type CookieConsentBannerProps = {
  onConsentChange: (value: CookieConsentValue) => void;
};

/** Site-wide cookie notice — analytics load only after acceptance. */
export function CookieConsentBanner({
  onConsentChange,
}: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  const syncVisibility = useCallback(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  useEffect(() => {
    syncVisibility();
    const onOpen = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onOpen);
  }, [syncVisibility]);

  if (!visible) return null;

  function choose(value: CookieConsentValue) {
    writeCookieConsent(value);
    onConsentChange(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg-deep/95 p-5 backdrop-blur-md md:p-6"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-[74px]">
        <div className="max-w-2xl">
          <p
            id="cookie-consent-title"
            className="font-mono text-label uppercase tracking-[0.16em] text-gold"
          >
            Cookies
          </p>
          <p
            id="cookie-consent-desc"
            className="mt-2 font-sans text-sm leading-6 text-fg-muted"
          >
            We use essential cookies to run the site and optional analytics /
            advertising measurement to understand traffic and campaign
            performance. See our{" "}
            <Link href="/privacy#cookies" className="text-fg underline-offset-2 hover:text-gold hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="inline-flex h-[44px] items-center border border-line px-4 font-mono text-label uppercase tracking-[0.12em] text-fg-muted transition-colors hover:border-fg-muted hover:text-fg"
          >
            Decline optional
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex h-[44px] items-center bg-gold px-4 font-mono text-label font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
