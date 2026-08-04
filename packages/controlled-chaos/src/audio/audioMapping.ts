/**
 * Shared audio → visual mapping helpers.
 * Server-safe (no Web Audio / Three). Frame loops should call these with refs.
 */

import type { AudioBands, AudioReactiveConfig } from "./audio.schema";

export type AudioBandMix = {
  bass?: number;
  mid?: number;
  treble?: number;
  energy?: number;
  beat?: number;
};

export const AUDIO_MIX_PROFILES = {
  /** Particles / inflatable — body + beat. */
  bodyBeat: { bass: 0.5, mid: 0.15, treble: 0.08, energy: 0.28, beat: 0.55 },
  /** Chrome liquid — smoother mid/treble shimmer. */
  liquid: { bass: 0.4, mid: 0.3, treble: 0.2, energy: 0.25, beat: 0.45 },
  /** Elastic / architecture — mid-forward oscillation. */
  spring: { bass: 0.25, mid: 0.4, treble: 0.12, energy: 0.3, beat: 0.5 },
  /** Torn paper — soft mid drift. */
  paper: { bass: 0.2, mid: 0.4, treble: 0.15, energy: 0.28, beat: 0.4 },
  /** CRT post stack — grain/scan/chroma punch. */
  crt: { bass: 0.25, mid: 0.2, treble: 0.35, energy: 0.25, beat: 0.65 },
} as const satisfies Record<string, Required<AudioBandMix>>;

export type AudioMixProfile = keyof typeof AUDIO_MIX_PROFILES;

export function isAudioReactiveEnabled(
  audio: Pick<AudioReactiveConfig, "mode" | "reactive">,
  reducedMotion = false,
): boolean {
  return audio.mode !== "off" && audio.reactive && !reducedMotion;
}

/**
 * Drive gain for visual systems. Band values already include sensitivity
 * from the analyser, so this only scales by gain × displacementAmount.
 */
export function audioDriveGain(
  audio: AudioReactiveConfig,
  reducedMotion = false,
): number {
  if (!isAudioReactiveEnabled(audio, reducedMotion)) return 0;
  return Math.max(0, audio.gain * audio.displacementAmount);
}

export function mixAudioBands(
  bands: AudioBands,
  mix: AudioBandMix = AUDIO_MIX_PROFILES.bodyBeat,
): number {
  return (
    bands.bass * (mix.bass ?? 0) +
    bands.mid * (mix.mid ?? 0) +
    bands.treble * (mix.treble ?? 0) +
    bands.energy * (mix.energy ?? 0) +
    bands.beat * (mix.beat ?? 0)
  );
}

/**
 * Returns a multiplicative factor ≥ 1 for transforms/uniforms.
 * `beatBoost` from config adds a short punch on top of the band mix.
 */
export function audioMul(
  bands: AudioBands,
  driveGain: number,
  mix: AudioBandMix = AUDIO_MIX_PROFILES.bodyBeat,
  beatBoost = 0.7,
): number {
  if (driveGain <= 0) return 1;
  const body = mixAudioBands(bands, mix);
  const pulse = bands.beat * beatBoost * 0.55;
  return 1 + driveGain * (body * 0.85 + pulse);
}

/** Additive 0–~2 influence useful for post opacity / chromatic deltas. */
export function audioInfluence(
  bands: AudioBands,
  driveGain: number,
  mix: AudioBandMix = AUDIO_MIX_PROFILES.crt,
  beatBoost = 0.7,
): number {
  if (driveGain <= 0) return 0;
  return Math.min(
    2,
    driveGain * (mixAudioBands(bands, mix) * 0.7 + bands.beat * beatBoost * 0.5),
  );
}
