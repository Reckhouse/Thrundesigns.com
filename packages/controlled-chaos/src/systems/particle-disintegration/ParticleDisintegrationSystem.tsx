"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { loadPosterFont } from "../../typography/FontLoader";
import { sampleSvgPoints } from "../../svg/SvgPointSampler";
import {
  particleCountForDensity,
  qualityBudget,
  type QualityTier,
} from "../../quality/quality-presets";
import { defaultPointerForce, type ForceMode, type PointerForce } from "../types";
import { InteractionPlane } from "../../interaction/InteractionPlane";
import { parseParticleConfig } from "./particleDisintegration.schema";
import { ParticleField } from "./ParticleField";
import { sampleTextPoints } from "./textPointSampler";
import type { SampledPoint } from "./pointSampling";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";

type ParticleDisintegrationSystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
  forceMode?: ForceMode;
};

export function ParticleDisintegrationSystem({
  document,
  quality = "auto",
  paused = false,
  reducedMotion = false,
  assetBasePath = "/experiences/controlled-chaos",
  forceMode = "push",
}: ParticleDisintegrationSystemProps) {
  const config = useMemo(
    () => parseParticleConfig(document.visualSystem.config),
    [document.visualSystem.config],
  );
  const audioRef = useAudioBandsRef();
  const audioGain =
    document.audio.mode !== "off" && document.audio.reactive
      ? document.audio.gain * document.audio.sensitivity
      : 0;

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

  const targetCount = particleCountForDensity(
    budget.particleCount,
    config.density,
  );

  const [font, setFont] = useState<Font | null>(null);
  const [points, setPoints] = useState<SampledPoint[]>([]);
  const forceRef = useRef<PointerForce>(defaultPointerForce());

  useEffect(() => {
    let cancelled = false;
    void loadPosterFont(document.typography.fontKey, assetBasePath)
      .then((loaded) => {
        if (!cancelled) setFont(loaded);
      })
      .catch(() => {
        if (!cancelled) setFont(null);
      });
    return () => {
      cancelled = true;
    };
  }, [document.typography.fontKey, assetBasePath]);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        const svgMarkup = document.asset?.normalizedSvg;
        let next: SampledPoint[] = [];

        if (svgMarkup) {
          next = sampleSvgPoints({
            svg: svgMarkup,
            seed: document.seed,
            count: targetCount,
            depthSpread: config.depthSpread,
            edgeBias: config.edgeBias,
          });
        } else if (font) {
          next = await sampleTextPoints({
            font,
            typography: document.typography,
            seed: document.seed,
            count: targetCount,
            depthSpread: config.depthSpread,
            edgeBias: config.edgeBias,
          });
        }

        if (!cancelled) setPoints(next);
      })();
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [
    font,
    document.typography,
    document.seed,
    document.asset?.normalizedSvg,
    document.asset?.checksum,
    targetCount,
    config.depthSpread,
    config.edgeBias,
  ]);

  useEffect(() => {
    forceRef.current.radius = config.forceRadius;
    forceRef.current.strength = config.forceStrength;
    forceRef.current.mode = forceMode;
  }, [config.forceRadius, config.forceStrength, forceMode]);

  return (
    <group position={document.composition.position}>
      {points.length > 0 ? (
        <ParticleField
          points={points}
          config={config}
          palette={document.palette}
          seed={document.seed}
          loopSeconds={document.document.loopDurationSeconds}
          pointerRef={forceRef}
          audioRef={audioRef}
          audioGain={audioGain}
          paused={paused}
          reducedMotion={reducedMotion}
        />
      ) : null}
      <InteractionPlane
        forceRef={forceRef}
        mode={forceMode}
        radius={config.forceRadius}
        strength={config.forceStrength}
        enabled={!paused}
      />
    </group>
  );
}
