import type { VisualSystemDefinition } from "../types";
import {
  defaultParticleDisintegrationConfig,
  parseParticleConfig,
  particlePresets,
  type ParticleDisintegrationConfig,
} from "./particleDisintegration.schema";

export const particleDisintegrationDefinition: VisualSystemDefinition<ParticleDisintegrationConfig> =
  {
    key: "particle-disintegration",
    version: 1,
    title: "Particle Disintegration",
    description:
      "Typography and SVG marks dissolve into seeded particle fields that respond to pointer forces and loop seamlessly.",
    capabilities: {
      supportsText: true,
      supportsSvg: true,
      supportsAudio: true,
      supportsPointerForces: true,
      supportsPhysics: false,
      supportsSeamlessLoop: true,
      supportsStillExport: true,
      supportsVideoExport: true,
    },
    defaultConfig: defaultParticleDisintegrationConfig,
    presets: particlePresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseParticleConfig,
  };
