type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "missing_secret" | "missing_token" | "invalid" };

export async function verifyTurnstileToken(options: {
  token: string | null | undefined;
  ip?: string | null;
}): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Dev bypass when Turnstile is not configured.
  if (!secret || !siteKey) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true };
    }
    return { ok: false, reason: "missing_secret" };
  }

  if (!options.token) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", options.token);
  if (options.ip) body.set("remoteip", options.ip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!response.ok) {
      return { ok: false, reason: "invalid" };
    }

    const data = (await response.json()) as { success?: boolean };
    if (!data.success) {
      return { ok: false, reason: "invalid" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}
