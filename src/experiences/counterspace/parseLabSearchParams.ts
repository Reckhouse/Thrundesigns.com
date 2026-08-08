import type { CounterspaceEmbedConfig } from "@thrun-design/counterspace/schemas";
import { counterspaceManifest } from "@thrun-design/counterspace/manifest";
import { validateExperienceEmbedConfig } from "@/experiences/compatibility";
import type { ExperienceCompatibilityResult } from "@/experiences/types";

export type CounterspaceLabSearchParams = {
  mode?: string | string[];
  preset?: string | string[];
  quality?: string | string[];
  from?: string | string[];
  controls?: string | string[];
};

export type CounterspaceLabParseSuccess = {
  configuration: CounterspaceEmbedConfig;
  returnHref: string;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parse lab URL search params into a validated Counterspace embed config.
 */
export function parseCounterspaceLabConfig(
  raw: CounterspaceLabSearchParams,
): ExperienceCompatibilityResult<CounterspaceLabParseSuccess> {
  const modeParam = firstValue(raw.mode);
  const mode =
    modeParam === "preview" || modeParam === "inline" ? modeParam : "inline";

  const from = firstValue(raw.from);
  const returnHref =
    from && from.startsWith("/") && !from.startsWith("//")
      ? from
      : "/work/counterspace-field-laboratory";

  const draft = {
    mode,
    initialPresetKey: firstValue(raw.preset) || "twin-orbit",
    quality: firstValue(raw.quality) || "auto",
    controls:
      firstValue(raw.controls) ||
      (mode === "preview" ? "minimal" : "full"),
    autoplay: false,
    height: counterspaceManifest.defaultHeight,
    allowTextEditing: false,
    allowSvgUpload: false,
    allowAudio: false,
    allowExport: false,
    embedConfigVersion: counterspaceManifest.embedConfigVersion,
    assetBaseUrl: counterspaceManifest.assetBasePath,
  };

  const validated = validateExperienceEmbedConfig(
    counterspaceManifest.experienceKey,
    draft,
  );

  if (!validated.ok) {
    return validated;
  }

  return {
    ok: true,
    value: {
      configuration: validated.value.configuration as CounterspaceEmbedConfig,
      returnHref,
    },
  };
}
