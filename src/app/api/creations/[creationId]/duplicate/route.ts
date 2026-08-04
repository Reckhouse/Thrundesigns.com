import { NextResponse } from "next/server";
import { hashCreationId } from "@/lib/creations/id";
import { enforceCreationsRateLimits } from "@/lib/creations/rate-limit";
import { logCreationsSecurity } from "@/lib/creations/security-log";
import { duplicateCreation } from "@/lib/creations/store";
import { getClientIp } from "@/lib/quote/request-guards";
import { hashIdentifier } from "@/lib/quote/security-log";

type RouteContext = {
  params: Promise<{ creationId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const rate = await enforceCreationsRateLimits(request);
  if (!rate.success) {
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

  const { creationId } = await context.params;
  const duplicated = await duplicateCreation(creationId);
  if (!duplicated.ok) {
    return NextResponse.json(
      { error: duplicated.message },
      { status: duplicated.status },
    );
  }

  logCreationsSecurity("creations.duplicated", {
    ipHash: hashIdentifier(getClientIp(request)),
    creationHash: hashCreationId(duplicated.id),
    sourceHash: hashCreationId(creationId),
  });

  return NextResponse.json(
    {
      ok: true,
      id: duplicated.id,
      url: `/creation/${duplicated.id}`,
    },
    { status: 201 },
  );
}
