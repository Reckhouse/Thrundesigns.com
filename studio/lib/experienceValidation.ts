import {
  getExperienceManifest,
  type ManifestOption,
} from "./experienceManifestOptions";

export type ThreeExperienceValue = {
  experienceKey?: string;
  embedConfigVersion?: number;
  mode?: string;
  initialPresetKey?: string;
  initialCreationId?: string;
  quality?: string;
  controls?: string;
  allowTextEditing?: boolean;
  allowSvgUpload?: boolean;
  allowAudio?: boolean;
  allowExport?: boolean;
  posterImage?: {
    image?: unknown;
    blobUrl?: string;
    alt?: string;
  };
  height?: number;
};

export type ExperienceWarning = {
  code: string;
  message: string;
};

export function collectExperienceWarnings(
  value: ThreeExperienceValue | undefined | null,
): ExperienceWarning[] {
  const warnings: ExperienceWarning[] = [];
  if (!value) {
    warnings.push({
      code: "missing_value",
      message: "Experience configuration is empty",
    });
    return warnings;
  }

  const key = value.experienceKey;
  if (!key) {
    warnings.push({
      code: "missing_experience_key",
      message: "Select an experience",
    });
    return warnings;
  }

  const manifest = getExperienceManifest(key);
  if (!manifest) {
    warnings.push({
      code: "unknown_experience_key",
      message: `Unknown experience key "${key}"`,
    });
    return warnings;
  }

  if (
    value.embedConfigVersion != null &&
    value.embedConfigVersion !== manifest.embedConfigVersion
  ) {
    warnings.push({
      code: "embed_config_migration",
      message: `Embed configuration requires migration (CMS ${value.embedConfigVersion} → package ${manifest.embedConfigVersion})`,
    });
  }

  if (value.mode && !manifest.modes.includes(value.mode)) {
    warnings.push({
      code: "unsupported_mode",
      message: `Mode "${value.mode}" is not supported by the installed package`,
    });
  }

  if (value.initialPresetKey) {
    const ok = manifest.presets.some((p) => p.key === value.initialPresetKey);
    if (!ok) {
      warnings.push({
        code: "unsupported_preset",
        message: `Preset "${value.initialPresetKey}" is not available in the installed package`,
      });
    }
  }

  if (value.mode === "replay" && !value.initialCreationId?.trim()) {
    warnings.push({
      code: "replay_requires_creation",
      message: "Replay mode requires a creation ID",
    });
  }

  const hasPoster = Boolean(
    value.posterImage?.image || value.posterImage?.blobUrl,
  );
  if (!hasPoster) {
    warnings.push({
      code: "missing_poster",
      message: "Fallback image is missing",
    });
  }

  if (value.mode === "preview" && value.controls === "full") {
    warnings.push({
      code: "full_controls_in_preview",
      message: "Full controls are not allowed in preview mode",
    });
  }

  if (value.allowAudio && !manifest.capabilities.audio) {
    warnings.push({
      code: "audio_unsupported",
      message: "Selected experience does not support audio",
    });
  }

  if (value.allowSvgUpload && !manifest.capabilities.svgUpload) {
    warnings.push({
      code: "svg_unsupported",
      message: "Selected experience does not support SVG upload",
    });
  }

  if (value.allowTextEditing && !manifest.capabilities.textEditing) {
    warnings.push({
      code: "text_editing_unsupported",
      message: "Selected experience does not support text editing",
    });
  }

  if (value.allowExport && !manifest.capabilities.export) {
    warnings.push({
      code: "export_unsupported",
      message: "Selected experience does not support export",
    });
  }

  if (
    value.height != null &&
    (value.height < 400 || value.height > 1400)
  ) {
    warnings.push({
      code: "height_out_of_range",
      message: "Height must be between 400 and 1400",
    });
  }

  return warnings;
}

export function optionsOrFallback(
  options: ManifestOption[],
  fallback: ManifestOption[],
): ManifestOption[] {
  return options.length ? options : fallback;
}
