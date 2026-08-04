import { z } from "zod";

export const crtPhotocopyConfigSchema = z.object({
  scanlines: z.number().min(0).max(1).default(0.55),
  grain: z.number().min(0).max(1).default(0.35),
  threshold: z.number().min(0).max(1).default(0.42),
  contrast: z.number().min(0).max(1).default(0.55),
  chromaticOffset: z.number().min(0).max(1).default(0.28),
  vignette: z.number().min(0).max(1).default(0.4),
  bloom: z.number().min(0).max(1).default(0.12),
  inkBleed: z.number().min(0).max(1).default(0.25),
  photocopyMix: z.number().min(0).max(1).default(0.7),
});

export type CrtPhotocopyConfig = z.infer<typeof crtPhotocopyConfigSchema>;

export const defaultCrtPhotocopyConfig: CrtPhotocopyConfig =
  crtPhotocopyConfigSchema.parse({});

export const crtPresets = [
  {
    key: "static-channel",
    title: "Static Channel",
    description: "Heavy scanlines and grain with soft chromatic bleed.",
    config: crtPhotocopyConfigSchema.parse({
      scanlines: 0.72,
      grain: 0.55,
      threshold: 0.28,
      contrast: 0.45,
      chromaticOffset: 0.38,
      vignette: 0.5,
      bloom: 0.18,
      photocopyMix: 0.35,
    }),
  },
  {
    key: "xerox-draft",
    title: "Xerox Draft",
    description: "High-threshold photocopy ink with crushed midtones.",
    config: crtPhotocopyConfigSchema.parse({
      scanlines: 0.22,
      grain: 0.4,
      threshold: 0.68,
      contrast: 0.78,
      chromaticOffset: 0.08,
      vignette: 0.35,
      bloom: 0,
      inkBleed: 0.45,
      photocopyMix: 0.92,
    }),
  },
  {
    key: "broadcast-bleed",
    title: "Broadcast Bleed",
    description: "Broadcast CRT with chromatic fringe and gentle glow.",
    config: crtPhotocopyConfigSchema.parse({
      scanlines: 0.48,
      grain: 0.28,
      threshold: 0.35,
      contrast: 0.5,
      chromaticOffset: 0.55,
      vignette: 0.45,
      bloom: 0.32,
      inkBleed: 0.15,
      photocopyMix: 0.55,
    }),
  },
] as const;

export type CrtPresetKey = (typeof crtPresets)[number]["key"];

export function parseCrtConfig(value: unknown): CrtPhotocopyConfig {
  const parsed = crtPhotocopyConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultCrtPhotocopyConfig;
}

/** Map CRT config onto the shared document.postprocessing fields. */
export function crtConfigToPostprocessing(config: CrtPhotocopyConfig): {
  enabled: boolean;
  grain: number;
  vignette: number;
  bloom: number;
  chromaticOffset: number;
} {
  return {
    enabled: true,
    grain: config.grain,
    vignette: config.vignette,
    bloom: config.bloom,
    chromaticOffset: config.chromaticOffset,
  };
}
