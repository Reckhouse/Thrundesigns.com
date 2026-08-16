/**
 * Seed baseline page modules for concept showcases so they are editable
 * via the Sanity project.modules drag-and-drop builder.
 *
 * Usage:
 *   npm run seed:concept-modules
 *
 * Requires SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID /
 * NEXT_PUBLIC_SANITY_DATASET in .env.local (or environment).
 *
 * Safe to re-run: skips projects that already have modules.
 */
import { createClient } from "@sanity/client";

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

function portableParagraph(text, keyPrefix) {
  return {
    _type: "block",
    _key: `${keyPrefix}B1`,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${keyPrefix}C1`,
        marks: [],
        text,
      },
    ],
  };
}

const SEEDS = [
  {
    slug: "northline-advisory",
    overview:
      "A focused advisory brand system with editorial restraint. This concept study explores calm authority and a clear digital presence for professional services — speculative work with production intent, not a shipped client engagement.",
    coverAlt: "Mountain ridgeline for Northline Advisory",
    coverBlobUrl: "/images/project-01.jpg",
    keyPrefix: "nl",
  },
  {
    slug: "summit-construction",
    overview:
      "Geometry-forward construction brand presence. This concept study focuses on durable systems and marketing clarity for a construction brand — speculative work with production intent, not a shipped client engagement.",
    coverAlt: "Modern architecture for Summit Construction",
    coverBlobUrl: "/images/project-02.jpg",
    keyPrefix: "su",
  },
  {
    slug: "orbit-systems",
    overview:
      "Technical narrative for a systems-minded product brand. This concept study explores website hierarchy and product storytelling for technology — speculative work with production intent, not a shipped client engagement.",
    coverAlt: "Technical landscape for Orbit Systems",
    coverBlobUrl: "/images/project-03.jpg",
    keyPrefix: "or",
  },
];

function buildModules(seed) {
  const p = seed.keyPrefix;
  return [
    {
      _type: "projectRichText",
      _key: `${p}Overview`,
      heading: "Concept overview",
      body: [portableParagraph(seed.overview, `${p}Overview`)],
    },
    {
      _type: "projectGallery",
      _key: `${p}Gallery`,
      layout: "grid",
      caption: "Cover direction",
      items: [
        {
          _type: "mediaAsset",
          _key: `${p}Cover`,
          alt: seed.coverAlt,
          blobUrl: seed.coverBlobUrl,
        },
      ],
    },
    {
      _type: "projectCta",
      _key: `${p}Cta`,
      eyebrow: "Next step",
      heading: "Start a project conversation",
      label: "Request a quote",
      href: "/quote",
    },
  ];
}

const projects = await client.fetch(
  `*[_type == "project" && slug.current in $slugs]{
    _id,
    title,
    "slug": slug.current,
    modules
  }`,
  { slugs: SEEDS.map((s) => s.slug) },
);

const bySlug = new Map(projects.map((p) => [p.slug, p]));
let patched = 0;

for (const seed of SEEDS) {
  const project = bySlug.get(seed.slug);
  if (!project) {
    console.warn(`Skip ${seed.slug}: project document not found`);
    continue;
  }
  if (Array.isArray(project.modules) && project.modules.length > 0) {
    console.log(
      `Skip ${project.title || seed.slug}: already has ${project.modules.length} module(s)`,
    );
    continue;
  }

  await client
    .patch(project._id)
    .set({ modules: buildModules(seed) })
    .commit({ autoGenerateArrayKeys: true });

  patched += 1;
  console.log(`Seeded modules for ${project.title || seed.slug}`);
}

console.log(`Done. Patched ${patched} project(s).`);
