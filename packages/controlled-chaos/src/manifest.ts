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
  packageVersion: "0.12.2",
  stateSchemaVersion: 1,
  embedConfigVersion: 1,
  assetBasePath: "/experiences/controlled-chaos",
  presets: [
    { key: "signal-failure", title: "Signal Failure" },
    { key: "grid-bloom", title: "Grid Bloom" },
    { key: "cold-open", title: "Cold Open" },
    { key: "molten-signal", title: "Molten Signal" },
    { key: "mirror-grid", title: "Mirror Grid" },
    { key: "black-ice", title: "Black Ice" },
    { key: "static-channel", title: "Static Channel" },
    { key: "xerox-draft", title: "Xerox Draft" },
    { key: "broadcast-bleed", title: "Broadcast Bleed" },
    { key: "helium-drop", title: "Helium Drop" },
    { key: "balloon-grid", title: "Balloon Grid" },
    { key: "soft-pressure", title: "Soft Pressure" },
    { key: "rubber-band", title: "Rubber Band" },
    { key: "spring-lattice", title: "Spring Lattice" },
    { key: "rebound", title: "Rebound" },
    { key: "rough-tear", title: "Rough Tear" },
    { key: "collage-stack", title: "Collage Stack" },
    { key: "edge-fray", title: "Edge Fray" },
    { key: "brutal-stack", title: "Brutal Stack" },
    { key: "column-grid", title: "Column Grid" },
    { key: "cantilever", title: "Cantilever" },
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
