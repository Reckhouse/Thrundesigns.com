"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { PosterSceneContent } from "./PosterSceneContent";
import { PosterLoadingScreen } from "../shell/PosterLoadingScreen";
import { tokens } from "../shell/tokens";

type PosterSceneProps = {
  document: PosterCreationV1;
  reducedMotion?: boolean;
  paused?: boolean;
  quality?: "auto" | "low" | "medium" | "high";
  assetBasePath?: string;
  forceMode?: import("../systems/types").ForceMode;
};

function Lighting({
  lighting,
  accent,
}: {
  lighting: PosterCreationV1["lighting"];
  accent: string;
}) {
  return (
    <>
      <ambientLight intensity={0.28 * lighting.exposure} />
      <directionalLight
        position={[2.4, 3.2, 4]}
        intensity={lighting.keyIntensity * lighting.exposure}
        color="#fff6e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-2.5, -1.2, 2]}
        intensity={lighting.fillIntensity * lighting.exposure}
        color={accent}
      />
      <pointLight
        position={[0, 0.6, 2.2]}
        intensity={lighting.rimIntensity * lighting.exposure}
        color={accent}
      />
    </>
  );
}

function dprForQuality(
  quality: PosterSceneProps["quality"],
): [number, number] | number {
  if (quality === "low") return 1;
  if (quality === "high") return [1, 2];
  return [1, 1.5];
}

export function PosterCanvas({
  document,
  reducedMotion = false,
  paused = false,
  quality = "auto",
  assetBasePath,
  forceMode = "push",
}: PosterSceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const camera = document.camera;

  if (contextLost) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "1.5rem",
          boxSizing: "border-box",
          background: tokens.bgDeep,
          color: tokens.fg,
          fontFamily: tokens.fontSans,
          fontSize: "0.875rem",
          textAlign: "center",
        }}
      >
        The graphics renderer stopped unexpectedly. Reload the experience to
        continue.
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      aria-label="Interactive poster canvas"
    >
      <Canvas
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: camera.position,
          fov: camera.fieldOfView ?? 35,
          near: 0.1,
          far: 40,
        }}
        dpr={dprForQuality(quality)}
        frameloop={paused || reducedMotion ? "demand" : "always"}
        shadows={quality !== "low"}
        onCreated={({ gl }) => {
          gl.setClearColor(document.palette.background, 1);
          const canvasEl = gl.domElement;
          const onLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
          };
          canvasEl.addEventListener("webglcontextlost", onLost, false);
        }}
      >
        <Suspense fallback={null}>
          <Lighting
            lighting={document.lighting}
            accent={document.palette.accent}
          />
          <PosterSceneContent
            document={document}
            reducedMotion={reducedMotion}
            paused={paused}
            assetBasePath={assetBasePath}
            quality={quality}
            forceMode={forceMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function PosterCanvasFallback() {
  return <PosterLoadingScreen label="Preparing canvas…" />;
}
