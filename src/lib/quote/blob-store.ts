import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { get, put } from "@vercel/blob";
import { quoteStoreConfig } from "./store-config";

export function quoteRecordPath(id: string): string {
  return `quotes/records/${createHash("sha256").update(id).digest("hex")}.json`;
}

export async function readQuoteRecord(pathname: string) {
  if (!/^quotes\/records\/[a-f0-9]{64}\.json$/.test(pathname)) {
    throw new Error("Invalid quote record path");
  }
  const file = await get(pathname, { ...quoteStoreConfig(), useCache: false });
  if (!file) return null;
  if (file.statusCode !== 200) throw new Error("Quote could not be read");
  return JSON.parse(await new Response(file.stream).text()) as Record<string, unknown>;
}

/** Immutable individual objects avoid shared-index races and accidental overwrites. */
export async function storeQuoteRecord(document: Record<string, unknown>, id: string = randomUUID()) {
  const pathname = quoteRecordPath(id);
  await put(pathname, JSON.stringify(document), {
    ...quoteStoreConfig(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 60,
  });
  return pathname;
}

/** Migration retries compare the full document; conflicting copies are never overwritten. */
export async function copyAndVerifyQuote(document: Record<string, unknown>, id: string) {
  const pathname = quoteRecordPath(id);
  const existing = await readQuoteRecord(pathname);
  if (!existing) await storeQuoteRecord(document, id);
  const stored = await readQuoteRecord(pathname);
  if (!isDeepStrictEqual(stored, document)) throw new Error("Quote copy verification failed");
  return pathname;
}
