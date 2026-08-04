import { NextResponse } from "next/server";
import { hashCreationId, isValidCreationId } from "@/lib/creations/id";
import { logCreationsSecurity } from "@/lib/creations/security-log";
import { loadCreation } from "@/lib/creations/store";
import { getClientIp } from "@/lib/quote/request-guards";
import { hashIdentifier } from "@/lib/quote/security-log";

type RouteContext = {
  params: Promise<{ creationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { creationId } = await context.params;

  if (!isValidCreationId(creationId)) {
    logCreationsSecurity("creations.invalid_id", {
      ipHash: hashIdentifier(getClientIp(request)),
    });
    return NextResponse.json(
      { error: "Invalid creation ID" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const loaded = await loadCreation(creationId);
  if (!loaded.ok) {
    logCreationsSecurity("creations.load_failed", {
      ipHash: hashIdentifier(getClientIp(request)),
      status: loaded.status,
      creationHash: hashCreationId(creationId),
    });
    return NextResponse.json(
      { error: loaded.message },
      { status: loaded.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      id: loaded.value.meta.id,
      meta: {
        experienceKey: loaded.value.meta.experienceKey,
        stateSchemaVersion: loaded.value.meta.stateSchemaVersion,
        createdAt: loaded.value.meta.createdAt,
        title: loaded.value.meta.title ?? null,
        thumbnailUrl: loaded.value.meta.thumbnailUrl ?? null,
        presetKey: loaded.value.meta.presetKey ?? null,
      },
      creation: loaded.value.payload,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
