import type { VisualSystemDefinition } from "../types";
import {
  defaultTypeArchitectureConfig,
  parseTypeArchitectureConfig,
  typeArchitecturePresets,
  type TypeArchitectureConfig,
} from "./typeArchitecture.schema";

export const typeArchitectureDefinition: VisualSystemDefinition<TypeArchitectureConfig> =
  {
    key: "type-architecture",
    version: 1,
    title: "Type Architecture",
    description:
      "Structural typography as massing — extruded line slabs, beams, and columns arranged in seeded architectural compositions.",
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
    defaultConfig: defaultTypeArchitectureConfig,
    presets: typeArchitecturePresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseTypeArchitectureConfig,
  };
