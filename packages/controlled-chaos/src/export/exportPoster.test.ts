import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { selectRecorderMimeType } from "./exportPoster.js";

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
