/**
 * Strict SVG sanitizer — server-safe string processing, no DOM required.
 * Rejects or strips scripts, handlers, foreignObject, and external URLs.
 */

export type SvgSanitizeResult =
  | { ok: true; svg: string; checksum: string }
  | { ok: false; message: string };

const MAX_BYTES = 180_000;
const MAX_ELEMENTS = 2_500;

const FORBIDDEN_TAGS =
  /<\s*\/?\s*(script|foreignObject|iframe|object|embed|link|meta|use)\b/i;
const EVENT_ATTR = /\son[a-z]+\s*=/i;
const EXTERNAL_URL =
  /(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:|\/\/|data:text\/html)/i;
const CSS_IMPORT = /@import/i;
const JS_PROTOCOL = /javascript:/i;

export function sanitizeSvgMarkup(raw: string): SvgSanitizeResult {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, message: "SVG file is empty." };
  }

  const bytes = new TextEncoder().encode(raw).length;
  if (bytes > MAX_BYTES) {
    return {
      ok: false,
      message: `SVG exceeds ${MAX_BYTES} byte limit.`,
    };
  }

  const trimmed = raw.trim();
  if (!/<svg[\s>]/i.test(trimmed)) {
    return { ok: false, message: "File does not look like an SVG document." };
  }

  if (FORBIDDEN_TAGS.test(trimmed)) {
    return {
      ok: false,
      message: "SVG contains disallowed elements.",
    };
  }

  if (EVENT_ATTR.test(trimmed) || JS_PROTOCOL.test(trimmed)) {
    return {
      ok: false,
      message: "SVG contains executable handlers or scripts.",
    };
  }

  if (EXTERNAL_URL.test(trimmed) || CSS_IMPORT.test(trimmed)) {
    return {
      ok: false,
      message: "SVG contains external references.",
    };
  }

  // Strip comments and normalize to a conservative subset by removing style blocks
  // that embed urls, while keeping path/group structure intact.
  let svg = trimmed
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "");

  // Drop image tags entirely for v1.
  svg = svg.replace(/<\s*image\b[^>]*(?:\/>|>[\s\S]*?<\s*\/\s*image\s*>)/gi, "");

  const openTags = svg.match(/<[a-zA-Z][\w:-]*/g)?.length ?? 0;
  if (openTags > MAX_ELEMENTS) {
    return {
      ok: false,
      message: "SVG is too complex for Poster Lab.",
    };
  }

  // Ensure root svg exists after stripping.
  if (!/<svg[\s>]/i.test(svg)) {
    return { ok: false, message: "SVG root was removed during sanitization." };
  }

  return {
    ok: true,
    svg,
    checksum: fnv1a(svg),
  };
}

function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function isSvgFileName(name: string): boolean {
  return /\.svg$/i.test(name.trim());
}
