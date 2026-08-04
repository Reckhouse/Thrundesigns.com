import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createCreationId } from "@/lib/creations/id";
import { enforceCreationsRateLimits } from "@/lib/creations/rate-limit";
import { logCreationsSecurity } from "@/lib/creations/security-log";
import { getClientIp } from "@/lib/quote/request-guards";
import { hashIdentifier } from "@/lib/quote/security-log";

const MAX_THUMB_BYTES = 1_500_000;

function blobToken(): string | undefined {
  return (
    process.env.CREATIONS_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN
  );
}

function parseDataUrl(input: string): {
  contentType: string;
  bytes: Buffer;
} | null {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(
    input.trim(),
  );
  if (!match) return null;
  const contentType = match[1]!.toLowerCase().replace("image/jpg", "image/jpeg");
  try {
    const bytes = Buffer.from(match[2]!, "base64");
    if (!bytes.length) return null;
    return { contentType, bytes };
  } catch {
    return null;
  }
}

/**
 * Upload a poster thumbnail to Blob storage.
 * Body: { imageBase64: "data:image/jpeg;base64,..." }
 */
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
    return NextResponse.json(
      { error: "Expected imageBase64 data URL" },
      { status: 400 },
    );
  }

  const parsed = parseDataUrl(imageBase64);
  if (!parsed) {
    return NextResponse.json(
      { error: "Thumbnail must be a JPEG, PNG, or WebP data URL" },
      { status: 400 },
    );
  }

  if (parsed.bytes.byteLength > MAX_THUMB_BYTES) {
    return NextResponse.json(
      { error: "Thumbnail exceeds size limit" },
      { status: 413 },
    );
  }

  const extension =
    parsed.contentType === "image/png"
      ? "png"
      : parsed.contentType === "image/webp"
        ? "webp"
        : "jpg";
  const id = createCreationId().replace(/^cc_/, "th_");
  const path = `creations/thumbs/${id}.${extension}`;

  try {
    const blob = await put(path, parsed.bytes, {
      access: "public",
      token,
      contentType: parsed.contentType,
      addRandomSuffix: false,
    });

    logCreationsSecurity("creations.saved", {
      ipHash: hashIdentifier(getClientIp(request)),
      creationHash: id,
    });

    return NextResponse.json({ ok: true, url: blob.url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to store thumbnail" },
      { status: 500 },
    );
  }
}
