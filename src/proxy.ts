import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOSTS = new Set([
  "www.thrundesigns.com",
  "thrundesigns.com",
]);

/** Production Vercel alias — keep crawl/index signals on the www host only. */
const PRODUCTION_VERCEL_HOST = "thrundesigns-com.vercel.app";

/**
 * Host hygiene for Google indexing:
 * - Redirect the production *.vercel.app alias to www
 * - Mark preview deployments noindex so they do not compete with www
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() || "";

  if (host === PRODUCTION_VERCEL_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.thrundesigns.com";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (host && !CANONICAL_HOSTS.has(host) && host.endsWith(".vercel.app")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
