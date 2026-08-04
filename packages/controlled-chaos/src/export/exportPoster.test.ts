import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveVideoFpsLadder,
  selectRecorderMimeType,
} from "./exportPoster.js";

describe("export mime ladder", () => {
  it("prefers vp9 when supported", () => {
    const mime = selectRecorderMimeType(
      (type) => type === "video/webm;codecs=vp9",
    );
    assert.equal(mime, "video/webm;codecs=vp9");
  });

  it("falls back through the ladder", () => {
    const mime = selectRecorderMimeType((type) => type === "video/webm");
    assert.equal(mime, "video/webm");
  });

  it("returns undefined when nothing is supported", () => {
    assert.equal(selectRecorderMimeType(() => false), undefined);
  });
});

describe("export fps ladder", () => {
  it("degrades for low quality", () => {
    assert.deepEqual(resolveVideoFpsLadder(30, "low"), [24, 15, 12]);
  });

  it("keeps preferred fps first for high quality", () => {
    const ladder = resolveVideoFpsLadder(30, "high");
    assert.equal(ladder[0], 30);
    assert.ok(ladder.includes(24));
    assert.ok(ladder.includes(15));
  });
});
