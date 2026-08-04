import type { ComponentType } from "react";

/**
 * Shared portfolio experience types.
 * Server-safe — no Three.js / R3F imports.
 */

export type ExperienceMode = "preview" | "inline" | "replay";
export type ExperienceQuality = "auto" | "low" | "medium" | "high";
export type ExperienceControls = "none" | "minimal" | "full";
export type ExperienceLoadBehavior = "interaction" | "viewport" | "immediate";

export type ExperienceVersionReference = {
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
};

export type PortfolioExperiencePreset = {
  key: string;
  title: string;
};

export type PortfolioExperienceManifest = {
  experienceKey: string;
  title: string;
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
  assetBasePath: string;
  presets: readonly PortfolioExperiencePreset[];
  modes: readonly ExperienceMode[];
  quality: readonly ExperienceQuality[];
  controls: readonly ExperienceControls[];
  capabilities: {
    textEditing: boolean;
    svgUpload: boolean;
    audio: boolean;
    export: boolean;
  };
  defaultHeight: number;
  labPath: string;
};

/** Validated package embed configuration (package-specific shape, opaque here). */
export type ExperienceEmbedConfiguration = Record<string, unknown> & {
  mode: ExperienceMode;
  embedConfigVersion: number;
  height: number;
};

export type PortfolioExperienceRenderConfig = {
  experienceKey: string;
  configuration: ExperienceEmbedConfiguration;
  launchUrl: string;
  versions: ExperienceVersionReference;
};

export type ExperienceCompatibilityErrorCode =
  | "unknown_experience_key"
  | "missing_package"
  | "unsupported_preset"
  | "unsupported_mode"
  | "unsupported_quality"
  | "unsupported_controls"
  | "unsupported_embed_version"
  | "unsupported_state_version"
  | "invalid_configuration"
  | "capability_mismatch";

export type ExperienceCompatibilityError = {
  ok: false;
  code: ExperienceCompatibilityErrorCode;
  experienceKey?: string;
  message: string;
  details?: unknown;
};

export type ExperienceCompatibilitySuccess<T> = {
  ok: true;
  value: T;
};

export type ExperienceCompatibilityResult<T> =
  | ExperienceCompatibilitySuccess<T>
  | ExperienceCompatibilityError;

export type ExperienceComponentModule = {
  default: ComponentType<Record<string, unknown>>;
};

export type PortfolioExperienceServerPlugin = {
  manifest: PortfolioExperienceManifest;
  validateEmbedConfig: (value: unknown) => ExperienceEmbedConfiguration;
  buildLaunchUrl: (configuration: ExperienceEmbedConfiguration) => string;
};

export type PortfolioExperienceClientPlugin = {
  loadPreview: () => Promise<ExperienceComponentModule>;
  loadExperience: () => Promise<ExperienceComponentModule>;
  loadReplay?: () => Promise<ExperienceComponentModule>;
};

export type PortfolioExperiencePlugin = PortfolioExperienceServerPlugin &
  PortfolioExperienceClientPlugin;
