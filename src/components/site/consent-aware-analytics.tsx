"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { CookieConsentBanner } from "@/components/site/cookie-consent-banner";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookie-consent";
import { updateGoogleConsent } from "@/lib/google-tag";

/**
 * Vercel Analytics loads only after optional-cookie acceptance.
 * The Google tag stays in the document head; this updates Consent Mode.
 */
export function ConsentAwareAnalytics() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCookieConsent();
    setConsent(stored);
    setReady(true);
    if (stored === "accepted") updateGoogleConsent(true);
    if (stored === "declined") updateGoogleConsent(false);

    const onOpen = () => {
      setConsent(null);
      updateGoogleConsent(false);
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onOpen);
  }, []);

  function handleConsentChange(value: CookieConsentValue) {
    setConsent(value);
    updateGoogleConsent(value === "accepted");
  }

  if (!ready) return null;

  return (
    <>
      {consent === "accepted" ? <Analytics /> : null}
      {consent === null ? (
        <CookieConsentBanner onConsentChange={handleConsentChange} />
      ) : null}
    </>
  );
}
