import type { VisualSystemDefinition } from "../types";
import {
  chromePresets,
  defaultChromeLiquidConfig,
  parseChromeConfig,
  type ChromeLiquidConfig,
} from "./chromeLiquid.schema";

export const chromeLiquidDefinition: VisualSystemDefinition<ChromeLiquidConfig> =
  {
    key: "chrome-liquid",
    version: 1,
    title: "Chrome Liquid",
    description:
      "Extruded typography with metalness, fresnel-like highlights, and seeded liquid displacement that loops seamlessly.",
    capabilities: {
      supportsText: true,
      supportsSvg: false,
      supportsAudio: true,
      supportsPointerForces: false,
      supportsPhysics: false,
      supportsSeamlessLoop: true,
      supportsStillExport: true,
      supportsVideoExport: true,
    },
    defaultConfig: defaultChromeLiquidConfig,
    presets: chromePresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseChromeConfig,
  };
