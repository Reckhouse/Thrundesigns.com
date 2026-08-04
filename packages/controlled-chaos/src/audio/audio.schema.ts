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
