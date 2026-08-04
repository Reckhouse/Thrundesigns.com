/**
 * Server-safe Controlled Chaos Zod schemas.
 * Must not import Three.js, R3F, or browser-only APIs.
 */

import { z } from "zod";
import { controlledChaosManifest } from "./manifest";

const presetKeys = controlledChaosManifest.presets.map((p) => p.key) as [
  string,
  ...string[],
];

export const controlledChaosEmbedConfigSchema = z
  .object({
    mode: z.enum(["preview", "inline", "replay"]),
    initialPresetKey: z.enum(presetKeys).optional(),
    initialCreationId: z.string().min(1).optional(),
    quality: z.enum(["auto", "low", "medium", "high"]).default("auto"),
    controls: z.enum(["none", "minimal", "full"]).default("minimal"),
    autoplay: z.boolean().default(false),
    height: z.number().min(400).max(1400).default(720),
    allowTextEditing: z.boolean().default(false),
    allowSvgUpload: z.boolean().default(false),
    allowAudio: z.boolean().default(false),
    allowExport: z.boolean().default(false),
    embedConfigVersion: z
      .number()
      .int()
      .positive()
      .default(controlledChaosManifest.embedConfigVersion),
    assetBaseUrl: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "replay" && !value.initialCreationId) {
      ctx.addIssue({
        code: "custom",
        path: ["initialCreationId"],
        message: "Replay mode requires a creation ID",
      });
    }

    if (
      (value.mode === "preview" || value.mode === "inline") &&
      value.initialPresetKey === undefined
    ) {
      // Preset is recommended but not strictly required — allow defaults.
    }

    if (value.mode === "preview" && value.controls === "full") {
      ctx.addIssue({
        code: "custom",
        path: ["controls"],
        message: "Full controls are not allowed in preview mode",
      });
    }

    if (
      value.allowTextEditing &&
      !controlledChaosManifest.capabilities.textEditing
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["allowTextEditing"],
        message: "Text editing is not supported by this package",
      });
    }

    if (
      value.allowSvgUpload &&
      !controlledChaosManifest.capabilities.svgUpload
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["allowSvgUpload"],
        message: "SVG upload is not supported by this package",
      });
    }

    if (value.allowAudio && !controlledChaosManifest.capabilities.audio) {
      ctx.addIssue({
        code: "custom",
        path: ["allowAudio"],
        message: "Audio is not supported by this package",
      });
    }

    if (value.allowExport && !controlledChaosManifest.capabilities.export) {
      ctx.addIssue({
        code: "custom",
        path: ["allowExport"],
        message: "Export is not supported by this package",
      });
    }

    if (
      value.embedConfigVersion !== controlledChaosManifest.embedConfigVersion
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["embedConfigVersion"],
        message: `Unsupported embed config version ${value.embedConfigVersion}; package supports ${controlledChaosManifest.embedConfigVersion}`,
      });
    }
  });

export type ControlledChaosEmbedConfig = z.infer<
  typeof controlledChaosEmbedConfigSchema
>;

export const controlledChaosCreationSchema = z.object({
  stateSchemaVersion: z
    .number()
    .int()
    .positive()
    .default(controlledChaosManifest.stateSchemaVersion),
  experienceKey: z.literal(controlledChaosManifest.experienceKey),
  presetKey: z.enum(presetKeys).optional(),
  createdAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  state: z.record(z.string(), z.unknown()),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().min(1).max(120).optional(),
});

export type ControlledChaosCreation = z.infer<
  typeof controlledChaosCreationSchema
>;
