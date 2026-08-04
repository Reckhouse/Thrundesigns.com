"use client";

import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { getFontEntry, resolveTypefaceUrl } from "./font-manifest";

const fontCache = new Map<string, Promise<Font>>();

export async function loadPosterFont(
  fontKey: string,
  assetBasePath = "/experiences/controlled-chaos",
): Promise<Font> {
  const url = resolveTypefaceUrl(fontKey, assetBasePath);
  if (!url || !getFontEntry(fontKey)) {
    throw new Error(`Unknown font key: ${fontKey}`);
  }

  const cacheKey = url;
  const existing = fontCache.get(cacheKey);
  if (existing) return existing;

  const loader = new FontLoader();
  const promise = loader.loadAsync(url).catch((error: unknown) => {
    fontCache.delete(cacheKey);
    throw error;
  });
  fontCache.set(cacheKey, promise);
  return promise;
}

export function clearPosterFontCache() {
  fontCache.clear();
}
