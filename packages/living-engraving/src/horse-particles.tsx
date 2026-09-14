"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  ShaderMaterial,
  Vector2,
} from "three";

/** Living Engraving palette — cream ink base, bronze mid, gold accent. */
const COLOR_STONE = "#efe9dc";
const COLOR_BRONZE = "#b0894a";
const COLOR_GOLD = "#d4af6a";

const HORSE_SCALE = 1.58;
const HORSE_HALF = 1.35;
/** Pointer influence only near the silhouette (page px). */
const INTERACT_PX = 140;
const DEAD_ZONE_PX = 28;
/** Micro tilt limits (radians) — idle pointer tracking. */
const TILT_YAW = (9 * Math.PI) / 180;
const TILT_PITCH = (4.5 * Math.PI) / 180;
/** Click-and-hold orbit limits. */
const ORBIT_YAW = (52 * Math.PI) / 180;
const ORBIT_PITCH = (30 * Math.PI) / 180;
const ORBIT_DRAG = 0.0055;

const TIER_HIGH = 12000;
const TIER_STANDARD = 8000;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAppear;
uniform float uScroll;
uniform float uTension;
uniform float uCta;
uniform float uIdle;
uniform float uPixelRatio;
uniform vec2 uPointerLocal;
uniform float uStatic;
uniform float uOrbit; // 0–1 while click-holding — deepens relief
uniform float uPosterCapture; // >0 boosts point size for poster snapshots

attribute vec3 aRandom;
attribute vec3 aMeta; // edge, tone, rear

varying float vEdge;
varying float vTone;
varying float vRear;
varying float vTwinkle;

void main() {
  vEdge = aMeta.x;
  vTone = aMeta.y;
  vRear = aMeta.z;

  vec3 origin = position;

  // Cameo relief — project flat bake onto a shallow dome so orbit reads in 3D
  float radial = length(origin.xy) / 1.35;
  float dome = sqrt(max(0.0, 1.0 - clamp(radial * radial, 0.0, 1.0)));
  float reliefAmt = mix(0.22, 0.48, uOrbit);
  float cameoZ = dome * reliefAmt * mix(0.65, 1.15, vEdge);
  // Interior sits slightly back; edges / features push forward
  cameoZ += mix(-0.06, 0.05, vEdge) * mix(0.7, 1.2, uOrbit);
  cameoZ *= mix(0.85, 1.0, 1.0 - vRear * 0.35);
  origin.z += cameoZ;

  float phase = aRandom.z * 6.2831853;
  vec3 dir = normalize(vec3(aRandom.x, aRandom.y, (aRandom.z - 0.5) * 0.25));

  // Entrance: particles resolve a few pixels into place from haze
  float appear = clamp(uAppear, 0.0, 1.0);
  float appearEase = appear * appear * (3.0 - 2.0 * appear);
  vec3 fromHaze = dir * (1.0 - appearEase) * 0.045;
  fromHaze.z -= (1.0 - appearEase) * 0.08;

  // Idle breath + slow traveling wave (disabled when static)
  float wave = sin(uTime * 0.55 + origin.y * 2.4 + origin.x * 1.1 + phase);
  float breath = uIdle * (1.0 - uStatic) * wave * 0.012;
  vec3 idleOffset = vec3(0.0, breath, breath * 0.35);

  // Sparse twinkle scale factor passed to point size
  float twinkleGate = step(0.72, aRandom.z);
  float twinkle = 1.0 + twinkleGate * uIdle * (1.0 - uStatic)
    * sin(uTime * 1.1 + phase * 2.0) * 0.04;
  vTwinkle = twinkle;

  // Minimal surface tension near pointer (local horse space)
  vec2 toPtr = origin.xy - uPointerLocal;
  float dist = length(toPtr);
  float tensionRadius = 0.65;
  float tension = uTension * (1.0 - uStatic)
    * smoothstep(tensionRadius, 0.0, dist);
  vec3 tensionOffset = vec3(0.0);
  float tLen = length(toPtr);
  if (tLen > 0.0001) {
    tensionOffset = vec3(toPtr.x, toPtr.y, 0.0) / tLen * tension * 0.045;
  }

  // Scroll recession — drift deeper / right
  vec3 scrollOffset = vec3(uScroll * 0.08, -uScroll * 0.02, -uScroll * 0.14);

  vec3 transformed = origin
    + fromHaze
    + idleOffset
    + tensionOffset
    + scrollOffset;

  // CTA: subtle forward rim lift on front/edge points
  transformed.z += uCta * vEdge * 0.03 * (1.0 - vRear);

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float sizeBase = mix(0.95, 1.35, vEdge);
  sizeBase *= mix(0.95, 1.12, vTone);
  sizeBase *= twinkle;
  sizeBase *= mix(0.5, 1.0, appearEase);
  float attenuated = sizeBase * uPixelRatio * (96.0 / max(1.0, -mvPosition.z));
  float minSize = mix(0.9, 2.2, uPosterCapture);
  float maxSize = mix(2.4, 7.5, uPosterCapture);
  gl_PointSize = clamp(attenuated * mix(1.0, 2.4, uPosterCapture), minSize, maxSize);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uStone;
uniform vec3 uBronze;
uniform vec3 uGold;
uniform float uAppear;
uniform float uScroll;
uniform float uCta;

varying float vEdge;
varying float vTone;
varying float vRear;
varying float vTwinkle;

void main() {
  // Squared engraving stroke — slightly softer core for readable density
  vec2 uv = gl_PointCoord - vec2(0.5);
  vec2 a = abs(uv);
  float d = max(a.x, a.y);
  if (d > 0.5) discard;
  float alpha = 1.0 - smoothstep(0.22, 0.5, d);
  alpha *= mix(0.82, 0.98, vEdge);

  vec3 color = uStone;
  if (vTone > 0.75) {
    color = uGold;
  } else if (vTone > 0.25) {
    color = mix(uStone, uBronze, 0.7);
  }

  // Keep rear/interior quieter, but still legible on the mountain
  alpha *= mix(1.0, 0.62, vRear);
  alpha *= mix(0.78, 1.0, clamp(vEdge * 1.15, 0.0, 1.0));

  float appear = clamp(uAppear, 0.0, 1.0);
  float depthGate = mix(0.75, 1.0, 1.0 - vRear);
  float toneGate = mix(1.0, smoothstep(0.35, 0.9, appear), vTone * 0.65);
  alpha *= smoothstep(0.0, 0.7, appear * depthGate) * toneGate;

  alpha *= 1.0 - uScroll * mix(0.4, 0.85, vRear);

  color = mix(color, uGold, uCta * vEdge * 0.55 * (1.0 - vRear));
  alpha *= mix(1.0, 1.1, uCta * vEdge);

  alpha *= mix(0.97, 1.0, vTwinkle);
  alpha = clamp(alpha, 0.0, 0.94);

  if (alpha < 0.02) discard;
  gl_FragColor = vec4(color, alpha);
}
`;

type ParticleBuffers = {
  count: number;
  positions: Float32Array;
  randoms: Float32Array;
  metas: Float32Array;
};

export type LivingEngravingLayout = "hero" | "centered";

export type HorseParticlesProps = {
  staticMode?: boolean;
  rotation?: number;
  /** Hero keeps the right-offset cameo; centered is for lab / case-study embeds. */
  layout?: LivingEngravingLayout;
  /** Base URL for particle buffers (no trailing slash). */
  assetBaseUrl?: string;
  /** Keep the last WebGL frame readable for screenshots / toDataURL. */
  preserveDrawingBuffer?: boolean;
  /** Larger points + opaque clear for poster snapshots. */
  posterCapture?: boolean;
  ctaRef?: RefObject<HTMLElement | null>;
  sectionRef?: RefObject<HTMLElement | null>;
};

const DEFAULT_ASSET_BASE = "/experiences/living-engraving";

function preferFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

function pickTierCount(max: number) {
  if (typeof window === "undefined") return Math.min(TIER_STANDARD, max);
  const cores = navigator.hardwareConcurrency || 4;
  const mem =
    "deviceMemory" in navigator
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
      : 4;
  const fine = preferFinePointer();
  if (fine && cores >= 8 && mem >= 8) return Math.min(TIER_HIGH, max);
  return Math.min(TIER_STANDARD, max);
}

async function loadParticleBuffers(
  assetBaseUrl: string,
): Promise<ParticleBuffers> {
  const base = assetBaseUrl.replace(/\/$/, "");
  const [metaRes, posRes, randRes, attrRes] = await Promise.all([
    fetch(`${base}/horse-particles.json`),
    fetch(`${base}/horse-particles-pos.bin`),
    fetch(`${base}/horse-particles-rand.bin`),
    fetch(`${base}/horse-particles-meta.bin`),
  ]);
  if (!metaRes.ok || !posRes.ok || !randRes.ok || !attrRes.ok) {
    throw new Error("Failed to load horse particle data");
  }
  const meta = (await metaRes.json()) as { count: number };
  return {
    count: meta.count,
    positions: new Float32Array(await posRes.arrayBuffer()),
    randoms: new Float32Array(await randRes.arrayBuffer()),
    metas: new Float32Array(await attrRes.arrayBuffer()),
  };
}

function useHorseLayout(layout: LivingEngravingLayout) {
  const { viewport } = useThree();
  // Hero: mild right bias so the cameo balances the left copy column
  // without crowding the far edge.
  const offsetX = layout === "hero" ? Math.min(viewport.width * 0.2, 2.8) : 0;
  const offsetY = layout === "hero" ? viewport.height * 0.04 : 0;
  const scaleFactor = layout === "hero" ? 0.62 : 0.72;
  const scale = Math.min(
    HORSE_SCALE,
    (viewport.height * scaleFactor) / (HORSE_HALF * 2),
  );
  return { offsetX, offsetY, scale };
}

function HorseParticleField({
  staticMode = false,
  rotation = 0,
  layout = "centered",
  assetBaseUrl = DEFAULT_ASSET_BASE,
  posterCapture = false,
  ctaRef,
  sectionRef,
  active,
}: HorseParticlesProps & { active: boolean }) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const appearProxy = useRef({ value: staticMode ? 1 : 0 });
  const pointerLocal = useRef(new Vector2(10, 10));
  const pointerNdc = useRef({ x: 0, y: 0, inside: false });
  const ctaHover = useRef(0);
  const scrollFade = useRef(0);
  const orbit = useRef({
    holding: false,
    yaw: 0,
    pitch: 0,
    lastX: 0,
    lastY: 0,
    amount: 0,
  });
  const horseAnchorRef = useRef({
    x: 0.78,
    y: 0.48,
    halfW: 0.12,
    halfH: 0.2,
  });
  const [buffers, setBuffers] = useState<ParticleBuffers | null>(null);
  const [drawCount, setDrawCount] = useState(TIER_STANDARD);
  const { gl, size, viewport, invalidate } = useThree();
  useLayoutEffect(() => {
    if (groupRef.current) groupRef.current.rotation.y = rotation;
    invalidate();
  }, [rotation, invalidate]);
  const { offsetX, offsetY, scale } = useHorseLayout(layout);
  const finePointer = useRef(preferFinePointer());
  const tiltCurrent = useRef({ yaw: 0, pitch: 0 });

  const isOverHorse = (clientX: number, clientY: number, pad = INTERACT_PX) => {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const anchor = horseAnchorRef.current;
    const cx = rect.left + rect.width * anchor.x;
    const cy = rect.top + rect.height * anchor.y;
    const halfW = rect.width * anchor.halfW;
    const halfH = rect.height * anchor.halfH;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(
      Math.max(Math.abs(dx) - halfW, 0),
      Math.max(Math.abs(dy) - halfH, 0),
    );
    return {
      over: dist <= pad && appearProxy.current.value >= 0.85,
      dx,
      dy,
      halfW,
      halfH,
      rect,
    };
  };

  useEffect(() => {
    let cancelled = false;
    void loadParticleBuffers(assetBaseUrl)
      .then((data) => {
        if (cancelled) return;
        setBuffers(data);
        setDrawCount(
          staticMode
            ? Math.min(TIER_STANDARD, data.count)
            : pickTierCount(data.count),
        );
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [assetBaseUrl, staticMode]);

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
  }, [
    offsetX,
    offsetY,
    scale,
    size.height,
    size.width,
    viewport.height,
    viewport.width,
  ]);

  useEffect(() => {
    if (staticMode) {
      appearProxy.current.value = 1;
      if (materialRef.current) {
        materialRef.current.uniforms.uAppear.value = 1;
      }
      return;
    }
    const tween = gsap.to(appearProxy.current, {
      value: 1,
      duration: 1.55,
      delay: 0.38,
      ease: "power3.out",
      onUpdate: () => {
        if (materialRef.current) {
          materialRef.current.uniforms.uAppear.value =
            appearProxy.current.value;
        }
      },
    });
    return () => {
      tween.kill();
    };
  }, [staticMode]);

  useEffect(() => {
    if (staticMode) return;

    const setCursor = (value: string) => {
      document.body.style.cursor = value;
    };

    const onMove = (event: PointerEvent) => {
      if (!finePointer.current) return;

      // Click-hold orbit — drag rotates into 3D
      if (orbit.current.holding) {
        const dX = event.clientX - orbit.current.lastX;
        const dY = event.clientY - orbit.current.lastY;
        orbit.current.lastX = event.clientX;
        orbit.current.lastY = event.clientY;
        orbit.current.yaw = Math.max(
          -ORBIT_YAW,
          Math.min(ORBIT_YAW, orbit.current.yaw + dX * ORBIT_DRAG),
        );
        orbit.current.pitch = Math.max(
          -ORBIT_PITCH,
          Math.min(ORBIT_PITCH, orbit.current.pitch + dY * ORBIT_DRAG),
        );
        setCursor("grabbing");
        return;
      }

      const hit = isOverHorse(event.clientX, event.clientY);
      if (!hit.over) {
        pointerNdc.current.inside = false;
        pointerLocal.current.set(10, 10);
        if (document.body.style.cursor === "grab") setCursor("auto");
        return;
      }

      pointerNdc.current.inside = true;
      const localX = (hit.dx / Math.max(hit.halfW, 1)) * HORSE_HALF * 0.85;
      const localY = (-hit.dy / Math.max(hit.halfH, 1)) * HORSE_HALF * 0.85;
      pointerLocal.current.set(localX, localY);

      const nx = hit.dx / (hit.rect.width * 0.35);
      const ny = -hit.dy / (hit.rect.height * 0.35);
      pointerNdc.current.x = Math.max(-1, Math.min(1, nx));
      pointerNdc.current.y = Math.max(-1, Math.min(1, ny));
      setCursor("grab");
    };

    const onDown = (event: PointerEvent) => {
      if (!finePointer.current || event.button !== 0) return;
      const hit = isOverHorse(event.clientX, event.clientY, 24);
      if (!hit.over) return;
      event.preventDefault();
      orbit.current.holding = true;
      orbit.current.lastX = event.clientX;
      orbit.current.lastY = event.clientY;
      document.body.style.userSelect = "none";
      setCursor("grabbing");
    };

    const endOrbit = () => {
      if (!orbit.current.holding) return;
      orbit.current.holding = false;
      document.body.style.userSelect = "";
      setCursor(pointerNdc.current.inside ? "grab" : "auto");
    };

    const onLeave = () => {
      if (orbit.current.holding) return;
      pointerNdc.current.inside = false;
      pointerLocal.current.set(10, 10);
      setCursor("auto");
    };

    const media = window.matchMedia("(pointer: fine)");
    const onPointerType = () => {
      finePointer.current = media.matches;
    };

    const onBlur = () => {
      endOrbit();
      onLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointerup", endOrbit);
    window.addEventListener("pointercancel", endOrbit);
    window.addEventListener("blur", onBlur);
    media.addEventListener("change", onPointerType);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", endOrbit);
      window.removeEventListener("pointercancel", endOrbit);
      window.removeEventListener("blur", onBlur);
      media.removeEventListener("change", onPointerType);
      setCursor("auto");
    };
    // isOverHorse closes over gl + appearProxy refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, staticMode]);

  useEffect(() => {
    if (staticMode) return;
    const el = ctaRef?.current;
    if (!el) return;
    const enter = () => {
      ctaHover.current = 1;
    };
    const leave = () => {
      ctaHover.current = 0;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
    };
  }, [ctaRef, staticMode]);

  useEffect(() => {
    if (staticMode) return;
    const section = sectionRef?.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(rect.height * 0.65, viewH * 0.5)),
      );
      scrollFade.current = progress;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionRef, staticMode]);

  const geometry = useMemo(() => {
    if (!buffers) return null;
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(buffers.positions, 3));
    geo.setAttribute("aRandom", new BufferAttribute(buffers.randoms, 3));
    geo.setAttribute("aMeta", new BufferAttribute(buffers.metas, 3));
    geo.setDrawRange(0, drawCount);
    return geo;
  }, [buffers, drawCount]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  const material = useMemo(() => {
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uAppear: { value: staticMode ? 1 : 0 },
        uScroll: { value: 0 },
        uTension: { value: 0 },
        uCta: { value: 0 },
        uIdle: { value: staticMode ? 0 : 1 },
        uStatic: { value: staticMode ? 1 : 0 },
        uPixelRatio: { value: 1 },
        uPointerLocal: { value: new Vector2(10, 10) },
        uOrbit: { value: 0 },
        uPosterCapture: { value: posterCapture ? 1 : 0 },
        uStone: { value: new Color(COLOR_STONE) },
        uBronze: { value: new Color(COLOR_BRONZE) },
        uGold: { value: new Color(COLOR_GOLD) },
      },
    });
    return mat;
  }, [posterCapture, staticMode]);
  useLayoutEffect(() => {
    materialRef.current = material;
    invalidate();
    return () => { materialRef.current = null; material.dispose(); };
  }, [material, invalidate]);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    if (!active && !staticMode) return;

    if (!staticMode) {
      mat.uniforms.uTime.value += delta;
    }
    mat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 1.5);
    mat.uniforms.uAppear.value = appearProxy.current.value;
    mat.uniforms.uScroll.value +=
      (scrollFade.current - mat.uniforms.uScroll.value) *
      Math.min(1, delta * 2.2);
    mat.uniforms.uCta.value +=
      (ctaHover.current - mat.uniforms.uCta.value) * Math.min(1, delta * 4);

    const holding = orbit.current.holding;
    const targetOrbit = holding ? 1 : 0;
    orbit.current.amount +=
      (targetOrbit - orbit.current.amount) *
      Math.min(1, delta * (holding ? 5 : 2.2));
    mat.uniforms.uOrbit.value = orbit.current.amount;

    // Ease orbit angles back to rest after release
    if (!holding) {
      const settle = 1 - Math.exp(-delta * 2.4);
      orbit.current.yaw *= 1 - settle;
      orbit.current.pitch *= 1 - settle;
      if (Math.abs(orbit.current.yaw) < 0.0008) orbit.current.yaw = 0;
      if (Math.abs(orbit.current.pitch) < 0.0008) orbit.current.pitch = 0;
    }

    const targetIdle =
      staticMode || holding || pointerNdc.current.inside
        ? 0.2
        : appearProxy.current.value > 0.9
          ? 1
          : 0;
    mat.uniforms.uIdle.value +=
      (targetIdle - mat.uniforms.uIdle.value) * Math.min(1, delta * 1.2);

    const ptr = pointerLocal.current;
    const distFromCenter = Math.hypot(ptr.x / HORSE_HALF, ptr.y / HORSE_HALF);
    const inDeadZone =
      !pointerNdc.current.inside ||
      Math.hypot(pointerNdc.current.x, pointerNdc.current.y) *
        Math.min(size.width, size.height) *
        0.12 <
        DEAD_ZONE_PX;

    let targetTension = 0;
    if (!staticMode && !holding && pointerNdc.current.inside && !inDeadZone) {
      targetTension = Math.min(1, Math.max(0, 1 - distFromCenter * 0.45));
    }
    mat.uniforms.uTension.value +=
      (targetTension - mat.uniforms.uTension.value) * Math.min(1, delta * 3.5);
    (mat.uniforms.uPointerLocal.value as Vector2).copy(ptr);

    let targetYaw = orbit.current.yaw;
    let targetPitch = orbit.current.pitch;
    if (!staticMode && !holding) {
      if (pointerNdc.current.inside && !inDeadZone) {
        targetYaw += pointerNdc.current.x * TILT_YAW;
        targetPitch += pointerNdc.current.y * TILT_PITCH;
      }
      if (ctaHover.current > 0.5) {
        targetYaw += (-1.5 * Math.PI) / 180;
        targetPitch += (0.4 * Math.PI) / 180;
      }
    }

    const ease = 1 - Math.exp(-delta * (holding ? 10 : 2.1));
    tiltCurrent.current.yaw += (targetYaw - tiltCurrent.current.yaw) * ease;
    tiltCurrent.current.pitch +=
      (targetPitch - tiltCurrent.current.pitch) * ease;

    const idleYaw =
      !staticMode && !holding && appearProxy.current.value > 0.95
        ? Math.sin(mat.uniforms.uTime.value * 0.28) * ((1 * Math.PI) / 180)
        : 0;

    if (groupRef.current) {
      groupRef.current.rotation.y =
        rotation + tiltCurrent.current.yaw + idleYaw;
      groupRef.current.rotation.x = tiltCurrent.current.pitch;
    }
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef} position={[offsetX, offsetY, 0]} scale={scale}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

export function HorseParticles({
  staticMode = false,
  rotation = 0,
  layout = "centered",
  assetBaseUrl = DEFAULT_ASSET_BASE,
  preserveDrawingBuffer = false,
  posterCapture = false,
  ctaRef,
  sectionRef,
}: HorseParticlesProps) {
  const [tabActive, setTabActive] = useState(true);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const section = sectionRef?.current;
    let io: IntersectionObserver | null = null;
    if (section) {
      io = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { threshold: 0.05 },
      );
      io.observe(section);
    }

    const onVisibility = () => {
      setTabActive(document.visibilityState === "visible");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sectionRef]);

  const running = !staticMode && tabActive && inView;

  return (
    <div
      className="horse-engraving absolute inset-0 h-full w-full"
      aria-label="Horse head engraving. Click and drag to rotate."
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer,
        }}
        camera={{ position: [0, 0, 6], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        frameloop={running ? "always" : "demand"}
        onCreated={({ gl }) => {
          gl.setClearColor(
            posterCapture ? 0x0c0d0c : 0x000000,
            posterCapture ? 1 : 0,
          );
        }}
      >
        <Suspense fallback={null}>
          <HorseParticleField
            staticMode={staticMode}
            rotation={rotation}
            layout={layout}
            assetBaseUrl={assetBaseUrl}
            posterCapture={posterCapture}
            ctaRef={ctaRef}
            sectionRef={sectionRef}
            active={running}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
