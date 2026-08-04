/**
 * Bake Living Engraving horse particles.
 * Edge-weighted sampling + per-particle tone/depth metadata for the shader.
 *
 * Usage: node scripts/bake-horse-particles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(root, "public/images/horse-head.png");

const size = 960;
/** High-tier count; client subsamples for standard/static tiers. */
const TARGET = 12000;

const { data, info } = await sharp(source)
  .resize(size, size, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;

function isInk(x, y) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  const i = (y * w + x) * 4;
  if (data[i + 3] < 10) return false;
  return (data[i] + data[i + 1] + data[i + 2]) / 3 < 60;
}

function neighborCount(x, y) {
  let neighbors = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue;
      if (isInk(x + ox, y + oy)) neighbors++;
    }
  }
  return neighbors;
}

/** Rough curvature: ink density in a 5×5 neighborhood. */
function curvatureScore(x, y) {
  let ink = 0;
  let total = 0;
  for (let oy = -2; oy <= 2; oy++) {
    for (let ox = -2; ox <= 2; ox++) {
      total += 1;
      if (isInk(x + ox, y + oy)) ink += 1;
    }
  }
  const ratio = ink / total;
  // Mid-density = silhouette folds; pure fill or empty score lower
  return 1 - Math.abs(ratio - 0.45) * 2;
}

const candidates = [];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!isInk(x, y)) continue;
    const neighbors = neighborCount(x, y);
    const edge = neighbors < 8 ? 1 - neighbors / 8 : 0;
    const curve = Math.max(0, curvatureScore(x, y));
    const i = (y * w + x) * 4;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;

    // Prefer silhouette / mane / features; thin interior fill
    const weight = edge * 1.35 + curve * 0.55 + (1 - lum / 60) * 0.2;
    const keepChance = edge > 0.15 ? 0.95 : 0.22 + curve * 0.35;
    if (Math.random() > keepChance) continue;

    candidates.push({ x, y, lum, edge, weight });
  }
}

// Sort engraved weight first so client drawRange tiers keep silhouette
candidates.sort((a, b) => b.weight - a.weight);

let picked = candidates;
if (candidates.length > TARGET) {
  // Keep top edge-weighted set, then fill with weighted random from remainder
  const edgeKeep = Math.floor(TARGET * 0.72);
  const head = candidates.slice(0, edgeKeep);
  const rest = candidates.slice(edgeKeep);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  picked = head.concat(rest.slice(0, TARGET - edgeKeep));
  // Re-sort so low tiers (drawRange) remain silhouette-first
  picked.sort((a, b) => b.weight - a.weight);
}

const positions = new Float32Array(picked.length * 3);
const randoms = new Float32Array(picked.length * 3);
/** aMeta: edge, tone (0 stone / 0.5 bronze / 1 gold), rear/depth */
const metas = new Float32Array(picked.length * 3);

let stone = 0;
let bronze = 0;
let gold = 0;

for (let i = 0; i < picked.length; i++) {
  const { x, y, lum, edge } = picked[i];
  const nx = ((x + 0.5) / w) * 2 - 1;
  const ny = 1 - ((y + 0.5) / h) * 2;
  const nz = (1 - lum / 60) * 0.05 - 0.025;

  positions[i * 3] = nx * 1.35;
  positions[i * 3 + 1] = ny * 1.35;
  positions[i * 3 + 2] = nz;

  const rx = Math.random() * 2 - 1;
  const ry = Math.random() * 2 - 1;
  const rz = Math.random() * 2 - 1;
  const len = Math.hypot(rx, ry, rz) || 1;
  randoms[i * 3] = rx / len;
  randoms[i * 3 + 1] = ry / len;
  randoms[i * 3 + 2] = Math.random();

  // Feature zones: upper face / eye band / silhouette get more metal
  const feature =
    edge * 0.55 +
    Math.max(0, ny) * 0.25 +
    Math.max(0, -nx) * 0.15 +
    (1 - Math.min(1, Math.abs(ny - 0.2))) * 0.15;

  // Target mix ≈ 80% stone / 15% bronze / 5% gold (gold biased to features)
  const roll = Math.random();
  let tone = 0;
  const goldChance = 0.02 + feature * 0.08;
  const bronzeChance = 0.1 + feature * 0.18;
  if (roll < goldChance) {
    tone = 1;
    gold += 1;
  } else if (roll < goldChance + bronzeChance) {
    tone = 0.5;
    bronze += 1;
  } else {
    stone += 1;
  }

  // Rear-ish samples (lower / back of head in image space) for depth fade
  const rear = Math.min(1, Math.max(0, (0.35 - ny) * 0.8 + (1 - edge) * 0.35));

  metas[i * 3] = edge;
  metas[i * 3 + 1] = tone;
  metas[i * 3 + 2] = rear;
}

const metaJson = JSON.stringify({
  count: picked.length,
  width: w,
  height: h,
  tiers: { high: picked.length, standard: 8000, constrained: 0 },
  tones: { stone, bronze, gold },
});

const outDirs = [
  path.join(root, "public/data"),
  path.join(root, "public/experiences/living-engraving"),
];

for (const outDir of outDirs) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "horse-particles-pos.bin"),
    Buffer.from(positions.buffer),
  );
  fs.writeFileSync(
    path.join(outDir, "horse-particles-rand.bin"),
    Buffer.from(randoms.buffer),
  );
  fs.writeFileSync(
    path.join(outDir, "horse-particles-meta.bin"),
    Buffer.from(metas.buffer),
  );
  fs.writeFileSync(path.join(outDir, "horse-particles.json"), metaJson);
}

console.log(
  `Baked ${picked.length} particles (stone ${stone}, bronze ${bronze}, gold ${gold}) from ${candidates.length} candidates → ${outDirs.map((d) => path.relative(root, d)).join(", ")}`,
);
