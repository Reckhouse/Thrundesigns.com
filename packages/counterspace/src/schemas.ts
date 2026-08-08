/**
 * Server-safe Counterspace Zod schemas.
 * Must not import Three.js or browser-only APIs.
 */

import { z } from "zod";
import { counterspaceManifest } from "./manifest";

const presetKeys = counterspaceManifest.presets.map((p) => p.key) as [
  string,
  ...string[],
];

export const counterspaceEmbedConfigSchema = z
  .object({
    mode: z.enum(["preview", "inline"]),
    initialPresetKey: z.enum(presetKeys).optional(),
    initialCreationId: z.string().min(1).optional(),
    quality: z.enum(["auto", "low", "medium", "high"]).default("auto"),
    controls: z.enum(["none", "minimal", "full"]).default("minimal"),
    autoplay: z.boolean().default(false),
    height: z.number().min(320).max(1400).default(720),
    allowTextEditing: z.boolean().default(false),
    allowSvgUpload: z.boolean().default(false),
    allowAudio: z.boolean().default(false),
    allowExport: z.boolean().default(false),
    embedConfigVersion: z
      .number()
      .int()
      .positive()
      .default(counterspaceManifest.embedConfigVersion),
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
        message: "Text editing is not supported by Counterspace",
      });
    }

    if (value.allowSvgUpload) {
      ctx.addIssue({
        code: "custom",
        path: ["allowSvgUpload"],
        message: "SVG upload is not supported by Counterspace",
      });
    }

    if (value.allowAudio) {
      ctx.addIssue({
        code: "custom",
        path: ["allowAudio"],
        message: "Audio is not supported by Counterspace",
      });
    }

    if (value.allowExport) {
      ctx.addIssue({
        code: "custom",
        path: ["allowExport"],
        message: "Export is not supported by Counterspace",
      });
    }

    if (value.embedConfigVersion !== counterspaceManifest.embedConfigVersion) {
      ctx.addIssue({
        code: "custom",
        path: ["embedConfigVersion"],
        message: `Unsupported embed config version ${value.embedConfigVersion}; package supports ${counterspaceManifest.embedConfigVersion}`,
      });
    }
  });

export type CounterspaceEmbedConfig = z.infer<
  typeof counterspaceEmbedConfigSchema
>;
