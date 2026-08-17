"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

type StageModel = {
  url: string;
  label: string;
};

function RotatingModel({
  url,
  x,
  reduce,
}: {
  url: string;
  x: number;
  reduce: boolean;
}) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    clone.scale.setScalar(1.6 / maxDim);
  }, [clone]);

  useFrame((_, delta) => {
    if (reduce || !group.current) return;
    group.current.rotation.y += delta * 0.32;
  });

  return (
    <group ref={group} position={[x, 0, 0]}>
      <Center>
        <primitive object={clone} />
      </Center>
    </group>
  );
}

export function ModelStageCanvas({ models }: { models: StageModel[] }) {
  const reduce = Boolean(useReducedMotion());
  const count = models.length;
  const span = 8.6;
  const positions = models.map((_, index) => {
    if (count <= 1) return 0;
    return -span / 2 + (span * index) / (count - 1);
  });

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.35, 7.2], fov: 32, near: 0.1, far: 40 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} />
      <directionalLight position={[-5, 2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        {models.map((model, index) => (
          <RotatingModel
            key={`${model.url}-${index}`}
            url={model.url}
            x={positions[index] ?? 0}
            reduce={reduce}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}
