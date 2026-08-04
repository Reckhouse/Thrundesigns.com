import { validateExperienceEmbedConfig } from "@/experiences/compatibility";
import type {
  ExperienceCompatibilityResult,
  ExperienceControls,
  ExperienceLoadBehavior,
  ExperienceMode,
  ExperienceQuality,
  PortfolioExperienceRenderConfig,
} from "@/experiences/types";
import type { ThreeExperienceBlockValue } from "@/types/three-experience";

export type MappedSanityExperience = PortfolioExperienceRenderConfig & {
  /** CMS-only presentation fields kept alongside validated package config. */
  presentation: {
    heading?: string;
    description?: string;
    loadBehavior: ExperienceLoadBehavior;
    showFullscreenAction: boolean;
    fullscreenLabel: string;
    moduleKey?: string;
  };
};

function asMode(value: unknown): ExperienceMode {
  if (value === "preview" || value === "inline" || value === "replay") {
    return value;
  }
  return "preview";
}

function asQuality(value: unknown): ExperienceQuality {
  if (
    value === "auto" ||
    value === "low" ||
    value === "medium" ||
    value === "high"
  ) {
    return value;
  }
  return "auto";
}

function asControls(value: unknown): ExperienceControls {
  if (value === "none" || value === "minimal" || value === "full") {
    return value;
  }
  return "minimal";
}

function asLoadBehavior(value: unknown): ExperienceLoadBehavior {
  if (
    value === "interaction" ||
    value === "viewport" ||
    value === "immediate"
  ) {
    return value;
  }
  return "interaction";
}

/**
 * Strip CMS-only fields, apply safe defaults, and validate with the package schema.
 * Never pass raw Sanity objects into the renderer.
 */
export function mapSanityExperienceConfig(
  value: ThreeExperienceBlockValue | null | undefined,
): ExperienceCompatibilityResult<MappedSanityExperience> {
  if (!value?.experienceKey) {
    return {
      ok: false,
      code: "unknown_experience_key",
      message: "Experience configuration is missing an experience key",
    };
  }

  const rawConfiguration = {
    mode: asMode(value.mode),
    initialPresetKey: value.initialPresetKey || undefined,
    initialCreationId: value.initialCreationId || undefined,
    quality: asQuality(value.quality),
    controls: asControls(value.controls),
    autoplay: Boolean(value.autoplay),
    height:
      typeof value.height === "number" && Number.isFinite(value.height)
        ? value.height
        : 720,
    allowTextEditing: Boolean(value.allowTextEditing),
    allowSvgUpload: Boolean(value.allowSvgUpload),
    allowAudio: Boolean(value.allowAudio),
    allowExport: Boolean(value.allowExport),
    embedConfigVersion:
      typeof value.embedConfigVersion === "number"
        ? value.embedConfigVersion
        : undefined,
  };

  const validated = validateExperienceEmbedConfig(
    value.experienceKey,
    rawConfiguration,
  );

  if (!validated.ok) {
    return validated;
  }

  return {
    ok: true,
    value: {
      ...validated.value,
      presentation: {
        heading: value.heading?.trim() || undefined,
        description: value.description?.trim() || undefined,
        loadBehavior: asLoadBehavior(value.loadBehavior),
        showFullscreenAction: value.showFullscreenAction !== false,
        fullscreenLabel:
          value.fullscreenLabel?.trim() || "Launch full experience",
        moduleKey: value._key,
      },
    },
  };
}
