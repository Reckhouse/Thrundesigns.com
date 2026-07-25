"use client";

import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Rings() {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[1.6, 0.008, 16, 120]} />
        <meshBasicMaterial color="#c59a53" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[0.8, -0.3, 0.2]}>
        <torusGeometry args={[2.1, 0.006, 16, 140]} />
        <meshBasicMaterial color="#c59a53" transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-0.2, 0.6, 0.1]}>
        <torusGeometry args={[2.6, 0.004, 16, 160]} />
        <meshBasicMaterial color="#7a5d2f" transparent opacity={0.22} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Rings />
    </Canvas>
  );
}
