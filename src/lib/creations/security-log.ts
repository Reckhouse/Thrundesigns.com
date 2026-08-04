type CreationsSecurityEvent =
  | "creations.rate_limited"
  | "creations.save_failed"
  | "creations.saved"
  | "creations.duplicated";

type SecurityLogMeta = Record<string, string | number | boolean | undefined>;

/** Redacted creations security events — never log payloads or user content. */
export function logCreationsSecurity(
  event: CreationsSecurityEvent,
  meta: SecurityLogMeta = {},
) {
  console.info(
    "[creations-security]",
    JSON.stringify({
      event,
      ts: new Date().toISOString(),
      ...meta,
    }),
  );
}
