import { issueSignedToken, presignUrl } from "@vercel/blob";

const PATH_PREFIX = "quotes/";
const MAX_PATH_LENGTH = 240;
/** Default signed download window for email + Studio. */
export const ATTACHMENT_DOWNLOAD_TTL_MS = 60 * 60 * 1000;

export function getQuoteBlobToken(): string | null {
  const token = process.env.QUOTE_READ_WRITE_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

/** Operator secret for unlock page + session cookies. */
export function getAttachmentSignSecret(): string | null {
  const dedicated = process.env.QUOTE_ATTACHMENT_SECRET?.trim();
  if (
    dedicated &&
    dedicated.length >= 32 &&
    dedicated !== process.env.QUOTE_FORM_SECRET?.trim()
  )
    return dedicated;
  return null;
}

export function assertSafeAttachmentPathname(
  pathname: string,
): { ok: true; pathname: string } | { ok: false; reason: string } {
  const value = pathname.trim();
  if (!value) return { ok: false, reason: "empty" };
  if (value.length > MAX_PATH_LENGTH) return { ok: false, reason: "too_long" };
  if (!value.startsWith(PATH_PREFIX)) {
    return { ok: false, reason: "bad_prefix" };
  }
  if (value.includes("..") || value.includes("\\") || value.includes("//")) {
    return { ok: false, reason: "invalid_chars" };
  }
  if (!/^quotes\/[A-Za-z0-9._/\-]+$/.test(value)) {
    return { ok: false, reason: "invalid_chars" };
  }
  return { ok: true, pathname: value };
}

export async function createAttachmentDownloadUrl(
  pathname: string,
  ttlMs = ATTACHMENT_DOWNLOAD_TTL_MS,
): Promise<{ url: string; expiresAt: string; pathname: string }> {
  const safe = assertSafeAttachmentPathname(pathname);
  if (!safe.ok) {
    throw new Error(`Unsafe attachment pathname: ${safe.reason}`);
  }

  const token = getQuoteBlobToken();
  if (!token) {
    throw new Error("QUOTE_READ_WRITE_TOKEN is not configured");
  }

  const validUntil = Date.now() + ttlMs;
  const issued = await issueSignedToken({
    pathname: safe.pathname,
    operations: ["get"],
    validUntil,
    token,
  });

  const { presignedUrl } = await presignUrl(issued, {
    operation: "get",
    pathname: safe.pathname,
    access: "private",
    validUntil,
    useCache: false,
  });

  return {
    pathname: safe.pathname,
    url: presignedUrl,
    expiresAt: new Date(validUntil).toISOString(),
  };
}

export async function createAttachmentDownloadUrls(
  pathnames: string[],
  ttlMs = ATTACHMENT_DOWNLOAD_TTL_MS,
): Promise<{ pathname: string; url: string; expiresAt: string }[]> {
  const unique = [...new Set(pathnames.map((p) => p.trim()).filter(Boolean))];
  const results: { pathname: string; url: string; expiresAt: string }[] = [];

  for (const pathname of unique.slice(0, 10)) {
    results.push(await createAttachmentDownloadUrl(pathname, ttlMs));
  }

  return results;
}

export function filenameFromPathname(pathname: string): string {
  const base = pathname.split("/").pop() || pathname;
  return base.replace(/^[0-9]+-/, "");
}
