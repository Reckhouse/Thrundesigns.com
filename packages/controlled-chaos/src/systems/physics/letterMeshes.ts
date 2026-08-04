import type { BufferGeometry } from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterTypography } from "../../serialization/posterCreation.schema";
import { layoutPhrase, lineOffsets } from "../../typography/TextLayout";
import {
  buildLineTextGeometry,
  sharedTextGeometryCache,
} from "../../typography/TextGeometryCache";

export type PhysicsLetterMesh = {
  key: string;
  char: string;
  geometry: BufferGeometry;
  rest: [number, number, number];
  width: number;
  lineIndex: number;
  charIndex: number;
};

export const PHYSICS_LETTER_SIZE = 0.15;

type GlyphAdvance = {
  char: string;
  geometry: BufferGeometry | null;
  width: number;
};

/**
 * Build per-character extruded meshes for physics typography systems.
 * Spaces advance layout without creating bodies.
 */
export function buildPhysicsLetterMeshes(options: {
  font: Font;
  typography: PosterTypography;
  curveSegments: number;
  letterGap: number;
  compositionZ: number;
}): PhysicsLetterMesh[] {
  const { font, typography, curveSegments, letterGap, compositionZ } = options;
  const layout = layoutPhrase(typography);
  const yOffsets = lineOffsets(
    layout.lines.length,
    typography.lineHeight,
    PHYSICS_LETTER_SIZE,
  );
  const letters: PhysicsLetterMesh[] = [];

  for (let lineIndex = 0; lineIndex < layout.lines.length; lineIndex += 1) {
    const line = layout.lines[lineIndex]!;
    const glyphs: GlyphAdvance[] = [];

    for (let i = 0; i < line.text.length; i += 1) {
      const char = line.text[i]!;
      if (char === " ") {
        glyphs.push({
          char,
          geometry: null,
          width: PHYSICS_LETTER_SIZE * 0.45,
        });
        continue;
      }

      const geometry = sharedTextGeometryCache.acquire(
        {
          phrase: char,
          fontKey: typography.fontKey,
          size: PHYSICS_LETTER_SIZE,
          letterSpacing: 0,
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
      const width = box
        ? Math.max(0.04, box.max.x - box.min.x)
        : PHYSICS_LETTER_SIZE * 0.6;
      glyphs.push({ char, geometry, width });
    }

    let totalWidth = 0;
    for (let i = 0; i < glyphs.length; i += 1) {
      totalWidth += glyphs[i]!.width;
      if (i < glyphs.length - 1) totalWidth += letterGap;
    }

    let cursor = 0;
    if (typography.alignment === "center") cursor = -totalWidth / 2;
    if (typography.alignment === "right") cursor = -totalWidth;

    let charIndex = 0;
    for (const glyph of glyphs) {
      if (!glyph.geometry) {
        cursor += glyph.width + letterGap;
        continue;
      }
      const box = glyph.geometry.boundingBox;
      const xOffset = box ? -box.min.x : 0;
      letters.push({
        key: `L${lineIndex}-C${charIndex}-${glyph.char}`,
        char: glyph.char,
        geometry: glyph.geometry,
        rest: [cursor + xOffset, yOffsets[lineIndex] ?? 0, compositionZ],
        width: glyph.width,
        lineIndex,
        charIndex,
      });
      cursor += glyph.width + letterGap;
      charIndex += 1;
    }
  }

  return letters;
}

export function releasePhysicsLetterMeshes(letters: PhysicsLetterMesh[]) {
  for (const letter of letters) {
    sharedTextGeometryCache.release(letter.geometry);
  }
}
