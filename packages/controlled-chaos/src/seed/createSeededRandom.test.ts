import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSeededRandom } from "./createSeededRandom.js";

describe("createSeededRandom", () => {
  it("reproduces the same sequence for the same seed", () => {
    const a = createSeededRandom("signal01");
    const b = createSeededRandom("signal01");
    const seqA = Array.from({ length: 8 }, () => a.next());
    const seqB = Array.from({ length: 8 }, () => b.next());
    assert.deepEqual(seqA, seqB);
  });

  it("diverges for different seeds", () => {
    const a = createSeededRandom("signal01");
    const b = createSeededRandom("coldopen");
    assert.notEqual(a.next(), b.next());
  });

  it("nextInt stays in range", () => {
    const rng = createSeededRandom("range-check");
    for (let i = 0; i < 50; i += 1) {
      const value = rng.nextInt(2, 5);
      assert.ok(value >= 2 && value < 5);
    }
  });
});
