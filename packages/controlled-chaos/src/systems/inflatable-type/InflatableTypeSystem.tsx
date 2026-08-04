"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import type { Group, Mesh } from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { loadPosterFont } from "../../typography/FontLoader";
import { qualityBudget, type QualityTier } from "../../quality/quality-presets";
import { createSeededRandom } from "../../seed/createSeededRandom";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";
import {
  AUDIO_MIX_PROFILES,
  audioDriveGain,
  audioMul,
} from "../../audio/audioMapping";
import {
  buildPhysicsLetterMeshes,
  releasePhysicsLetterMeshes,
  type PhysicsLetterMesh,
} from "../physics/letterMeshes";
import { parseInflatableConfig } from "./inflatableType.schema";

type InflatableTypeSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
};

type LetterBodyProps = {
  letter: PhysicsLetterMesh;
  color: string;
  accent: string;
  mass: number;
  bounce: number;
  linearDamping: number;
  angularDamping: number;
  gravityScale: number;
  shadows: boolean;
  bodyRef: (body: RapierRigidBody | null) => void;
  meshRef: (mesh: Mesh | null) => void;
};

function LetterBody({
  letter,
  color,
  accent,
  mass,
  bounce,
  linearDamping,
  angularDamping,
  gravityScale,
  shadows,
  bodyRef,
  meshRef,
}: LetterBodyProps) {
  return (
    <RigidBody
      ref={bodyRef}
      position={letter.rest}
      colliders="hull"
      mass={mass}
      restitution={bounce}
      linearDamping={linearDamping}
      angularDamping={angularDamping}
      gravityScale={gravityScale}
      canSleep
    >
      <mesh
        ref={meshRef}
        geometry={letter.geometry}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.42}
          metalness={0.18}
          emissive={accent}
          emissiveIntensity={0.06}
        />
      </mesh>
    </RigidBody>
  );
}

function InflateForces({
  bodyRefs,
  meshRefs,
  letters,
  configRef,
  timeRef,
  loopSeconds,
  paused,
  reducedMotion,
  audioGain,
  beatBoost,
  seed,
}: {
  bodyRefs: RefObject<Array<RapierRigidBody | null>>;
  meshRefs: RefObject<Array<Mesh | null>>;
  letters: PhysicsLetterMesh[];
  configRef: RefObject<ReturnType<typeof parseInflatableConfig>>;
  timeRef: RefObject<number>;
  loopSeconds: number;
  paused: boolean;
  reducedMotion: boolean;
  audioGain: number;
  beatBoost: number;
  seed: string;
}) {
  const audioRef = useAudioBandsRef();
  const impulseScratch = useMemo(() => {
    const rng = createSeededRandom(`${seed}:inflate-phase`);
    return letters.map(() => rng.nextRange(0, Math.PI * 2));
  }, [letters, seed]);

  useBeforePhysicsStep(() => {
    if (paused || reducedMotion) return;
    const cfg = configRef.current;
    const t = timeRef.current;
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2 * cfg.pulseSpeed;
    const bands = audioRef.current;
    const drive = audioMul(
      bands,
      audioGain,
      AUDIO_MIX_PROFILES.bodyBeat,
      beatBoost,
    );

    for (let i = 0; i < letters.length; i += 1) {
      const body = bodyRefs.current[i];
      const letter = letters[i];
      if (!body || !letter || !body.isValid()) continue;

      const rest = letter.rest;
      const translation = body.translation();
      const linvel = body.linvel();
      const inflate =
        0.5 + 0.5 * Math.sin(angle + (impulseScratch[i] ?? 0));
      const pressure = cfg.inflatePressure * inflate * drive;

      // Restore toward rest pose (spring-like)
      const kx = (rest[0] - translation.x) * (1.8 + cfg.inflatePressure);
      const ky = (rest[1] - translation.y) * (1.6 + cfg.inflatePressure);
      const kz = (rest[2] - translation.z) * 2.2;
      body.applyImpulse({ x: kx * 0.02, y: ky * 0.02, z: kz * 0.02 }, true);

      // Cyclic inflate impulse (radial puff + slight lift)
      body.applyImpulse(
        {
          x: Math.sin(angle * 1.3 + i) * pressure * 0.008,
          y: (0.35 + Math.cos(angle + i * 0.4)) * pressure * 0.012,
          z: Math.sin(angle * 0.7 + i * 0.2) * pressure * 0.004,
        },
        true,
      );

      // Mild angular wobble from seed phase
      body.applyTorqueImpulse(
        {
          x: Math.sin(angle + i) * pressure * 0.0008,
          y: Math.cos(angle * 0.8 + i) * pressure * 0.001,
          z: (impulseScratch[i]! - Math.PI) * 0.00015 * pressure,
        },
        true,
      );

      // Soft velocity clamp for export stability
      const speed = Math.hypot(linvel.x, linvel.y, linvel.z);
      if (speed > 1.8) {
        const scale = 1.8 / speed;
        body.setLinvel(
          { x: linvel.x * scale, y: linvel.y * scale, z: linvel.z * scale },
          true,
        );
      }
    }
  });

  useFrame(() => {
    if (reducedMotion) return;
    const cfg = configRef.current;
    const t = timeRef.current;
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2 * cfg.pulseSpeed;
    const bands = audioRef.current;
    const drive = audioMul(
      bands,
      audioGain,
      AUDIO_MIX_PROFILES.bodyBeat,
      beatBoost,
    );

    for (let i = 0; i < letters.length; i += 1) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const inflate =
        0.5 + 0.5 * Math.sin(angle + (impulseScratch[i] ?? 0));
      const puff = 1 + cfg.puffScale * inflate * 0.55 * drive;
      mesh.scale.setScalar(puff);
    }
  });

  return null;
}

function StaticLetters({
  letters,
  color,
  accent,
  shadows,
  composition,
}: {
  letters: PhysicsLetterMesh[];
  color: string;
  accent: string;
  shadows: boolean;
  composition: PosterCreationV1["composition"];
}) {
  return (
    <group
      position={[composition.position[0], composition.position[1], 0]}
      rotation={composition.rotation}
      scale={composition.scale}
    >
      {letters.map((letter) => (
        <mesh
          key={letter.key}
          geometry={letter.geometry}
          position={letter.rest}
          castShadow={shadows}
          receiveShadow={shadows}
        >
          <meshStandardMaterial
            color={color}
            roughness={0.42}
            metalness={0.18}
            emissive={accent}
            emissiveIntensity={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

function InflatableSimulation({
  document,
  letters,
  config,
  paused,
  reducedMotion,
  shadows,
  audioGain,
  beatBoost,
}: {
  document: PosterCreationV1;
  letters: PhysicsLetterMesh[];
  config: ReturnType<typeof parseInflatableConfig>;
  paused: boolean;
  reducedMotion: boolean;
  shadows: boolean;
  audioGain: number;
  beatBoost: number;
}) {
  const bodyRefs = useRef<Array<RapierRigidBody | null>>([]);
  const meshRefs = useRef<Array<Mesh | null>>([]);
  const configRef = useRef(config);
  const timeRef = useRef(0);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    bodyRefs.current = bodyRefs.current.slice(0, letters.length);
    meshRefs.current = meshRefs.current.slice(0, letters.length);
  }, [letters.length]);

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime();
  });

  const ox = document.composition.position[0];
  const oy = document.composition.position[1];
  const oz = document.composition.position[2];

  return (
    <group
      ref={groupRef}
      position={[ox, oy, 0]}
      rotation={document.composition.rotation}
      scale={document.composition.scale}
    >
      <Physics
        gravity={[0, -1.6 * config.gravityScale, 0]}
        timeStep={1 / 60}
        paused={paused || reducedMotion}
        interpolate={false}
        numSolverIterations={4}
        colliders={false}
      >
        <CuboidCollider
          args={[0.55, 0.02, 0.35]}
          position={[0, -0.82, oz]}
          restitution={0.2}
          friction={0.6}
        />
        <CuboidCollider
          args={[0.02, 1.05, 0.35]}
          position={[-0.52, 0, oz]}
        />
        <CuboidCollider
          args={[0.02, 1.05, 0.35]}
          position={[0.52, 0, oz]}
        />
        <CuboidCollider
          args={[0.55, 0.02, 0.35]}
          position={[0, 0.9, oz]}
        />
        <CuboidCollider
          args={[0.55, 1.05, 0.02]}
          position={[0, 0, oz - 0.28]}
        />
        <CuboidCollider
          args={[0.55, 1.05, 0.02]}
          position={[0, 0, oz + 0.28]}
        />

        {letters.map((letter, index) => (
          <LetterBody
            key={letter.key}
            letter={letter}
            color={document.palette.primary}
            accent={document.palette.accent}
            mass={config.mass}
            bounce={config.bounce}
            linearDamping={config.linearDamping}
            angularDamping={config.angularDamping}
            gravityScale={0.35 + config.gravityScale}
            shadows={shadows}
            bodyRef={(body) => {
              bodyRefs.current[index] = body;
            }}
            meshRef={(mesh) => {
              meshRefs.current[index] = mesh;
            }}
          />
        ))}

        <InflateForces
          bodyRefs={bodyRefs}
          meshRefs={meshRefs}
          letters={letters}
          configRef={configRef}
          timeRef={timeRef}
          loopSeconds={document.document.loopDurationSeconds}
          paused={paused}
          reducedMotion={reducedMotion}
          audioGain={audioGain}
          beatBoost={beatBoost}
          seed={document.seed}
        />
      </Physics>
    </group>
  );
}

/**
 * Inflatable typography — Rapier rigid bodies + cyclic inflate forces.
 * Not a true soft-body solver.
 */
export function InflatableTypeSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
}: InflatableTypeSystemProps) {
  const config = useMemo(
    () => parseInflatableConfig(document.visualSystem.config),
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
  const [letters, setLetters] = useState<PhysicsLetterMesh[]>([]);
  const lettersRef = useRef<PhysicsLetterMesh[]>([]);

  const audioGain = audioDriveGain(document.audio, reducedMotion);
  const beatBoost = document.audio.beatBoost;

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

  useEffect(() => {
    if (!font) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      if (cancelled) return;
      const next = buildPhysicsLetterMeshes({
        font,
        typography: {
          ...document.typography,
          depth: Math.min(0.22, document.typography.depth * 1.35),
          bevel: Math.min(0.05, document.typography.bevel * 1.4),
        },
        curveSegments: budget.curveSegments,
        letterGap: config.letterGap,
        compositionZ: 0.07,
      });
      releasePhysicsLetterMeshes(lettersRef.current);
      lettersRef.current = next;
      setLetters(next);
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [
    font,
    document.typography,
    budget.curveSegments,
    config.letterGap,
  ]);

  useEffect(() => {
    return () => {
      releasePhysicsLetterMeshes(lettersRef.current);
      lettersRef.current = [];
    };
  }, []);

  if (letters.length === 0) return null;

  return (
    <group>
      <ambientLight intensity={0.35 * document.lighting.exposure} />
      <directionalLight
        position={[2.4, 3.2, 3.6]}
        intensity={
          1.15 *
          document.lighting.keyIntensity *
          document.lighting.exposure
        }
        color="#fff4e6"
      />
      <directionalLight
        position={[-2.2, -0.6, 2]}
        intensity={
          0.45 *
          document.lighting.fillIntensity *
          document.lighting.exposure
        }
        color="#c9a66b"
      />
      <pointLight
        position={[0.2, 1.2, -2]}
        intensity={
          0.7 *
          document.lighting.rimIntensity *
          document.lighting.exposure
        }
        color={document.palette.accent}
        distance={7}
      />

      {reducedMotion ? (
        <StaticLetters
          letters={letters}
          color={document.palette.primary}
          accent={document.palette.accent}
          shadows={budget.shadows}
          composition={document.composition}
        />
      ) : (
        <Suspense fallback={null}>
          <InflatableSimulation
            document={document}
            letters={letters}
            config={config}
            paused={paused}
            reducedMotion={reducedMotion}
            shadows={budget.shadows}
            audioGain={audioGain}
            beatBoost={beatBoost}
          />
        </Suspense>
      )}
    </group>
  );
}
