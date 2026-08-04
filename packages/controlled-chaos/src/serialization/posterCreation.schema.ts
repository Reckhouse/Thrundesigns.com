/**
 * PosterCreationV1 — serializable document state.
 * Server-safe Zod schemas (no Three.js).
 */

import { z } from "zod";
import { DEFAULT_FONT_KEY, FONT_KEYS } from "../typography/font-manifest";
import { createRandomSeed } from "../seed/createSeededRandom";
import {
  defaultParticleDisintegrationConfig,
  particlePresets,
} from "../systems/particle-disintegration/particleDisintegration.schema";

export const VISUAL_SYSTEM_KEYS = [
  "particle-disintegration",
  "chrome-liquid",
  "inflatable-type",
  "crt-photocopy",
  "torn-paper",
  "elastic-type",
  "type-architecture",
  "audio-displacement",
] as const;

export type VisualSystemKey = (typeof VISUAL_SYSTEM_KEYS)[number];

const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

export const paletteSchema = z.object({
  background: z.string().min(4).max(32),
  primary: z.string().min(4).max(32),
  secondary: z.string().min(4).max(32),
  accent: z.string().min(4).max(32),
});

export const typographySchema = z.object({
  phrase: z
    .string()
    .min(1)
    .max(120)
    .refine((value) => value.trim().length > 0, {
      message: "Phrase cannot be empty",
    }),
  fontKey: z.enum(FONT_KEYS),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  letterSpacing: z.number().min(-0.2).max(1).default(0.04),
  lineHeight: z.number().min(0.8).max(2.5).default(1.15),
  caseTransform: z.enum(["none", "uppercase", "lowercase"]).default("uppercase"),
  maxWidth: z.number().positive().max(2).default(0.9),
  depth: z.number().min(0).max(0.4).default(0.06),
  bevel: z.number().min(0).max(0.08).default(0.012),
});

export const visualSystemStateSchema = z.object({
  key: z.enum(VISUAL_SYSTEM_KEYS),
  version: z.number().int().positive().default(1),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const posterCreationV1Schema = z.object({
  schemaVersion: z.literal(1),
  seed: z.string().min(1).max(64),
  title: z.string().min(1).max(120).optional(),

  document: z.object({
    aspectRatio: z.literal("9:16"),
    width: z.number().int().positive().default(1080),
    height: z.number().int().positive().default(1920),
    background: z
      .object({
        mode: z.enum(["solid", "gradient"]).default("solid"),
        color: z.string().min(4).max(32).optional(),
      })
      .default({ mode: "solid" }),
    loopDurationSeconds: z.union([z.literal(6), z.literal(8), z.literal(12)]),
  }),

  typography: typographySchema,

  asset: z
    .object({
      type: z.literal("svg"),
      assetId: z.string().optional(),
      normalizedSvg: z.string().max(180_000).optional(),
      checksum: z.string().min(4).max(64),
    })
    .optional(),

  composition: z.object({
    position: vec3Schema.default([0, 0, 0.07]),
    rotation: vec3Schema.default([0, 0, 0]),
    scale: vec3Schema.default([1, 1, 1]),
    safeAreaEnabled: z.boolean().default(true),
  }),

  visualSystem: visualSystemStateSchema,

  palette: paletteSchema,

  camera: z.object({
    type: z.enum(["perspective", "orthographic"]).default("perspective"),
    position: vec3Schema.default([0, 0, 3.2]),
    target: vec3Schema.default([0, 0, 0]),
    fieldOfView: z.number().min(10).max(90).default(35),
    zoom: z.number().positive().optional(),
    motionPreset: z.string().default("subtle-breath"),
    motionIntensity: z.number().min(0).max(2).default(0.35),
  }),

  lighting: z.object({
    environmentKey: z.string().default("studio-warm"),
    keyIntensity: z.number().min(0).max(4).default(1.35),
    fillIntensity: z.number().min(0).max(4).default(0.35),
    rimIntensity: z.number().min(0).max(4).default(0.45),
    exposure: z.number().min(0.2).max(3).default(1),
  }),

  postprocessing: z.object({
    enabled: z.boolean().default(false),
    grain: z.number().min(0).max(1).default(0.15),
    vignette: z.number().min(0).max(1).default(0.2),
    bloom: z.number().min(0).max(1).default(0),
    chromaticOffset: z.number().min(0).max(1).default(0),
  }),
});

export type PosterCreationV1 = z.infer<typeof posterCreationV1Schema>;
export type PosterPalette = z.infer<typeof paletteSchema>;
export type PosterTypography = z.infer<typeof typographySchema>;

export const DEFAULT_PHRASE = "CHANGE ME";

const PRESET_DEFAULTS: Record<
  string,
  Partial<{
    phrase: string;
    fontKey: (typeof FONT_KEYS)[number];
    palette: PosterPalette;
    seed: string;
  }>
> = {
  "signal-failure": {
    phrase: "SIGNAL FAILURE",
    fontKey: "helvetiker-bold",
    seed: "signal01",
    palette: {
      background: "#0c0d0c",
      primary: "#ebe7df",
      secondary: "#8a6a38",
      accent: "#d4af6a",
    },
  },
  "grid-bloom": {
    phrase: "GRID BLOOM",
    fontKey: "optimer-bold",
    seed: "gridbloom",
    palette: {
      background: "#121410",
      primary: "#f4f1e9",
      secondary: "#5c6b52",
      accent: "#d4af6a",
    },
  },
  "cold-open": {
    phrase: "COLD OPEN",
    fontKey: "gentilis-regular",
    seed: "coldopen",
    palette: {
      background: "#0a0c10",
      primary: "#d7dde8",
      secondary: "#6a7385",
      accent: "#9bb0c9",
    },
  },
};

export function createDefaultPosterCreation(
  options?: {
    presetKey?: string;
    phrase?: string;
    seed?: string;
  },
): PosterCreationV1 {
  const preset = options?.presetKey
    ? PRESET_DEFAULTS[options.presetKey]
    : undefined;

  const particlePreset = options?.presetKey
    ? particlePresets.find((entry) => entry.key === options.presetKey)
    : undefined;

  const draft = {
    schemaVersion: 1 as const,
    seed: options?.seed ?? preset?.seed ?? createRandomSeed(),
    title: options?.presetKey?.replace(/-/g, " "),
    document: {
      aspectRatio: "9:16" as const,
      width: 1080,
      height: 1920,
      background: { mode: "solid" as const, color: undefined },
      loopDurationSeconds: 8 as const,
    },
    typography: {
      phrase: options?.phrase ?? preset?.phrase ?? DEFAULT_PHRASE,
      fontKey: preset?.fontKey ?? DEFAULT_FONT_KEY,
      alignment: "center" as const,
      letterSpacing: 0.04,
      lineHeight: 1.15,
      caseTransform: "uppercase" as const,
      maxWidth: 0.9,
      depth: 0.06,
      bevel: 0.012,
    },
    composition: {
      position: [0, 0.05, 0.07] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      safeAreaEnabled: true,
    },
    visualSystem: {
      key: "particle-disintegration" as const,
      version: 1,
      config:
        particlePreset?.config ?? defaultParticleDisintegrationConfig,
    },
    palette: preset?.palette ?? {
      background: "#0c0d0c",
      primary: "#ebe7df",
      secondary: "#8a6a38",
      accent: "#d4af6a",
    },
    camera: {
      type: "perspective" as const,
      position: [0, 0, 3.2] as [number, number, number],
      target: [0, 0, 0] as [number, number, number],
      fieldOfView: 35,
      motionPreset: "subtle-breath",
      motionIntensity: 0.35,
    },
    lighting: {
      environmentKey: "studio-warm",
      keyIntensity: 1.35,
      fillIntensity: 0.35,
      rimIntensity: 0.45,
      exposure: 1,
    },
    postprocessing: {
      enabled: false,
      grain: 0.15,
      vignette: 0.2,
      bloom: 0,
      chromaticOffset: 0,
    },
  };

  return posterCreationV1Schema.parse(draft);
}

export function normalizePhrase(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, 120);
}

export function countPhraseLines(phrase: string): number {
  return phrase.split("\n").filter((line) => line.length > 0).length;
}

export function validatePhraseInput(
  raw: string,
): { ok: true; value: string } | { ok: false; message: string } {
  const value = normalizePhrase(raw);
  if (!value) {
    return { ok: false, message: "Enter a phrase to continue." };
  }
  if (countPhraseLines(value) > 5) {
    return { ok: false, message: "Use at most 5 lines." };
  }
  return { ok: true, value };
}
