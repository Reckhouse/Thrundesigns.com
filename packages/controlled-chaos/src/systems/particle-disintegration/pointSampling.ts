import { type Shape } from "three";
import type { SeededRandom } from "../../seed/createSeededRandom";

export type SampledPoint = {
  x: number;
  y: number;
  z: number;
  edge: number;
};

/**
 * Even contour sampling + seeded filled-area sampling for Three.js Shapes.
 */
export function sampleShapes(
  shapes: Shape[],
  options: {
    count: number;
    rng: SeededRandom;
    depthSpread: number;
    edgeBias: number;
    contourRatio?: number;
  },
): SampledPoint[] {
  if (shapes.length === 0 || options.count <= 0) return [];

  const contourRatio = options.contourRatio ?? 0.35 + options.edgeBias * 0.35;
  const contourCount = Math.floor(options.count * contourRatio);
  const fillCount = options.count - contourCount;

  const points: SampledPoint[] = [];
  const contourPool = buildContourPool(shapes, Math.max(contourCount * 2, 64));
  const bounds = shapeBounds(shapes);

  for (let i = 0; i < contourCount; i += 1) {
    const sample = contourPool[options.rng.nextInt(0, contourPool.length)]!;
    points.push({
      x: sample.x,
      y: sample.y,
      z: options.rng.nextRange(-options.depthSpread, options.depthSpread) * 0.08,
      edge: 1,
    });
  }

  let attempts = 0;
  while (points.length < options.count && attempts < fillCount * 40) {
    attempts += 1;
    const x = options.rng.nextRange(bounds.minX, bounds.maxX);
    const y = options.rng.nextRange(bounds.minY, bounds.maxY);
    if (!pointInShapes(shapes, x, y)) continue;
    const edge = edgeProximity(contourPool, x, y, bounds.diagonal);
    if (options.rng.next() > 1 - options.edgeBias * 0.35 && edge < 0.15) {
      // Prefer near-edge fills when edgeBias is high.
      if (edge < 0.04) continue;
    }
    points.push({
      x,
      y,
      z: options.rng.nextRange(-options.depthSpread, options.depthSpread) * 0.08,
      edge,
    });
  }

  // Top up from contour pool if fill rejection undersampled.
  while (points.length < options.count && contourPool.length > 0) {
    const sample = contourPool[options.rng.nextInt(0, contourPool.length)]!;
    points.push({
      x: sample.x,
      y: sample.y,
      z: options.rng.nextRange(-options.depthSpread, options.depthSpread) * 0.08,
      edge: 1,
    });
  }

  return points.slice(0, options.count);
}

function buildContourPool(
  shapes: Shape[],
  samplesPerShape: number,
): Vector2Like[] {
  const pool: Vector2Like[] = [];
  for (const shape of shapes) {
    const spaced = shape.getSpacedPoints(
      Math.max(12, Math.floor(samplesPerShape / Math.max(1, shapes.length))),
    );
    for (const point of spaced) {
      pool.push({ x: point.x, y: point.y });
    }
    for (const hole of shape.holes) {
      const holePoints = hole.getSpacedPoints(24);
      for (const point of holePoints) {
        pool.push({ x: point.x, y: point.y });
      }
    }
  }
  return pool;
}

type Vector2Like = { x: number; y: number };

function shapeBounds(shapes: Shape[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const shape of shapes) {
    const points = shape.getPoints(24);
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  if (!Number.isFinite(minX)) {
    return { minX: -0.5, maxX: 0.5, minY: -0.5, maxY: 0.5, diagonal: 1 };
  }
  const diagonal = Math.hypot(maxX - minX, maxY - minY) || 1;
  return { minX, maxX, minY, maxY, diagonal };
}

function pointInShapes(shapes: Shape[], x: number, y: number): boolean {
  for (const shape of shapes) {
    if (pointInPolygon(shape.getPoints(24), x, y)) {
      let inHole = false;
      for (const hole of shape.holes) {
        if (pointInPolygon(hole.getPoints(16), x, y)) {
          inHole = true;
          break;
        }
      }
      if (!inHole) return true;
    }
  }
  return false;
}

function pointInPolygon(
  polygon: Array<{ x: number; y: number }>,
  x: number,
  y: number,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function edgeProximity(
  contour: Vector2Like[],
  x: number,
  y: number,
  diagonal: number,
): number {
  let min = Infinity;
  for (const point of contour) {
    const d = Math.hypot(point.x - x, point.y - y);
    if (d < min) min = d;
  }
  return Math.min(1, min / (diagonal * 0.15));
}

export function centerAndScalePoints(
  points: SampledPoint[],
  targetWidth = 0.9,
): SampledPoint[] {
  if (points.length === 0) return points;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  const width = Math.max(0.0001, maxX - minX);
  const height = Math.max(0.0001, maxY - minY);
  const scale = targetWidth / Math.max(width, height * (9 / 16) * (16 / 9) * 0.6);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return points.map((point) => ({
    ...point,
    x: (point.x - cx) * scale,
    y: (point.y - cy) * scale,
    z: point.z * scale,
  }));
}
