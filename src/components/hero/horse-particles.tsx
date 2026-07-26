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

  vec3 shakeOffset = dir * uShake * (0.035 + abs(wobble) * 0.06);
  shakeOffset.x += sin(uTime * 26.0 + phase) * uShake * 0.02;
  shakeOffset.y += cos(uTime * 22.0 + phase * 1.3) * uShake * 0.02;

  float burst = uExplode * uExplode;
  vec3 explodeOffset = dir * burst * (1.8 + aRandom.z * 2.8);
  explodeOffset += vec3(
    sin(phase + uTime * 2.0) * burst * 0.55,
    cos(phase * 1.4 + uTime) * burst * 0.55,
    sin(phase * 2.1) * burst * 0.85
  );

  vec3 transformed = origin
    + shakeOffset * (1.0 - uExplode * 0.4)
    + explodeOffset;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Keep points tiny so strokes read as a horse, not a filled blob
  float base = mix(1.35, 1.0, uExplode);
  float attenuated = base * uPixelRatio * (90.0 / max(1.0, -mvPosition.z));
  gl_PointSize = clamp(attenuated, 0.85, 2.4);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uExplode;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float d = length(uv);
  // Harder disc — less soft glow fill
  if (d > 0.45) discard;
  float alpha = smoothstep(0.45, 0.2, d);
  alpha *= mix(0.9, 0.45, uExplode);
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
  const pointerActive = useRef(false);
  const cream = useMemo(() => new Color(CREAM), []);
  const gold = useMemo(() => new Color(GOLD), []);
  const [buffers, setBuffers] = useState<ParticleBuffers | null>(null);
  const { viewport, gl } = useThree();

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
    const el = gl.domElement;
    const activate = () => {
      pointerActive.current = true;
    };
    el.addEventListener("pointermove", activate, { passive: true });
    el.addEventListener("pointerenter", activate, { passive: true });
    return () => {
      el.removeEventListener("pointermove", activate);
      el.removeEventListener("pointerenter", activate);
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
      duration: to > 0 ? 0.85 : 1.25,
      ease: to > 0 ? "power3.out" : "power3.inOut",
      onUpdate: () => {
        if (materialRef.current) {
          materialRef.current.uniforms.uExplode.value =
            explodeProxy.current.value;
        }
      },
    });
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.75);

    // R3F pointer defaults to (0,0) = canvas center. Ignore until real movement.
    if (!pointerActive.current) {
      if (Math.hypot(state.pointer.x, state.pointer.y) > 0.002) {
        pointerActive.current = true;
      } else {
        mat.uniforms.uShake.value +=
          (0 - mat.uniforms.uShake.value) * Math.min(1, delta * 6);
        const color = mat.uniforms.uColor.value as Color;
        color.copy(cream).lerp(gold, mat.uniforms.uExplode.value * 0.55);
        return;
      }
    }

    const mx = (state.pointer.x * viewport.width) / 2;
    const my = (state.pointer.y * viewport.height) / 2;

    const hx = 1.35;
    const hy = 1.35;
    const dx = Math.max(Math.abs(mx) - hx, 0);
    const dy = Math.max(Math.abs(my) - hy, 0);
    const dist = Math.hypot(dx, dy);
    const proximity = 1 - Math.min(Math.max(dist / 2.1, 0), 1);
    const targetShake = hovering.current
      ? Math.max(proximity, 0.55)
      : Math.pow(proximity, 1.55);

    mat.uniforms.uShake.value +=
      (targetShake - mat.uniforms.uShake.value) * Math.min(1, delta * 8);

    const color = mat.uniforms.uColor.value as Color;
    color.copy(cream).lerp(gold, mat.uniforms.uExplode.value * 0.55);
  });

  if (!geometry) return null;

  return (
    <group>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <mesh
        position={[0, 0, 0.04]}
        onPointerMove={() => {
          pointerActive.current = true;
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          pointerActive.current = true;
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
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HorseParticles() {
  return (
    <div
      className="relative h-full min-h-[320px] w-full"
      aria-label="Interactive horse head particle field"
      onPointerMove={() => {
        /* marks canvas engagement via bubbling into R3F pointer */
      }}
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 4.4], fov: 36, near: 0.1, far: 40 }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onPointerMove={() => {
          /* ensures pointer updates while over canvas */
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
