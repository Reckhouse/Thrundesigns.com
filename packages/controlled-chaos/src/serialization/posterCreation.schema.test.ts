import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDefaultPosterCreation,
  posterCreationV1Schema,
  validatePhraseInput,
} from "../serialization/posterCreation.schema.js";
import { deserializePosterCreation } from "../serialization/deserializeCreation.js";
import {
  hashPosterCreation,
  serializePosterCreation,
} from "../serialization/serializeCreation.js";
import { canonicalizeCreation } from "../serialization/canonicalizeCreation.js";
import { controlledChaosCreationSchema } from "../schemas.js";
import { layoutPhrase } from "../typography/TextLayout.js";

describe("PosterCreationV1", () => {
  it("builds a valid default document", () => {
    const doc = createDefaultPosterCreation({
      presetKey: "signal-failure",
      seed: "signal01",
    });
    const parsed = posterCreationV1Schema.parse(doc);
    assert.equal(parsed.schemaVersion, 1);
    assert.equal(parsed.typography.phrase, "SIGNAL FAILURE");
    assert.equal(parsed.seed, "signal01");
  });

  it("hashes identically for canonical equivalents", () => {
    const doc = createDefaultPosterCreation({ seed: "abc12345" });
    const left = hashPosterCreation(doc);
    const right = hashPosterCreation(structuredClone(doc));
    assert.equal(left, right);
    assert.equal(
      canonicalizeCreation({ b: 1, a: 2 }),
      canonicalizeCreation({ a: 2, b: 1 }),
    );
  });

  it("serializes into the portfolio creation envelope", () => {
    const doc = createDefaultPosterCreation({ presetKey: "grid-bloom" });
    const payload = serializePosterCreation(doc, {
      presetKey: "grid-bloom",
      createdAt: "2026-08-04T00:00:00.000Z",
    });
    const parsed = controlledChaosCreationSchema.parse(payload);
    assert.equal(parsed.experienceKey, "controlled-chaos-poster-lab");
    assert.equal(parsed.state.typography.fontKey, "optimer-bold");
  });

  it("migrates legacy loose state", () => {
    const migrated = deserializePosterCreation({
      phrase: "LEGACY",
      seed: "legacy01",
    });
    assert.equal(migrated.typography.phrase, "LEGACY");
    assert.equal(migrated.seed, "legacy01");
    assert.equal(migrated.schemaVersion, 1);
  });
});

describe("phrase + layout", () => {
  it("rejects empty phrases", () => {
    const result = validatePhraseInput("   ");
    assert.equal(result.ok, false);
  });

  it("layouts multiline phrases", () => {
    const layout = layoutPhrase({
      phrase: "ONE\nTWO\nTHREE",
      caseTransform: "uppercase",
      letterSpacing: 0.04,
      maxWidth: 0.9,
    });
    assert.equal(layout.lineCount, 3);
    assert.equal(layout.lines[1]?.text, "TWO");
  });
});
