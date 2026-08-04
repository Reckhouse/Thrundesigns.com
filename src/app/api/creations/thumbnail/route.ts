import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createCreationId } from "@/lib/creations/id";
import { enforceThumbnailRateLimits } from "@/lib/creations/rate-limit";
import { logCreationsSecurity } from "@/lib/creations/security-log";
import { assertContentLengthBudget } from "@/lib/creations/store";
import {
  contentTypeForImageKind,
  detectImageKind,
  extensionForImageKind,
} from "@/lib/creations/thumbnail-policy";
import { getClientIp } from "@/lib/quote/request-guards";
import { hashIdentifier } from "@/lib/quote/security-log";

const MAX_THUMB_BYTES = 1_500_000;
/** Base64 expands ~4/3; allow header budget for JSON wrapper. */
const MAX_REQUEST_BYTES = Math.ceil(MAX_THUMB_BYTES * 1.4) + 2048;

function blobToken(): string | undefined {
  return (
    process.env.CREATIONS_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN
  );
}

function parseDataUrl(input: string): {
  declaredType: string;
  bytes: Buffer;
} | null {
  const match =
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
      input.trim(),
    );
  if (!match) return null;
  const declaredType = match[1]!
    .toLowerCase()
    .replace("image/jpg", "image/jpeg");
  try {
    const bytes = Buffer.from(match[2]!.replace(/\s+/g, ""), "base64");
    if (!bytes.length) return null;
    return { declaredType, bytes };
  } catch {
    return null;
  }
}

/**
 * Upload a poster thumbnail to Blob storage.
 * Body: { imageBase64: "data:image/jpeg;base64,..." }
 */
export async function POST(request: Request) {
  const rate = await enforceThumbnailRateLimits(request);
  if (!rate.success) {
    logCreationsSecurity("creations.rate_limited", {
      ipHash: hashIdentifier(getClientIp(request)),
      surface: "thumbnail",
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

  const lengthBudget = assertContentLengthBudget(request, MAX_REQUEST_BYTES);
  if (!lengthBudget.ok) {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "content_length",
    });
    return NextResponse.json({ error: lengthBudget.message }, { status: 413 });
  }

  const token = blobToken();
  if (!token) {
    return NextResponse.json(
      { error: "Creations storage is not configured" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const imageBase64 =
    body && typeof body === "object" && "imageBase64" in body
      ? (body as { imageBase64?: unknown }).imageBase64
      : null;

  if (typeof imageBase64 !== "string") {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "missing_data_url",
    });
    return NextResponse.json(
      { error: "Expected imageBase64 data URL" },
      { status: 400 },
    );
  }

  const parsed = parseDataUrl(imageBase64);
  if (!parsed) {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "invalid_data_url",
    });
    return NextResponse.json(
      { error: "Thumbnail must be a JPEG, PNG, or WebP data URL" },
      { status: 400 },
    );
  }

  if (parsed.bytes.byteLength > MAX_THUMB_BYTES) {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "too_large",
    });
    return NextResponse.json(
      { error: "Thumbnail exceeds size limit" },
      { status: 413 },
    );
  }

  const kind = detectImageKind(parsed.bytes);
  if (!kind) {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "magic_mismatch",
    });
    return NextResponse.json(
      { error: "Thumbnail bytes do not match a supported image type" },
      { status: 400 },
    );
  }

  const contentType = contentTypeForImageKind(kind);
  if (
    parsed.declaredType !== contentType &&
    !(parsed.declaredType === "image/jpeg" && kind === "jpeg")
  ) {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "type_mismatch",
    });
    return NextResponse.json(
      { error: "Thumbnail Content-Type does not match file contents" },
      { status: 400 },
    );
  }

  const extension = extensionForImageKind(kind);
  const id = createCreationId().replace(/^cc_/, "th_");
  const path = `creations/thumbs/${id}.${extension}`;

  try {
    const blob = await put(path, parsed.bytes, {
      access: "public",
      token,
      contentType,
      addRandomSuffix: false,
    });

    logCreationsSecurity("creations.thumbnail_uploaded", {
      ipHash: hashIdentifier(getClientIp(request)),
      creationHash: id,
    });

    return NextResponse.json(
      { ok: true, url: blob.url },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    logCreationsSecurity("creations.thumbnail_rejected", {
      ipHash: hashIdentifier(getClientIp(request)),
      reason: "store_failed",
    });
    return NextResponse.json(
      { error: "Failed to store thumbnail" },
      { status: 500 },
    );
  }
}
