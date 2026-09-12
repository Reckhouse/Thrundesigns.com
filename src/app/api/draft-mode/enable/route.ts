import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { getSanityReadToken } from "@/sanity/lib/token";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  let token: string;
  try {
    token = getSanityReadToken();
  } catch {
    return NextResponse.json(
      { error: "Preview is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const handler = defineEnableDraftMode({
    client: client.withConfig({ token }),
  });
  return handler.GET(request);
}
