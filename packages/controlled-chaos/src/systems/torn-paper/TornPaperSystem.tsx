"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ExtrudeGeometry,
  Shape,
  type BufferGeometry,
  type Group,
  type Mesh,
} from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { loadPosterFont } from "../../typography/FontLoader";
import { layoutPhrase, lineOffsets } from "../../typography/TextLayout";
import {
  buildLineTextGeometry,
  sharedTextGeometryCache,
} from "../../typography/TextGeometryCache";
import { qualityBudget, type QualityTier } from "../../quality/quality-presets";
import { createSeededRandom } from "../../seed/createSeededRandom";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";
import { parseTornPaperConfig } from "./tornPaper.schema";

type TornPaperSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
};

type PaperShard = {
  key: string;
  geometry: ExtrudeGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  phase: number;
  paperTone: number;
};

type LineMesh = {
  geometry: BufferGeometry;
  x: number;
  y: number;
  text: string;
};

const TEXT_SIZE = 0.15;

function buildTornShardShape(
  rng: ReturnType<typeof createSeededRandom>,
  width: number,
  height: number,
  tearAmount: number,
  edgeFray: number,
): Shape {
  const shape = new Shape();
  const segments = 6 + Math.floor(tearAmount * 8 + edgeFray * 4);
  const points: Array<[number, number]> = [];
  for (let i = 0; i < segments; i += 1) {
    const t = i / segments;
    const angle = t * Math.PI * 2;
    const baseX = Math.cos(angle) * width * 0.5;
    const baseY = Math.sin(angle) * height * 0.5;
    const jagged =
      1 +
      (rng.nextRange(-1, 1) * 0.18 * tearAmount +
        rng.nextRange(-1, 1) * 0.12 * edgeFray);
    points.push([baseX * jagged, baseY * jagged]);
  }
  const first = points[0]!;
  shape.moveTo(first[0], first[1]);
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i]!;
    const mid = points[(i + 1) % points.length]!;
    const ctrlX = (point[0] + mid[0]) * 0.5 + rng.nextRange(-0.02, 0.02) * tearAmount;
    const ctrlY = (point[1] + mid[1]) * 0.5 + rng.nextRange(-0.02, 0.02) * tearAmount;
    shape.quadraticCurveTo(ctrlX, ctrlY, point[0], point[1]);
  }
  shape.closePath();
  return shape;
}

function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const cleaned = hex.replace("#", "");
    const full =
      cleaned.length === 3
        ? cleaned
            .split("")
            .map((c) => c + c)
            .join("")
        : cleaned.padEnd(6, "0").slice(0, 6);
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ] as const;
  };
  const ca = parse(a);
  const cb = parse(b);
  const mix = (i: number) =>
    Math.round(ca[i]! + (cb[i]! - ca[i]!) * Math.min(1, Math.max(0, t)));
  return `#${[mix(0), mix(1), mix(2)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Torn paper collage with shallow extruded type.
 * Frame loop mutates shard transforms only — no React setState.
 */
export function TornPaperSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
}: TornPaperSystemProps) {
  const config = useMemo(
    () => parseTornPaperConfig(document.visualSystem.config),
    [document.visualSystem.config],
  );

  const budget = useMemo(
    () =>
      qualityBudget(quality, {
        reducedMotion,
        mobile:
          typeof navigator !== "undefined" &&
          /Mobi|Android/i.test(navigator.userAgent),
        hardwareConcurrency:
          typeof navigator !== "undefined"
            ? navigator.hardwareConcurrency
            : 8,
      }),
    [quality, reducedMotion],
  );

  const [font, setFont] = useState<Font | null>(null);
  const [lines, setLines] = useState<LineMesh[]>([]);
  const activeGeometries = useRef<BufferGeometry[]>([]);
  const shardGroupRef = useRef<Group>(null);
  const configRef = useRef(config);
  const audioRef = useAudioBandsRef();

  const audioEnabled =
    document.audio.mode !== "off" &&
    document.audio.reactive &&
    !reducedMotion;
  const audioGain = audioEnabled
    ? document.audio.gain * document.audio.sensitivity
    : 0;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const shards = useMemo(() => {
    const rng = createSeededRandom(`${document.seed}:torn-paper`);
    const count = Math.round(config.layerCount);
    const next: PaperShard[] = [];
    for (let i = 0; i < count; i += 1) {
      const width = rng.nextRange(0.28, 0.55) * (0.7 + config.overlap * 0.5);
      const height = rng.nextRange(0.22, 0.48) * (0.75 + config.overlap * 0.4);
      const shape = buildTornShardShape(
        rng,
        width,
        height,
        config.tearAmount,
        config.edgeFray,
      );
      const geometry = new ExtrudeGeometry(shape, {
        depth: 0.008 + config.tearAmount * 0.01,
        bevelEnabled: false,
        curveSegments: budget.tier === "low" ? 2 : 4,
      });
      next.push({
        key: `shard-${document.seed}-${i}`,
        geometry,
        position: [
          rng.nextRange(-0.32, 0.32) * (0.6 + config.overlap),
          rng.nextRange(-0.55, 0.55) * (0.7 + config.overlap * 0.3),
          0.02 + i * 0.006,
        ],
        rotation: [
          rng.nextRange(-0.18, 0.18) * config.curl,
          rng.nextRange(-0.12, 0.12) * config.curl,
          rng.nextRange(-0.35, 0.35) * (0.4 + config.tearAmount * 0.6),
        ],
        scale: [
          rng.nextRange(0.85, 1.15),
          rng.nextRange(0.85, 1.15),
          1,
        ],
        phase: rng.nextRange(0, Math.PI * 2),
        paperTone: rng.nextRange(0.15, 0.85),
      });
    }
    return next;
  }, [
    document.seed,
    config.layerCount,
    config.overlap,
    config.tearAmount,
    config.edgeFray,
    config.curl,
    budget.tier,
  ]);

  useEffect(() => {
    return () => {
      for (const shard of shards) {
        shard.geometry.dispose();
      }
    };
  }, [shards]);

  useEffect(() => {
    let cancelled = false;
    void loadPosterFont(document.typography.fontKey, assetBasePath)
      .then((loaded) => {
        if (!cancelled) setFont(loaded);
      })
      .catch(() => {
        if (!cancelled) setFont(null);
      });
    return () => {
      cancelled = true;
    };
  }, [document.typography.fontKey, assetBasePath]);

  const typography = useMemo(
    () => ({
      ...document.typography,
      depth: Math.max(0.018, document.typography.depth * 0.45),
      bevel: Math.max(0.003, document.typography.bevel * 0.35),
    }),
    [document.typography],
  );

  const layout = useMemo(() => layoutPhrase(typography), [typography]);

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
            curveSegments: budget.curveSegments,
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
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [font, layout, typography, budget.curveSegments]);

  useEffect(() => {
    return () => {
      for (const geometry of activeGeometries.current) {
        sharedTextGeometryCache.release(geometry);
      }
      activeGeometries.current = [];
    };
  }, []);

  useFrame(({ clock }) => {
    const group = shardGroupRef.current;
    if (!group) return;
    const cfg = configRef.current;
    if (paused || reducedMotion) {
      let i = 0;
      group.children.forEach((child) => {
        const mesh = child as Mesh;
        const shard = shards[i];
        if (!shard || !mesh.isMesh) return;
        mesh.position.set(...shard.position);
        mesh.rotation.set(...shard.rotation);
        i += 1;
      });
      return;
    }

    const t = clock.getElapsedTime();
    const loopSeconds = document.document.loopDurationSeconds;
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;
    const bands = audioRef.current;
    const audioMul =
      1 +
      audioGain *
        (bands.mid * 0.35 + bands.energy * 0.25 + bands.beat * 0.4);

    let index = 0;
    group.children.forEach((child) => {
      const mesh = child as Mesh;
      const shard = shards[index];
      if (!shard || !mesh.isMesh) return;
      const local = angle + shard.phase;
      const drift = cfg.drift * 0.028 * audioMul;
      mesh.position.x = shard.position[0] + Math.sin(local * 0.7) * drift;
      mesh.position.y =
        shard.position[1] + Math.cos(local * 0.55) * drift * 1.1;
      mesh.position.z = shard.position[2];
      mesh.rotation.x =
        shard.rotation[0] + Math.sin(local) * cfg.curl * 0.08 * audioMul;
      mesh.rotation.y =
        shard.rotation[1] + Math.cos(local * 0.8) * cfg.curl * 0.06;
      mesh.rotation.z =
        shard.rotation[2] + Math.sin(local * 0.45) * cfg.drift * 0.04;
      index += 1;
    });
  });

  const paperBase = mixHex("#f2ebe0", document.palette.secondary, 0.25);
  const paperDark = mixHex("#d8cfc0", document.palette.background, 0.35);
  const inkColor =
    config.inkContrast > 0.6 ? "#1a1814" : document.palette.primary;

  return (
    <group>
      <ambientLight intensity={0.42 * document.lighting.exposure} />
      <directionalLight
        position={[1.8, 2.8, 3.2]}
        intensity={
          0.95 *
          document.lighting.keyIntensity *
          document.lighting.exposure
        }
        color="#fff6ea"
      />
      <directionalLight
        position={[-2.2, -0.4, 1.8]}
        intensity={
          0.35 *
          document.lighting.fillIntensity *
          document.lighting.exposure
        }
        color="#c4b49a"
      />

      <group ref={shardGroupRef}>
        {shards.map((shard) => (
          <mesh
            key={shard.key}
            geometry={shard.geometry}
            position={shard.position}
            rotation={shard.rotation}
            scale={shard.scale}
            castShadow={budget.shadows}
            receiveShadow={budget.shadows}
          >
            <meshStandardMaterial
              color={mixHex(paperBase, paperDark, shard.paperTone)}
              roughness={config.paperRoughness}
              metalness={0.02}
              flatShading
            />
          </mesh>
        ))}
      </group>

      <group
        position={[
          document.composition.position[0],
          document.composition.position[1],
          document.composition.position[2] + 0.05,
        ]}
        rotation={document.composition.rotation}
        scale={document.composition.scale}
      >
        {lines.map((line, index) => (
          <mesh
            key={`torn-type-${typography.fontKey}-${line.text}-${index}`}
            geometry={line.geometry}
            position={[line.x, line.y, 0]}
            castShadow={budget.shadows}
          >
            <meshStandardMaterial
              color={inkColor}
              roughness={0.78 - config.inkContrast * 0.2}
              metalness={0.05}
              emissive={document.palette.accent}
              emissiveIntensity={0.03 + config.inkContrast * 0.04}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
