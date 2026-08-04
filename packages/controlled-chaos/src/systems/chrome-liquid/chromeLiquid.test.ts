import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseChromeConfig,
  chromePresets,
} from "./chromeLiquid.schema.js";
import {
  parseCrtConfig,
  crtPresets,
  crtConfigToPostprocessing,
} from "../crt-photocopy/crtPhotocopy.schema.js";
import { postprocessingBudget } from "../../quality/quality-presets.js";
import { createDefaultPosterCreation } from "../../serialization/posterCreation.schema.js";
import {
  ACTIVE_VISUAL_SYSTEM_KEYS,
  getVisualSystemDefinition,
  listRegisteredVisualSystems,
} from "../registry.js";

describe("chrome liquid + crt systems", () => {
  it("parses chrome config with defaults", () => {
    const config = parseChromeConfig({ liquidAmplitude: 0.9 });
    assert.equal(config.liquidAmplitude, 0.9);
    assert.ok(config.metalness > 0);
  });

  it("exposes chrome presets", () => {
    assert.equal(chromePresets.length, 3);
    assert.equal(chromePresets[0]?.key, "molten-signal");
  });

  it("parses crt config and maps postprocessing", () => {
    const config = parseCrtConfig({ scanlines: 0.8, grain: 0.5 });
    assert.equal(config.scanlines, 0.8);
    const post = crtConfigToPostprocessing(config);
    assert.equal(post.enabled, true);
    assert.equal(post.grain, 0.5);
  });

  it("exposes crt presets", () => {
    assert.equal(crtPresets.length, 3);
    assert.equal(crtPresets[1]?.key, "xerox-draft");
  });

  it("registers chrome and crt in the visual system registry", () => {
    assert.deepEqual([...ACTIVE_VISUAL_SYSTEM_KEYS], [
      "particle-disintegration",
      "chrome-liquid",
      "crt-photocopy",
    ]);
    assert.ok(getVisualSystemDefinition("chrome-liquid"));
    assert.ok(getVisualSystemDefinition("crt-photocopy"));
    assert.equal(listRegisteredVisualSystems().length, 3);
  });

  it("builds chrome and crt documents from presets", () => {
    const chrome = createDefaultPosterCreation({
      presetKey: "mirror-grid",
      seed: "mirror01",
    });
    assert.equal(chrome.visualSystem.key, "chrome-liquid");
    assert.equal(chrome.typography.phrase, "MIRROR");

    const crt = createDefaultPosterCreation({
      presetKey: "xerox-draft",
      seed: "xerox01",
    });
    assert.equal(crt.visualSystem.key, "crt-photocopy");
    assert.equal(crt.postprocessing.enabled, true);
  });

  it("scales postprocessing budget by quality", () => {
    const low = postprocessingBudget("low");
    const high = postprocessingBudget("high");
    assert.equal(low.allowChromatic, false);
    assert.equal(low.allowBloom, false);
    assert.equal(high.allowChromatic, true);
    assert.ok(high.resolutionScale >= low.resolutionScale);
  });
});
