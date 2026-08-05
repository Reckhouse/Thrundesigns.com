import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  groupProjectsByWorkCategory,
  isWorkCategoryKey,
  workCategoryLabel,
} from "./work-categories.js";

describe("work categories", () => {
  it("recognizes known keys", () => {
    assert.equal(isWorkCategoryKey("animation-studies"), true);
    assert.equal(isWorkCategoryKey("web-design"), true);
    assert.equal(isWorkCategoryKey("branding-strategy"), true);
    assert.equal(isWorkCategoryKey("other"), false);
  });

  it("labels known categories", () => {
    assert.equal(workCategoryLabel("animation-studies"), "Animation Studies");
    assert.equal(workCategoryLabel("unknown"), "Work");
  });

  it("groups in display order and omits empty categories", () => {
    const rows = groupProjectsByWorkCategory([
      { _id: "a", workCategory: "web-design" },
      { _id: "b", workCategory: "animation-studies" },
      { _id: "c", workCategory: "web-design" },
      { _id: "d", workCategory: null },
      { _id: "e", workCategory: "mystery" },
    ]);

    assert.deepEqual(
      rows.map((row) => row.key),
      ["animation-studies", "web-design"],
    );
    assert.equal(rows[0]?.projects.length, 1);
    assert.equal(rows[1]?.projects.length, 2);
    assert.equal(rows.find((row) => row.key === "branding-strategy"), undefined);
  });
});
