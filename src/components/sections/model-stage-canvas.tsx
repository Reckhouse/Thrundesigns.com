"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { Center, Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  GLTFLoader,
  type GLTFParser,
} from "three/examples/jsm/loaders/GLTFLoader.js";
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
          parseKtx2(
            ktx2,
            copyBuffer(bufferView as ArrayBuffer | ArrayBufferView),
          ),
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

function measureMeshBox(root: THREE.Object3D) {
  const box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) box.expandByObject(mesh);
  });
  return box;
}

function fitScale(root: THREE.Object3D, target = 1.55) {
  const box = measureMeshBox(root);
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
      material.envMapIntensity = 0.7;
      // Keep KHR_texture_transform (gltfpack 12-bit UV dequant). Stripping
      // repeat/offset zooms into a corner of the albedo.
      const maps = [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
        material.aoMap,
      ];
      for (const texture of maps) {
        if (!texture) continue;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
      }
      if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
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

function disableMeshRaycast(root: THREE.Object3D) {
  root.traverse((obj) => {
    obj.raycast = () => {};
  });
}

function RotatingModel({
  url,
  x,
  reduce,
  y,
  target,
  paused,
  yaw,
  hidden,
}: {
  url: string;
  x: number;
  y: number;
  target: number;
  reduce: boolean;
  paused: boolean;
  yaw: number;
  hidden: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const renderer = useThree((state) => state.gl);
  const group = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (group.current) group.current.rotation.y = yaw;
    invalidate();
  }, [yaw, hidden, invalidate]);
  const motion = useRef({
    falling: false,
    velocity: new THREE.Vector3(),
    spin: new THREE.Vector3(),
  });
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.setKTX2Loader(getKtx2Loader(renderer));
    registerBasisuBufferPlugin(loader);
  });
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const unitScale = useMemo(() => fitScale(scene, 1), [scene]);
  const scale = unitScale * target;
  const hitSize = useMemo(() => {
    const size = measureMeshBox(scene).getSize(new THREE.Vector3());
    if (size.lengthSq() === 0) size.set(1, 1, 1);
    size.multiplyScalar(1.08);
    return size;
  }, [scene]);

  useLayoutEffect(() => {
    prepareMaterials(scene);
    disableMeshRaycast(scene);
  }, [scene]);

  const knockOff = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    event.nativeEvent.preventDefault();
    if (event.button !== 0 && event.button !== 2) return;
    const node = group.current;
    if (paused && node) {
      node.visible = false;
      invalidate();
      return;
    }
    const state = motion.current;
    if (!node || state.falling) return;
    state.falling = true;
    const away = event.point
      .clone()
      .sub(node.getWorldPosition(new THREE.Vector3()));
    away.y = 0;
    if (away.lengthSq() < 0.0001) away.set(x >= 0 ? 1 : -1, 0, 0.2);
    away.normalize();
    state.velocity.set(
      away.x * (2.4 + Math.random() * 1.4),
      reduce ? 0.4 : 2.6 + Math.random() * 1.1,
      away.z * (1.2 + Math.random()) - 0.8,
    );
    state.spin.set(
      (Math.random() - 0.5) * (reduce ? 1.2 : 6),
      (Math.random() - 0.5) * (reduce ? 1.6 : 8),
      (Math.random() - 0.5) * (reduce ? 1.2 : 5),
    );
  };

  useFrame((_, delta) => {
    if (paused) return;
    const node = group.current;
    if (!node) return;
    const state = motion.current;
    if (!state.falling) {
      if (!reduce) node.rotation.y += delta * 0.32;
      return;
    }
    const dt = Math.min(delta, 0.05);
    state.velocity.y -= 18 * dt;
    node.position.x += state.velocity.x * dt;
    node.position.y += state.velocity.y * dt;
    node.position.z += state.velocity.z * dt;
    node.rotation.x += state.spin.x * dt;
    node.rotation.y += state.spin.y * dt;
    node.rotation.z += state.spin.z * dt;
    if (node.position.y < -14) node.visible = false;
  });

  return (
    <group ref={group} position={[x, y, 0]} scale={scale} visible={!hidden}>
      <Center>
        <group>
          <primitive object={scene} />
        </group>
      </Center>
      <mesh onPointerDown={knockOff} onContextMenu={knockOff}>
        <boxGeometry args={[hitSize.x, hitSize.y, hitSize.z]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

type StageProps = {
  models: StageModel[];
  paused: boolean;
  adjustments: Record<number, { yaw: number; hidden: boolean }>;
};
function StageModels({ models, paused, adjustments }: StageProps) {
  const reduce = Boolean(useReducedMotion());
  const { width, height } = useThree((state) => state.viewport);
  const vertical = width < height;
  const available = vertical ? height : width;
  const cell = available / Math.max(1, models.length);
  const target = Math.min(1.8, cell * 0.65);
  return (
    <>
      {models.map((model, index) => {
        const offset = (index - (models.length - 1) / 2) * cell;
        return (
          <Suspense
            key={`${model.url}-${index}`}
            fallback={
              <Html
                position={vertical ? [0, -offset, 0] : [offset, 0, 0]}
                center
              >
                <p
                  role="status"
                  className="whitespace-nowrap text-sm text-fg-muted"
                >
                  Loading {model.label}…
                </p>
              </Html>
            }
          >
            <RotatingModel
              url={model.url}
              x={vertical ? 0 : offset}
              y={vertical ? -offset : 0}
              target={target}
              reduce={reduce}
              paused={paused}
              yaw={adjustments[index]?.yaw ?? 0}
              hidden={adjustments[index]?.hidden ?? false}
            />
          </Suspense>
        );
      })}
    </>
  );
}
export function ModelStageCanvas({
  models,
  paused,
  adjustments,
  visible,
}: StageProps & { visible: boolean }) {
  return (
    <Canvas
      frameloop={visible && !paused ? "always" : "demand"}
      className="h-full w-full"
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.2], fov: 32, near: 0.1, far: 40 }}
    >
      <StudioEnvironment />
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 8, 6]} intensity={0.55} />
      <directionalLight position={[-5, 2, -3]} intensity={0.18} />
      <StageModels
        models={models}
        paused={paused || !visible}
        adjustments={adjustments}
      />
    </Canvas>
  );
}
