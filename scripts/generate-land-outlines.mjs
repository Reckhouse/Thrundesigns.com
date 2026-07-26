import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = process.argv[2] || "/tmp/land-50m.json";
const topology = JSON.parse(fs.readFileSync(source, "utf8"));
const land = feature(topology, topology.objects.land);
const DEG = Math.PI / 180;

function toXYZ(lon, lat) {
  const latRad = lat * DEG;
  const lonRad = lon * DEG;
  const cosLat = Math.cos(latRad);
  return [
    cosLat * Math.sin(lonRad),
    Math.sin(latRad),
    cosLat * Math.cos(lonRad),
  ];
}

function densifyRing(ring, maxStepDeg = 0.75) {
  const out = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon0, lat0] = ring[i];
    const [lon1, lat1] = ring[i + 1];
    out.push([lon0, lat0]);
    let dLon = lon1 - lon0;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const dLat = lat1 - lat0;
    const dist = Math.hypot(dLon, dLat);
    const steps = Math.max(1, Math.ceil(dist / maxStepDeg));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      out.push([lon0 + dLon * t, lat0 + dLat * t]);
    }
  }
  out.push(ring[ring.length - 1]);
  return out;
}

const positions = [];

function walkCoords(coords) {
  if (typeof coords[0][0] === "number") {
    const ring = densifyRing(coords);
    for (let i = 0; i < ring.length - 1; i++) {
      const a = toXYZ(ring[i][0], ring[i][1]);
      const b = toXYZ(ring[i + 1][0], ring[i + 1][1]);
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      if (dx * dx + dy * dy + dz * dz > 0.35) continue;
      positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
    return;
  }
  for (const c of coords) walkCoords(c);
}

for (const f of land.type === "FeatureCollection" ? land.features : [land]) {
  walkCoords(f.geometry.coordinates);
}

const outPath = path.join(root, "public/data/land-outlines.bin");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(new Float32Array(positions).buffer));
console.log(`Wrote ${positions.length / 6} segments → ${outPath}`);
