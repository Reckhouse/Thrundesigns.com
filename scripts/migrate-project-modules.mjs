/**
 * One-time migration: move legacy project.body / project.gallery into modules[].
 *
 * Usage:
 *   npm run migrate:project-modules
 *
 * Requires SANITY_API_WRITE_TOKEN (or SANITY_API_READ_TOKEN with write) and
 * NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET in .env.local.
 */
import { createClient } from "@sanity/client";
import { randomUUID } from "node:crypto";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "fbuy6kak";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";
const token =
  process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

if (!token) {
  console.error("Missing SANITY_API_WRITE_TOKEN in environment.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

function key() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

const projects = await client.fetch(`
  *[_type == "project" && (defined(body) || defined(gallery))]{
    _id,
    title,
    body,
    gallery,
    modules
  }
`);

if (!projects.length) {
  console.log("No projects with legacy body/gallery found.");
  process.exit(0);
}

let patched = 0;

for (const project of projects) {
  const existing = Array.isArray(project.modules) ? project.modules : [];
  const additions = [];

  const hasRichText = existing.some((m) => m?._type === "projectRichText");
  const hasGallery = existing.some((m) => m?._type === "projectGallery");

  if (project.body?.length && !hasRichText) {
    additions.push({
      _type: "projectRichText",
      _key: key(),
      body: project.body,
    });
  }

  if (project.gallery?.length && !hasGallery) {
    additions.push({
      _type: "projectGallery",
      _key: key(),
      layout: "grid",
      items: project.gallery.map((item) => ({
        ...item,
        _key: item._key || key(),
        _type: item._type || "mediaAsset",
      })),
    });
  }

  if (!additions.length) {
    console.log(`Skip ${project.title || project._id}: modules already cover legacy fields`);
    continue;
  }

  await client
    .patch(project._id)
    .setIfMissing({ modules: [] })
    .insert("after", "modules[-1]", additions)
    .commit({ autoGenerateArrayKeys: true });

  patched += 1;
  console.log(
    `Migrated ${project.title || project._id}: +${additions.map((a) => a._type).join(", ")}`,
  );
}

console.log(`Done. Patched ${patched} project(s).`);
