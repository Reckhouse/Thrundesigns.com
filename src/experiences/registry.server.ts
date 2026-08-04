import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";
import {
  controlledChaosEmbedConfigSchema,
  type ControlledChaosEmbedConfig,
} from "@thrun-design/controlled-chaos/schemas";
import type {
  ExperienceCompatibilityError,
  ExperienceEmbedConfiguration,
  PortfolioExperienceManifest,
  PortfolioExperienceServerPlugin,
} from "@/experiences/types";

/**
 * Server-safe experience registry.
 * May import manifests and schemas only — never Three.js / R3F / WebGL.
 */

function buildControlledChaosLaunchUrl(
  configuration: ExperienceEmbedConfiguration,
): string {
  const config = configuration as ControlledChaosEmbedConfig;
  const url = new URL(
    controlledChaosManifest.labPath,
    "https://thrundesign.local",
  );

  url.searchParams.set("mode", config.mode);
  if (config.initialPresetKey) {
    url.searchParams.set("preset", config.initialPresetKey);
  }
  if (config.initialCreationId) {
    url.searchParams.set("creation", config.initialCreationId);
  }
  if (config.quality && config.quality !== "auto") {
    url.searchParams.set("quality", config.quality);
  }

  return `${url.pathname}${url.search}`;
}

function validateControlledChaosEmbedConfig(
  value: unknown,
): ExperienceEmbedConfiguration {
  const parsed = controlledChaosEmbedConfigSchema.parse(value);
  return parsed as ExperienceEmbedConfiguration;
}

export const experienceRegistryServer = {
  "controlled-chaos-poster-lab": {
    manifest: controlledChaosManifest as PortfolioExperienceManifest,
    validateEmbedConfig: validateControlledChaosEmbedConfig,
    buildLaunchUrl: buildControlledChaosLaunchUrl,
  },
} as const satisfies Record<string, PortfolioExperienceServerPlugin>;

export type RegisteredExperienceKey = keyof typeof experienceRegistryServer;

export function listRegisteredExperienceKeys(): RegisteredExperienceKey[] {
  return Object.keys(
    experienceRegistryServer,
  ) as RegisteredExperienceKey[];
}

export function getExperienceServerPlugin(
  experienceKey: string,
): PortfolioExperienceServerPlugin | null {
  if (experienceKey in experienceRegistryServer) {
    return experienceRegistryServer[
      experienceKey as RegisteredExperienceKey
    ];
  }
  return null;
}

export function getExperienceManifest(
  experienceKey: string,
): PortfolioExperienceManifest | null {
  return getExperienceServerPlugin(experienceKey)?.manifest ?? null;
}

export function missingExperienceError(
  experienceKey: string,
): ExperienceCompatibilityError {
  return {
    ok: false,
    code: "unknown_experience_key",
    experienceKey,
    message: `Unknown experience key "${experienceKey}". Register it in the experience registry.`,
  };
}
