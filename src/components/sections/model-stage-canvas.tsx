"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

type StageModel = {
  url: string;
  label: string;
};

let ktx2Loader: KTX2Loader | null = null;

function getKtx2Loader(renderer: THREE.WebGLRenderer) {
  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader().setTranscoderPath("/basis/");
  }
  try {
    ktx2Loader.detectSupport(renderer);
  } catch {
    const gl = renderer.getContext();
    ktx2Loader.workerConfig = {
      astcSupported: Boolean(gl.getExtension("WEBGL_compressed_texture_astc")),
      astcHDRSupported: false,
      etc1Supported: Boolean(gl.getExtension("WEBGL_compressed_texture_etc1")),
      etc2Supported: Boolean(gl.getExtension("WEBGL_compressed_texture_etc")),
      dxtSupported: Boolean(gl.getExtension("WEBGL_compressed_texture_s3tc")),
      bptcSupported: Boolean(gl.getExtension("EXT_texture_compression_bptc")),
      pvrtcSupported: Boolean(
        gl.getExtension("WEBGL_compressed_texture_pvrtc") ||
          gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
      ),
    };
  }
  return ktx2Loader;
}

function fitScale(root: THREE.Object3D, target = 1.55) {
  const box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) box.expandByObject(mesh);
  });
  if (box.isEmpty()) return 1;
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  return target / maxDim;
}

function prepareMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of materials) {
      if (
        !(material instanceof THREE.MeshStandardMaterial) &&
        !(material instanceof THREE.MeshPhysicalMaterial)
      ) {
        continue;
      }
      material.envMapIntensity = 1.2;
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.needsUpdate = true;
      }
      material.needsUpdate = true;
    }
  });
}

function StudioEnvironment() {
  const renderer = useThree((state) => state.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const map = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    return { map, pmrem };
  }, [renderer]);

  useLayoutEffect(() => {
    const { map, pmrem } = env;
    return () => {
      map.dispose();
      pmrem.dispose();
    };
  }, [env]);

  return <primitive object={env.map} attach="environment" />;
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
  const { scene } = useGLTF(url, false, true, (loader) => {
    loader.setKTX2Loader(
      getKtx2Loader(renderer) as unknown as Parameters<
        typeof loader.setKTX2Loader
      >[0],
    );
  });
  const scale = useMemo(() => fitScale(scene), [scene]);

  useLayoutEffect(() => {
    prepareMaterials(scene);
  }, [scene]);

  useFrame((_, delta) => {
    if (reduce || !group.current) return;
    group.current.rotation.y += delta * 0.32;
  });

  return (
    <group ref={group} position={[x, 0, 0]} scale={scale}>
      <Center>
        <group>
          <primitive object={scene} />
        </group>
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
      <StudioEnvironment />
      <ambientLight intensity={0.28} />
      <hemisphereLight color="#f3eee6" groundColor="#1b1b1b" intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.35} />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} />
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
