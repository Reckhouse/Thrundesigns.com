"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from "three";

/**
 * Editorial cream (same family as --fg / --contrast).
 * Reads as brand ink on the mountain — high contrast without the orange
 * cast solid --gold picks up as translucent particles.
 */
const PARTICLE = "#f4f1e9";
/** Soft champagne accent on explode — cooler than button gold. */
const PARTICLE_HOT = "#e6d9b8";

const HORSE_SCALE = 1.3;
const HORSE_HALF = 1.35;
/** ~6 inches at CSS 96px/in from the silhouette edge. */
const NO_SHAKE_PX = 6 * 96;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uShake;
uniform float uExplode;
uniform float uPixelRatio;
attribute vec3 aRandom;

void main() {
  vec3 origin = position;
  vec3 dir = normalize(vec3(aRandom.x, aRandom.y, (aRandom.z - 0.5) * 0.35));
  float phase = aRandom.z * 6.2831853;

  float wobble = sin(uTime * 18.0 + phase) * 0.5
    + sin(uTime * 29.0 + phase * 1.7) * 0.3;

  vec3 shakeOffset = dir * uShake * (0.04 + abs(wobble) * 0.07);
  shakeOffset.x += sin(uTime * 26.0 + phase) * uShake * 0.022;
  shakeOffset.y += cos(uTime * 22.0 + phase * 1.3) * uShake * 0.022;

  float burst = uExplode * uExplode;
  // Wider scatter so particles travel across the full hero canvas
  vec3 explodeOffset = dir * burst * (3.4 + aRandom.z * 4.2);
  explodeOffset += vec3(
    sin(phase + uTime * 2.0) * burst * 1.1,
    cos(phase * 1.4 + uTime) * burst * 1.1,
    sin(phase * 2.1) * burst * 1.35
  );

  vec3 transformed = origin
    + shakeOffset * (1.0 - uExplode)
    + explodeOffset;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float base = mix(1.4, 1.1, uExplode);
  float attenuated = base * uPixelRatio * (100.0 / max(1.0, -mvPosition.z));
  gl_PointSize = clamp(attenuated, 0.95, 2.7);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uExplode;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  if (d > 0.45) discard;
  float alpha = smoothstep(0.45, 0.18, d);
  alpha *= mix(0.95, 0.55, uExplode);
  gl_FragColor = vec4(uColor, alpha);
}
`;

type ParticleBuffers = {
  count: number;
  positions: Float32Array;
  randoms: Float32Array;
};

async function loadParticleBuffers(): Promise<ParticleBuffers> {
  const [metaRes, posRes, randRes] = await Promise.all([
    fetch("/data/horse-particles.json"),
    fetch("/data/horse-particles-pos.bin"),
    fetch("/data/horse-particles-rand.bin"),
  ]);
  if (!metaRes.ok || !posRes.ok || !randRes.ok) {
    throw new Error("Failed to load horse particle data");
  }
  const meta = (await metaRes.json()) as { count: number };
  const positions = new Float32Array(await posRes.arrayBuffer());
  const randoms = new Float32Array(await randRes.arrayBuffer());
  return { count: meta.count, positions, randoms };
}

/** Horse rests on the right side of the full-hero viewport. */
function useHorseLayout() {
  const { viewport } = useThree();
  const offsetX = Math.min(viewport.width * 0.3, 4.2);
  const offsetY = viewport.height * 0.02;
  const scale = Math.min(
    HORSE_SCALE,
    (viewport.height * 0.48) / (HORSE_HALF * 2),
  );
  return { offsetX, offsetY, scale };
}

function HorseParticleField() {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const explodeProxy = useRef({ value: 0 });
  const explodeTween = useRef<gsap.core.Tween | null>(null);
  const hovering = useRef(false);
  const distPxRef = useRef(NO_SHAKE_PX);
  const horseAnchorRef = useRef({ x: 0.72, y: 0.5, halfW: 0.14, halfH: 0.22 });
  const particle = useMemo(() => new Color(PARTICLE), []);
  const particleHot = useMemo(() => new Color(PARTICLE_HOT), []);
  const [buffers, setBuffers] = useState<ParticleBuffers | null>(null);
  const { gl, size, viewport } = useThree();
  const { offsetX, offsetY, scale } = useHorseLayout();

  // Keep page-space horse anchor in sync with the 3D layout
  useEffect(() => {
    const worldToPxX = size.width / viewport.width;
    const worldToPxY = size.height / viewport.height;
    const halfW = (HORSE_HALF * scale * worldToPxX) / size.width;
    const halfH = (HORSE_HALF * scale * worldToPxY) / size.height;
    const cx = 0.5 + offsetX / viewport.width;
    const cy = 0.5 - offsetY / viewport.height;
    horseAnchorRef.current = {
      x: cx,
      y: cy,
      halfW: Math.max(halfW, 0.08),
      halfH: Math.max(halfH, 0.12),
    };
  }, [offsetX, offsetY, scale, size.height, size.width, viewport.height, viewport.width]);

  useEffect(() => {
    let cancelled = false;
    void loadParticleBuffers()
      .then((data) => {
        if (!cancelled) setBuffers(data);
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
      explodeTween.current?.kill();
    };
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;

    const updateDistance = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const anchor = horseAnchorRef.current;
      const cx = rect.left + rect.width * anchor.x;
      const cy = rect.top + rect.height * anchor.y;
      const halfW = rect.width * anchor.halfW;
      const halfH = rect.height * anchor.halfH;
      const dx = Math.max(Math.abs(clientX - cx) - halfW, 0);
      const dy = Math.max(Math.abs(clientY - cy) - halfH, 0);
      distPxRef.current = Math.hypot(dx, dy);
    };

    const onMove = (event: PointerEvent) => {
      updateDistance(event.clientX, event.clientY);
    };

    const onLeave = () => {
      distPxRef.current = NO_SHAKE_PX;
      if (hovering.current) {
        hovering.current = false;
        document.body.style.cursor = "auto";
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    distPxRef.current = NO_SHAKE_PX;

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, [gl]);

  const geometry = useMemo(() => {
    if (!buffers) return null;
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(buffers.positions, 3));
    geo.setAttribute("aRandom", new BufferAttribute(buffers.randoms, 3));
    return geo;
  }, [buffers]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
      materialRef.current?.dispose();
    };
  }, [geometry]);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uShake: { value: 0 },
        uExplode: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new Color(PARTICLE) },
      },
    });
    materialRef.current = mat;
    return mat;
  }, []);

  const setExplode = useCallback((to: number) => {
    explodeTween.current?.kill();
    explodeTween.current = gsap.to(explodeProxy.current, {
      value: to,
      duration: to > 0 ? 0.7 : 1.5,
      ease: to > 0 ? "power3.out" : "power2.inOut",
      onUpdate: () => {
        if (materialRef.current) {
          materialRef.current.uniforms.uExplode.value =
            explodeProxy.current.value;
        }
      },
      onComplete: () => {
        if (to === 0 && materialRef.current) {
          explodeProxy.current.value = 0;
          materialRef.current.uniforms.uExplode.value = 0;
          materialRef.current.uniforms.uShake.value = 0;
        }
      },
    });
  }, []);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);

    const color = mat.uniforms.uColor.value as Color;
    color.copy(particle).lerp(particleHot, mat.uniforms.uExplode.value * 0.4);

    const distPx = distPxRef.current;
    let targetShake = 0;

    if (hovering.current) {
      targetShake = 0.2;
    } else if (distPx < NO_SHAKE_PX) {
      const t = 1 - distPx / NO_SHAKE_PX;
      targetShake = t * t;
    }

    if (targetShake === 0 && !hovering.current) {
      mat.uniforms.uShake.value *= Math.max(0, 1 - delta * 10);
      if (mat.uniforms.uShake.value < 0.002) {
        mat.uniforms.uShake.value = 0;
      }
    } else {
      mat.uniforms.uShake.value +=
        (targetShake - mat.uniforms.uShake.value) * Math.min(1, delta * 8);
    }
  });

  if (!geometry) return null;

  const hitSize = HORSE_HALF * 2 * 0.92;

  return (
    <group position={[offsetX, offsetY, 0]} scale={scale}>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <mesh
        position={[0, 0, 0.04]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hovering.current = true;
          document.body.style.cursor = "pointer";
          setExplode(1);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          hovering.current = false;
          document.body.style.cursor = "auto";
          setExplode(0);
        }}
      >
        <planeGeometry args={[hitSize, hitSize]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HorseParticles() {
  return (
    <div
      className="absolute inset-0 h-full w-full"
      aria-label="Interactive horse head particle field"
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 6], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <HorseParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
