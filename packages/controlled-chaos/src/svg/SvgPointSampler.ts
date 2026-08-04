"use client";

import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { Shape } from "three";
import { createSeededRandom } from "../seed/createSeededRandom";
import {
  centerAndScalePoints,
  sampleShapes,
  type SampledPoint,
} from "../systems/particle-disintegration/pointSampling";

export function sampleSvgPoints(options: {
  svg: string;
  seed: string;
  count: number;
  depthSpread: number;
  edgeBias: number;
}): SampledPoint[] {
  const loader = new SVGLoader();
  const data = loader.parse(options.svg);
  const shapes: Shape[] = [];

  for (const path of data.paths) {
    const pathShapes = SVGLoader.createShapes(path);
    for (const shape of pathShapes) {
      shapes.push(shape);
    }
  }

  if (shapes.length === 0) return [];

  // SVG Y axis is flipped relative to Three scene space.
  for (const shape of shapes) {
    shape.curves.forEach(() => undefined);
    const points = shape.getPoints(4);
    // Invert via translate/scale trick on all points by rebuilding bounds.
    void points;
  }

  const rng = createSeededRandom(`${options.seed}:svg-points`);
  const sampled = sampleShapes(shapes, {
    count: options.count,
    rng,
    depthSpread: options.depthSpread,
    edgeBias: options.edgeBias,
  }).map((point) => ({
    ...point,
    y: -point.y,
  }));

  return centerAndScalePoints(sampled, 0.9);
}
