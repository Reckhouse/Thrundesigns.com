import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  particleCountForDensity,
  qualityBudget,
  resolveQualityTier,
} from "../../quality/quality-presets.js";
import {
  parseParticleConfig,
  particlePresets,
} from "./particleDisintegration.schema.js";
import { createSeededRandom } from "../../seed/createSeededRandom.js";

describe("particle quality + config", () => {
  it("resolves auto quality with mobile hint to low", () => {
    assert.equal(resolveQualityTier("auto", { mobile: true }), "low");
    assert.equal(resolveQualityTier("high"), "high");
  });

  it("scales particle count by density", () => {
    const budget = qualityBudget("medium").particleCount;
    const dense = particleCountForDensity(budget, 1);
    const sparse = particleCountForDensity(budget, 0.2);
    assert.ok(dense > sparse);
    assert.ok(sparse >= 1500);
  });

  it("parses particle config with defaults", () => {
    const config = parseParticleConfig({ disintegration: 0.9 });
    assert.equal(config.disintegration, 0.9);
    assert.ok(config.density > 0);
  });

  it("exposes curated presets", () => {
    assert.equal(particlePresets.length, 3);
    assert.equal(particlePresets[0]?.key, "signal-failure");
  });

  it("keeps seeded sequences stable for particle attrs", () => {
    const a = createSeededRandom("signal01:particle-attrs");
    const b = createSeededRandom("signal01:particle-attrs");
    assert.deepEqual(
      [a.next(), a.next(), a.next()],
      [b.next(), b.next(), b.next()],
    );
  });
});
