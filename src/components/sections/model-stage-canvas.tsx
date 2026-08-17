"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader, type GLTFParser } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

type StageModel = {
  url: string;
  label: string;
};

const MAG_FILTERS: Record<number, THREE.MagnificationTextureFilter> = {
  9728: THREE.NearestFilter,
  9729: THREE.LinearFilter,
};

const MIN_FILTERS: Record<number, THREE.MinificationTextureFilter> = {
  9728: THREE.NearestFilter,
  9729: THREE.LinearFilter,
  9984: THREE.NearestMipmapNearestFilter,
  9985: THREE.LinearMipmapNearestFilter,
  9986: THREE.NearestMipmapLinearFilter,
  9987: THREE.LinearMipmapLinearFilter,
};

const WRAP_MODES: Record<number, THREE.Wrapping> = {
  33071: THREE.ClampToEdgeWrapping,
  33648: THREE.MirroredRepeatWrapping,
  10497: THREE.RepeatWrapping,
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

function parseKtx2(loader: KTX2Loader, buffer: ArrayBuffer) {
  return new Promise<THREE.CompressedTexture>((resolve, reject) => {
    loader.parse(buffer, resolve, reject);
  });
}

function copyBuffer(view: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  const bytes =
    view instanceof ArrayBuffer
      ? new Uint8Array(view)
      : new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/**
 * Decode embedded KTX2 images from bufferViews instead of blob: URLs.
 * FileLoader fetch(blob:) is blocked by connect-src, and transferring the
 * GLB ArrayBuffer into the transcoder worker would detach the mesh data.
 */
type ParserWithTextureCache = GLTFParser & {
  textureCache: Record<string, Promise<THREE.Texture>>;
};

function registerBasisuBufferPlugin(loader: GLTFLoader) {
  const flagged = loader as GLTFLoader & { __basisuBufferPlugin?: boolean };
  if (flagged.__basisuBufferPlugin) return;
  flagged.__basisuBufferPlugin = true;

  loader.register((parser) => ({
    name: "KHR_texture_basisu",
    loadTexture(textureIndex: number) {
      const parserWithCache = parser as ParserWithTextureCache;
      const json = parser.json as {
        textures: Array<{
          sampler?: number;
          extensions?: { KHR_texture_basisu?: { source: number } };
        }>;
        images: Array<{ bufferView?: number; name?: string }>;
        samplers?: Array<{
          magFilter?: number;
          minFilter?: number;
          wrapS?: number;
          wrapT?: number;
        }>;
      };
      const textureDef = json.textures[textureIndex];
      const sourceIndex = textureDef?.extensions?.KHR_texture_basisu?.source;
      const ktx2 = parser.options.ktx2Loader as KTX2Loader | undefined;
      if (sourceIndex === undefined || !ktx2) return null;

      const sourceDef = json.images[sourceIndex];
      if (sourceDef?.bufferView === undefined) return null;

      const cacheKey = `${sourceDef.bufferView}:${textureDef.sampler ?? ""}`;
      const cached = parserWithCache.textureCache[cacheKey];
      if (cached) return cached;

      const promise = parser
        .getDependency("bufferView", sourceDef.bufferView)
        .then((bufferView) =>
          parseKtx2(ktx2, copyBuffer(bufferView as ArrayBuffer | ArrayBufferView)),
        )
        .then((texture) => {
          texture.flipY = false;
          texture.name = sourceDef.name || "";
          texture.generateMipmaps = false;
          const sampler = json.samplers?.[textureDef.sampler ?? -1] ?? {};
          texture.magFilter =
            MAG_FILTERS[sampler.magFilter ?? 9729] ?? THREE.LinearFilter;
          texture.minFilter =
            MIN_FILTERS[sampler.minFilter ?? 9987] ??
            THREE.LinearMipmapLinearFilter;
          texture.wrapS =
            WRAP_MODES[sampler.wrapS ?? 10497] ?? THREE.RepeatWrapping;
          texture.wrapT =
            WRAP_MODES[sampler.wrapT ?? 10497] ?? THREE.RepeatWrapping;
          parser.associations.set(texture, { textures: textureIndex });
          return texture;
        });

      parserWithCache.textureCache[cacheKey] = promise;
      return promise;
    },
  }));
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

function normalizeTexture(texture: THREE.Texture, colorSpace?: THREE.ColorSpace) {
  if (texture.repeat.x > 2 || texture.repeat.y > 2) {
    texture.repeat.set(1, 1);
    texture.offset.set(0, 0);
  }
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (colorSpace) texture.colorSpace = colorSpace;
  texture.needsUpdate = true;
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
      material.envMapIntensity = 0.85;
      if (material.map) normalizeTexture(material.map, THREE.SRGBColorSpace);
      if (material.normalMap) normalizeTexture(material.normalMap);
      if (material.roughnessMap) normalizeTexture(material.roughnessMap);
      if (material.metalnessMap) normalizeTexture(material.metalnessMap);
      if (material.aoMap) normalizeTexture(material.aoMap);
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
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.setKTX2Loader(getKtx2Loader(renderer));
    registerBasisuBufferPlugin(loader);
  });
  const scale = useMemo(() => fitScale(gltf.scene), [gltf.scene]);

  useLayoutEffect(() => {
    prepareMaterials(gltf.scene);
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (reduce || !group.current) return;
    group.current.rotation.y += delta * 0.32;
  });

  return (
    <group ref={group} position={[x, 0, 0]} scale={scale}>
      <Center>
        <group>
          <primitive object={gltf.scene} />
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
      <ambientLight intensity={0.22} />
      <hemisphereLight color="#f3eee6" groundColor="#1b1b1b" intensity={0.4} />
      <directionalLight position={[4, 8, 6]} intensity={1.05} />
      <directionalLight position={[-5, 2, -3]} intensity={0.28} />
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
