type QuoteSecurityEvent =
  | "quote.request_rejected"
  | "quote.rate_limited"
  | "quote.schema_invalid"
  | "quote.honeypot"
  | "quote.form_token_invalid"
  | "quote.too_fast"
  | "quote.turnstile_failed"
  | "quote.duplicate"
  | "quote.stored"
  | "quote.storage_failed";

type SecurityLogMeta = Record<string, string | number | boolean | undefined>;

/** Redacted security events — never log message bodies, tokens, or secrets. */
export function logQuoteSecurity(
  event: QuoteSecurityEvent,
  meta: SecurityLogMeta = {},
) {
  const payload = {
    event,
    ts: new Date().toISOString(),
    ...meta,
  };

  if (
    event === "quote.stored" ||
    event === "quote.request_rejected" ||
    event === "quote.schema_invalid"
  ) {
    console.info("[quote-security]", JSON.stringify(payload));
    return;
  }

  console.warn("[quote-security]", JSON.stringify(payload));
}

export function hashIdentifier(value: string): string {
  // Short non-reversible fingerprint for logs (not a password hash).
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
