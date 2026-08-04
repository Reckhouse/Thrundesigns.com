"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
import type { AudioReactiveConfig } from "../../audio/audio.schema";
import { useAudioBandsRef } from "../../audio/AudioReactiveContext";
import {
  AUDIO_MIX_PROFILES,
  audioDriveGain,
  audioInfluence,
} from "../../audio/audioMapping";

const ZERO_OFFSET = new Vector2(0, 0);

type CrtPostStackProps = {
  config: CrtPhotocopyConfig;
  quality?: "auto" | QualityTier;
  reducedMotion?: boolean;
  enabled?: boolean;
  audio?: AudioReactiveConfig;
  paused?: boolean;
};

type EffectWithOpacity = { opacity: number };
type EffectWithOffset = { offset: Vector2 };
type EffectWithIntensity = { intensity: number };
type EffectWithDarkness = { darkness: number };

/**
 * Quality-aware CRT / photocopy EffectComposer stack.
 * Audio modulates effect uniforms via refs — no React setState in the frame loop.
 */
export function CrtPostStack({
  config,
  quality = "auto",
  reducedMotion = false,
  enabled = true,
  audio,
  paused = false,
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

  const baseOffset = useMemo(() => {
    const amount =
      config.chromaticOffset *
      budget.chromaticScale *
      (reducedMotion ? 0.35 : 1);
    return new Vector2(amount * 0.0045, amount * 0.0022);
  }, [config.chromaticOffset, budget.chromaticScale, reducedMotion]);

  const baseScan = config.scanlines * budget.scanlineScale;
  const baseGrain =
    config.grain * budget.grainScale * (reducedMotion ? 0.45 : 1);
  const contrast =
    (config.contrast * 0.55 + config.threshold * 0.35) * config.photocopyMix;
  const brightness = -config.threshold * 0.22 * config.photocopyMix;
  const baseBloom = config.bloom * budget.bloomScale;
  const baseVignette = config.vignette * 0.85;
  const showScan = baseScan > 0.02;
  const showGrain = baseGrain > 0.02;
  const showPhotocopy = config.photocopyMix > 0.05;
  const showChromatic = baseOffset.length() > 0.0002 && budget.allowChromatic;
  const showVignette = config.vignette > 0.02;
  const showBloom = baseBloom > 0.02 && budget.allowBloom;

  const scanRef = useRef<EffectWithOpacity | null>(null);
  const grainRef = useRef<EffectWithOpacity | null>(null);
  const chromaRef = useRef<EffectWithOffset | null>(null);
  const bloomRef = useRef<EffectWithIntensity | null>(null);
  const vignetteRef = useRef<EffectWithDarkness | null>(null);
  const audioRef = useAudioBandsRef();
  const audioConfigRef = useRef(audio);
  const chromaScratch = useMemo(() => new Vector2(), []);

  useEffect(() => {
    audioConfigRef.current = audio;
  }, [audio]);

  useFrame(() => {
    const audioConfig = audioConfigRef.current;
    const drive = audioConfig
      ? audioDriveGain(audioConfig, reducedMotion)
      : 0;
    const influence =
      paused || drive <= 0
        ? 0
        : audioInfluence(
            audioRef.current,
            drive,
            AUDIO_MIX_PROFILES.crt,
            audioConfig?.beatBoost ?? 0.7,
          );

    if (scanRef.current) {
      scanRef.current.opacity = Math.min(
        1,
        baseScan * (1 + influence * 0.35),
      );
    }
    if (grainRef.current) {
      grainRef.current.opacity = Math.min(
        1,
        baseGrain * (1 + influence * 0.45),
      );
    }
    if (chromaRef.current) {
      const scale = 1 + influence * 0.55;
      chromaScratch.copy(baseOffset).multiplyScalar(scale);
      chromaRef.current.offset.copy(chromaScratch);
    }
    if (bloomRef.current) {
      bloomRef.current.intensity = baseBloom * 1.4 * (1 + influence * 0.5);
    }
    if (vignetteRef.current) {
      vignetteRef.current.darkness = Math.min(
        1,
        baseVignette * (1 + influence * 0.2),
      );
    }
  });

  if (!enabled || !budget.enabled) return null;

  // Callback refs only — object refs on wrapEffect components crash under
  // React 19 when @react-three/postprocessing JSON.stringifies props (#334).
  return (
    <EffectComposer
      key={`crt-post-${budget.tier}`}
      multisampling={budget.multisampling}
      enableNormalPass={false}
      resolutionScale={budget.resolutionScale}
    >
      {showScan ? (
        <Scanline
          ref={(effect: EffectWithOpacity | null) => {
            scanRef.current = effect;
          }}
          density={budget.scanlineDensity}
          opacity={baseScan}
          blendFunction={BlendFunction.OVERLAY}
        />
      ) : (
        <Scanline density={0.01} opacity={0} />
      )}
      {showGrain ? (
        <Noise
          ref={(effect: EffectWithOpacity | null) => {
            grainRef.current = effect;
          }}
          opacity={baseGrain}
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
          ref={(effect: EffectWithOffset | null) => {
            chromaRef.current = effect;
          }}
          offset={baseOffset}
          radialModulation={false}
          modulationOffset={0}
        />
      ) : (
        <ChromaticAberration offset={ZERO_OFFSET} />
      )}
      {showVignette ? (
        <Vignette
          ref={(effect: EffectWithDarkness | null) => {
            vignetteRef.current = effect;
          }}
          offset={0.25 + config.inkBleed * 0.15}
          darkness={baseVignette}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : (
        <Vignette offset={0.5} darkness={0} />
      )}
      {showBloom ? (
        <Bloom
          ref={(effect: EffectWithIntensity | null) => {
            bloomRef.current = effect;
          }}
          intensity={baseBloom * 1.4}
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
