import { z } from "zod";

export const typeArchitectureConfigSchema = z.object({
  massing: z.number().min(0).max(1).default(0.55),
  columnDensity: z.number().min(0).max(1).default(0.4),
  beamWeight: z.number().min(0).max(1).default(0.45),
  elevation: z.number().min(0).max(1).default(0.35),
  gridTightness: z.number().min(0).max(1).default(0.5),
  cantilever: z.number().min(0).max(1).default(0.3),
  facadeDepth: z.number().min(0).max(1).default(0.55),
  rhythm: z.number().min(0).max(1).default(0.4),
});

export type TypeArchitectureConfig = z.infer<
  typeof typeArchitectureConfigSchema
>;

export const defaultTypeArchitectureConfig: TypeArchitectureConfig =
  typeArchitectureConfigSchema.parse({});

export const typeArchitecturePresets = [
  {
    key: "brutal-stack",
    title: "Brutal Stack",
    description: "Heavy stacked slabs with thick beams and deep massing.",
    config: typeArchitectureConfigSchema.parse({
      massing: 0.85,
      columnDensity: 0.35,
      beamWeight: 0.7,
      elevation: 0.25,
      gridTightness: 0.6,
      cantilever: 0.15,
      facadeDepth: 0.75,
      rhythm: 0.3,
    }),
  },
  {
    key: "column-grid",
    title: "Column Grid",
    description: "Regular columnar rhythm with restrained cantilever.",
    config: typeArchitectureConfigSchema.parse({
      massing: 0.45,
      columnDensity: 0.8,
      beamWeight: 0.4,
      elevation: 0.4,
      gridTightness: 0.75,
      cantilever: 0.2,
      facadeDepth: 0.4,
      rhythm: 0.65,
    }),
  },
  {
    key: "cantilever",
    title: "Cantilever",
    description: "Offset floors with strong overhang and elevation.",
    config: typeArchitectureConfigSchema.parse({
      massing: 0.55,
      columnDensity: 0.28,
      beamWeight: 0.5,
      elevation: 0.7,
      gridTightness: 0.35,
      cantilever: 0.85,
      facadeDepth: 0.6,
      rhythm: 0.45,
    }),
  },
] as const;

export type TypeArchitecturePresetKey =
  (typeof typeArchitecturePresets)[number]["key"];

export function parseTypeArchitectureConfig(
  value: unknown,
): TypeArchitectureConfig {
  const parsed = typeArchitectureConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultTypeArchitectureConfig;
}
