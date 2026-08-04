import { NextResponse } from "next/server";

/**
 * Public visitor saves must stay on-device (lab downloads).
 * Disables unauthenticated Blob writes that can exhaust storage.
 */
export function publicCreationWritesForbidden() {
  return NextResponse.json(
    {
      error:
        "Public creation uploads are disabled. Download your poster from the lab instead.",
    },
    {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
