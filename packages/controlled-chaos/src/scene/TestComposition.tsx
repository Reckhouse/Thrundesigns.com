"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { defaultPhrase } from "../shell/tokens";

const LOOP_SECONDS = 8;

type TestCompositionProps = {
  phrase?: string;
  reducedMotion?: boolean;
  paused?: boolean;
};

/**
 * Phase 1 placeholder composition: a vertical 9:16 poster plate with a
 * looping metallic accent and readable phrase plane. Replaced by visual
 * systems in later phases — establishes canvas framing, loop timing,
 * and dispose-safe scene structure.
 */
export function TestComposition({
  phrase = defaultPhrase,
  reducedMotion = false,
  paused = false,
}: TestCompositionProps) {
  const plateRef = useRef<Mesh>(null);
  const accentRef = useRef<Group>(null);
  const shardRefs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (paused || reducedMotion) return;
    const t = clock.getElapsedTime();
    const phase = (t % LOOP_SECONDS) / LOOP_SECONDS;
    const angle = phase * Math.PI * 2;

    if (accentRef.current) {
      accentRef.current.rotation.y = Math.sin(angle) * 0.18;
      accentRef.current.rotation.x = Math.cos(angle * 0.5) * 0.08;
      accentRef.current.position.y = Math.sin(angle) * 0.06;
    }

    for (let i = 0; i < shardRefs.current.length; i += 1) {
      const shard = shardRefs.current[i];
      if (!shard) continue;
      const offset = (i / shardRefs.current.length) * Math.PI * 2;
      shard.position.y = 0.55 + Math.sin(angle + offset) * 0.12;
      shard.rotation.z = Math.sin(angle + offset) * 0.35;
    }

    if (plateRef.current) {
      plateRef.current.rotation.z = Math.sin(angle * 0.25) * 0.01;
    }
  });

  const display = phrase.trim().slice(0, 24) || defaultPhrase;

  return (
    <group>
      {/* Vertical poster plate — aspect 9:16 in world units (~1.08 × 1.92) */}
      <mesh ref={plateRef} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1.08, 1.92]} />
        <meshStandardMaterial
          color="#171816"
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Soft inner vignette plate */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.98, 1.78]} />
        <meshStandardMaterial
          color="#0c0d0c"
          roughness={1}
          metalness={0}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Gold accent bar */}
      <group ref={accentRef} position={[0, 0.42, 0.06]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.035, 0.04]} />
          <meshStandardMaterial
            color="#d4af6a"
            metalness={0.85}
            roughness={0.28}
          />
        </mesh>
      </group>

      {/* Floating shards — suggest future particle / fracture systems */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = -0.28 + i * 0.14;
        return (
          <mesh
            key={i}
            ref={(node) => {
              shardRefs.current[i] = node;
            }}
            position={[x, 0.55, 0.08]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#d4af6a" : "#8a6a38"}
              metalness={0.7}
              roughness={0.35}
            />
          </mesh>
        );
      })}

      {/* Phrase as extruded-looking plates (no FontLoader yet — Phase 2) */}
      <PhraseBlocks phrase={display} />

      {/* Baseline prompt strip */}
      <mesh position={[0, -0.72, 0.05]}>
        <planeGeometry args={[0.7, 0.04]} />
        <meshStandardMaterial color="#222522" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PhraseBlocks({ phrase }: { phrase: string }) {
  const words = phrase.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 3);
  const lines = words.length > 0 ? words : [defaultPhrase];

  return (
    <group position={[0, -0.05, 0.07]}>
      {lines.map((word, lineIndex) => {
        const chars = word.slice(0, 12).split("");
        const totalWidth = chars.length * 0.09;
        return (
          <group
            key={`${word}-${lineIndex}`}
            position={[0, 0.18 - lineIndex * 0.22, 0]}
          >
            {chars.map((char, i) => (
              <mesh
                key={`${char}-${i}`}
                position={[-totalWidth / 2 + i * 0.09 + 0.04, 0, 0]}
                castShadow
              >
                <boxGeometry
                  args={[
                    char === "I" || char === "1" ? 0.035 : 0.07,
                    0.12,
                    0.045,
                  ]}
                />
                <meshStandardMaterial
                  color="#ebe7df"
                  metalness={0.15}
                  roughness={0.55}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
