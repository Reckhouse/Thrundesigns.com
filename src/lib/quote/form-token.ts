import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const MIN_COMPLETION_MS = 2_000;
const MAX_FORM_AGE_MS = 45 * 60 * 1000;

function getSecret(): string | null {
  const secret = process.env.QUOTE_FORM_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-quote-form-secret";
  }
  return null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function issueFormToken(): { formToken: string; issuedAt: number } | null {
  const secret = getSecret();
  if (!secret) return null;

  const issuedAt = Date.now();
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${issuedAt}.${nonce}`;
  const formToken = `${payload}.${sign(payload, secret)}`;
  return { formToken, issuedAt };
}

export type FormTokenResult =
  | { ok: true; issuedAt: number }
  | { ok: false; reason: "missing_secret" | "invalid" | "expired" | "too_fast" };

export function verifyFormToken(
  token: string | null | undefined,
  now = Date.now(),
): FormTokenResult {
  const secret = getSecret();
  if (!secret) {
    return { ok: false, reason: "missing_secret" };
  }

  if (!token || typeof token !== "string") {
    return { ok: false, reason: "invalid" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "invalid" };
  }

  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || !nonce || !signature) {
    return { ok: false, reason: "invalid" };
  }

  const payload = `${issuedAtRaw}.${nonce}`;
  const expected = sign(payload, secret);

  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "invalid" };
    }
  } catch {
    return { ok: false, reason: "invalid" };
  }

  const age = now - issuedAt;
  if (age < MIN_COMPLETION_MS) {
    return { ok: false, reason: "too_fast" };
  }
  if (age > MAX_FORM_AGE_MS) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, issuedAt };
}
