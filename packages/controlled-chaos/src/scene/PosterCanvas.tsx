"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { TestComposition } from "./TestComposition";
import { PosterLoadingScreen } from "../shell/PosterLoadingScreen";
import { tokens } from "../shell/tokens";

type PosterSceneProps = {
  phrase?: string;
  reducedMotion?: boolean;
  paused?: boolean;
  quality?: "auto" | "low" | "medium" | "high";
};

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[2.4, 3.2, 4]}
        intensity={1.35}
        color="#fff6e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-2.5, -1.2, 2]}
        intensity={0.35}
        color="#8a6a38"
      />
      <pointLight position={[0, 0.6, 2.2]} intensity={0.45} color="#d4af6a" />
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

/**
 * R3F canvas host for the vertical poster. Kept separate so entries can
 * swap systems later without remounting the shell chrome.
 */
export function PosterCanvas({
  phrase,
  reducedMotion = false,
  paused = false,
  quality = "auto",
}: PosterSceneProps) {
  const [contextLost, setContextLost] = useState(false);

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
        camera={{ position: [0, 0, 3.2], fov: 35, near: 0.1, far: 40 }}
        dpr={dprForQuality(quality)}
        frameloop={paused || reducedMotion ? "demand" : "always"}
        shadows={quality !== "low"}
        onCreated={({ gl }) => {
          gl.setClearColor(tokens.bgDeep, 1);
          const canvas = gl.domElement;
          const onLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
          };
          canvas.addEventListener("webglcontextlost", onLost, false);
        }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <TestComposition
            phrase={phrase}
            reducedMotion={reducedMotion}
            paused={paused}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function PosterCanvasFallback() {
  return <PosterLoadingScreen label="Preparing canvas…" />;
}
