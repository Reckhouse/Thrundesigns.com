"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { createSeededRandom } from "../seed/createSeededRandom";
import { PosterText } from "../typography/PosterText";

type PosterSceneContentProps = {
  document: PosterCreationV1;
  reducedMotion?: boolean;
  paused?: boolean;
  assetBasePath?: string;
  quality?: "auto" | "low" | "medium" | "high";
};

/**
 * Phase 2 scene: palette-driven plate, seeded accent motion, extruded type.
 */
export function PosterSceneContent({
  document,
  reducedMotion = false,
  paused = false,
  assetBasePath,
  quality = "auto",
}: PosterSceneContentProps) {
  const plateRef = useRef<Mesh>(null);
  const accentRef = useRef<Group>(null);
  const shardRefs = useRef<(Mesh | null)[]>([]);

  const loopSeconds = document.document.loopDurationSeconds;
  const motionIntensity = document.camera.motionIntensity;
  const { palette, seed } = document;

  const shardSeeds = useMemo(() => {
    const rng = createSeededRandom(`${seed}:shards`);
    return Array.from({ length: 5 }, () => ({
      x: rng.nextRange(-0.32, 0.32),
      baseY: rng.nextRange(0.48, 0.72),
      z: rng.nextRange(0.06, 0.12),
      size: rng.nextRange(0.05, 0.09),
      phase: rng.nextRange(0, Math.PI * 2),
      gold: rng.bool(0.55),
    }));
  }, [seed]);

  useFrame(({ clock }) => {
    if (paused || reducedMotion) return;
    const t = clock.getElapsedTime();
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;

    if (accentRef.current) {
      accentRef.current.rotation.y = Math.sin(angle) * 0.18 * motionIntensity;
      accentRef.current.rotation.x =
        Math.cos(angle * 0.5) * 0.08 * motionIntensity;
      accentRef.current.position.y = Math.sin(angle) * 0.06 * motionIntensity;
    }

    for (let i = 0; i < shardRefs.current.length; i += 1) {
      const shard = shardRefs.current[i];
      const spec = shardSeeds[i];
      if (!shard || !spec) continue;
      shard.position.y =
        spec.baseY + Math.sin(angle + spec.phase) * 0.12 * motionIntensity;
      shard.rotation.z = Math.sin(angle + spec.phase) * 0.35 * motionIntensity;
    }

    if (plateRef.current) {
      plateRef.current.rotation.z = Math.sin(angle * 0.25) * 0.01 * motionIntensity;
    }
  });

  return (
    <group>
      <mesh ref={plateRef} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1.08, 1.92]} />
        <meshStandardMaterial
          color={palette.background}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.98, 1.78]} />
        <meshStandardMaterial
          color={palette.background}
          roughness={1}
          metalness={0}
          transparent
          opacity={0.92}
        />
      </mesh>

      <group ref={accentRef} position={[0, 0.62, 0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.035, 0.04]} />
          <meshStandardMaterial
            color={palette.accent}
            metalness={0.85}
            roughness={0.28}
          />
        </mesh>
      </group>

      {shardSeeds.map((spec, i) => (
        <mesh
          key={`shard-${seed}-${i}`}
          ref={(node) => {
            shardRefs.current[i] = node;
          }}
          position={[spec.x, spec.baseY, spec.z]}
          castShadow
        >
          <boxGeometry args={[spec.size, spec.size, spec.size]} />
          <meshStandardMaterial
            color={spec.gold ? palette.accent : palette.secondary}
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>
      ))}

      <PosterText
        typography={document.typography}
        palette={palette}
        composition={document.composition}
        assetBasePath={assetBasePath}
        quality={quality}
      />
    </group>
  );
}
