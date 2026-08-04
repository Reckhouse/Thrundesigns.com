export type VisualSystemCapabilities = {
  supportsText: boolean;
  supportsSvg: boolean;
  supportsAudio: boolean;
  supportsPointerForces: boolean;
  supportsPhysics: boolean;
  supportsSeamlessLoop: boolean;
  supportsStillExport: boolean;
  supportsVideoExport: boolean;
};

export type VisualSystemPreset<TConfig> = {
  key: string;
  title: string;
  description: string;
  config: TConfig;
};

export type VisualSystemDefinition<TConfig> = {
  key: string;
  version: number;
  title: string;
  description: string;
  capabilities: VisualSystemCapabilities;
  defaultConfig: TConfig;
  presets: Array<VisualSystemPreset<TConfig>>;
  parseConfig: (value: unknown) => TConfig;
};

export type ForceMode =
  | "push"
  | "pull"
  | "repel"
  | "attract"
  | "tear"
  | "explode"
  | "smear"
  | "distort";

export type PointerForce = {
  position: [number, number, number];
  previousPosition: [number, number, number];
  velocity: [number, number, number];
  radius: number;
  strength: number;
  pressure: number;
  mode: ForceMode;
  active: boolean;
};

export const defaultPointerForce = (): PointerForce => ({
  position: [0, 0, 0],
  previousPosition: [0, 0, 0],
  velocity: [0, 0, 0],
  radius: 0.28,
  strength: 0.85,
  pressure: 0,
  mode: "push",
  active: false,
});
