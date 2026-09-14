import { test } from "node:test";
import assert from "node:assert/strict";
import { modelAssetFilename, modelAssetUrl } from "../src/lib/model-asset-url";
import { GET } from "../src/app/api/model-assets/[filename]/route";
const name = "8fa014c4e13cb1a68ddf190619e88ccaef33a7ea.glb";
test("public model mapping is confined to this Sanity dataset", () => {
  assert.equal(
    modelAssetUrl(`https://cdn.sanity.io/files/fbuy6kak/production/${name}`),
    `/api/model-assets/${name}`,
  );
  for (const url of [
    `https://evil.example/files/fbuy6kak/production/${name}`,
    `https://cdn.sanity.io/files/other/production/${name}`,
    `https://cdn.sanity.io/files/fbuy6kak/private/${name}`,
    "https://cdn.sanity.io/files/fbuy6kak/production/secret.json",
  ]) {
    assert.equal(modelAssetFilename(url), null);
  }
});
test("model proxy rejects traversal and arbitrary upstream targets", async () => {
  for (const filename of [
    "../secret",
    "https://evil.example/a.glb",
    "secret.json",
    name + "/extra",
  ]) {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ filename }),
    });
    assert.equal(response.status, 404);
  }
});
