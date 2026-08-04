import {
  getExperienceServerPlugin,
  listRegisteredExperienceKeys,
} from "@/experiences/registry.server";
import type { PortfolioExperienceManifest } from "@/experiences/types";

/**
 * Manifest helpers for Studio option lists and docs.
 * Server-safe — imports registry.server only.
 */

export function getAllExperienceManifests(): PortfolioExperienceManifest[] {
  return listRegisteredExperienceKeys()
    .map((key) => getExperienceServerPlugin(key)?.manifest)
    .filter((manifest): manifest is PortfolioExperienceManifest =>
      Boolean(manifest),
    );
}

export function experienceKeyOptions(): { title: string; value: string }[] {
  return getAllExperienceManifests().map((manifest) => ({
    title: manifest.title,
    value: manifest.experienceKey,
  }));
}

export function presetOptionsForExperience(
  experienceKey: string,
): { title: string; value: string }[] {
  const plugin = getExperienceServerPlugin(experienceKey);
  if (!plugin) return [];
  return plugin.manifest.presets.map((preset) => ({
    title: preset.title,
    value: preset.key,
  }));
}
