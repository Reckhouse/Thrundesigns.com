"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group, Mesh } from "three";

import countries from "@/data/countries.json";
import { formatPopulation, latLonToVector3 } from "@/lib/geo";

type Country = {
  name: string;
  code: string;
  lat: number;
  lon: number;
  population: number;
};

type HoveredCountry = Country & {
  position: [number, number, number];
};

const GLOBE_RADIUS = 1.55;
const NODE_RADIUS = GLOBE_RADIUS * 1.012;
const GOLD = "#d4af6a";
const CREAM = "#ebe7df";

function CountryNode({
  country,
  active,
  onHover,
  onLeave,
}: {
  country: Country;
  active: boolean;
  onHover: (country: HoveredCountry) => void;
  onLeave: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const position = useMemo(
    () => latLonToVector3(country.lat, country.lon, NODE_RADIUS),
    [country.lat, country.lon],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pulse = active
      ? 1.55 + Math.sin(clock.getElapsedTime() * 5.5) * 0.22
      : 1;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      {/* Invisible hit target */}
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover({ ...country, position });
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "auto";
          onLeave();
        }}
      >
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Visible node */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[active ? 0.022 : 0.013, 12, 12]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={active ? 0.98 : 0.58}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function GlobeScene({
  paused,
  hovered,
  onHover,
  onLeave,
}: {
  paused: boolean;
  hovered: HoveredCountry | null;
  onHover: (country: HoveredCountry) => void;
  onLeave: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const countryList = countries as Country[];

  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    groupRef.current.rotation.y += delta * 0.18;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={1.05} color={GOLD} />
      <pointLight position={[-3.5, -2, -3]} intensity={0.32} color={CREAM} />

      <group ref={groupRef} rotation={[0.35, -0.45, 0]}>
        {/* Glass fill — keeps the mountain readable behind */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 48, 32]} />
          <meshBasicMaterial
            color="#0c0d0c"
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>

        {/* Dense wireframe shell */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * 1.002, 36, 24]} />
          <meshBasicMaterial
            color={CREAM}
            wireframe
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>

        {/* Coarser gold latitude/longitude accents */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * 1.004, 16, 12]} />
          <meshBasicMaterial
            color={GOLD}
            wireframe
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>

        {countryList.map((country) => (
          <CountryNode
            key={country.code || country.name}
            country={country}
            active={hovered?.name === country.name}
            onHover={onHover}
            onLeave={onLeave}
          />
        ))}

        {hovered ? (
          <Html
            position={[
              hovered.position[0] * 1.14,
              hovered.position[1] * 1.14,
              hovered.position[2] * 1.14,
            ]}
            center
            distanceFactor={6.2}
            style={{ pointerEvents: "none" }}
            zIndexRange={[40, 0]}
          >
            <div className="min-w-[11rem] border border-line bg-bg-deep/92 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <p className="font-display text-[15px] leading-snug text-fg">
                {hovered.name}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                Est. pop. {formatPopulation(hovered.population)}
              </p>
            </div>
          </Html>
        ) : null}
      </group>
    </>
  );
}

export function WireframeGlobe() {
  const [hovered, setHovered] = useState<HoveredCountry | null>(null);

  const handleHover = useCallback((country: HoveredCountry) => {
    setHovered(country);
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(null);
  }, []);

  return (
    <div
      className="relative h-full min-h-[320px] w-full"
      aria-label="Interactive wireframe globe of countries"
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 4.35], fov: 42, near: 0.1, far: 40 }}
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        onPointerMissed={() => setHovered(null)}
      >
        <Suspense fallback={null}>
          <GlobeScene
            paused={Boolean(hovered)}
            hovered={hovered}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </Suspense>
      </Canvas>

      <p className="pointer-events-none absolute bottom-1 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted/75">
        Hover a node · {countries.length} countries
      </p>
    </div>
  );
}
