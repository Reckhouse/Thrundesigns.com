/**
 * Server-safe Living Engraving manifest.
 * Must not import Three.js, R3F, or browser-only APIs.
 */

export type LivingEngravingMode = "preview" | "inline";
export type LivingEngravingQuality = "auto" | "low" | "medium" | "high";
export type LivingEngravingControls = "none" | "minimal" | "full";

export type LivingEngravingPreset = {
  key: string;
  title: string;
};

export type LivingEngravingManifest = {
  experienceKey: "living-engraving-horse";
  title: string;
  packageVersion: string;
  stateSchemaVersion: number;
  embedConfigVersion: number;
  assetBasePath: string;
  presets: readonly LivingEngravingPreset[];
  modes: readonly LivingEngravingMode[];
  quality: readonly LivingEngravingQuality[];
  controls: readonly LivingEngravingControls[];
  capabilities: {
    textEditing: boolean;
    svgUpload: boolean;
    audio: boolean;
    export: boolean;
  };
  defaultHeight: number;
  labPath: string;
};

export const livingEngravingManifest = {
  experienceKey: "living-engraving-horse",
  title: "Living Engraving",
  packageVersion: "0.1.0",
  stateSchemaVersion: 1,
  embedConfigVersion: 1,
  assetBasePath: "/experiences/living-engraving",
  presets: [
    { key: "centered-cameo", title: "Centered cameo" },
    { key: "hero-offset", title: "Hero offset" },
    { key: "print-static", title: "Print / static" },
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
  defaultHeight: 640,
  labPath: "/lab/living-engraving",
} as const satisfies LivingEngravingManifest;
