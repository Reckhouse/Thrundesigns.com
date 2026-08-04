/**
 * Server-safe audio reactive configuration.
 * Local file bytes are never serialized — only built-in track keys and gains.
 */

import { z } from "zod";

export const AUDIO_TRACK_KEYS = [
  "pulse-drone",
  "grid-click",
  "signal-hum",
] as const;

export type AudioTrackKey = (typeof AUDIO_TRACK_KEYS)[number];

export const audioModeSchema = z.enum(["off", "curated", "local"]);

export const audioReactiveConfigSchema = z.object({
  mode: audioModeSchema.default("off"),
  trackKey: z.enum(AUDIO_TRACK_KEYS).default("pulse-drone"),
  gain: z.number().min(0).max(1).default(0.65),
  sensitivity: z.number().min(0).max(2).default(1),
  bassWeight: z.number().min(0).max(2).default(1.1),
  midWeight: z.number().min(0).max(2).default(0.85),
  trebleWeight: z.number().min(0).max(2).default(0.55),
  energyWeight: z.number().min(0).max(2).default(1),
  beatWeight: z.number().min(0).max(2).default(1.25),
  /** Global scale for visual displacement / post modulation. */
  displacementAmount: z.number().min(0).max(2).default(1),
  /** How hard beat envelopes punch reactive motion. */
  beatBoost: z.number().min(0).max(2).default(0.7),
  reactive: z.boolean().default(true),
});

export type AudioReactiveConfig = z.infer<typeof audioReactiveConfigSchema>;

export const defaultAudioReactiveConfig: AudioReactiveConfig =
  audioReactiveConfigSchema.parse({});

export const CURATED_AUDIO_TRACKS = [
  {
    key: "pulse-drone" as const,
    title: "Pulse Drone",
    description: "Low pulsing drone for bass-led displacement.",
  },
  {
    key: "grid-click" as const,
    title: "Grid Click",
    description: "Rhythmic mid clicks with sparse highs.",
  },
  {
    key: "signal-hum" as const,
    title: "Signal Hum",
    description: "Sustained hum with soft treble shimmer.",
  },
] as const;

/** Curated routing presets — applied via setAudioConfig, not a separate key. */
export const AUDIO_ROUTING_PRESETS = [
  {
    key: "bass-led",
    title: "Bass Led",
    description: "Heavy lows with punchy beat envelopes.",
    config: {
      bassWeight: 1.45,
      midWeight: 0.55,
      trebleWeight: 0.35,
      energyWeight: 1.1,
      beatWeight: 1.4,
      beatBoost: 0.95,
      displacementAmount: 1.15,
    },
  },
  {
    key: "balanced",
    title: "Balanced",
    description: "Even band routing for general composition.",
    config: {
      bassWeight: 1.05,
      midWeight: 0.95,
      trebleWeight: 0.7,
      energyWeight: 1,
      beatWeight: 1.15,
      beatBoost: 0.65,
      displacementAmount: 1,
    },
  },
  {
    key: "treble-spark",
    title: "Treble Spark",
    description: "Bright highs with lighter body motion.",
    config: {
      bassWeight: 0.55,
      midWeight: 0.85,
      trebleWeight: 1.45,
      energyWeight: 0.9,
      beatWeight: 1.05,
      beatBoost: 0.5,
      displacementAmount: 0.95,
    },
  },
  {
    key: "beat-punch",
    title: "Beat Punch",
    description: "Aggressive beat envelopes for rhythmic posters.",
    config: {
      bassWeight: 1.15,
      midWeight: 0.75,
      trebleWeight: 0.45,
      energyWeight: 1.2,
      beatWeight: 1.75,
      beatBoost: 1.35,
      displacementAmount: 1.25,
    },
  },
] as const;

export type AudioRoutingPresetKey = (typeof AUDIO_ROUTING_PRESETS)[number]["key"];

export function parseAudioConfig(value: unknown): AudioReactiveConfig {
  const parsed = audioReactiveConfigSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultAudioReactiveConfig;
}

/** Ephemeral analyser output — refs/typed arrays only, never persisted. */
export type AudioBands = {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  beat: number;
};

export function emptyAudioBands(): AudioBands {
  return { bass: 0, mid: 0, treble: 0, energy: 0, beat: 0 };
}
