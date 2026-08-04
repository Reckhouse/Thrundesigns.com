/**
 * Server-safe Living Engraving Zod schemas.
 * Must not import Three.js, R3F, or browser-only APIs.
 */

import { z } from "zod";
import { livingEngravingManifest } from "./manifest";

const presetKeys = livingEngravingManifest.presets.map((p) => p.key) as [
  string,
  ...string[],
];

export const livingEngravingEmbedConfigSchema = z
  .object({
    mode: z.enum(["preview", "inline"]),
    initialPresetKey: z.enum(presetKeys).optional(),
    initialCreationId: z.string().min(1).optional(),
    quality: z.enum(["auto", "low", "medium", "high"]).default("auto"),
    controls: z.enum(["none", "minimal", "full"]).default("minimal"),
    autoplay: z.boolean().default(false),
    height: z.number().min(320).max(1400).default(640),
    allowTextEditing: z.boolean().default(false),
    allowSvgUpload: z.boolean().default(false),
    allowAudio: z.boolean().default(false),
    allowExport: z.boolean().default(false),
    embedConfigVersion: z
      .number()
      .int()
      .positive()
      .default(livingEngravingManifest.embedConfigVersion),
    assetBaseUrl: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "preview" && value.controls === "full") {
      ctx.addIssue({
        code: "custom",
        path: ["controls"],
        message: "Full controls are not allowed in preview mode",
      });
    }

    if (value.allowTextEditing) {
      ctx.addIssue({
        code: "custom",
        path: ["allowTextEditing"],
        message: "Text editing is not supported by Living Engraving",
      });
    }

    if (value.allowSvgUpload) {
      ctx.addIssue({
        code: "custom",
        path: ["allowSvgUpload"],
        message: "SVG upload is not supported by Living Engraving",
      });
    }

    if (value.allowAudio) {
      ctx.addIssue({
        code: "custom",
        path: ["allowAudio"],
        message: "Audio is not supported by Living Engraving",
      });
    }

    if (value.allowExport) {
      ctx.addIssue({
        code: "custom",
        path: ["allowExport"],
        message: "Export is not supported by Living Engraving",
      });
    }

    if (
      value.embedConfigVersion !== livingEngravingManifest.embedConfigVersion
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["embedConfigVersion"],
        message: `Unsupported embed config version ${value.embedConfigVersion}; package supports ${livingEngravingManifest.embedConfigVersion}`,
      });
    }
  });

export type LivingEngravingEmbedConfig = z.infer<
  typeof livingEngravingEmbedConfigSchema
>;
