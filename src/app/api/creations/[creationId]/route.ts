import { NextResponse } from "next/server";
import { loadCreation } from "@/lib/creations/store";

type RouteContext = {
  params: Promise<{ creationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { creationId } = await context.params;
  const loaded = await loadCreation(creationId);
  if (!loaded.ok) {
    return NextResponse.json(
      { error: loaded.message },
      { status: loaded.status },
    );
  }

  return NextResponse.json({
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
  });
}
