"use client";

import { useMemo } from "react";
import type { PosterCreationV1 } from "../../serialization/posterCreation.schema";
import { PosterText } from "../../typography/PosterText";
import { type QualityTier } from "../../quality/quality-presets";
import { parseCrtConfig } from "./crtPhotocopy.schema";
import { CrtPostStack } from "./CrtPostStack";

type CrtPhotocopySystemProps = {
  document: PosterCreationV1;
  quality?: "auto" | QualityTier;
  paused?: boolean;
  reducedMotion?: boolean;
  assetBasePath?: string;
};

/**
 * Photocopy-styled extruded type + CRT post stack.
 * Type stays readable; postprocessing carries the channel/xerox look.
 */
export function CrtPhotocopySystem({
  document,
  quality = "auto",
  reducedMotion = false,
  assetBasePath,
}: CrtPhotocopySystemProps) {
  const config = useMemo(
    () => parseCrtConfig(document.visualSystem.config),
    [document.visualSystem.config],
  );

  const photocopyTypography = useMemo(() => {
    return {
      ...document.typography,
      depth: Math.max(0.02, document.typography.depth * 0.55),
      bevel: Math.max(0.004, document.typography.bevel * 0.45),
    };
  }, [document.typography]);

  const inkPalette = useMemo(() => {
    const mix = config.photocopyMix;
    // Bias toward high-contrast ink on paper as photocopyMix rises.
    return {
      ...document.palette,
      primary: mix > 0.55 ? "#ebe7df" : document.palette.primary,
      background: document.palette.background,
    };
  }, [document.palette, config.photocopyMix]);

  return (
    <group>
      <PosterText
        typography={photocopyTypography}
        palette={inkPalette}
        composition={document.composition}
        assetBasePath={assetBasePath}
        quality={quality}
        appearance={{
          metalness: 0.08 + config.inkBleed * 0.12,
          roughness: 0.72 - config.contrast * 0.25,
        }}
      />
      <CrtPostStack
        config={config}
        quality={quality}
        reducedMotion={reducedMotion}
        enabled
      />
    </group>
  );
}
