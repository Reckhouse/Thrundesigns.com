import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeSvgMarkup } from "./SvgSanitizer.js";

describe("sanitizeSvgMarkup", () => {
  it("accepts a simple path svg", () => {
    const result = sanitizeSvgMarkup(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>`,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.match(result.svg, /<path/);
      assert.equal(result.checksum.length, 8);
    }
  });

  it("rejects script tags", () => {
    const result = sanitizeSvgMarkup(
      `<svg><script>alert(1)</script><path d="M0 0"/></svg>`,
    );
    assert.equal(result.ok, false);
  });

  it("rejects event handlers", () => {
    const result = sanitizeSvgMarkup(
      `<svg><path d="M0 0" onclick="alert(1)"/></svg>`,
    );
    assert.equal(result.ok, false);
  });

  it("rejects external hrefs", () => {
    const result = sanitizeSvgMarkup(
      `<svg><a href="https://evil.example"><path d="M0 0"/></a></svg>`,
    );
    assert.equal(result.ok, false);
  });
});
