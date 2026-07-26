"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  BufferGeometry,
  Float32BufferAttribute,
  type Group,
  type Mesh,
} from "three";

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
const NODE_RADIUS = GLOBE_RADIUS * 1.008;
/** Earth axial tilt */
const AXIAL_TILT = (23.44 * Math.PI) / 180;
const GOLD = "#d4af6a";
const CREAM = "#ebe7df";
const BG_DEEP = "#0c0d0c";
const LINE = "rgba(255,255,255,0.18)";

function LandOutlines({ radius }: { radius: number }) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    const geo = new BufferGeometry();

    async function load() {
      const res = await fetch("/data/land-outlines.bin");
      if (!res.ok) throw new Error("Failed to load land outlines");
      const buffer = await res.arrayBuffer();
      const unit = new Float32Array(buffer);
      const scaled = new Float32Array(unit.length);
      for (let i = 0; i < unit.length; i++) scaled[i] = unit[i] * radius;
      geo.setAttribute("position", new Float32BufferAttribute(scaled, 3));
      if (!cancelled) setGeometry(geo);
    }

    void load().catch((error) => {
      console.error(error);
      geo.dispose();
    });

    return () => {
      cancelled = true;
      geo.dispose();
    };
  }, [radius]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color={GOLD}
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </lineSegments>
  );
}

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
      ? 1.45 + Math.sin(clock.getElapsedTime() * 5.2) * 0.18
      : 1;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
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
        <sphereGeometry args={[0.042, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[active ? 0.016 : 0.01, 12, 12]} />
        <meshBasicMaterial
          color={active ? GOLD : CREAM}
          transparent
          opacity={active ? 0.95 : 0.5}
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
  const spinRef = useRef<Group>(null);
  const countryList = countries as Country[];

  useFrame((_, delta) => {
    if (!spinRef.current || paused) return;
    spinRef.current.rotation.y += delta * 0.14;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={0.9} color={GOLD} />
      <pointLight position={[-3.5, -2, -3]} intensity={0.28} color={CREAM} />

      {/* Axial tilt, then daily spin */}
      <group rotation={[0, 0, AXIAL_TILT]}>
        <group ref={spinRef} rotation={[0, -0.55, 0]}>
          {/* Subtle ocean sphere — no latitude/longitude grid */}
          <mesh>
            <sphereGeometry args={[GLOBE_RADIUS, 64, 48]} />
            <meshBasicMaterial
              color={BG_DEEP}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>

          {/* Natural Earth land coastlines (50m) */}
          <LandOutlines radius={GLOBE_RADIUS * 1.002} />

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
                hovered.position[0] * 1.1,
                hovered.position[1] * 1.1,
                hovered.position[2] * 1.1,
              ]}
              center
              distanceFactor={18}
              style={{ pointerEvents: "none" }}
              zIndexRange={[40, 0]}
            >
              <div
                className="w-max max-w-[7.5rem] border px-1.5 py-1"
                style={{
                  borderColor: LINE,
                  backgroundColor: "rgba(12, 13, 12, 0.92)",
                }}
              >
                <p
                  className="truncate font-sans text-[9px] leading-tight"
                  style={{ color: "#f4f1e9" }}
                >
                  {hovered.name}
                </p>
                <p
                  className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.12em]"
                  style={{ color: GOLD }}
                >
                  Est. {formatPopulation(hovered.population)}
                </p>
              </div>
            </Html>
          ) : null}
        </group>
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
      aria-label="Interactive Earth globe with country markers"
    >
      <Canvas
        className="h-full w-full touch-none"
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.15, 4.2], fov: 40, near: 0.1, far: 40 }}
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

      <p
        className="pointer-events-none absolute bottom-1 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.14em]"
        style={{ color: "rgba(199, 194, 184, 0.7)" }}
      >
        Hover a node · {countries.length} countries
      </p>
    </div>
  );
}
