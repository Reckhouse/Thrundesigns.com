/**
 * Manifest-derived Sanity option lists.
 * Imports server-safe package entries only — never React/Three.js loaders.
 */

import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";
import { livingEngravingManifest } from "@thrun-design/living-engraving/manifest";
import { counterspaceManifest } from "@thrun-design/counterspace/manifest";

export type ManifestOption = { title: string; value: string };

type ExperienceManifestLike = {
  experienceKey: string;
  title: string;
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
  presets: readonly { key: string; title: string }[];
  modes: readonly string[];
  quality: readonly string[];
  controls: readonly string[];
  capabilities: {
    textEditing: boolean;
    svgUpload: boolean;
    audio: boolean;
    export: boolean;
  };
  defaultHeight: number;
  labPath: string;
};

/** Installed experience manifests available to Studio. */
export const installedExperienceManifests: readonly ExperienceManifestLike[] = [
  livingEngravingManifest,
  controlledChaosManifest,
  counterspaceManifest,
];

export function getExperienceManifest(
  experienceKey: string | undefined | null,
): ExperienceManifestLike | undefined {
  if (!experienceKey) return undefined;
  return installedExperienceManifests.find(
    (manifest) => manifest.experienceKey === experienceKey,
  );
}

export function experienceKeyOptions(): ManifestOption[] {
  return installedExperienceManifests.map((manifest) => ({
    title: manifest.title,
    value: manifest.experienceKey,
  }));
}

export function presetOptionsForExperience(
  experienceKey: string | undefined | null,
): ManifestOption[] {
  const manifest = getExperienceManifest(experienceKey);
  if (!manifest) return [];
  return manifest.presets.map((preset) => ({
    title: preset.title,
    value: preset.key,
  }));
}

export function modeOptionsForExperience(
  experienceKey: string | undefined | null,
): ManifestOption[] {
  const manifest = getExperienceManifest(experienceKey);
  const modes = manifest?.modes ?? ["preview", "inline", "replay"];
  const labels: Record<string, string> = {
    preview: "Preview",
    inline: "Inline",
    replay: "Replay",
  };
  return modes.map((mode) => ({
    title: labels[mode] ?? mode,
    value: mode,
  }));
}

export function qualityOptionsForExperience(
  experienceKey: string | undefined | null,
): ManifestOption[] {
  const manifest = getExperienceManifest(experienceKey);
  const qualities = manifest?.quality ?? ["auto", "low", "medium", "high"];
  const labels: Record<string, string> = {
    auto: "Automatic",
    low: "Performance",
    medium: "Balanced",
    high: "High",
  };
  return qualities.map((quality) => ({
    title: labels[quality] ?? quality,
    value: quality,
  }));
}

export function controlsOptionsForExperience(
  experienceKey: string | undefined | null,
): ManifestOption[] {
  const manifest = getExperienceManifest(experienceKey);
  const controls = manifest?.controls ?? ["none", "minimal", "full"];
  const labels: Record<string, string> = {
    none: "None",
    minimal: "Minimal",
    full: "Full",
  };
  return controls.map((control) => ({
    title: labels[control] ?? control,
    value: control,
  }));
}

export function defaultEmbedConfigVersion(
  experienceKey: string | undefined | null,
): number {
  return (
    getExperienceManifest(experienceKey)?.embedConfigVersion ??
    controlledChaosManifest.embedConfigVersion
  );
}

export function defaultExperienceHeight(
  experienceKey: string | undefined | null,
): number {
  return (
    getExperienceManifest(experienceKey)?.defaultHeight ??
    controlledChaosManifest.defaultHeight
  );
}
