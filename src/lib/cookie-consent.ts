export const COOKIE_CONSENT_KEY = "thrun-cookie-consent";
export const COOKIE_CONSENT_EVENT = "thrun:cookie-consent-open";

export type CookieConsentValue = "accepted" | "declined";

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function writeCookieConsent(value: CookieConsentValue): void {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  document.cookie = `${COOKIE_CONSENT_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearCookieConsent(): void {
  window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  document.cookie = `${COOKIE_CONSENT_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}
