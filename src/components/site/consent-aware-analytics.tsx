"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner";
import { GoogleTag } from "@/components/site/google-tag";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookie-consent";

/**
 * Loads Vercel Analytics and the Google tag only after the visitor accepts
 * optional cookies. Declining keeps essential site cookies only.
 */
export function ConsentAwareAnalytics() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readCookieConsent());
    setReady(true);
    const onOpen = () => setConsent(null);
    window.addEventListener(COOKIE_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onOpen);
  }, []);

  if (!ready) return null;

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Analytics />
          <GoogleTag />
        </>
      ) : null}
      {consent === null ? (
        <CookieConsentBanner onConsentChange={setConsent} />
      ) : null}
    </>
  );
}
