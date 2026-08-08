/**
 * Server-safe Counterspace Field Laboratory manifest.
 * Must not import Three.js or browser-only APIs.
 */

export type CounterspaceMode = "preview" | "inline";
export type CounterspaceQuality = "auto" | "low" | "medium" | "high";
export type CounterspaceControls = "none" | "minimal" | "full";

export type CounterspacePreset = {
  key: string;
  title: string;
};

export type CounterspaceManifest = {
  experienceKey: "counterspace-field-laboratory";
  title: string;
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
  assetBasePath: string;
  presets: readonly CounterspacePreset[];
  modes: readonly CounterspaceMode[];
  quality: readonly CounterspaceQuality[];
  controls: readonly CounterspaceControls[];
  capabilities: {
    textEditing: boolean;
    svgUpload: boolean;
    audio: boolean;
    export: boolean;
  };
  defaultHeight: number;
  labPath: string;
};

export const counterspaceManifest = {
  experienceKey: "counterspace-field-laboratory",
  title: "Counterspace Field Laboratory",
  packageVersion: "0.1.0",
  stateSchemaVersion: 1,
  embedConfigVersion: 1,
  assetBasePath: "/experiences/counterspace",
  presets: [
    { key: "twin-orbit", title: "Twin Orbit" },
    { key: "pressure-vessel", title: "Pressure Vessel" },
    { key: "axial-rotor", title: "Axial Engine" },
  ],
  modes: ["preview", "inline"] as const,
  quality: ["auto", "low", "medium", "high"] as const,
  controls: ["none", "minimal", "full"] as const,
  capabilities: {
    textEditing: false,
    svgUpload: false,
    audio: false,
    export: false,
  },
  defaultHeight: 720,
  labPath: "/lab/counterspace",
} as const satisfies CounterspaceManifest;
