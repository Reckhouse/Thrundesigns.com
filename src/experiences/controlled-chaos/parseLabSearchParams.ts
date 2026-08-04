import type { ControlledChaosEmbedConfig } from "@thrun-design/controlled-chaos/schemas";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";
import { validateExperienceEmbedConfig } from "@/experiences/compatibility";
import type { ExperienceCompatibilityResult } from "@/experiences/types";
import { getSiteUrl } from "@/lib/site-url";

export type ControlledChaosLabSearchParams = {
  mode?: string | string[];
  preset?: string | string[];
  creation?: string | string[];
  quality?: string | string[];
  from?: string | string[];
  controls?: string | string[];
};

export type ControlledChaosLabParseSuccess = {
  configuration: ControlledChaosEmbedConfig;
  returnHref: string;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Parse lab URL search params into a validated Controlled Chaos embed config.
 * Lab defaults favor the full editor (inline + full controls + capabilities).
 */
export function parseControlledChaosLabConfig(
  raw: ControlledChaosLabSearchParams,
): ExperienceCompatibilityResult<ControlledChaosLabParseSuccess> {
  const modeParam = firstValue(raw.mode);
  const mode =
    modeParam === "preview" ||
    modeParam === "inline" ||
    modeParam === "replay"
      ? modeParam
      : "inline";

  const from = firstValue(raw.from);
  const returnHref =
    from && from.startsWith("/") && !from.startsWith("//") ? from : "/work";

  const assetBaseUrl = `${getSiteUrl()}${controlledChaosManifest.assetBasePath}`;

  const draft = {
    mode,
    initialPresetKey: firstValue(raw.preset) || undefined,
    initialCreationId: firstValue(raw.creation) || undefined,
    quality: firstValue(raw.quality) || "auto",
    controls:
      firstValue(raw.controls) ||
      (mode === "preview" ? "minimal" : "full"),
    autoplay: false,
    height: controlledChaosManifest.defaultHeight,
    allowTextEditing: mode === "inline",
    allowSvgUpload: mode === "inline",
    allowAudio: mode === "inline",
    allowExport: mode === "inline",
    embedConfigVersion: controlledChaosManifest.embedConfigVersion,
    assetBaseUrl,
  };

  const validated = validateExperienceEmbedConfig(
    controlledChaosManifest.experienceKey,
    draft,
  );

  if (!validated.ok) {
    return validated;
  }

  return {
    ok: true,
    value: {
      configuration: validated.value
        .configuration as ControlledChaosEmbedConfig,
      returnHref,
    },
  };
}

/** Append a safe return path for lab → case study navigation. */
export function withLabReturnPath(
  launchUrl: string,
  returnPath: string,
): string {
  if (!returnPath.startsWith("/") || returnPath.startsWith("//")) {
    return launchUrl;
  }
  const url = new URL(launchUrl, "https://thrundesign.local");
  url.searchParams.set("from", returnPath);
  return `${url.pathname}${url.search}`;
}
