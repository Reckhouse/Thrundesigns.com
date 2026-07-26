import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(root, "public/images/horse-head.png");

const size = 960;
const TARGET = 42000;

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

const candidates = [];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!isInk(x, y)) continue;
    let neighbors = 0;
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        if (ox === 0 && oy === 0) continue;
        if (isInk(x + ox, y + oy)) neighbors++;
      }
    }
    const edge = neighbors < 8;
    const keepChance = edge ? 0.92 : 0.55;
    if (Math.random() > keepChance) continue;
    const i = (y * w + x) * 4;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    candidates.push([x, y, lum]);
  }
}

let picked = candidates;
if (candidates.length > TARGET) {
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  picked = candidates.slice(0, TARGET);
}

const positions = new Float32Array(picked.length * 3);
const randoms = new Float32Array(picked.length * 3);

for (let i = 0; i < picked.length; i++) {
  const [x, y, lum] = picked[i];
  const nx = ((x + 0.5) / w) * 2 - 1;
  const ny = 1 - ((y + 0.5) / h) * 2;
  const nz = (1 - lum / 60) * 0.04 - 0.02;
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
}

const outDir = path.join(root, "public/data");
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
  path.join(outDir, "horse-particles.json"),
  JSON.stringify({ count: picked.length, width: w, height: h }),
);

console.log(`Baked ${picked.length} particles from ${candidates.length} ink samples`);
