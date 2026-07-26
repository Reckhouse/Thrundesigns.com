import { createHmac, timingSafeEqual } from "node:crypto";
import { getAttachmentSignSecret } from "@/lib/quote/attachment-download";

const COOKIE_NAME = "quote_attachment_session";
const SESSION_TTL_MS = 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function attachmentSessionCookieName(): string {
  return COOKIE_NAME;
}

export function createAttachmentSessionCookie(): {
  name: string;
  value: string;
  maxAge: number;
} | null {
  const secret = getAttachmentSignSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = String(exp);
  const value = `${payload}.${sign(payload, secret)}`;
  return {
    name: COOKIE_NAME,
    value,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export function verifyAttachmentSessionCookie(
  cookieHeader: string | null,
): boolean {
  const secret = getAttachmentSignSecret();
  if (!secret || !cookieHeader) return false;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;

  const raw = match.slice(`${COOKIE_NAME}=`.length);
  const [expRaw, signature] = raw.split(".");
  if (!expRaw || !signature) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = sign(expRaw, secret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAttachmentPassword(password: string): boolean {
  const secret = getAttachmentSignSecret();
  if (!secret) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
