"use client";

import { useMemo } from "react";
import { Vector2 } from "three";
import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Scanline,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { CrtPhotocopyConfig } from "./crtPhotocopy.schema";
import {
  postprocessingBudget,
  type QualityTier,
} from "../../quality/quality-presets";

const ZERO_OFFSET = new Vector2(0, 0);

type CrtPostStackProps = {
  config: CrtPhotocopyConfig;
  quality?: "auto" | QualityTier;
  reducedMotion?: boolean;
  enabled?: boolean;
};

/**
 * Quality-aware CRT / photocopy EffectComposer stack.
 * Reduced motion disables animated grain and softens chromatic offset.
 */
export function CrtPostStack({
  config,
  quality = "auto",
  reducedMotion = false,
  enabled = true,
}: CrtPostStackProps) {
  const budget = useMemo(
    () =>
      postprocessingBudget(quality, {
        reducedMotion,
        mobile:
          typeof navigator !== "undefined" &&
          /Mobi|Android/i.test(navigator.userAgent),
      }),
    [quality, reducedMotion],
  );

  const offset = useMemo(() => {
    const amount =
      config.chromaticOffset *
      budget.chromaticScale *
      (reducedMotion ? 0.35 : 1);
    return new Vector2(amount * 0.0045, amount * 0.0022);
  }, [config.chromaticOffset, budget.chromaticScale, reducedMotion]);

  const scanOpacity = config.scanlines * budget.scanlineScale;
  const grainOpacity =
    config.grain * budget.grainScale * (reducedMotion ? 0.45 : 1);
  const contrast =
    (config.contrast * 0.55 + config.threshold * 0.35) * config.photocopyMix;
  const brightness = -config.threshold * 0.22 * config.photocopyMix;
  const bloomIntensity = config.bloom * budget.bloomScale;
  const showScan = scanOpacity > 0.02;
  const showGrain = grainOpacity > 0.02;
  const showPhotocopy = config.photocopyMix > 0.05;
  const showChromatic = offset.length() > 0.0002 && budget.allowChromatic;
  const showVignette = config.vignette > 0.02;
  const showBloom = bloomIntensity > 0.02 && budget.allowBloom;

  if (!enabled || !budget.enabled) return null;

  return (
    <EffectComposer
      multisampling={budget.multisampling}
      enableNormalPass={false}
      resolutionScale={budget.resolutionScale}
    >
      {showScan ? (
        <Scanline
          density={budget.scanlineDensity}
          opacity={scanOpacity}
          blendFunction={BlendFunction.OVERLAY}
        />
      ) : (
        <Scanline density={0.01} opacity={0} />
      )}
      {showGrain ? (
        <Noise
          opacity={grainOpacity}
          premultiply={!reducedMotion}
          blendFunction={BlendFunction.SOFT_LIGHT}
        />
      ) : (
        <Noise opacity={0} />
      )}
      {showPhotocopy ? (
        <BrightnessContrast
          brightness={brightness}
          contrast={contrast * 0.85 - 0.15}
        />
      ) : (
        <BrightnessContrast brightness={0} contrast={0} />
      )}
      {showChromatic ? (
        <ChromaticAberration
          offset={offset}
          radialModulation={false}
          modulationOffset={0}
        />
      ) : (
        <ChromaticAberration offset={ZERO_OFFSET} />
      )}
      {showVignette ? (
        <Vignette
          offset={0.25 + config.inkBleed * 0.15}
          darkness={config.vignette * 0.85}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : (
        <Vignette offset={0.5} darkness={0} />
      )}
      {showBloom ? (
        <Bloom
          intensity={bloomIntensity * 1.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.35}
          mipmapBlur
        />
      ) : (
        <Bloom intensity={0} />
      )}
    </EffectComposer>
  );
}
