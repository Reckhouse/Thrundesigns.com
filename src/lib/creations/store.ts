import { head, put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import {
  controlledChaosCreationSchema,
  type ControlledChaosCreation,
} from "@thrun-design/controlled-chaos/schemas";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";
import { assertStateVersionSupported } from "@/experiences/compatibility";
import { createCreationId, isValidCreationId } from "@/lib/creations/id";
import type { PortfolioExperienceManifest } from "@/experiences/types";

export type CreationMetadata = {
  id: string;
  experienceKey: string;
  stateSchemaVersion: number;
  createdAt: string;
  title?: string;
  thumbnailUrl?: string;
  presetKey?: string;
  blobUrl: string;
  duplicatedFrom?: string;
};

export type StoredCreation = {
  meta: CreationMetadata;
  payload: ControlledChaosCreation;
};

const controlledChaosManifestForCompat: PortfolioExperienceManifest = {
  experienceKey: controlledChaosManifest.experienceKey,
  title: controlledChaosManifest.title,
  packageVersion: controlledChaosManifest.packageVersion,
  stateSchemaVersion: controlledChaosManifest.stateSchemaVersion,
  embedConfigVersion: controlledChaosManifest.embedConfigVersion,
  assetBasePath: controlledChaosManifest.assetBasePath,
  presets: controlledChaosManifest.presets,
  modes: [...controlledChaosManifest.modes],
  quality: [...controlledChaosManifest.quality],
  controls: [...controlledChaosManifest.controls],
  capabilities: controlledChaosManifest.capabilities,
  defaultHeight: controlledChaosManifest.defaultHeight,
  labPath: controlledChaosManifest.labPath,
};

function maxBytes(): number {
  const raw = Number(process.env.CREATIONS_MAX_BYTES || 262144);
  return Number.isFinite(raw) && raw > 1024 ? raw : 262144;
}

function blobToken(): string | undefined {
  return (
    process.env.CREATIONS_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN
  );
}

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function metaKey(id: string): string {
  return `creation:meta:${id}`;
}

function blobPath(id: string): string {
  return `creations/${id}.json`;
}

export function parseCreationPayload(
  input: unknown,
):
  | { ok: true; value: ControlledChaosCreation }
  | { ok: false; message: string } {
  const parsed = controlledChaosCreationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid creation payload",
    };
  }

  const versionCheck = assertStateVersionSupported(
    controlledChaosManifestForCompat,
    parsed.data.stateSchemaVersion,
  );

  if (!versionCheck.ok) {
    return { ok: false, message: versionCheck.message };
  }

  return { ok: true, value: parsed.data };
}

export function assertPayloadSize(
  payload: unknown,
): { ok: true; bytes: number } | { ok: false; message: string } {
  const bytes = Buffer.byteLength(JSON.stringify(payload), "utf8");
  if (bytes > maxBytes()) {
    return {
      ok: false,
      message: `Creation payload exceeds ${maxBytes()} byte limit`,
    };
  }
  return { ok: true, bytes };
}

export async function saveCreation(
  input: unknown,
  options?: { duplicatedFrom?: string },
): Promise<
  | { ok: true; id: string; meta: CreationMetadata }
  | { ok: false; status: number; message: string }
> {
  const token = blobToken();
  if (!token) {
    return {
      ok: false,
      status: 503,
      message: "Creations storage is not configured",
    };
  }

  const parsed = parseCreationPayload(input);
  if (!parsed.ok) {
    return { ok: false, status: 400, message: parsed.message };
  }

  const size = assertPayloadSize(parsed.value);
  if (!size.ok) {
    return { ok: false, status: 413, message: size.message };
  }

  const id = createCreationId();
  const blob = await put(blobPath(id), JSON.stringify(parsed.value), {
    access: "public",
    token,
    contentType: "application/json",
    addRandomSuffix: false,
  });

  const meta: CreationMetadata = {
    id,
    experienceKey: parsed.value.experienceKey,
    stateSchemaVersion: parsed.value.stateSchemaVersion,
    createdAt: parsed.value.createdAt,
    title: parsed.value.title,
    thumbnailUrl: parsed.value.thumbnailUrl,
    presetKey: parsed.value.presetKey,
    blobUrl: blob.url,
    duplicatedFrom: options?.duplicatedFrom,
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(metaKey(id), meta);
  }

  return { ok: true, id, meta };
}

async function loadMeta(id: string): Promise<CreationMetadata | null> {
  const redis = getRedis();
  if (redis) {
    const meta = await redis.get<CreationMetadata>(metaKey(id));
    if (meta) return meta;
  }
  return null;
}

async function readPayloadJson(
  id: string,
  meta: CreationMetadata | null,
): Promise<{ json: string; blobUrl: string } | null> {
  const token = blobToken();

  if (meta?.blobUrl) {
    const res = await fetch(meta.blobUrl, { cache: "no-store" }).catch(
      () => null,
    );
    if (res?.ok) {
      return { json: await res.text(), blobUrl: meta.blobUrl };
    }
  }

  if (!token) return null;

  try {
    const headed = await head(blobPath(id), { token });
    const res = await fetch(headed.url, { cache: "no-store" });
    if (!res.ok) return null;
    return { json: await res.text(), blobUrl: headed.url };
  } catch {
    return null;
  }
}

export async function loadCreation(
  id: string,
): Promise<
  | { ok: true; value: StoredCreation }
  | { ok: false; status: number; message: string }
> {
  if (!isValidCreationId(id)) {
    return { ok: false, status: 400, message: "Invalid creation ID" };
  }

  const meta = await loadMeta(id);
  const file = await readPayloadJson(id, meta);
  if (!file) {
    return { ok: false, status: 404, message: "Creation not found" };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(file.json);
  } catch {
    return { ok: false, status: 500, message: "Stored creation is corrupt" };
  }

  const parsed = parseCreationPayload(raw);
  if (!parsed.ok) {
    return { ok: false, status: 409, message: parsed.message };
  }

  const resolvedMeta: CreationMetadata = meta ?? {
    id,
    experienceKey: parsed.value.experienceKey,
    stateSchemaVersion: parsed.value.stateSchemaVersion,
    createdAt: parsed.value.createdAt,
    title: parsed.value.title,
    thumbnailUrl: parsed.value.thumbnailUrl,
    presetKey: parsed.value.presetKey,
    blobUrl: file.blobUrl,
  };

  return { ok: true, value: { meta: resolvedMeta, payload: parsed.value } };
}

export async function duplicateCreation(
  id: string,
): Promise<
  | { ok: true; id: string; meta: CreationMetadata }
  | { ok: false; status: number; message: string }
> {
  const loaded = await loadCreation(id);
  if (!loaded.ok) return loaded;

  const nextPayload: ControlledChaosCreation = {
    ...loaded.value.payload,
    createdAt: new Date().toISOString(),
    title: loaded.value.payload.title
      ? `${loaded.value.payload.title} (copy)`
      : undefined,
  };

  return saveCreation(nextPayload, { duplicatedFrom: id });
}

/** Server-side batch load for featured creation galleries. */
export async function loadCreationsByIds(
  ids: string[],
): Promise<StoredCreation[]> {
  const unique = [...new Set(ids.filter(isValidCreationId))];
  const results = await Promise.all(unique.map((id) => loadCreation(id)));
  return results
    .filter(
      (result): result is { ok: true; value: StoredCreation } => result.ok,
    )
    .map((result) => result.value);
}
