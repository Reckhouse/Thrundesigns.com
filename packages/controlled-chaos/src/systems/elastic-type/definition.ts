import type { VisualSystemDefinition } from "../types";
import {
  defaultElasticTypeConfig,
  elasticPresets,
  parseElasticConfig,
  type ElasticTypeConfig,
} from "./elasticType.schema";

export const elasticTypeDefinition: VisualSystemDefinition<ElasticTypeConfig> =
  {
    key: "elastic-type",
    version: 1,
    title: "Elastic Type",
    description:
      "Letter rigid bodies sprung toward rest poses with neighbor coupling and optional pointer stretch — spring forces, not cloth simulation.",
    capabilities: {
      supportsText: true,
      supportsSvg: false,
      supportsAudio: true,
      supportsPointerForces: true,
      supportsPhysics: true,
      supportsSeamlessLoop: true,
      supportsStillExport: true,
      supportsVideoExport: true,
    },
    defaultConfig: defaultElasticTypeConfig,
    presets: elasticPresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseElasticConfig,
  };
