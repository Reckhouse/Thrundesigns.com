import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultPosterCreation } from "@thrun-design/controlled-chaos";
import { parseCreationPayload } from "./store.ts";

describe("parseCreationPayload hardening", () => {
  it("accepts a valid serialized creation", () => {
    const state = createDefaultPosterCreation({ seed: "secure01" });
    const result = parseCreationPayload({
      stateSchemaVersion: 1,
      experienceKey: "controlled-chaos-poster-lab",
      createdAt: new Date().toISOString(),
      state,
      title: "Secure Poster",
    });
    assert.equal(result.ok, true);
  });

  it("rejects foreign thumbnail hosts", () => {
    const state = createDefaultPosterCreation({ seed: "secure02" });
    const result = parseCreationPayload({
      stateSchemaVersion: 1,
      experienceKey: "controlled-chaos-poster-lab",
      createdAt: new Date().toISOString(),
      state,
      thumbnailUrl: "https://evil.example/thumb.jpg",
    });
    assert.equal(result.ok, false);
  });

  it("hardens local audio mode to off", () => {
    const state = createDefaultPosterCreation({ seed: "secure03" });
    state.audio.mode = "local";
    const result = parseCreationPayload({
      stateSchemaVersion: 1,
      experienceKey: "controlled-chaos-poster-lab",
      createdAt: new Date().toISOString(),
      state,
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.state.audio.mode, "off");
    }
  });
});
