"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { KTX2Loader, type GLTFLoader } from "three-stdlib";

type StageModel = {
  url: string;
  label: string;
};

let ktx2Loader: KTX2Loader | null = null;

function getKtx2Loader(renderer: THREE.WebGLRenderer) {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader().setTranscoderPath("/basis/");
  }
  ktx2Loader.detectSupport(renderer);
  return ktx2Loader;
}

function fitToHeight(root: THREE.Object3D, target = 1.55) {
  const box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) box.expandByObject(mesh);
  });
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  root.scale.multiplyScalar(target / maxDim);
}

function RotatingModel({
  url,
  x,
  reduce,
}: {
  url: string;
  x: number;
  reduce: boolean;
}) {
  const renderer = useThree((state) => state.gl);
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(
    url,
    false,
    true,
    (loader) => {
      const gltfLoader = loader as GLTFLoader;
      gltfLoader.setKTX2Loader(getKtx2Loader(renderer));
    },
  );
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    fitToHeight(clone);
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
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
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
