import type { LivingEngravingEmbedConfig } from "@thrun-design/living-engraving/schemas";
import { livingEngravingManifest } from "@thrun-design/living-engraving/manifest";
import { validateExperienceEmbedConfig } from "@/experiences/compatibility";
import type { ExperienceCompatibilityResult } from "@/experiences/types";

export type LivingEngravingLabSearchParams = {
  mode?: string | string[];
  preset?: string | string[];
  quality?: string | string[];
  from?: string | string[];
  controls?: string | string[];
};

export type LivingEngravingLabParseSuccess = {
  configuration: LivingEngravingEmbedConfig;
  returnHref: string;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parse lab URL search params into a validated Living Engraving embed config.
 */
export function parseLivingEngravingLabConfig(
  raw: LivingEngravingLabSearchParams,
): ExperienceCompatibilityResult<LivingEngravingLabParseSuccess> {
  const modeParam = firstValue(raw.mode);
  const mode =
    modeParam === "preview" || modeParam === "inline" ? modeParam : "inline";

  const from = firstValue(raw.from);
  const returnHref =
    from && from.startsWith("/") && !from.startsWith("//") ? from : "/work";

  // Always fetch particle buffers from this deployment — never pin to the
  // production origin (preview/lab would 404 and render a blank canvas).
  const assetBaseUrl = livingEngravingManifest.assetBasePath;

  const draft = {
    mode,
    initialPresetKey: firstValue(raw.preset) || "centered-cameo",
    quality: firstValue(raw.quality) || "auto",
    controls:
      firstValue(raw.controls) ||
      (mode === "preview" ? "minimal" : "full"),
    autoplay: false,
    height: livingEngravingManifest.defaultHeight,
    allowTextEditing: false,
    allowSvgUpload: false,
    allowAudio: false,
    allowExport: false,
    embedConfigVersion: livingEngravingManifest.embedConfigVersion,
    assetBaseUrl,
  };

  const validated = validateExperienceEmbedConfig(
    livingEngravingManifest.experienceKey,
    draft,
  );

  if (!validated.ok) {
    return validated;
  }

  return {
    ok: true,
    value: {
      configuration: validated.value
        .configuration as LivingEngravingEmbedConfig,
      returnHref,
    },
  };
}
