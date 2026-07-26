import { NextResponse } from "next/server";
import {
  assertSafeAttachmentPathname,
  createAttachmentDownloadUrl,
} from "@/lib/quote/attachment-download";
import {
  createAttachmentSessionCookie,
  verifyAttachmentPassword,
  verifyAttachmentSessionCookie,
} from "@/lib/quote/attachment-session";
import { logQuoteSecurity } from "@/lib/quote/security-log";

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://thrundesigns-com.vercel.app")
  ).replace(/\/$/, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("pathname") || "";
  const safe = assertSafeAttachmentPathname(pathname);
  if (!safe.ok) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const authed = verifyAttachmentSessionCookie(
    request.headers.get("cookie"),
  );
  if (!authed) {
    const unlock = new URL("/quote-attachments", siteOrigin());
    unlock.searchParams.set("pathname", safe.pathname);
    return NextResponse.redirect(unlock);
  }

  try {
    const download = await createAttachmentDownloadUrl(safe.pathname);
    logQuoteSecurity("quote.attachment_signed", {
      count: 1,
      via: "download_redirect",
    });
    return NextResponse.redirect(download.url);
  } catch {
    logQuoteSecurity("quote.storage_failed", { stage: "attachment_download" });
    return NextResponse.json(
      { error: "Unable to create download link" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
    return NextResponse.redirect(unlock);
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

  const response = NextResponse.redirect(target);
  response.cookies.set(session.name, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
