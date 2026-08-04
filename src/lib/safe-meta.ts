/**
 * Sanitize strings before placing them in HTML metadata / Open Graph tags.
 * Never pass raw user phrase text from creation.state into metadata.
 */
export function safeMetaText(
  value: string | null | undefined,
  fallback: string,
  maxLength = 120,
): string {
  const cleaned = (value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return fallback;
  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength - 1).trimEnd()}…`
    : cleaned;
}

export function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
