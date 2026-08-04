"use client";

import {
  HorseParticles,
  type LivingEngravingLayout,
} from "./horse-particles";
import { livingEngravingManifest } from "./manifest";
import type { LivingEngravingEmbedConfig } from "./schemas";

export type LivingEngravingExperienceProps = {
  configuration?: LivingEngravingEmbedConfig;
};

function layoutFromConfig(
  configuration?: LivingEngravingEmbedConfig,
): LivingEngravingLayout {
  return configuration?.initialPresetKey === "hero-offset"
    ? "hero"
    : "centered";
}

function staticFromConfig(configuration?: LivingEngravingEmbedConfig): boolean {
  if (configuration?.initialPresetKey === "print-static") return true;
  if (configuration?.quality === "low") return true;
  return false;
}

export function LivingEngravingExperience({
  configuration,
}: LivingEngravingExperienceProps) {
  const height = configuration?.height ?? livingEngravingManifest.defaultHeight;
  const assetBaseUrl =
    configuration?.assetBaseUrl && configuration.assetBaseUrl.startsWith("/")
      ? configuration.assetBaseUrl
      : livingEngravingManifest.assetBasePath;

  return (
    <div
      className="living-engraving-embed"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: Math.max(height, 480),
        background:
          "radial-gradient(ellipse at 50% 45%, #1a1c18 0%, #0c0d0c 70%)",
      }}
      data-experience={livingEngravingManifest.experienceKey}
      data-mode={configuration?.mode}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <HorseParticles
          layout={layoutFromConfig(configuration)}
          staticMode={staticFromConfig(configuration)}
          assetBaseUrl={assetBaseUrl}
        />
      </div>
    </div>
  );
}

export default LivingEngravingExperience;
