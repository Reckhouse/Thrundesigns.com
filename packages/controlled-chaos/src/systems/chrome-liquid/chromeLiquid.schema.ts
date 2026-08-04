import { z } from "zod";

export const chromeLightingPresetSchema = z.enum([
  "studio-warm",
  "cold-chrome",
  "gallery-spot",
  "rim-heavy",
]);

export const chromeLiquidConfigSchema = z.object({
  metalness: z.number().min(0).max(1).default(1),
  roughness: z.number().min(0).max(1).default(0.18),
  clearcoat: z.number().min(0).max(1).default(0.85),
  clearcoatRoughness: z.number().min(0).max(1).default(0.12),
  fresnel: z.number().min(0).max(1).default(0.65),
  liquidAmplitude: z.number().min(0).max(1).default(0.45),
  liquidFrequency: z.number().min(0.1).max(4).default(1.35),
  liquidSpeed: z.number().min(0).max(2).default(0.7),
  bevelBoost: z.number().min(0).max(1).default(0.35),
  depthBoost: z.number().min(0).max(1).default(0.4),
  envIntensity: z.number().min(0).max(3).default(1.4),
  lightingPreset: chromeLightingPresetSchema.default("studio-warm"),
});

export type ChromeLiquidConfig = z.infer<typeof chromeLiquidConfigSchema>;
export type ChromeLightingPreset = z.infer<typeof chromeLightingPresetSchema>;

export const defaultChromeLiquidConfig: ChromeLiquidConfig =
  chromeLiquidConfigSchema.parse({});

export const chromePresets = [
  {
    key: "molten-signal",
    title: "Molten Signal",
    description: "Warm gold chrome with pronounced liquid ripples.",
    config: chromeLiquidConfigSchema.parse({
      metalness: 1,
      roughness: 0.14,
      clearcoat: 0.9,
      fresnel: 0.75,
      liquidAmplitude: 0.62,
      liquidFrequency: 1.1,
      liquidSpeed: 0.85,
      lightingPreset: "studio-warm",
      depthBoost: 0.55,
      bevelBoost: 0.5,
    }),
  },
  {
    key: "mirror-grid",
    title: "Mirror Grid",
    description: "Cool silver mirror type with restrained liquid drift.",
    config: chromeLiquidConfigSchema.parse({
      metalness: 1,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      fresnel: 0.55,
      liquidAmplitude: 0.28,
      liquidFrequency: 1.8,
      liquidSpeed: 0.45,
      lightingPreset: "cold-chrome",
      envIntensity: 1.8,
    }),
  },
  {
    key: "black-ice",
    title: "Black Ice",
    description: "Dark chrome with slow, glassy displacement.",
    config: chromeLiquidConfigSchema.parse({
      metalness: 0.95,
      roughness: 0.22,
      clearcoat: 0.7,
      fresnel: 0.85,
      liquidAmplitude: 0.38,
      liquidFrequency: 0.85,
      liquidSpeed: 0.35,
      lightingPreset: "rim-heavy",
      envIntensity: 1.1,
      depthBoost: 0.3,
    }),
  },
] as const;

export type ChromePresetKey = (typeof chromePresets)[number]["key"];

export function parseChromeConfig(value: unknown): ChromeLiquidConfig {
  const parsed = chromeLiquidConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultChromeLiquidConfig;
}

export const CHROME_LIGHTING: Record<
  ChromeLightingPreset,
  {
    key: [number, number, number];
    keyColor: string;
    fill: [number, number, number];
    fillColor: string;
    rim: [number, number, number];
    rimColor: string;
    keyMul: number;
    fillMul: number;
    rimMul: number;
  }
> = {
  "studio-warm": {
    key: [2.6, 3.4, 3.8],
    keyColor: "#fff1dc",
    fill: [-2.2, -0.8, 2.4],
    fillColor: "#c9a66b",
    rim: [0.2, 1.4, -2.2],
    rimColor: "#ffe8c8",
    keyMul: 1.35,
    fillMul: 0.55,
    rimMul: 0.85,
  },
  "cold-chrome": {
    key: [2.2, 2.8, 4.2],
    keyColor: "#e8f0ff",
    fill: [-2.8, 0.4, 2],
    fillColor: "#8aa0b8",
    rim: [-0.4, 1.8, -2.6],
    rimColor: "#d7e4f5",
    keyMul: 1.5,
    fillMul: 0.7,
    rimMul: 1.05,
  },
  "gallery-spot": {
    key: [0.4, 4.2, 2.8],
    keyColor: "#fff8ef",
    fill: [-1.6, -1.2, 1.6],
    fillColor: "#a89878",
    rim: [2.4, 0.6, -1.8],
    rimColor: "#ffffff",
    keyMul: 1.7,
    fillMul: 0.3,
    rimMul: 0.55,
  },
  "rim-heavy": {
    key: [1.8, 2.2, 3.2],
    keyColor: "#f2ebe0",
    fill: [-1.4, -0.6, 1.8],
    fillColor: "#6a645c",
    rim: [-2.6, 1.2, -2.8],
    rimColor: "#d4c4a8",
    keyMul: 0.85,
    fillMul: 0.25,
    rimMul: 1.55,
  },
};
