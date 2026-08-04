"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { createSeededRandom } from "../seed/createSeededRandom";
import { ParticleDisintegrationSystem } from "../systems/particle-disintegration/ParticleDisintegrationSystem";
import type { ForceMode } from "../systems/types";
import { PosterText } from "../typography/PosterText";

type PosterSceneContentProps = {
  document: PosterCreationV1;
  reducedMotion?: boolean;
  paused?: boolean;
  assetBasePath?: string;
  quality?: "auto" | "low" | "medium" | "high";
  forceMode?: ForceMode;
};

/**
 * Poster scene host. Active visual systems replace solid type meshes.
 */
export function PosterSceneContent({
  document,
  reducedMotion = false,
  paused = false,
  assetBasePath,
  quality = "auto",
  forceMode = "push",
}: PosterSceneContentProps) {
  const plateRef = useRef<Mesh>(null);
  const loopSeconds = document.document.loopDurationSeconds;
  const motionIntensity = document.camera.motionIntensity;
  const { palette, seed } = document;
  const useParticles = document.visualSystem.key === "particle-disintegration";

  const shardSeeds = useMemo(() => {
    if (useParticles) return [];
    const rng = createSeededRandom(`${seed}:shards`);
    return Array.from({ length: 5 }, () => ({
      x: rng.nextRange(-0.32, 0.32),
      baseY: rng.nextRange(0.48, 0.72),
      z: rng.nextRange(0.06, 0.12),
      size: rng.nextRange(0.05, 0.09),
      phase: rng.nextRange(0, Math.PI * 2),
      gold: rng.bool(0.55),
    }));
  }, [seed, useParticles]);

  useFrame(({ clock }) => {
    if (paused || reducedMotion || !plateRef.current) return;
    const t = clock.getElapsedTime();
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;
    plateRef.current.rotation.z = Math.sin(angle * 0.25) * 0.01 * motionIntensity;
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

      {useParticles ? (
        <ParticleDisintegrationSystem
          document={document}
          quality={quality}
          paused={paused}
          reducedMotion={reducedMotion}
          assetBasePath={assetBasePath}
          forceMode={forceMode}
        />
      ) : (
        <>
          {shardSeeds.map((spec, i) => (
            <mesh
              key={`shard-${seed}-${i}`}
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
        </>
      )}
    </group>
  );
}
