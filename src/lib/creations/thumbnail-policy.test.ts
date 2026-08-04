import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectImageKind,
  isAllowedCreationThumbnailUrl,
  isPlausibleCreatedAt,
} from "./thumbnail-policy.ts";

describe("creation thumbnail policy", () => {
  it("allows vercel blob https hosts", () => {
    assert.equal(
      isAllowedCreationThumbnailUrl(
        "https://abc123.public.blob.vercel-storage.com/creations/thumbs/th_1.jpg",
      ),
      true,
    );
  });

  it("rejects http and foreign hosts", () => {
    assert.equal(
      isAllowedCreationThumbnailUrl("http://evil.example/x.jpg"),
      false,
    );
    assert.equal(
      isAllowedCreationThumbnailUrl("https://evil.example/x.jpg"),
      false,
    );
  });

  it("detects jpeg/png magic bytes", () => {
    assert.equal(detectImageKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
    assert.equal(
      detectImageKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "png",
    );
  });

  it("validates createdAt windows", () => {
    const now = Date.parse("2026-08-04T12:00:00.000Z");
    assert.equal(isPlausibleCreatedAt("2026-08-04T11:00:00.000Z", now), true);
    assert.equal(isPlausibleCreatedAt("2026-08-06T12:00:00.000Z", now), false);
    assert.equal(isPlausibleCreatedAt("not-a-date", now), false);
  });
});
