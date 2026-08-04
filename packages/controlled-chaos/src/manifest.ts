/**
 * Server-safe Controlled Chaos manifest.
 * Must not import Three.js, R3F, or browser-only APIs.
 */

export type ControlledChaosMode = "preview" | "inline" | "replay";
export type ControlledChaosQuality = "auto" | "low" | "medium" | "high";
export type ControlledChaosControls = "none" | "minimal" | "full";

export type ControlledChaosPreset = {
  key: string;
  title: string;
};

export type ControlledChaosManifest = {
  experienceKey: "controlled-chaos-poster-lab";
  title: string;
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
  assetBasePath: string;
  presets: readonly ControlledChaosPreset[];
  modes: readonly ControlledChaosMode[];
  quality: readonly ControlledChaosQuality[];
  controls: readonly ControlledChaosControls[];
  capabilities: {
    textEditing: boolean;
    svgUpload: boolean;
    audio: boolean;
    export: boolean;
  };
  defaultHeight: number;
  labPath: string;
};

export const controlledChaosManifest = {
  experienceKey: "controlled-chaos-poster-lab",
  title: "Controlled Chaos Poster Lab",
  packageVersion: "0.1.0",
  stateSchemaVersion: 1,
  embedConfigVersion: 1,
  assetBasePath: "/experiences/controlled-chaos",
  presets: [
    { key: "signal-failure", title: "Signal Failure" },
    { key: "grid-bloom", title: "Grid Bloom" },
    { key: "cold-open", title: "Cold Open" },
  ],
  modes: ["preview", "inline", "replay"] as const,
  quality: ["auto", "low", "medium", "high"] as const,
  controls: ["none", "minimal", "full"] as const,
  capabilities: {
    textEditing: true,
    svgUpload: true,
    audio: true,
    export: true,
  },
  defaultHeight: 720,
  labPath: "/lab/controlled-chaos",
} as const satisfies ControlledChaosManifest;
