"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { PosterSceneContent } from "./PosterSceneContent";
import { PosterLoadingScreen } from "../shell/PosterLoadingScreen";
import { tokens } from "../shell/tokens";
import { qualityBudget } from "../quality/quality-presets";

type PosterSceneProps = {
  document: PosterCreationV1;
  reducedMotion?: boolean;
  paused?: boolean;
  quality?: "auto" | "low" | "medium" | "high";
  assetBasePath?: string;
  forceMode?: import("../systems/types").ForceMode;
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
  exporting?: boolean;
  canvasDescribedBy?: string;
};

function Lighting({
  lighting,
  accent,
  shadows,
  shadowMapSize,
}: {
  lighting: PosterCreationV1["lighting"];
  accent: string;
  shadows: boolean;
  shadowMapSize: number;
}) {
  return (
    <>
      <ambientLight intensity={0.28 * lighting.exposure} />
      <directionalLight
        position={[2.4, 3.2, 4]}
        intensity={lighting.keyIntensity * lighting.exposure}
        color="#fff6e8"
        castShadow={shadows}
        shadow-mapSize={shadows ? [shadowMapSize, shadowMapSize] : undefined}
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

function ContextLostGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvasEl = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvasEl.addEventListener("webglcontextlost", onContextLost, false);
    return () => {
      canvasEl.removeEventListener("webglcontextlost", onContextLost, false);
    };
  }, [gl, onLost]);

  return null;
}

export function PosterCanvas({
  document,
  reducedMotion = false,
  paused = false,
  quality = "auto",
  assetBasePath,
  forceMode = "push",
  canvasRef,
  exporting = false,
  canvasDescribedBy,
}: PosterSceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const [contextEpoch, setContextEpoch] = useState(0);
  const camera = document.camera;

  const handleContextLost = useCallback(() => {
    setContextLost(true);
  }, []);

  const budget = useMemo(
    () =>
      qualityBudget(quality, {
        reducedMotion,
        mobile:
          typeof navigator !== "undefined" &&
          /Mobi|Android/i.test(navigator.userAgent),
        hardwareConcurrency:
          typeof navigator !== "undefined"
            ? navigator.hardwareConcurrency
            : 8,
      }),
    [quality, reducedMotion],
  );

  const dpr =
    budget.tier === "low"
      ? 1
      : ([1, budget.dprCap] as [number, number]);
  const antialias = budget.tier !== "low";
  const shadowMapSize = budget.tier === "high" ? 1024 : 512;

  if (contextLost) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.85rem",
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
        <p style={{ margin: 0, lineHeight: 1.55, maxWidth: 28 }}>
          The graphics renderer stopped unexpectedly. You can retry without
          leaving this page.
        </p>
        <button
          type="button"
          onClick={() => {
            setContextLost(false);
            setContextEpoch((value) => value + 1);
          }}
          style={{
            appearance: "none",
            border: `1px solid ${tokens.line}`,
            background: tokens.gold,
            color: tokens.ink,
            fontFamily: tokens.fontMono,
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.65rem 1rem",
            cursor: "pointer",
          }}
        >
          Retry renderer
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ position: "absolute", inset: 0 }}
      aria-label="Interactive poster canvas"
      aria-describedby={canvasDescribedBy}
      data-exporting={exporting ? "true" : undefined}
    >
      <Canvas
        key={`poster-canvas-${contextEpoch}`}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        gl={{
          alpha: false,
          antialias,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: camera.position,
          fov: camera.fieldOfView ?? 35,
          near: 0.1,
          far: 40,
        }}
        dpr={dpr}
        frameloop={paused || reducedMotion ? "demand" : "always"}
        shadows={budget.shadows}
        onCreated={({ gl }) => {
          gl.setClearColor(document.palette.background, 1);
          if (canvasRef) {
            canvasRef.current = gl.domElement;
          }
        }}
      >
        <ContextLostGuard onLost={handleContextLost} />
        <Suspense fallback={null}>
          <Lighting
            lighting={document.lighting}
            accent={document.palette.accent}
            shadows={budget.shadows}
            shadowMapSize={shadowMapSize}
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
