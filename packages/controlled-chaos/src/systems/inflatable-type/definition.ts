import type { VisualSystemDefinition } from "../types";
import {
  defaultInflatableTypeConfig,
  inflatablePresets,
  parseInflatableConfig,
  type InflatableTypeConfig,
} from "./inflatableType.schema";

export const inflatableTypeDefinition: VisualSystemDefinition<InflatableTypeConfig> =
  {
    key: "inflatable-type",
    version: 1,
    title: "Inflatable Type",
    description:
      "Extruded letter bodies with Rapier physics, cyclic inflate pressure, and buoyant bounce — rigid bodies with inflate-like forces, not true soft-body.",
    capabilities: {
      supportsText: true,
      supportsSvg: false,
      supportsAudio: true,
      supportsPointerForces: false,
      supportsPhysics: true,
      supportsSeamlessLoop: true,
      supportsStillExport: true,
      supportsVideoExport: true,
    },
    defaultConfig: defaultInflatableTypeConfig,
    presets: inflatablePresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseInflatableConfig,
  };
