import { z } from "zod";

export const tornPaperConfigSchema = z.object({
  tearAmount: z.number().min(0).max(1).default(0.55),
  layerCount: z.number().min(3).max(12).default(7),
  curl: z.number().min(0).max(1).default(0.35),
  drift: z.number().min(0).max(1).default(0.4),
  paperRoughness: z.number().min(0).max(1).default(0.88),
  inkContrast: z.number().min(0).max(1).default(0.55),
  edgeFray: z.number().min(0).max(1).default(0.45),
  overlap: z.number().min(0).max(1).default(0.5),
});

export type TornPaperConfig = z.infer<typeof tornPaperConfigSchema>;

export const defaultTornPaperConfig: TornPaperConfig =
  tornPaperConfigSchema.parse({});

export const tornPaperPresets = [
  {
    key: "rough-tear",
    title: "Rough Tear",
    description: "Jagged layered scraps with strong edge fray.",
    config: tornPaperConfigSchema.parse({
      tearAmount: 0.78,
      layerCount: 8,
      curl: 0.42,
      drift: 0.48,
      edgeFray: 0.7,
      overlap: 0.55,
      inkContrast: 0.65,
    }),
  },
  {
    key: "collage-stack",
    title: "Collage Stack",
    description: "Dense overlapping sheets with restrained curl.",
    config: tornPaperConfigSchema.parse({
      tearAmount: 0.4,
      layerCount: 10,
      curl: 0.22,
      drift: 0.28,
      edgeFray: 0.35,
      overlap: 0.78,
      paperRoughness: 0.92,
      inkContrast: 0.5,
    }),
  },
  {
    key: "edge-fray",
    title: "Edge Fray",
    description: "Sparse frayed plates with slow atmospheric drift.",
    config: tornPaperConfigSchema.parse({
      tearAmount: 0.62,
      layerCount: 5,
      curl: 0.55,
      drift: 0.62,
      edgeFray: 0.85,
      overlap: 0.28,
      inkContrast: 0.72,
    }),
  },
] as const;

export type TornPaperPresetKey = (typeof tornPaperPresets)[number]["key"];

export function parseTornPaperConfig(value: unknown): TornPaperConfig {
  const parsed = tornPaperConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultTornPaperConfig;
}
