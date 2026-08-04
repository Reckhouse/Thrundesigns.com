import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultPosterCreation } from "../serialization/posterCreation.schema.js";
import { hardenPosterCreationForPersist } from "./hardenCreation.js";

describe("hardenPosterCreationForPersist", () => {
  it("accepts a default document", () => {
    const doc = createDefaultPosterCreation({ seed: "harden01" });
    const result = hardenPosterCreationForPersist(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.state.seed, "harden01");
    }
  });

  it("clears local audio mode for persistence", () => {
    const doc = createDefaultPosterCreation({ seed: "harden02" });
    doc.audio.mode = "local";
    const result = hardenPosterCreationForPersist(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.state.audio.mode, "off");
    }
  });

  it("rejects SVG with scripts", () => {
    const doc = createDefaultPosterCreation({ seed: "harden03" });
    doc.asset = {
      type: "svg",
      normalizedSvg: `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`,
      checksum: "bad",
    };
    const result = hardenPosterCreationForPersist(doc);
    assert.equal(result.ok, false);
  });

  it("scrubs control characters from titles", () => {
    const doc = createDefaultPosterCreation({ seed: "harden04" });
    doc.title = "Signal\u0000Failure<>";
    const result = hardenPosterCreationForPersist(doc);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.state.title, "SignalFailure");
    }
  });
});
