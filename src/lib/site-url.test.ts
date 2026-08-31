import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CANONICAL_SITE_URL,
  getSiteUrl,
  normalizeSiteUrl,
} from "./site-url.js";

describe("site-url", () => {
  it("normalizes apex and legacy vercel.app hosts to www", () => {
    assert.equal(normalizeSiteUrl("https://thrundesigns.com"), CANONICAL_SITE_URL);
    assert.equal(
      normalizeSiteUrl("https://thrundesigns-com.vercel.app"),
      CANONICAL_SITE_URL,
    );
    assert.equal(normalizeSiteUrl("www.thrundesigns.com"), CANONICAL_SITE_URL);
  });

  it("keeps unrelated hosts", () => {
    assert.equal(
      normalizeSiteUrl("https://example.com/path"),
      "https://example.com",
    );
  });

  it("getSiteUrl remaps a stale NEXT_PUBLIC_SITE_URL", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://thrundesigns-com.vercel.app";
    try {
      assert.equal(getSiteUrl(), CANONICAL_SITE_URL);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = previous;
    }
  });
});
