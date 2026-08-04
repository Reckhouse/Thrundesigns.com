import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUDIO_ROUTING_PRESETS,
  CURATED_AUDIO_TRACKS,
  emptyAudioBands,
  parseAudioConfig,
} from "./audio.schema.js";
import {
  AUDIO_MIX_PROFILES,
  audioDriveGain,
  audioInfluence,
  audioMul,
  isAudioReactiveEnabled,
  mixAudioBands,
} from "./audioMapping.js";
import { createDefaultPosterCreation } from "../serialization/posterCreation.schema.js";
import { createPosterLabStore } from "../state/usePosterLabStore.js";
import { getVisualSystemDefinition } from "../systems/registry.js";

describe("audio reactive config", () => {
  it("parses defaults and patches", () => {
    const config = parseAudioConfig({ gain: 0.4, mode: "curated" });
    assert.equal(config.mode, "curated");
    assert.equal(config.gain, 0.4);
    assert.equal(config.reactive, true);
    assert.ok(config.sensitivity > 0);
    assert.ok(config.displacementAmount > 0);
    assert.ok(config.beatBoost > 0);
    assert.ok(config.energyWeight > 0);
    assert.ok(config.beatWeight > 0);
  });

  it("exposes curated tracks and routing presets", () => {
    assert.equal(CURATED_AUDIO_TRACKS.length, 3);
    assert.equal(CURATED_AUDIO_TRACKS[0]?.key, "pulse-drone");
    assert.equal(AUDIO_ROUTING_PRESETS.length, 4);
    assert.equal(AUDIO_ROUTING_PRESETS[3]?.key, "beat-punch");
  });

  it("starts documents with audio off", () => {
    const doc = createDefaultPosterCreation({ seed: "audio001" });
    assert.equal(doc.audio.mode, "off");
    assert.deepEqual(emptyAudioBands().energy, 0);
  });

  it("records audio config in store history", () => {
    const store = createPosterLabStore({
      document: createDefaultPosterCreation({ seed: "audio002" }),
    });
    store.getState().setAudioConfig({ mode: "curated", trackKey: "grid-click" });
    assert.equal(store.getState().document.audio.mode, "curated");
    assert.equal(store.getState().document.audio.trackKey, "grid-click");
    store.getState().undo();
    assert.equal(store.getState().document.audio.mode, "off");
  });

  it("applies routing presets through the store", () => {
    const store = createPosterLabStore({
      document: createDefaultPosterCreation({ seed: "audio003" }),
    });
    const preset = AUDIO_ROUTING_PRESETS.find((entry) => entry.key === "bass-led");
    assert.ok(preset);
    store.getState().setAudioConfig({ mode: "curated", ...preset.config });
    const audio = store.getState().document.audio;
    assert.equal(audio.bassWeight, preset.config.bassWeight);
    assert.equal(audio.beatBoost, preset.config.beatBoost);
  });
});

describe("audio mapping helpers", () => {
  it("gates reactive drive on mode and reduced motion", () => {
    const on = parseAudioConfig({ mode: "curated", gain: 0.8 });
    assert.equal(isAudioReactiveEnabled(on, false), true);
    assert.equal(isAudioReactiveEnabled(on, true), false);
    assert.equal(audioDriveGain(on, false), 0.8);
    assert.equal(audioDriveGain(on, true), 0);
  });

  it("computes band mixes and multiplicative drive", () => {
    const bands = {
      bass: 1,
      mid: 0.5,
      treble: 0.25,
      energy: 0.8,
      beat: 1,
    };
    const mixed = mixAudioBands(bands, AUDIO_MIX_PROFILES.bodyBeat);
    assert.ok(mixed > 1);
    const mul = audioMul(bands, 1, AUDIO_MIX_PROFILES.liquid, 1);
    assert.ok(mul > 1);
    const influence = audioInfluence(bands, 1, AUDIO_MIX_PROFILES.crt, 1);
    assert.ok(influence > 0);
    assert.ok(influence <= 2);
  });

  it("marks CRT as audio-capable", () => {
    assert.equal(
      getVisualSystemDefinition("crt-photocopy")?.capabilities.supportsAudio,
      true,
    );
  });
});
