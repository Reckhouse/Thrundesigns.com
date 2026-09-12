/** JSON is embedded in HTML script text, not an HTML-escaped React text node. */
export function serializeJsonLd(
  data: Record<string, unknown> | Record<string, unknown>[],
): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
