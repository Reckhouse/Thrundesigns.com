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

const GOLD = "#d4af6a";
const CREAM = "#ebe7df";

/** Fits inside the hero column without clipping. */
const HORSE_SCALE = 1.12;
const HORSE_HALF = 1.35;
/** ~6 inches at CSS 96px/in — measured in page pixels from the silhouette. */
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
  vec3 explodeOffset = dir * burst * (2.1 + aRandom.z * 3.0);
  explodeOffset += vec3(
    sin(phase + uTime * 2.0) * burst * 0.65,
    cos(phase * 1.4 + uTime) * burst * 0.65,
    sin(phase * 2.1) * burst * 1.0
  );

  // When both uniforms are 0, transformed == origin (perfect rest pose)
  vec3 transformed = origin
    + shakeOffset * (1.0 - uExplode)
    + explodeOffset;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float base = mix(1.35, 1.05, uExplode);
  float attenuated = base * uPixelRatio * (95.0 / max(1.0, -mvPosition.z));
  gl_PointSize = clamp(attenuated, 0.9, 2.5);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uExplode;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  if (d > 0.45) discard;
  float alpha = smoothstep(0.45, 0.2, d);
  alpha *= mix(0.92, 0.42, uExplode);
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

function HorseParticleField() {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const explodeProxy = useRef({ value: 0 });
  const explodeTween = useRef<gsap.core.Tween | null>(null);
  const hovering = useRef(false);
  /** Page-pixel distance from pointer to horse silhouette rect (outside edge). */
  const distPxRef = useRef(NO_SHAKE_PX);
  const cream = useMemo(() => new Color(CREAM), []);
  const gold = useMemo(() => new Color(GOLD), []);
  const [buffers, setBuffers] = useState<ParticleBuffers | null>(null);
  const { gl } = useThree();

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

  // Track pointer in page space so distance works even over the hero copy.
  useEffect(() => {
    const canvas = gl.domElement;

    const updateDistance = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Tighter than full canvas — approx visible stroke bounds
      const halfW = rect.width * 0.34;
      const halfH = rect.height * 0.4;
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
    canvas.addEventListener("pointerleave", onLeave);
    // Start at rest (no shake) until we see a real pointer position
    distPxRef.current = NO_SHAKE_PX;

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      canvas.removeEventListener("pointerleave", onLeave);
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
        uColor: { value: new Color(CREAM) },
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
        // Snap to exact rest so the horse is mathematically perfect
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
    color.copy(cream).lerp(gold, mat.uniforms.uExplode.value * 0.55);

    const distPx = distPxRef.current;
    let targetShake = 0;

    if (hovering.current) {
      // Contact: explosion handles chaos; keep residual shake low
      targetShake = 0.2;
    } else if (distPx < NO_SHAKE_PX) {
      // 0 at 6" away → 1 at silhouette edge
      const t = 1 - distPx / NO_SHAKE_PX;
      targetShake = t * t;
    } else {
      targetShake = 0;
    }

    // When far away, snap quickly to a perfect still pose
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
    <group scale={HORSE_SCALE}>
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
      className="relative h-full min-h-[320px] w-full overflow-hidden"
      aria-label="Interactive horse head particle field"
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 4.5], fov: 36, near: 0.1, far: 40 }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <HorseParticleField />
        </Suspense>
      </Canvas>
      <p
        className="pointer-events-none absolute bottom-1 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ color: "rgba(199, 194, 184, 0.7)" }}
      >
        Approach to unsettle · touch to disperse
      </p>
    </div>
  );
}
