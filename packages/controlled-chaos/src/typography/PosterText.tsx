"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BufferGeometry } from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { loadPosterFont } from "./FontLoader";
import { layoutPhrase, lineOffsets } from "./TextLayout";
import {
  buildLineTextGeometry,
  sharedTextGeometryCache,
} from "./TextGeometryCache";

type PosterTextProps = {
  typography: PosterCreationV1["typography"];
  palette: PosterCreationV1["palette"];
  composition: PosterCreationV1["composition"];
  assetBasePath?: string;
  quality?: "auto" | "low" | "medium" | "high";
};

type LineMesh = {
  geometry: BufferGeometry;
  x: number;
  y: number;
  text: string;
};

const TEXT_SIZE = 0.16;

type FontLoadState =
  | { status: "loading"; fontKey: string }
  | { status: "ready"; fontKey: string; font: Font }
  | { status: "error"; fontKey: string; message: string };

/**
 * Debounced extruded typography. Previous geometry stays visible until the
 * next build is ready; released geometries return to the ref-counted cache.
 */
export function PosterText({
  typography,
  palette,
  composition,
  assetBasePath = "/experiences/controlled-chaos",
  quality = "auto",
}: PosterTextProps) {
  const [fontState, setFontState] = useState<FontLoadState>({
    status: "loading",
    fontKey: typography.fontKey,
  });
  const [lines, setLines] = useState<LineMesh[]>([]);
  const activeGeometries = useRef<BufferGeometry[]>([]);

  const layout = useMemo(() => layoutPhrase(typography), [typography]);
  const curveSegments = quality === "low" ? 3 : quality === "high" ? 8 : 5;
  const font =
    fontState.status === "ready" && fontState.fontKey === typography.fontKey
      ? fontState.font
      : null;

  useEffect(() => {
    let cancelled = false;
    const fontKey = typography.fontKey;
    void loadPosterFont(fontKey, assetBasePath)
      .then((loaded) => {
        if (cancelled) return;
        setFontState({ status: "ready", fontKey, font: loaded });
      })
      .catch(() => {
        if (cancelled) return;
        setFontState({
          status: "error",
          fontKey,
          message: "Font failed to load",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [typography.fontKey, assetBasePath]);

  useEffect(() => {
    if (!font) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (cancelled) return;

      const yOffsets = lineOffsets(
        layout.lines.length,
        typography.lineHeight,
        TEXT_SIZE,
      );
      const next: LineMesh[] = [];

      for (let index = 0; index < layout.lines.length; index += 1) {
        const line = layout.lines[index]!;
        const geometry = sharedTextGeometryCache.acquire(
          {
            phrase: line.text,
            fontKey: typography.fontKey,
            size: TEXT_SIZE,
            letterSpacing: typography.letterSpacing,
            lineHeight: typography.lineHeight,
            depth: typography.depth,
            bevel: typography.bevel,
            curveSegments,
          },
          font,
          (activeFont, key) =>
            buildLineTextGeometry(activeFont, key.phrase, {
              size: key.size,
              depth: key.depth,
              bevel: key.bevel,
              curveSegments: key.curveSegments,
            }),
        );

        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const width = box ? box.max.x - box.min.x : 0;
        let x = 0;
        if (typography.alignment === "center") x = -width / 2;
        if (typography.alignment === "right") x = -width;
        if (box) x -= box.min.x;

        next.push({
          geometry,
          x,
          y: yOffsets[index] ?? 0,
          text: line.text,
        });
      }

      for (const geometry of activeGeometries.current) {
        sharedTextGeometryCache.release(geometry);
      }
      activeGeometries.current = next.map((line) => line.geometry);
      setLines(next);
    }, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [font, layout, typography, curveSegments]);

  useEffect(() => {
    return () => {
      for (const geometry of activeGeometries.current) {
        sharedTextGeometryCache.release(geometry);
      }
      activeGeometries.current = [];
    };
  }, []);

  if (fontState.status === "error" && fontState.fontKey === typography.fontKey) {
    return null;
  }

  return (
    <group
      position={composition.position}
      rotation={composition.rotation}
      scale={composition.scale}
    >
      {lines.map((line, index) => (
        <mesh
          key={`${typography.fontKey}-${line.text}-${index}`}
          geometry={line.geometry}
          position={[line.x, line.y, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={palette.primary}
            metalness={0.35}
            roughness={0.42}
          />
        </mesh>
      ))}
    </group>
  );
}
