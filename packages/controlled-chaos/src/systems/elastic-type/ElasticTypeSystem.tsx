"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from "@react-three/rapier";
import type { Group } from "three";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { loadPosterFont } from "../../typography/FontLoader";
import { qualityBudget, type QualityTier } from "../../quality/quality-presets";
import { createSeededRandom } from "../../seed/createSeededRandom";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";
import {
  buildPhysicsLetterMeshes,
  releasePhysicsLetterMeshes,
  type PhysicsLetterMesh,
} from "../physics/letterMeshes";
import { defaultPointerForce, type ForceMode, type PointerForce } from "../types";
import { parseElasticConfig } from "./elasticType.schema";

type ElasticTypeSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
  forceMode?: ForceMode;
};

function LetterBody({
  letter,
  color,
  accent,
  mass,
  shadows,
  bodyRef,
}: {
  letter: PhysicsLetterMesh;
  color: string;
  accent: string;
  mass: number;
  shadows: boolean;
  bodyRef: (body: RapierRigidBody | null) => void;
}) {
  return (
    <RigidBody
      ref={bodyRef}
      position={letter.rest}
      colliders="cuboid"
      mass={mass}
      restitution={0.18}
      linearDamping={0.2}
      angularDamping={0.65}
      gravityScale={0.25}
      canSleep
    >
      <mesh
        geometry={letter.geometry}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.48}
          metalness={0.12}
          emissive={accent}
          emissiveIntensity={0.05}
        />
      </mesh>
    </RigidBody>
  );
}

function ElasticForces({
  bodyRefs,
  letters,
  configRef,
  timeRef,
  pointerRef,
  loopSeconds,
  paused,
  reducedMotion,
  audioGain,
  seed,
}: {
  bodyRefs: RefObject<Array<RapierRigidBody | null>>;
  letters: PhysicsLetterMesh[];
  configRef: RefObject<ReturnType<typeof parseElasticConfig>>;
  timeRef: RefObject<number>;
  pointerRef: RefObject<PointerForce>;
  loopSeconds: number;
  paused: boolean;
  reducedMotion: boolean;
  audioGain: number;
  seed: string;
}) {
  const audioRef = useAudioBandsRef();
  const phaseOffsets = useMemo(() => {
    const rng = createSeededRandom(`${seed}:elastic-phase`);
    return letters.map(() => rng.nextRange(0, Math.PI * 2));
  }, [letters, seed]);

  useBeforePhysicsStep(() => {
    if (paused || reducedMotion) return;
    const cfg = configRef.current;
    const t = timeRef.current;
    const phase = (t % loopSeconds) / loopSeconds;
    const angle = phase * Math.PI * 2;
    const bands = audioRef.current;
    const audioMul =
      1 +
      audioGain *
        (bands.mid * 0.4 + bands.energy * 0.3 + bands.beat * 0.5);
    const stiffness = 2.4 + cfg.stiffness * 6.5;
    const damping = 0.8 + cfg.damping * 3.2;
    const maxTravel = 0.08 + cfg.stretch * 0.32;
    const pointer = pointerRef.current;

    for (let i = 0; i < letters.length; i += 1) {
      const body = bodyRefs.current[i];
      const letter = letters[i];
      if (!body || !letter || !body.isValid()) continue;

      const rest = letter.rest;
      const translation = body.translation();
      const linvel = body.linvel();

      let targetX = rest[0];
      let targetY = rest[1];
      const targetZ = rest[2];

      // Seeded oscillation of rest pose
      const osc = cfg.oscillation * audioMul;
      targetX += Math.sin(angle * 1.1 + (phaseOffsets[i] ?? 0)) * osc * 0.035;
      targetY += Math.cos(angle * 0.9 + (phaseOffsets[i] ?? 0)) * osc * 0.028;

      // Neighbor coupling — pull slightly toward adjacent rest midpoints
      if (cfg.neighborCoupling > 0) {
        const prev = letters[i - 1];
        const next = letters[i + 1];
        if (prev && prev.lineIndex === letter.lineIndex) {
          targetX +=
            (prev.rest[0] + rest[0]) * 0.5 * cfg.neighborCoupling * 0.015 -
            rest[0] * cfg.neighborCoupling * 0.015;
        }
        if (next && next.lineIndex === letter.lineIndex) {
          targetX +=
            (next.rest[0] + rest[0]) * 0.5 * cfg.neighborCoupling * 0.015 -
            rest[0] * cfg.neighborCoupling * 0.015;
        }
      }

      // Clamp stretch from rest
      const dx = translation.x - rest[0];
      const dy = translation.y - rest[1];
      const dz = translation.z - rest[2];
      const dist = Math.hypot(dx, dy, dz);
      if (dist > maxTravel) {
        const scale = maxTravel / dist;
        body.setTranslation(
          {
            x: rest[0] + dx * scale,
            y: rest[1] + dy * scale,
            z: rest[2] + dz * scale,
          },
          true,
        );
      }

      const pos = body.translation();
      const fx = (targetX - pos.x) * stiffness - linvel.x * damping;
      const fy = (targetY - pos.y) * stiffness - linvel.y * damping;
      const fz = (targetZ - pos.z) * stiffness - linvel.z * damping;
      body.applyImpulse(
        { x: fx * 0.016, y: fy * 0.016, z: fz * 0.016 },
        true,
      );

      if (pointer.active && cfg.pointerCoupling > 0) {
        const px = pointer.position[0];
        const py = pointer.position[1];
        const pz = pointer.position[2];
        const pdx = pos.x - px;
        const pdy = pos.y - py;
        const pdz = pos.z - pz;
        const pDist = Math.hypot(pdx, pdy, pdz);
        const radius = pointer.radius * (0.7 + cfg.stretch * 0.5);
        if (pDist < radius && pDist > 1e-4) {
          const falloff = 1 - pDist / radius;
          const strength =
            pointer.strength * cfg.pointerCoupling * falloff * 0.025;
          const nx = pdx / pDist;
          const ny = pdy / pDist;
          const nz = pdz / pDist;
          const sign =
            pointer.mode === "pull" || pointer.mode === "attract" ? -1 : 1;
          body.applyImpulse(
            {
              x: nx * strength * sign,
              y: ny * strength * sign,
              z: nz * strength * sign * 0.35,
            },
            true,
          );
        }
      }
    }
  });

  return null;
}

function PointerPlane({
  pointerRef,
  forceMode,
  enabled,
}: {
  pointerRef: RefObject<PointerForce>;
  forceMode: ForceMode;
  enabled: boolean;
}) {
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), -0.07), []);
  const ndc = useMemo(() => new Vector2(), []);
  const hit = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!enabled) return;
    const element = gl.domElement;
    const force = pointerRef.current;

    const update = (clientX: number, clientY: number, active: boolean) => {
      const rect = element.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      force.previousPosition = [...force.position];
      if (raycaster.ray.intersectPlane(plane, hit)) {
        force.position = [hit.x, hit.y, hit.z];
        force.velocity = [
          force.position[0] - force.previousPosition[0],
          force.position[1] - force.previousPosition[1],
          force.position[2] - force.previousPosition[2],
        ];
      }
      force.active = active;
      force.mode = forceMode;
      force.pressure = active ? 1 : 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      element.setPointerCapture(event.pointerId);
      update(event.clientX, event.clientY, true);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!force.active && event.buttons === 0) {
        update(event.clientX, event.clientY, false);
        return;
      }
      update(event.clientX, event.clientY, event.buttons > 0 || force.active);
    };
    const onPointerUp = (event: PointerEvent) => {
      update(event.clientX, event.clientY, false);
      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      force.active = false;
    };
  }, [camera, enabled, forceMode, gl.domElement, ndc, plane, pointerRef, raycaster, hit]);

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
            roughness={0.48}
            metalness={0.12}
            emissive={accent}
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function ElasticSimulation({
  document,
  letters,
  config,
  paused,
  reducedMotion,
  shadows,
  audioGain,
  forceMode,
}: {
  document: PosterCreationV1;
  letters: PhysicsLetterMesh[];
  config: ReturnType<typeof parseElasticConfig>;
  paused: boolean;
  reducedMotion: boolean;
  shadows: boolean;
  audioGain: number;
  forceMode: ForceMode;
}) {
  const bodyRefs = useRef<Array<RapierRigidBody | null>>([]);
  const configRef = useRef(config);
  const timeRef = useRef(0);
  const pointerRef = useRef<PointerForce>(defaultPointerForce());
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    bodyRefs.current = bodyRefs.current.slice(0, letters.length);
  }, [letters.length]);

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime();
  });

  const oz = document.composition.position[2];

  return (
    <group
      ref={groupRef}
      position={[
        document.composition.position[0],
        document.composition.position[1],
        0,
      ]}
      rotation={document.composition.rotation}
      scale={document.composition.scale}
    >
      <PointerPlane
        pointerRef={pointerRef}
        forceMode={forceMode}
        enabled={!paused && !reducedMotion && config.pointerCoupling > 0}
      />
      <Physics
        gravity={[0, -1.2 * config.gravityScale, 0]}
        timeStep={1 / 60}
        paused={paused || reducedMotion}
        interpolate={false}
        numSolverIterations={4}
        colliders={false}
      >
        <CuboidCollider
          args={[0.55, 0.02, 0.35]}
          position={[0, -0.82, oz]}
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

        {letters.map((letter, index) => (
          <LetterBody
            key={letter.key}
            letter={letter}
            color={document.palette.primary}
            accent={document.palette.accent}
            mass={config.mass}
            shadows={shadows}
            bodyRef={(body) => {
              bodyRefs.current[index] = body;
            }}
          />
        ))}

        <ElasticForces
          bodyRefs={bodyRefs}
          letters={letters}
          configRef={configRef}
          timeRef={timeRef}
          pointerRef={pointerRef}
          loopSeconds={document.document.loopDurationSeconds}
          paused={paused}
          reducedMotion={reducedMotion}
          audioGain={audioGain}
          seed={document.seed}
        />
      </Physics>
    </group>
  );
}

/**
 * Elastic typography — Rapier rigid bodies sprung toward rest poses.
 */
export function ElasticTypeSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
  forceMode = "push",
}: ElasticTypeSystemProps) {
  const config = useMemo(
    () => parseElasticConfig(document.visualSystem.config),
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

  const audioEnabled =
    document.audio.mode !== "off" &&
    document.audio.reactive &&
    !reducedMotion;
  const audioGain = audioEnabled
    ? document.audio.gain * document.audio.sensitivity
    : 0;

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
        typography: document.typography,
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
  }, [font, document.typography, budget.curveSegments, config.letterGap]);

  useEffect(() => {
    return () => {
      releasePhysicsLetterMeshes(lettersRef.current);
      lettersRef.current = [];
    };
  }, []);

  if (letters.length === 0) return null;

  return (
    <group>
      <ambientLight intensity={0.32 * document.lighting.exposure} />
      <directionalLight
        position={[2.2, 3.4, 3.4]}
        intensity={
          1.1 *
          document.lighting.keyIntensity *
          document.lighting.exposure
        }
        color="#fff1dc"
      />
      <directionalLight
        position={[-2.4, -0.4, 2.2]}
        intensity={
          0.5 *
          document.lighting.fillIntensity *
          document.lighting.exposure
        }
        color="#8a6a38"
      />
      <pointLight
        position={[-0.4, 1.4, -2.2]}
        intensity={
          0.75 *
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
          <ElasticSimulation
            document={document}
            letters={letters}
            config={config}
            paused={paused}
            reducedMotion={reducedMotion}
            shadows={budget.shadows}
            audioGain={audioGain}
            forceMode={forceMode}
          />
        </Suspense>
      )}
    </group>
  );
}
