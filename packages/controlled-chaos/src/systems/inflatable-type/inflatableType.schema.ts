import { z } from "zod";

export const inflatableTypeConfigSchema = z.object({
  inflatePressure: z.number().min(0).max(1).default(0.65),
  bounce: z.number().min(0).max(1).default(0.42),
  mass: z.number().min(0.1).max(2).default(0.55),
  linearDamping: z.number().min(0).max(1).default(0.38),
  angularDamping: z.number().min(0).max(1).default(0.55),
  gravityScale: z.number().min(0).max(1).default(0.12),
  pulseSpeed: z.number().min(0.1).max(3).default(1),
  puffScale: z.number().min(0).max(1).default(0.28),
  letterGap: z.number().min(0).max(0.2).default(0.035),
});

export type InflatableTypeConfig = z.infer<typeof inflatableTypeConfigSchema>;

export const defaultInflatableTypeConfig: InflatableTypeConfig =
  inflatableTypeConfigSchema.parse({});

export const inflatablePresets = [
  {
    key: "helium-drop",
    title: "Helium Drop",
    description: "Soft buoyant letters with a slow inflate pulse.",
    config: inflatableTypeConfigSchema.parse({
      inflatePressure: 0.72,
      bounce: 0.5,
      mass: 0.4,
      gravityScale: 0.06,
      pulseSpeed: 0.85,
      puffScale: 0.34,
      linearDamping: 0.32,
    }),
  },
  {
    key: "balloon-grid",
    title: "Balloon Grid",
    description: "Tighter letter spacing with punchy inflate beats.",
    config: inflatableTypeConfigSchema.parse({
      inflatePressure: 0.8,
      bounce: 0.35,
      mass: 0.7,
      gravityScale: 0.18,
      pulseSpeed: 1.35,
      puffScale: 0.22,
      letterGap: 0.02,
      angularDamping: 0.7,
    }),
  },
  {
    key: "soft-pressure",
    title: "Soft Pressure",
    description: "Heavy damped balloons with restrained bounce.",
    config: inflatableTypeConfigSchema.parse({
      inflatePressure: 0.48,
      bounce: 0.22,
      mass: 0.9,
      gravityScale: 0.2,
      pulseSpeed: 0.55,
      puffScale: 0.18,
      linearDamping: 0.55,
      angularDamping: 0.75,
    }),
  },
] as const;

export type InflatablePresetKey = (typeof inflatablePresets)[number]["key"];

export function parseInflatableConfig(value: unknown): InflatableTypeConfig {
  const parsed = inflatableTypeConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultInflatableTypeConfig;
}
