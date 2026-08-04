import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CURATED_AUDIO_TRACKS,
  emptyAudioBands,
  parseAudioConfig,
} from "./audio.schema.js";
import { createDefaultPosterCreation } from "../serialization/posterCreation.schema.js";
import { createPosterLabStore } from "../state/usePosterLabStore.js";

describe("audio reactive config", () => {
  it("parses defaults and patches", () => {
    const config = parseAudioConfig({ gain: 0.4, mode: "curated" });
    assert.equal(config.mode, "curated");
    assert.equal(config.gain, 0.4);
    assert.equal(config.reactive, true);
    assert.ok(config.sensitivity > 0);
  });

  it("exposes curated tracks", () => {
    assert.equal(CURATED_AUDIO_TRACKS.length, 3);
    assert.equal(CURATED_AUDIO_TRACKS[0]?.key, "pulse-drone");
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
});
