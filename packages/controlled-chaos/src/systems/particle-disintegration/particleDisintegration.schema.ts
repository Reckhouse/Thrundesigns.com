import { z } from "zod";

export const particleShapeSchema = z.enum(["square", "disc", "shard"]);

export const particleDisintegrationConfigSchema = z.object({
  density: z.number().min(0.15).max(1).default(0.65),
  disintegration: z.number().min(0).max(1).default(0.55),
  motion: z.number().min(0).max(1).default(0.45),
  particleShape: particleShapeSchema.default("square"),
  turbulence: z.number().min(0).max(1).default(0.35),
  noiseFrequency: z.number().min(0.1).max(4).default(1.2),
  noiseAmplitude: z.number().min(0).max(1).default(0.4),
  forceRadius: z.number().min(0.05).max(1.2).default(0.28),
  forceStrength: z.number().min(0).max(2).default(0.85),
  reassemblyRate: z.number().min(0).max(1).default(0.55),
  sizeVariation: z.number().min(0).max(1).default(0.35),
  depthSpread: z.number().min(0).max(1).default(0.4),
  edgeBias: z.number().min(0).max(1).default(0.35),
  trailStrength: z.number().min(0).max(1).default(0.15),
});

export type ParticleDisintegrationConfig = z.infer<
  typeof particleDisintegrationConfigSchema
>;

export const defaultParticleDisintegrationConfig: ParticleDisintegrationConfig =
  particleDisintegrationConfigSchema.parse({});

export const particlePresets = [
  {
    key: "signal-failure",
    title: "Signal Failure",
    description: "Edge-biased dissolve with sharp shards and hard returns.",
    config: particleDisintegrationConfigSchema.parse({
      density: 0.7,
      disintegration: 0.72,
      motion: 0.4,
      particleShape: "shard",
      turbulence: 0.55,
      edgeBias: 0.7,
      reassemblyRate: 0.4,
      depthSpread: 0.55,
    }),
  },
  {
    key: "grid-bloom",
    title: "Grid Bloom",
    description: "Soft disc bloom that drifts and reassembles cleanly.",
    config: particleDisintegrationConfigSchema.parse({
      density: 0.8,
      disintegration: 0.42,
      motion: 0.55,
      particleShape: "disc",
      turbulence: 0.25,
      sizeVariation: 0.5,
      reassemblyRate: 0.7,
      trailStrength: 0.25,
    }),
  },
  {
    key: "cold-open",
    title: "Cold Open",
    description: "Sparse square field with restrained, icy motion.",
    config: particleDisintegrationConfigSchema.parse({
      density: 0.45,
      disintegration: 0.35,
      motion: 0.28,
      particleShape: "square",
      turbulence: 0.18,
      noiseAmplitude: 0.25,
      depthSpread: 0.25,
      forceStrength: 1.1,
    }),
  },
] as const;

export type ParticlePresetKey = (typeof particlePresets)[number]["key"];

export function parseParticleConfig(value: unknown): ParticleDisintegrationConfig {
  const parsed = particleDisintegrationConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultParticleDisintegrationConfig;
}
