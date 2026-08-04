import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseTornPaperConfig,
  tornPaperPresets,
} from "./tornPaper.schema.js";
import {
  parseTypeArchitectureConfig,
  typeArchitecturePresets,
} from "../type-architecture/typeArchitecture.schema.js";
import { createDefaultPosterCreation } from "../../serialization/posterCreation.schema.js";
import {
  ACTIVE_VISUAL_SYSTEM_KEYS,
  getVisualSystemDefinition,
  listRegisteredVisualSystems,
} from "../registry.js";

describe("torn paper + type architecture systems", () => {
  it("parses torn paper config with defaults", () => {
    const config = parseTornPaperConfig({ tearAmount: 0.9, layerCount: 9 });
    assert.equal(config.tearAmount, 0.9);
    assert.equal(config.layerCount, 9);
    assert.ok(config.curl > 0);
  });

  it("exposes torn paper presets", () => {
    assert.equal(tornPaperPresets.length, 3);
    assert.equal(tornPaperPresets[0]?.key, "rough-tear");
  });

  it("parses type architecture config with defaults", () => {
    const config = parseTypeArchitectureConfig({
      massing: 0.8,
      cantilever: 0.7,
    });
    assert.equal(config.massing, 0.8);
    assert.equal(config.cantilever, 0.7);
    assert.ok(config.columnDensity >= 0);
  });

  it("exposes type architecture presets", () => {
    assert.equal(typeArchitecturePresets.length, 3);
    assert.equal(typeArchitecturePresets[1]?.key, "column-grid");
  });

  it("registers Phase 9 systems in the visual system registry", () => {
    assert.deepEqual([...ACTIVE_VISUAL_SYSTEM_KEYS], [
      "particle-disintegration",
      "chrome-liquid",
      "crt-photocopy",
      "inflatable-type",
      "elastic-type",
      "torn-paper",
      "type-architecture",
    ]);
    assert.ok(getVisualSystemDefinition("torn-paper"));
    assert.ok(getVisualSystemDefinition("type-architecture"));
    assert.equal(listRegisteredVisualSystems().length, 7);
  });

  it("builds torn paper and architecture documents from presets", () => {
    const torn = createDefaultPosterCreation({
      presetKey: "rough-tear",
      seed: "rought01",
    });
    assert.equal(torn.visualSystem.key, "torn-paper");
    assert.equal(torn.typography.phrase, "TORN");

    const architecture = createDefaultPosterCreation({
      presetKey: "brutal-stack",
      seed: "brutal01",
    });
    assert.equal(architecture.visualSystem.key, "type-architecture");
    assert.equal(architecture.typography.phrase, "BRUTAL");
  });
});
