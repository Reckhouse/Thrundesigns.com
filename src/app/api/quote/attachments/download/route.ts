import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import {
  assertSafeAttachmentPathname,
  getQuoteBlobToken,
  filenameFromPathname,
} from "@/lib/quote/attachment-download";
import {
  createAttachmentSessionCookie,
  verifyAttachmentPassword,
  verifyAttachmentSessionCookie,
} from "@/lib/quote/attachment-session";
import { logQuoteSecurity } from "@/lib/quote/security-log";
import { getSiteUrl } from "@/lib/site-url";
import { enforceAttachmentUnlockRateLimits } from "@/lib/quote/rate-limit";
import {
  genericError,
  getClientIp,
  isAllowedQuoteOrigin,
} from "@/lib/quote/request-guards";
import { readBoundedFormData, RequestBodyError } from "@/lib/quote/body";

function siteOrigin(): string {
  return getSiteUrl();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("pathname") || "";
  const safe = assertSafeAttachmentPathname(pathname);
  if (!safe.ok) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const authed = verifyAttachmentSessionCookie(request.headers.get("cookie"));
  if (!authed) {
    const unlock = new URL("/quote-attachments", siteOrigin());
    unlock.searchParams.set("pathname", safe.pathname);
    return NextResponse.redirect(unlock);
  }

  try {
    const token = getQuoteBlobToken();
    if (!token) return genericError(503);
    const file = await get(safe.pathname, {
      token,
      access: "private",
      useCache: false,
    });
    if (!file || file.statusCode !== 200) return genericError(404);
    logQuoteSecurity("quote.attachment_signed", {
      count: 1,
      via: "authenticated_download",
    });
    const filename = filenameFromPathname(safe.pathname).replace(
      /[^A-Za-z0-9._-]/g,
      "_",
    );
    return new Response(file.stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    logQuoteSecurity("quote.storage_failed", { stage: "attachment_download" });
    return NextResponse.json(
      { error: "Unable to create download link" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAllowedQuoteOrigin(request)) return genericError(403);
  const rate = await enforceAttachmentUnlockRateLimits(getClientIp(request));
  if (!rate.success)
    return genericError(rate.unavailable ? 503 : 429, rate.retryAfterSec);
  let form: FormData;
  try {
    form = await readBoundedFormData(request, 16 * 1024);
  } catch (error) {
    return genericError(error instanceof RequestBodyError ? error.status : 400);
  }

  const password = String(form.get("password") || "");
  const pathname = String(form.get("pathname") || "");
  const safe = assertSafeAttachmentPathname(pathname);

  if (!verifyAttachmentPassword(password)) {
    logQuoteSecurity("quote.request_rejected", {
      stage: "attachment_unlock",
      reason: "invalid_password",
    });
    const unlock = new URL("/quote-attachments", siteOrigin());
    if (safe.ok) unlock.searchParams.set("pathname", safe.pathname);
    unlock.searchParams.set("error", "1");
    return NextResponse.redirect(unlock, 303);
  }

  const session = createAttachmentSessionCookie();
  if (!session) {
    return NextResponse.json(
      { error: "Attachment downloads are not configured" },
      { status: 503 },
    );
  }

  logQuoteSecurity("quote.attachment_unlocked", {});

  const target = safe.ok
    ? new URL(
        `/api/quote/attachments/download?pathname=${encodeURIComponent(safe.pathname)}`,
        siteOrigin(),
      )
    : new URL("/quote-attachments", siteOrigin());

  const response = NextResponse.redirect(target, 303);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(session.name, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
