"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, Group, Mesh } from "three";
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
import {
  AUDIO_MIX_PROFILES,
  audioDriveGain,
  audioMul,
} from "../../audio/audioMapping";
import { parseTypeArchitectureConfig } from "./typeArchitecture.schema";

type TypeArchitectureSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
};

type SlabMesh = {
  geometry: BufferGeometry;
  rest: [number, number, number];
  text: string;
  floor: number;
};

type StructurePiece = {
  key: string;
  kind: "column" | "beam";
  position: [number, number, number];
  size: [number, number, number];
  phase: number;
};

const TEXT_SIZE = 0.145;

/**
 * Architectural massing of extruded type with beams and columns.
 * Frame loop writes transforms only.
 */
export function TypeArchitectureSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
}: TypeArchitectureSystemProps) {
  const config = useMemo(
    () => parseTypeArchitectureConfig(document.visualSystem.config),
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
  const [slabs, setSlabs] = useState<SlabMesh[]>([]);
  const activeGeometries = useRef<BufferGeometry[]>([]);
  const groupRef = useRef<Group>(null);
  const structureRef = useRef<Group>(null);
  const configRef = useRef(config);
  const audioRef = useAudioBandsRef();
  const audioGain = audioDriveGain(document.audio, reducedMotion);
  const beatBoost = document.audio.beatBoost;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const typography = useMemo(() => {
    const depth =
      document.typography.depth * (0.9 + config.facadeDepth * 1.4);
    return {
      ...document.typography,
      depth: Math.min(0.32, Math.max(0.05, depth)),
      bevel: Math.min(0.04, document.typography.bevel * (0.7 + config.massing * 0.5)),
    };
  }, [document.typography, config.facadeDepth, config.massing]);

  const layout = useMemo(() => layoutPhrase(typography), [typography]);

  useEffect(() => {
    let cancelled = false;
    void loadPosterFont(typography.fontKey, assetBasePath)
      .then((loaded) => {
        if (!cancelled) setFont(loaded);
      })
      .catch(() => {
        if (!cancelled) setFont(null);
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
      const floorGap =
        typography.lineHeight * TEXT_SIZE * (0.85 + config.elevation * 0.55);
      const yOffsets = lineOffsets(layout.lines.length, 1, floorGap);
      const next: SlabMesh[] = [];
      for (let index = 0; index < layout.lines.length; index += 1) {
        const line = layout.lines[index]!;
        const geometry = sharedTextGeometryCache.acquire(
          {
            phrase: line.text,
            fontKey: typography.fontKey,
            size: TEXT_SIZE,
            letterSpacing:
              typography.letterSpacing * (0.7 + config.gridTightness * 0.5),
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
        const cantileverShift =
          (index % 2 === 0 ? 1 : -1) *
          config.cantilever *
          0.08 *
          (1 + index * 0.15);
        next.push({
          geometry,
          rest: [x + cantileverShift, yOffsets[index] ?? 0, 0],
          text: line.text,
          floor: index,
        });
      }
      for (const geometry of activeGeometries.current) {
        sharedTextGeometryCache.release(geometry);
      }
      activeGeometries.current = next.map((slab) => slab.geometry);
      setSlabs(next);
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [
    font,
    layout,
    typography,
    budget.curveSegments,
    config.elevation,
    config.gridTightness,
    config.cantilever,
  ]);

  useEffect(() => {
    return () => {
      for (const geometry of activeGeometries.current) {
        sharedTextGeometryCache.release(geometry);
      }
      activeGeometries.current = [];
    };
  }, []);

  const structure = useMemo(() => {
    const rng = createSeededRandom(`${document.seed}:type-arch`);
    const pieces: StructurePiece[] = [];
    const columnCount = Math.round(2 + config.columnDensity * 5);
    for (let i = 0; i < columnCount; i += 1) {
      const x = rng.nextRange(-0.38, 0.38);
      const height = rng.nextRange(0.55, 1.15) * (0.7 + config.massing * 0.5);
      pieces.push({
        key: `col-${document.seed}-${i}`,
        kind: "column",
        position: [x, rng.nextRange(-0.15, 0.2), -0.04 - i * 0.004],
        size: [
          0.018 + config.beamWeight * 0.012,
          height,
          0.018 + config.facadeDepth * 0.02,
        ],
        phase: rng.nextRange(0, Math.PI * 2),
      });
    }
    const beamCount = Math.round(1 + config.beamWeight * 4);
    for (let i = 0; i < beamCount; i += 1) {
      pieces.push({
        key: `beam-${document.seed}-${i}`,
        kind: "beam",
        position: [
          rng.nextRange(-0.12, 0.12),
          rng.nextRange(-0.35, 0.45),
          -0.02 - i * 0.005,
        ],
        size: [
          rng.nextRange(0.35, 0.7) * (0.7 + config.massing * 0.4),
          0.014 + config.beamWeight * 0.02,
          0.016 + config.facadeDepth * 0.015,
        ],
        phase: rng.nextRange(0, Math.PI * 2),
      });
    }
    return pieces;
  }, [
    document.seed,
    config.columnDensity,
    config.massing,
    config.beamWeight,
    config.facadeDepth,
  ]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const structureGroup = structureRef.current;
    const cfg = configRef.current;
    if (!group) return;

    if (paused || reducedMotion) {
      let i = 0;
      group.children.forEach((child) => {
        const mesh = child as Mesh;
        const slab = slabs[i];
        if (!slab || !mesh.isMesh) return;
        mesh.position.set(...slab.rest);
        mesh.rotation.set(0, 0, 0);
        i += 1;
      });
      return;
    }

    const t = clock.getElapsedTime();
    const loopSeconds = document.document.loopDurationSeconds;
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;
    const bands = audioRef.current;
    const drive = audioMul(
      bands,
      audioGain,
      AUDIO_MIX_PROFILES.spring,
      beatBoost,
    );
    const rhythm = cfg.rhythm * 0.02 * drive;

    let index = 0;
    group.children.forEach((child) => {
      const mesh = child as Mesh;
      const slab = slabs[index];
      if (!slab || !mesh.isMesh) return;
      const local = angle * (0.6 + cfg.rhythm * 0.5) + slab.floor * 0.4;
      mesh.position.x = slab.rest[0] + Math.sin(local) * rhythm * 0.6;
      mesh.position.y =
        slab.rest[1] + Math.cos(local * 0.8) * rhythm * 0.35 * drive;
      mesh.position.z =
        slab.rest[2] + Math.sin(local * 0.5) * cfg.elevation * 0.012;
      mesh.rotation.y = Math.sin(local * 0.35) * cfg.cantilever * 0.04;
      index += 1;
    });

    if (structureGroup) {
      let s = 0;
      structureGroup.children.forEach((child) => {
        const mesh = child as Mesh;
        const piece = structure[s];
        if (!piece || !mesh.isMesh) return;
        const local = angle + piece.phase;
        mesh.position.y =
          piece.position[1] + Math.sin(local * 0.6) * rhythm * 0.4;
        s += 1;
      });
    }
  });

  return (
    <group>
      <ambientLight intensity={0.28 * document.lighting.exposure} />
      <directionalLight
        position={[2.6, 3.6, 2.8]}
        intensity={
          1.25 *
          document.lighting.keyIntensity *
          document.lighting.exposure
        }
        color="#fff2e0"
      />
      <directionalLight
        position={[-2.4, 0.2, 2]}
        intensity={
          0.4 *
          document.lighting.fillIntensity *
          document.lighting.exposure
        }
        color="#8a7a62"
      />
      <pointLight
        position={[0.4, 1.6, -2.4]}
        intensity={
          0.85 *
          document.lighting.rimIntensity *
          document.lighting.exposure
        }
        color={document.palette.accent}
        distance={8}
      />

      <group
        ref={structureRef}
        position={document.composition.position}
        rotation={document.composition.rotation}
        scale={document.composition.scale}
      >
        {structure.map((piece) => (
          <mesh
            key={piece.key}
            position={piece.position}
            castShadow={budget.shadows}
            receiveShadow={budget.shadows}
          >
            <boxGeometry args={piece.size} />
            <meshStandardMaterial
              color={
                piece.kind === "column"
                  ? document.palette.secondary
                  : document.palette.accent
              }
              roughness={0.55}
              metalness={piece.kind === "beam" ? 0.35 : 0.12}
            />
          </mesh>
        ))}
      </group>

      <group
        ref={groupRef}
        position={document.composition.position}
        rotation={document.composition.rotation}
        scale={document.composition.scale}
      >
        {slabs.map((slab, index) => (
          <mesh
            key={`arch-${typography.fontKey}-${slab.text}-${index}`}
            geometry={slab.geometry}
            position={slab.rest}
            castShadow={budget.shadows}
            receiveShadow={budget.shadows}
          >
            <meshStandardMaterial
              color={document.palette.primary}
              roughness={0.38 - config.massing * 0.12}
              metalness={0.22 + config.facadeDepth * 0.25}
              emissive={document.palette.accent}
              emissiveIntensity={0.04 + config.rhythm * 0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
