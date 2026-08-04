import {
  getExperienceServerPlugin,
  missingExperienceError,
} from "@/experiences/registry.server";
import type {
  ExperienceCompatibilityError,
  ExperienceCompatibilityResult,
  ExperienceEmbedConfiguration,
  ExperienceMode,
  PortfolioExperienceManifest,
  PortfolioExperienceRenderConfig,
} from "@/experiences/types";

/**
 * Compatibility helpers shared by mapper / API / Studio tooling.
 * Server-safe — no Three.js imports.
 */

export function assertExperienceRegistered(
  experienceKey: string,
): ExperienceCompatibilityResult<PortfolioExperienceManifest> {
  const plugin = getExperienceServerPlugin(experienceKey);
  if (!plugin) {
    return missingExperienceError(experienceKey);
  }
  return { ok: true, value: plugin.manifest };
}

export function assertPresetSupported(
  manifest: PortfolioExperienceManifest,
  presetKey: string | undefined | null,
): ExperienceCompatibilityResult<true> {
  if (!presetKey) {
    return { ok: true, value: true };
  }
  const ok = manifest.presets.some((preset) => preset.key === presetKey);
  if (!ok) {
    return {
      ok: false,
      code: "unsupported_preset",
      experienceKey: manifest.experienceKey,
      message: `Preset "${presetKey}" is not available for ${manifest.title}.`,
      details: { presets: manifest.presets.map((p) => p.key) },
    };
  }
  return { ok: true, value: true };
}

export function assertModeSupported(
  manifest: PortfolioExperienceManifest,
  mode: ExperienceMode,
): ExperienceCompatibilityResult<true> {
  if (!manifest.modes.includes(mode)) {
    return {
      ok: false,
      code: "unsupported_mode",
      experienceKey: manifest.experienceKey,
      message: `Mode "${mode}" is not supported by ${manifest.title}.`,
      details: { modes: manifest.modes },
    };
  }
  return { ok: true, value: true };
}

export function assertEmbedVersionSupported(
  manifest: PortfolioExperienceManifest,
  embedConfigVersion: number,
): ExperienceCompatibilityResult<true> {
  if (embedConfigVersion !== manifest.embedConfigVersion) {
    return {
      ok: false,
      code: "unsupported_embed_version",
      experienceKey: manifest.experienceKey,
      message: `Embed configuration version ${embedConfigVersion} is unsupported (package supports ${manifest.embedConfigVersion}).`,
    };
  }
  return { ok: true, value: true };
}

export function assertStateVersionSupported(
  manifest: PortfolioExperienceManifest,
  stateSchemaVersion: number,
): ExperienceCompatibilityResult<true> {
  if (stateSchemaVersion !== manifest.stateSchemaVersion) {
    return {
      ok: false,
      code: "unsupported_state_version",
      experienceKey: manifest.experienceKey,
      message: `Creation state version ${stateSchemaVersion} is unsupported (package supports ${manifest.stateSchemaVersion}).`,
    };
  }
  return { ok: true, value: true };
}

export function validateExperienceEmbedConfig(
  experienceKey: string,
  value: unknown,
): ExperienceCompatibilityResult<PortfolioExperienceRenderConfig> {
  const plugin = getExperienceServerPlugin(experienceKey);
  if (!plugin) {
    return missingExperienceError(experienceKey);
  }

  try {
    const configuration = plugin.validateEmbedConfig(
      value,
    ) as ExperienceEmbedConfiguration;
    return {
      ok: true,
      value: {
        experienceKey,
        configuration,
        launchUrl: plugin.buildLaunchUrl(configuration),
        versions: {
          packageVersion: plugin.manifest.packageVersion,
          stateSchemaVersion: plugin.manifest.stateSchemaVersion,
          embedConfigVersion: plugin.manifest.embedConfigVersion,
        },
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid embed configuration";
    return {
      ok: false,
      code: "invalid_configuration",
      experienceKey,
      message,
      details: error,
    } satisfies ExperienceCompatibilityError;
  }
}

export function formatCompatibilityWarning(
  error: ExperienceCompatibilityError,
): string {
  const key = error.experienceKey ? ` [${error.experienceKey}]` : "";
  return `[experience${key}] ${error.code}: ${error.message}`;
}
