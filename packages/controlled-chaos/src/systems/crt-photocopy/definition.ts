import type { VisualSystemDefinition } from "../types";
import {
  crtPresets,
  defaultCrtPhotocopyConfig,
  parseCrtConfig,
  type CrtPhotocopyConfig,
} from "./crtPhotocopy.schema";

export const crtPhotocopyDefinition: VisualSystemDefinition<CrtPhotocopyConfig> =
  {
    key: "crt-photocopy",
    version: 1,
    title: "CRT / Photocopy",
    description:
      "High-contrast type through scanlines, grain, threshold ink, and chromatic CRT bleed — quality-aware and reduced-motion safe.",
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
    defaultConfig: defaultCrtPhotocopyConfig,
    presets: crtPresets.map((preset) => ({
      key: preset.key,
      title: preset.title,
      description: preset.description,
      config: preset.config,
    })),
    parseConfig: parseCrtConfig,
  };
