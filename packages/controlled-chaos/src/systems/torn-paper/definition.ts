import type { VisualSystemDefinition } from "../types";
import {
  defaultTornPaperConfig,
  parseTornPaperConfig,
  tornPaperPresets,
  type TornPaperConfig,
} from "./tornPaper.schema";

export const tornPaperDefinition: VisualSystemDefinition<TornPaperConfig> = {
  key: "torn-paper",
  version: 1,
  title: "Torn Paper",
  description:
    "Layered paper shards with seeded jagged edges, curl, and slow collage drift behind shallow extruded type.",
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
  defaultConfig: defaultTornPaperConfig,
  presets: tornPaperPresets.map((preset) => ({
    key: preset.key,
    title: preset.title,
    description: preset.description,
    config: preset.config,
  })),
  parseConfig: parseTornPaperConfig,
};
