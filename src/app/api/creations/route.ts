import { NextResponse } from "next/server";
import { hashCreationId } from "@/lib/creations/id";
import { enforceCreationsRateLimits } from "@/lib/creations/rate-limit";
import { logCreationsSecurity } from "@/lib/creations/security-log";
import { saveCreation } from "@/lib/creations/store";
import { getClientIp } from "@/lib/quote/request-guards";
import { hashIdentifier } from "@/lib/quote/security-log";

export async function POST(request: Request) {
  const rate = await enforceCreationsRateLimits(request);
  if (!rate.success) {
    logCreationsSecurity("creations.rate_limited", {
      ipHash: hashIdentifier(getClientIp(request)),
    });
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const saved = await saveCreation(body);
  if (!saved.ok) {
    logCreationsSecurity("creations.save_failed", {
      ipHash: hashIdentifier(getClientIp(request)),
      status: saved.status,
    });
    return NextResponse.json({ error: saved.message }, { status: saved.status });
  }

  logCreationsSecurity("creations.saved", {
    ipHash: hashIdentifier(getClientIp(request)),
    creationHash: hashCreationId(saved.id),
  });

  return NextResponse.json(
    {
      ok: true,
      id: saved.id,
      url: `/creation/${saved.id}`,
      meta: {
        experienceKey: saved.meta.experienceKey,
        createdAt: saved.meta.createdAt,
        title: saved.meta.title ?? null,
        thumbnailUrl: saved.meta.thumbnailUrl ?? null,
      },
    },
    { status: 201 },
  );
}
