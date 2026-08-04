"use client";

import type { BufferGeometry } from "three";
import {
  TextGeometry,
  type TextGeometryParameters,
} from "three/examples/jsm/geometries/TextGeometry.js";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";

export type TextGeometryCacheKey = {
  phrase: string;
  fontKey: string;
  size: number;
  letterSpacing: number;
  lineHeight: number;
  depth: number;
  bevel: number;
  curveSegments: number;
};

function serializeKey(key: TextGeometryCacheKey): string {
  return [
    key.fontKey,
    key.phrase,
    key.size.toFixed(4),
    key.letterSpacing.toFixed(4),
    key.lineHeight.toFixed(4),
    key.depth.toFixed(4),
    key.bevel.toFixed(4),
    key.curveSegments,
  ].join("|");
}

type CacheEntry = {
  key: string;
  geometry: BufferGeometry;
  refs: number;
  lastUsed: number;
};

/**
 * Ref-counted geometry cache. Geometries dispose only when the last
 * consumer releases them (or clear() is called).
 */
export class TextGeometryCache {
  private readonly maxEntries: number;
  private readonly entries = new Map<string, CacheEntry>();

  constructor(maxEntries = 32) {
    this.maxEntries = maxEntries;
  }

  acquire(
    key: TextGeometryCacheKey,
    font: Font,
    build: (font: Font, key: TextGeometryCacheKey) => BufferGeometry,
  ): BufferGeometry {
    const id = serializeKey(key);
    const hit = this.entries.get(id);
    if (hit) {
      hit.refs += 1;
      hit.lastUsed = Date.now();
      return hit.geometry;
    }

    this.evictUnreferencedIfNeeded();
    const geometry = build(font, key);
    this.entries.set(id, {
      key: id,
      geometry,
      refs: 1,
      lastUsed: Date.now(),
    });
    return geometry;
  }

  release(geometry: BufferGeometry) {
    for (const [id, entry] of this.entries) {
      if (entry.geometry !== geometry) continue;
      entry.refs = Math.max(0, entry.refs - 1);
      entry.lastUsed = Date.now();
      if (entry.refs === 0 && this.entries.size > this.maxEntries) {
        entry.geometry.dispose();
        this.entries.delete(id);
      }
      return;
    }
  }

  clear() {
    for (const entry of this.entries.values()) {
      entry.geometry.dispose();
    }
    this.entries.clear();
  }

  get size() {
    return this.entries.size;
  }

  get liveCount() {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (entry.refs > 0) count += 1;
    }
    return count;
  }

  private evictUnreferencedIfNeeded() {
    if (this.entries.size < this.maxEntries) return;
    const victims = [...this.entries.values()]
      .filter((entry) => entry.refs === 0)
      .sort((a, b) => a.lastUsed - b.lastUsed);
    for (const victim of victims) {
      if (this.entries.size < this.maxEntries) break;
      victim.geometry.dispose();
      this.entries.delete(victim.key);
    }
  }
}

export const sharedTextGeometryCache = new TextGeometryCache(32);

export function buildLineTextGeometry(
  font: Font,
  text: string,
  params: {
    size: number;
    depth: number;
    bevel: number;
    curveSegments: number;
  },
): BufferGeometry {
  const parameters: TextGeometryParameters = {
    font,
    size: params.size,
    depth: params.depth,
    curveSegments: params.curveSegments,
    bevelEnabled: params.bevel > 0,
    bevelThickness: params.bevel,
    bevelSize: params.bevel * 0.6,
    bevelOffset: 0,
    bevelSegments: params.bevel > 0 ? 2 : 0,
  };

  const geometry = new TextGeometry(text, parameters);
  geometry.computeBoundingBox();
  return geometry;
}
