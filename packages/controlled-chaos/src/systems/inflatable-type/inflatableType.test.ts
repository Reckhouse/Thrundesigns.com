import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseInflatableConfig,
  inflatablePresets,
} from "./inflatableType.schema.js";
import {
  parseElasticConfig,
  elasticPresets,
} from "../elastic-type/elasticType.schema.js";
import { createDefaultPosterCreation } from "../../serialization/posterCreation.schema.js";
import {
  ACTIVE_VISUAL_SYSTEM_KEYS,
  getVisualSystemDefinition,
  listRegisteredVisualSystems,
} from "../registry.js";

describe("inflatable + elastic type systems", () => {
  it("parses inflatable config with defaults", () => {
    const config = parseInflatableConfig({ inflatePressure: 0.9 });
    assert.equal(config.inflatePressure, 0.9);
    assert.ok(config.bounce > 0);
    assert.ok(config.pulseSpeed > 0);
  });

  it("exposes inflatable presets", () => {
    assert.equal(inflatablePresets.length, 3);
    assert.equal(inflatablePresets[0]?.key, "helium-drop");
  });

  it("parses elastic config with defaults", () => {
    const config = parseElasticConfig({ stiffness: 0.8, stretch: 0.2 });
    assert.equal(config.stiffness, 0.8);
    assert.equal(config.stretch, 0.2);
    assert.ok(config.pointerCoupling > 0);
  });

  it("exposes elastic presets", () => {
    assert.equal(elasticPresets.length, 3);
    assert.equal(elasticPresets[1]?.key, "spring-lattice");
  });

  it("registers physics systems in the visual system registry", () => {
    assert.deepEqual([...ACTIVE_VISUAL_SYSTEM_KEYS], [
      "particle-disintegration",
      "chrome-liquid",
      "crt-photocopy",
      "inflatable-type",
      "elastic-type",
      "torn-paper",
      "type-architecture",
    ]);
    assert.ok(getVisualSystemDefinition("inflatable-type"));
    assert.ok(getVisualSystemDefinition("elastic-type"));
    assert.equal(listRegisteredVisualSystems().length, 7);
    assert.equal(
      getVisualSystemDefinition("inflatable-type")?.capabilities.supportsPhysics,
      true,
    );
    assert.equal(
      getVisualSystemDefinition("elastic-type")?.capabilities.supportsPointerForces,
      true,
    );
  });

  it("builds inflatable and elastic documents from presets", () => {
    const inflatable = createDefaultPosterCreation({
      presetKey: "helium-drop",
      seed: "helium01",
    });
    assert.equal(inflatable.visualSystem.key, "inflatable-type");
    assert.equal(inflatable.typography.phrase, "HELIUM");

    const elastic = createDefaultPosterCreation({
      presetKey: "rubber-band",
      seed: "rubber01",
    });
    assert.equal(elastic.visualSystem.key, "elastic-type");
    assert.equal(elastic.typography.phrase, "RUBBER");
  });
});
