import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPosterLabStore } from "../state/usePosterLabStore.js";
import { createDefaultPosterCreation } from "../serialization/posterCreation.schema.js";

describe("poster lab store history", () => {
  it("supports undo and redo for phrase edits", () => {
    const store = createPosterLabStore({
      document: createDefaultPosterCreation({
        phrase: "CHANGE ME",
        seed: "hist0001",
      }),
    });

    store.getState().setDraftPhrase("SIGNAL");
    const commit = store.getState().commitPhrase();
    assert.equal(commit.ok, true);
    assert.equal(store.getState().document.typography.phrase, "SIGNAL");
    assert.equal(store.getState().past.length, 1);

    store.getState().undo();
    assert.equal(store.getState().document.typography.phrase, "CHANGE ME");
    assert.equal(store.getState().future.length, 1);

    store.getState().redo();
    assert.equal(store.getState().document.typography.phrase, "SIGNAL");
  });

  it("records font changes", () => {
    const store = createPosterLabStore({
      document: createDefaultPosterCreation({ seed: "font0001" }),
    });
    const before = store.getState().document.typography.fontKey;
    store.getState().setFontKey("gentilis-regular");
    assert.notEqual(store.getState().document.typography.fontKey, before);
    assert.equal(store.getState().document.typography.fontKey, "gentilis-regular");
    store.getState().undo();
    assert.equal(store.getState().document.typography.fontKey, before);
  });

  it("switches visual systems and syncs crt postprocessing", () => {
    const store = createPosterLabStore({
      document: createDefaultPosterCreation({ seed: "sys00001" }),
    });
    store.getState().setVisualSystem("chrome-liquid");
    assert.equal(store.getState().document.visualSystem.key, "chrome-liquid");
    assert.equal(store.getState().document.postprocessing.enabled, false);

    store.getState().setVisualSystem("crt-photocopy");
    assert.equal(store.getState().document.visualSystem.key, "crt-photocopy");
    assert.equal(store.getState().document.postprocessing.enabled, true);
  });
});
