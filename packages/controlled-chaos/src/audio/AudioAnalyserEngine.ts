/**
 * Web Audio analyser + curated procedural tracks / local decode.
 * Frame consumers read bands via sample() — no React setState in the loop.
 */

import {
  emptyAudioBands,
  type AudioBands,
  type AudioReactiveConfig,
  type AudioTrackKey,
} from "./audio.schema";

export type AudioEngineStatus =
  | "idle"
  | "ready"
  | "playing"
  | "paused"
  | "error";

export class AudioAnalyserEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private source: AudioBufferSourceNode | OscillatorNode | null = null;
  private frequencyData: Uint8Array | null = null;
  private localBuffer: AudioBuffer | null = null;
  private status: AudioEngineStatus = "idle";
  private lastEnergy = 0;
  private beatEnvelope = 0;
  private trackKey: AudioTrackKey = "pulse-drone";
  private mode: AudioReactiveConfig["mode"] = "off";
  private errorMessage: string | null = null;

  getStatus(): AudioEngineStatus {
    return this.status;
  }

  getError(): string | null {
    return this.errorMessage;
  }

  async ensureContext(): Promise<AudioContext> {
    if (this.context) {
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      return this.context;
    }
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.context = new Ctx();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.72;
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.status = "ready";
    return this.context;
  }

  setGain(gain: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.min(1, Math.max(0, gain));
    }
  }

  async loadLocalFile(file: File): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      if (!file.type.startsWith("audio/") && !/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)) {
        return { ok: false, message: "Choose an audio file (mp3, wav, ogg, m4a)." };
      }
      if (file.size > 12_000_000) {
        return { ok: false, message: "Audio file must be under 12 MB." };
      }
      const context = await this.ensureContext();
      const buffer = await file.arrayBuffer();
      this.localBuffer = await context.decodeAudioData(buffer.slice(0));
      this.mode = "local";
      this.errorMessage = null;
      return { ok: true };
    } catch {
      this.errorMessage = "Could not decode that audio file.";
      this.status = "error";
      return { ok: false, message: this.errorMessage };
    }
  }

  async playCurated(trackKey: AudioTrackKey, gain: number): Promise<void> {
    const context = await this.ensureContext();
    this.stopSource();
    this.trackKey = trackKey;
    this.mode = "curated";
    this.setGain(gain);

    const buffer = createCuratedBuffer(context, trackKey);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.gainNode!);
    source.start(0);
    this.source = source;
    this.status = "playing";
    this.errorMessage = null;
  }

  async playLocal(gain: number): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!this.localBuffer) {
      return { ok: false, message: "Load a local audio file first." };
    }
    const context = await this.ensureContext();
    this.stopSource();
    this.mode = "local";
    this.setGain(gain);
    const source = context.createBufferSource();
    source.buffer = this.localBuffer;
    source.loop = true;
    source.connect(this.gainNode!);
    source.start(0);
    this.source = source;
    this.status = "playing";
    this.errorMessage = null;
    return { ok: true };
  }

  pause() {
    if (this.context?.state === "running") {
      void this.context.suspend();
      this.status = "paused";
    }
  }

  async resume() {
    if (!this.context) return;
    await this.context.resume();
    if (this.source) this.status = "playing";
  }

  stop() {
    this.stopSource();
    this.status = this.context ? "ready" : "idle";
    this.lastEnergy = 0;
    this.beatEnvelope = 0;
  }

  /**
   * Sample analyser into `out` (mutates). Safe to call every frame.
   */
  sample(out: AudioBands, config: AudioReactiveConfig): void {
    if (
      !this.analyser ||
      !this.frequencyData ||
      config.mode === "off" ||
      !config.reactive ||
      this.status === "idle" ||
      this.status === "error"
    ) {
      out.bass = 0;
      out.mid = 0;
      out.treble = 0;
      out.energy = 0;
      out.beat = Math.max(0, this.beatEnvelope * 0.92);
      this.beatEnvelope = out.beat;
      return;
    }

    // AnalyserNode typings expect ArrayBuffer-backed Uint8Array; runtime is fine.
    this.analyser.getByteFrequencyData(
      this.frequencyData as Uint8Array<ArrayBuffer>,
    );
    const data = this.frequencyData;
    const n = data.length;
    const bassEnd = Math.max(1, Math.floor(n * 0.12));
    const midEnd = Math.max(bassEnd + 1, Math.floor(n * 0.45));

    let bass = 0;
    let mid = 0;
    let treble = 0;
    for (let i = 0; i < bassEnd; i += 1) bass += data[i]!;
    for (let i = bassEnd; i < midEnd; i += 1) mid += data[i]!;
    for (let i = midEnd; i < n; i += 1) treble += data[i]!;

    bass = (bass / (bassEnd * 255)) * config.bassWeight * config.sensitivity;
    mid =
      (mid / ((midEnd - bassEnd) * 255)) *
      config.midWeight *
      config.sensitivity;
    treble =
      (treble / ((n - midEnd) * 255)) *
      config.trebleWeight *
      config.sensitivity;

    const rawEnergy = Math.min(1.5, bass * 0.5 + mid * 0.35 + treble * 0.15);
    const energy = Math.min(1.5, rawEnergy * config.energyWeight);
    const delta = Math.max(0, rawEnergy - this.lastEnergy);
    this.lastEnergy = rawEnergy * 0.82 + this.lastEnergy * 0.18;
    const attack = 5.2 + config.beatBoost * 4.5;
    const decay = 0.78 - Math.min(0.12, config.beatBoost * 0.04);
    this.beatEnvelope = Math.max(this.beatEnvelope * decay, delta * attack);

    out.bass = Math.min(1.5, bass);
    out.mid = Math.min(1.5, mid);
    out.treble = Math.min(1.5, treble);
    out.energy = energy;
    out.beat = Math.min(1.5, this.beatEnvelope * config.beatWeight);
  }

  dispose() {
    this.stopSource();
    this.localBuffer = null;
    if (this.context) {
      void this.context.close();
    }
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.frequencyData = null;
    this.status = "idle";
  }

  private stopSource() {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // already stopped
      }
      try {
        this.source.disconnect();
      } catch {
        // ignore
      }
      this.source = null;
    }
  }
}

function createCuratedBuffer(
  context: AudioContext,
  trackKey: AudioTrackKey,
): AudioBuffer {
  const sampleRate = context.sampleRate;
  const duration = trackKey === "grid-click" ? 1.0 : 2.0;
  const length = Math.floor(sampleRate * duration);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    let sample = 0;
    if (trackKey === "pulse-drone") {
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.5);
      sample =
        Math.sin(t * Math.PI * 2 * 55) * 0.35 * pulse +
        Math.sin(t * Math.PI * 2 * 110) * 0.12 * pulse;
    } else if (trackKey === "grid-click") {
      const phase = t % 0.25;
      const click = phase < 0.02 ? Math.exp(-phase * 180) : 0;
      sample =
        (Math.random() * 2 - 1) * click * 0.55 +
        Math.sin(t * Math.PI * 2 * 220) * 0.04;
    } else {
      sample =
        Math.sin(t * Math.PI * 2 * 82) * 0.28 +
        Math.sin(t * Math.PI * 2 * 164.5) * 0.1 +
        Math.sin(t * Math.PI * 2 * 980 + Math.sin(t * 3) * 2) * 0.03;
    }
    // Soft fade edges for seamless loop
    const fade = Math.min(1, i / (sampleRate * 0.02), (length - i) / (sampleRate * 0.02));
    data[i] = sample * fade;
  }
  return buffer;
}

export function createAudioBandsRefValue(): AudioBands {
  return emptyAudioBands();
}
