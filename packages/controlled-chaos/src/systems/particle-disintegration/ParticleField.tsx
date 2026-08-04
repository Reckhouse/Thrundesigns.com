"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from "three";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { createSeededRandom } from "../../seed/createSeededRandom";
import type { PointerForce } from "../types";
import type { ParticleDisintegrationConfig } from "./particleDisintegration.schema";
import type { SampledPoint } from "./pointSampling";

const MAX_PARTICLES = 80_000;

const planeVertexShader = /* glsl */ `
uniform float uTime;
uniform float uLoop;
uniform float uDisintegration;
uniform float uMotion;
uniform float uTurbulence;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uReassembly;
uniform float uDepthSpread;
uniform vec3 uPointer;
uniform float uPointerRadius;
uniform float uPointerStrength;
uniform float uPointerActive;
uniform float uForceMode;
uniform float uReducedMotion;

attribute vec3 aSource;
attribute vec3 aRandom;
attribute float aScale;
attribute float aDelay;
attribute float aEdge;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

float loopNoise(vec3 p, float phase) {
  return sin(p.x * uNoiseFreq + phase * 6.2831853)
       * cos(p.y * uNoiseFreq * 0.85 + phase * 4.1887902);
}

void main() {
  vUv = uv;
  float phase = mod(uTime / max(uLoop, 0.001), 1.0);
  float envelope = 0.5 - 0.5 * cos(phase * 6.2831853);
  float local = clamp(envelope - aDelay * 0.25, 0.0, 1.0);
  float dissolve = local * uDisintegration * mix(1.0, 0.2, uReducedMotion);

  vec3 dir = normalize(aRandom * 2.0 - 1.0);
  dir.z *= (0.2 + uDepthSpread);

  float turb = loopNoise(aSource + aRandom, phase) * uNoiseAmp * uTurbulence;
  vec3 drift = dir * dissolve * (0.25 + uMotion * 0.9)
             + vec3(turb * 0.06, turb * 0.08, turb * 0.04);

  float reassemble = pow(smoothstep(0.78, 1.0, phase), 1.4) * uReassembly;
  drift = mix(drift, vec3(0.0), reassemble);

  vec3 world = aSource + drift;

  if (uPointerActive > 0.5) {
    vec3 toParticle = world - uPointer;
    float dist = length(toParticle);
    float influence = 1.0 - smoothstep(0.0, uPointerRadius, dist);
    vec3 forceDir = dist > 0.0001 ? normalize(toParticle) : dir;
    if (uForceMode < 0.5) {
      world += forceDir * influence * uPointerStrength * 0.32;
    } else if (uForceMode < 1.5) {
      world -= forceDir * influence * uPointerStrength * 0.28;
    } else {
      world += forceDir * influence * uPointerStrength * (0.4 + aRandom.x * 0.3);
    }
  }

  vColor = aColor;
  vAlpha = mix(1.0, 0.45, dissolve * 0.75) * mix(0.85, 1.0, aEdge);

  float scale = aScale * mix(1.0, 1.3, dissolve);
  vec3 transformed = position * scale;
  vec4 worldPos = modelMatrix * vec4(world, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;
  mvPosition.xyz += transformed;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const planeFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;
uniform float uShape;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float alpha = vAlpha;
  if (uShape > 0.5 && uShape < 1.5) {
    float d = length(p);
    if (d > 1.0) discard;
    alpha *= smoothstep(1.0, 0.55, d);
  } else if (uShape > 1.5) {
    if (abs(p.x) * 1.2 + abs(p.y) > 1.05) discard;
  } else if (abs(p.x) > 0.92 || abs(p.y) > 0.92) {
    discard;
  }
  gl_FragColor = vec4(vColor, alpha);
}
`;

type ParticleFieldProps = {
  points: SampledPoint[];
  config: ParticleDisintegrationConfig;
  palette: PosterCreationV1["palette"];
  seed: string;
  loopSeconds: number;
  pointerRef: MutableRefObject<PointerForce>;
  paused?: boolean;
  reducedMotion?: boolean;
};

function forceModeToFloat(mode: PointerForce["mode"]): number {
  if (mode === "pull" || mode === "attract") return 1;
  if (mode === "explode" || mode === "tear") return 2;
  return 0;
}

function shapeToFloat(
  shape: ParticleDisintegrationConfig["particleShape"],
): number {
  if (shape === "disc") return 1;
  if (shape === "shard") return 2;
  return 0;
}

export function ParticleField({
  points,
  config,
  palette,
  seed,
  loopSeconds,
  pointerRef,
  paused = false,
  reducedMotion = false,
}: ParticleFieldProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = Math.min(points.length, MAX_PARTICLES);

  const { geometry, material } = useMemo(() => {
    const geo = new PlaneGeometry(1, 1);
    const source = new Float32Array(count * 3);
    const random = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const delay = new Float32Array(count);
    const edge = new Float32Array(count);
    const color = new Float32Array(count * 3);

    const rng = createSeededRandom(`${seed}:particle-attrs`);
    const primary = new Color(palette.primary);
    const accent = new Color(palette.accent);
    const secondary = new Color(palette.secondary);

    for (let i = 0; i < count; i += 1) {
      const point = points[i]!;
      source[i * 3] = point.x;
      source[i * 3 + 1] = point.y;
      source[i * 3 + 2] = point.z;
      random[i * 3] = rng.next();
      random[i * 3 + 1] = rng.next();
      random[i * 3 + 2] = rng.next();
      scale[i] =
        0.008 +
        rng.next() * 0.012 * (0.5 + config.sizeVariation) +
        point.edge * 0.003;
      delay[i] = rng.next() * 0.65 * (0.4 + config.edgeBias);
      edge[i] = point.edge;
      const pick = rng.next();
      const c = pick < 0.55 ? primary : pick < 0.8 ? accent : secondary;
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }

    geo.setAttribute("aSource", new InstancedBufferAttribute(source, 3));
    geo.setAttribute("aRandom", new InstancedBufferAttribute(random, 3));
    geo.setAttribute("aScale", new InstancedBufferAttribute(scale, 1));
    geo.setAttribute("aDelay", new InstancedBufferAttribute(delay, 1));
    geo.setAttribute("aEdge", new InstancedBufferAttribute(edge, 1));
    geo.setAttribute("aColor", new InstancedBufferAttribute(color, 3));

    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uLoop: { value: loopSeconds },
        uDisintegration: { value: config.disintegration },
        uMotion: { value: config.motion },
        uTurbulence: { value: config.turbulence },
        uNoiseFreq: { value: config.noiseFrequency },
        uNoiseAmp: { value: config.noiseAmplitude },
        uReassembly: { value: config.reassemblyRate },
        uDepthSpread: { value: config.depthSpread },
        uPointer: { value: new Vector3() },
        uPointerRadius: { value: config.forceRadius },
        uPointerStrength: { value: config.forceStrength },
        uPointerActive: { value: 0 },
        uForceMode: { value: 0 },
        uReducedMotion: { value: reducedMotion ? 1 : 0 },
        uShape: { value: shapeToFloat(config.particleShape) },
      },
      vertexShader: planeVertexShader,
      fragmentShader: planeFragmentShader,
    });

    return { geometry: geo, material: mat };
  }, [
    count,
    points,
    seed,
    palette.primary,
    palette.accent,
    palette.secondary,
    config.sizeVariation,
    config.edgeBias,
    config.disintegration,
    config.motion,
    config.turbulence,
    config.noiseFrequency,
    config.noiseAmplitude,
    config.reassemblyRate,
    config.depthSpread,
    config.forceRadius,
    config.forceStrength,
    config.particleShape,
    loopSeconds,
    reducedMotion,
  ]);

  useEffect(() => {
    materialRef.current = material;
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i += 1) {
      dummy.position.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = count;
  }, [count, dummy, geometry]);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    if (!paused) {
      mat.uniforms.uTime.value = clock.getElapsedTime();
    }
    const pointer = pointerRef.current;
    mat.uniforms.uLoop.value = loopSeconds;
    mat.uniforms.uDisintegration.value = config.disintegration;
    mat.uniforms.uMotion.value = config.motion;
    mat.uniforms.uTurbulence.value = config.turbulence;
    mat.uniforms.uNoiseFreq.value = config.noiseFrequency;
    mat.uniforms.uNoiseAmp.value = config.noiseAmplitude;
    mat.uniforms.uReassembly.value = config.reassemblyRate;
    mat.uniforms.uDepthSpread.value = config.depthSpread;
    mat.uniforms.uPointerRadius.value = pointer.radius || config.forceRadius;
    mat.uniforms.uPointerStrength.value =
      pointer.strength || config.forceStrength;
    mat.uniforms.uPointerActive.value = pointer.active ? 1 : 0;
    mat.uniforms.uForceMode.value = forceModeToFloat(pointer.mode);
    mat.uniforms.uReducedMotion.value = reducedMotion ? 1 : 0;
    mat.uniforms.uShape.value = shapeToFloat(config.particleShape);
    (mat.uniforms.uPointer.value as Vector3).set(
      pointer.position[0],
      pointer.position[1],
      pointer.position[2],
    );
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, Math.max(count, 1)]}
      frustumCulled={false}
    />
  );
}
