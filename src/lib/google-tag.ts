import { COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

/** Google tag (gtag.js) measurement ID for Analytics / Ads. */
export const GOOGLE_TAG_ID = "G-GY7PYLXGWF";

export const GOOGLE_CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

export const GOOGLE_CONSENT_GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Apply Consent Mode after the visitor accepts or declines optional cookies. */
export function updateGoogleConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag(
    "consent",
    "update",
    granted ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED,
  );
}

/**
 * Inline bootstrap for the official gtag snippet.
 * Consent defaults to denied unless the visitor already accepted.
 * The snippet itself stays in the HTML so Google's connection test can find it.
 */
export function googleTagBootstrapScript(): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function () {
  var granted = document.cookie.indexOf(${JSON.stringify(`${COOKIE_CONSENT_KEY}=accepted`)}) !== -1;
  var state = granted ? "granted" : "denied";
  gtag("consent", "default", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
})();
gtag("js", new Date());
gtag("config", ${JSON.stringify(GOOGLE_TAG_ID)});
  `.trim();
}
