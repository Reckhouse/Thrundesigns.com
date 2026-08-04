"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, Group, Mesh, MeshPhysicalMaterial } from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { loadPosterFont } from "../../typography/FontLoader";
import { layoutPhrase, lineOffsets } from "../../typography/TextLayout";
import {
  buildLineTextGeometry,
  sharedTextGeometryCache,
} from "../../typography/TextGeometryCache";
import { qualityBudget, type QualityTier } from "../../quality/quality-presets";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";
import {
  AUDIO_MIX_PROFILES,
  audioDriveGain,
  audioMul,
} from "../../audio/audioMapping";
import {
  CHROME_LIGHTING,
  parseChromeConfig,
} from "./chromeLiquid.schema";

type ChromeLiquidSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
};

type LineMesh = {
  geometry: BufferGeometry;
  x: number;
  y: number;
  text: string;
};

const TEXT_SIZE = 0.16;

/**
 * Extruded chrome type with seeded liquid displacement.
 * Frame loop writes transforms/uniforms only — no React setState.
 */
export function ChromeLiquidSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
}: ChromeLiquidSystemProps) {
  const config = useMemo(
    () => parseChromeConfig(document.visualSystem.config),
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

  const typography = useMemo(() => {
    const depth =
      document.typography.depth * (1 + config.depthBoost * 0.9);
    const bevel =
      document.typography.bevel * (1 + config.bevelBoost * 1.2);
    return {
      ...document.typography,
      depth: Math.min(0.4, depth),
      bevel: Math.min(0.08, bevel),
    };
  }, [document.typography, config.depthBoost, config.bevelBoost]);

  const [font, setFont] = useState<Font | null>(null);
  const [lines, setLines] = useState<LineMesh[]>([]);
  const activeGeometries = useRef<BufferGeometry[]>([]);
  const groupRef = useRef<Group>(null);
  const configRef = useRef(config);
  const audioRef = useAudioBandsRef();
  const audioGain = audioDriveGain(document.audio, reducedMotion);
  const beatBoost = document.audio.beatBoost;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const layout = useMemo(() => layoutPhrase(typography), [typography]);
  const curveSegments = budget.curveSegments;
  const lighting = CHROME_LIGHTING[config.lightingPreset];
  const loopSeconds = document.document.loopDurationSeconds;
  const chromeColor =
    config.lightingPreset === "rim-heavy"
      ? document.palette.secondary
      : document.palette.primary;

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

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const cfg = configRef.current;

    const updateMaterials = (emissiveIntensity: number, envMapIntensity: number) => {
      group.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as MeshPhysicalMaterial;
        if (!material || typeof material !== "object") return;
        if ("emissiveIntensity" in material) {
          material.emissiveIntensity = emissiveIntensity;
        }
        if ("envMapIntensity" in material) {
          material.envMapIntensity = envMapIntensity;
        }
      });
    };

    if (paused || reducedMotion) {
      group.rotation.x = 0;
      group.rotation.y = 0;
      group.position.z = document.composition.position[2];
      updateMaterials(cfg.fresnel * 0.08, cfg.envIntensity);
      return;
    }

    const t = clock.getElapsedTime();
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;
    const bands = audioRef.current;
    const drive = audioMul(
      bands,
      audioGain,
      AUDIO_MIX_PROFILES.liquid,
      beatBoost,
    );
    const amp = cfg.liquidAmplitude * 0.045 * drive;
    const freq = cfg.liquidFrequency;
    const speed = cfg.liquidSpeed;

    group.rotation.x = Math.sin(angle * freq * 0.35 * speed) * amp * 1.4;
    group.rotation.y = Math.cos(angle * freq * 0.28 * speed) * amp * 1.8;
    group.position.z =
      document.composition.position[2] +
      Math.sin(angle * freq * speed) * amp * 0.6;

    let childIndex = 0;
    group.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const localPhase = angle * freq * speed + childIndex * 0.55;
      mesh.position.y =
        ((mesh.userData.baseY as number | undefined) ?? mesh.position.y) +
        Math.sin(localPhase) * amp * 0.35;
      childIndex += 1;
    });

    updateMaterials(
      cfg.fresnel *
        (0.06 +
          0.1 * (0.5 + 0.5 * Math.sin(angle * 2)) +
          audioGain * bands.treble * 0.12 +
          audioGain * bands.beat * beatBoost * 0.08),
      cfg.envIntensity *
        (0.92 +
          0.08 * Math.sin(angle) +
          audioGain * bands.mid * 0.15 +
          audioGain * bands.energy * 0.08),
    );
  });

  // Capture base Y once lines mount
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      mesh.userData.baseY = mesh.position.y;
    });
  }, [lines]);

  return (
    <group>
      <directionalLight
        position={lighting.key}
        intensity={
          lighting.keyMul *
          document.lighting.keyIntensity *
          document.lighting.exposure *
          0.55
        }
        color={lighting.keyColor}
      />
      <directionalLight
        position={lighting.fill}
        intensity={
          lighting.fillMul *
          document.lighting.fillIntensity *
          document.lighting.exposure *
          0.7
        }
        color={lighting.fillColor}
      />
      <pointLight
        position={lighting.rim}
        intensity={
          lighting.rimMul *
          document.lighting.rimIntensity *
          document.lighting.exposure *
          0.9
        }
        color={lighting.rimColor}
        distance={8}
      />

      <group
        ref={groupRef}
        position={document.composition.position}
        rotation={document.composition.rotation}
        scale={document.composition.scale}
      >
        {lines.map((line, index) => (
          <mesh
            key={`chrome-${typography.fontKey}-${line.text}-${index}`}
            geometry={line.geometry}
            position={[line.x, line.y, 0]}
            castShadow={budget.shadows}
            receiveShadow={budget.shadows}
            userData={{ baseY: line.y }}
          >
            <meshPhysicalMaterial
              color={chromeColor}
              metalness={config.metalness}
              roughness={config.roughness}
              clearcoat={config.clearcoat}
              clearcoatRoughness={config.clearcoatRoughness}
              reflectivity={0.9}
              envMapIntensity={config.envIntensity}
              emissive={document.palette.accent}
              emissiveIntensity={config.fresnel * 0.08}
              toneMapped
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

