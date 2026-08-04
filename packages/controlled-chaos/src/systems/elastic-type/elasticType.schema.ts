import { z } from "zod";

export const elasticTypeConfigSchema = z.object({
  stiffness: z.number().min(0).max(1).default(0.55),
  damping: z.number().min(0).max(1).default(0.42),
  stretch: z.number().min(0).max(1).default(0.48),
  mass: z.number().min(0.1).max(2).default(0.5),
  gravityScale: z.number().min(0).max(1).default(0.08),
  oscillation: z.number().min(0).max(1).default(0.4),
  neighborCoupling: z.number().min(0).max(1).default(0.35),
  pointerCoupling: z.number().min(0).max(1).default(0.55),
  letterGap: z.number().min(0).max(0.2).default(0.04),
});

export type ElasticTypeConfig = z.infer<typeof elasticTypeConfigSchema>;

export const defaultElasticTypeConfig: ElasticTypeConfig =
  elasticTypeConfigSchema.parse({});

export const elasticPresets = [
  {
    key: "rubber-band",
    title: "Rubber Band",
    description: "Snappy springs with medium stretch and rebound.",
    config: elasticTypeConfigSchema.parse({
      stiffness: 0.7,
      damping: 0.35,
      stretch: 0.55,
      oscillation: 0.5,
      neighborCoupling: 0.45,
      pointerCoupling: 0.7,
    }),
  },
  {
    key: "spring-lattice",
    title: "Spring Lattice",
    description: "Tight lattice coupling with restrained travel.",
    config: elasticTypeConfigSchema.parse({
      stiffness: 0.85,
      damping: 0.55,
      stretch: 0.28,
      oscillation: 0.25,
      neighborCoupling: 0.7,
      gravityScale: 0.04,
      pointerCoupling: 0.4,
      letterGap: 0.025,
    }),
  },
  {
    key: "rebound",
    title: "Rebound",
    description: "Loose springs with long elastic travel.",
    config: elasticTypeConfigSchema.parse({
      stiffness: 0.35,
      damping: 0.28,
      stretch: 0.78,
      oscillation: 0.62,
      neighborCoupling: 0.22,
      mass: 0.65,
      gravityScale: 0.14,
      pointerCoupling: 0.8,
    }),
  },
] as const;

export type ElasticPresetKey = (typeof elasticPresets)[number]["key"];

export function parseElasticConfig(value: unknown): ElasticTypeConfig {
  const parsed = elasticTypeConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultElasticTypeConfig;
}
