"use client";

import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { createSeededRandom } from "../../seed/createSeededRandom";
import { layoutPhrase, lineOffsets } from "../../typography/TextLayout";
import {
  centerAndScalePoints,
  sampleShapes,
  type SampledPoint,
} from "./pointSampling";

const TEXT_SIZE = 0.16;

export async function sampleTextPoints(options: {
  font: Font;
  typography: PosterCreationV1["typography"];
  seed: string;
  count: number;
  depthSpread: number;
  edgeBias: number;
}): Promise<SampledPoint[]> {
  const layout = layoutPhrase(options.typography);
  const yOffsets = lineOffsets(
    layout.lines.length,
    options.typography.lineHeight,
    TEXT_SIZE,
  );

  const perLine = Math.max(
    32,
    Math.floor(options.count / Math.max(1, layout.lines.length)),
  );
  const combined: SampledPoint[] = [];

  for (let index = 0; index < layout.lines.length; index += 1) {
    const line = layout.lines[index]!;
    const shapes = options.font.generateShapes(line.text, TEXT_SIZE);
    if (shapes.length === 0) continue;

    let minX = Infinity;
    let maxX = -Infinity;
    for (const shape of shapes) {
      for (const point of shape.getPoints(8)) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
      }
    }
    const width = Number.isFinite(minX) ? maxX - minX : 0;
    let offsetX = 0;
    if (options.typography.alignment === "center") offsetX = -width / 2 - (Number.isFinite(minX) ? minX : 0);
    if (options.typography.alignment === "right") offsetX = -width - (Number.isFinite(minX) ? minX : 0);
    if (options.typography.alignment === "left") {
      offsetX = Number.isFinite(minX) ? -minX : 0;
    }

    const rng = createSeededRandom(
      `${options.seed}:text-line:${index}:${line.text}`,
    );
    const sampled = sampleShapes(shapes, {
      count: perLine,
      rng,
      depthSpread: options.depthSpread,
      edgeBias: options.edgeBias,
    });

    const y = yOffsets[index] ?? 0;
    for (const point of sampled) {
      combined.push({
        x: point.x + offsetX,
        y: point.y + y,
        z: point.z,
        edge: point.edge,
      });
    }
  }

  // Trim or pad to exact count with seeded selection.
  const trimRng = createSeededRandom(`${options.seed}:text-trim`);
  while (combined.length > options.count) {
    const index = trimRng.nextInt(0, combined.length);
    combined.splice(index, 1);
  }

  return centerAndScalePoints(combined, options.typography.maxWidth);
}
