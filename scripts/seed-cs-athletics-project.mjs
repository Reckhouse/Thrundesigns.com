/**
 * Create or update the C$ Athletics branding case study.
 *
 * Usage:
 *   npm run seed:cs-athletics
 *
 * Requires SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID /
 * NEXT_PUBLIC_SANITY_DATASET in .env.local (or environment).
 *
 * Safe to re-run: patches the existing document by slug.
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

const SLUG = "cs-athletics";
const IMG = "/images/cs-athletics";

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

function media(key, file, alt, extras = {}) {
  return {
    _type: "mediaAsset",
    _key: key,
    alt,
    blobUrl: `${IMG}/${file}`,
    ...extras,
  };
}

function buildModules() {
  return [
    {
      _type: "projectRichText",
      _key: "csBrief",
      heading: "Performance meets culture",
      body: [
        portableParagraph(
          "C$ Athletics needed a brand that could live in the gym and on the street — sharp enough for performance apparel, cultural enough for the city. The brief was identity-first: a monogram with bite, a restrained gold-and-charcoal system, apparel concepts, and a storefront that sells the mindset as hard as the product.",
          "csBrief1",
        ),
        portableParagraph(
          "We built the brand end to end: a fused C$ mark, a three-color palette of warm gold, charcoal, and mid-gray, apparel and packaging language around “Built for More,” and a high-contrast ecommerce frame anchored by Discipline Today. Freedom Tomorrow.",
          "csBrief2",
        ),
      ],
    },
    {
      _type: "projectProcess",
      _key: "csProcess",
      heading: "From mark to marketplace",
      steps: [
        {
          _key: "csStep1",
          title: "Position",
          body: "Define the tension between performance and culture — earned effort, urban grit, and a standard people represent with pride.",
        },
        {
          _key: "csStep2",
          title: "Mark",
          body: "Shape a bold italic C$ monogram that reads as currency and commitment, then lock it with the ATHLETICS wordmark.",
        },
        {
          _key: "csStep3",
          title: "System",
          body: "Set gold, charcoal, and gray; write voice around Built for More / Discipline Drives Growth; specify patches, labels, and packaging.",
        },
        {
          _key: "csStep4",
          title: "Apply",
          body: "Extend into apparel concepts and a dark, high-contrast website that converts the brand story into shop flow.",
        },
      ],
    },
    {
      _type: "projectSplit",
      _key: "csMark",
      mediaPosition: "left",
      media: media(
        "csMarkMedia",
        "logo-mark.png",
        "C$ Athletics monogram and ATHLETICS wordmark on textured gray",
        {
          displayWidth: "half",
          aspectRatio: "3/2",
          objectFit: "contain",
        },
      ),
      body: [
        {
          _type: "block",
          _key: "csMarkH3",
          style: "h3",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "csMarkH3C",
              marks: [],
              text: "A mark that earns its keep",
            },
          ],
        },
        portableParagraph(
          "The monogram fuses C and $ into one italic form — currency as commitment. Paired with a heavy italic ATHLETICS lockup, it stays legible on a chest hit, a cap front, and a gold foil pack. Sharp terminals keep it athletic; the slant keeps it moving.",
          "csMarkP",
        ),
      ],
    },
    {
      _type: "projectGallery",
      _key: "csSystem",
      layout: "grid",
      caption: "Brand system — palette, apparel concepts, packaging, and culture",
      items: [
        media(
          "csSystem1",
          "brand-system.jpg",
          "C$ Athletics brand board with logo, palette, apparel, and packaging",
          {
            displayWidth: "wide",
            aspectRatio: "3/2",
            objectFit: "contain",
          },
        ),
        media(
          "csSystem2",
          "brand-apparel.png",
          "C$ Athletics apparel and brand application board",
          {
            displayWidth: "wide",
            aspectRatio: "3/2",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectRichText",
      _key: "csVoice",
      heading: "Built for More",
      body: [
        portableParagraph(
          "PERFORMANCE. CONFIDENCE. DISCIPLINE. EVERYDAY. The voice sits between training floor and city block — short lines, imperative energy, no fluff. Taglines like Built for More and Discipline Drives Growth show up on neck labels, pack lids, and site chrome so the product and the story stay locked.",
          "csVoice1",
        ),
        portableParagraph(
          "Warm gold (#C5A059) carries the premium signal on charcoal (#2E2E2E) and mid-gray (#A3A3A3). Mesh, fleece, and hardware close-ups keep the system tactile; culture photography stays high-contrast and urban so the brand never softens into generic athleisure.",
          "csVoice2",
        ),
      ],
    },
    {
      _type: "projectGallery",
      _key: "csDigital",
      layout: "fullBleed",
      caption: "Digital product — ecommerce storefront",
      items: [
        media(
          "csDigital1",
          "website-mockup.png",
          "C$ Athletics website mockup with hero, product grid, and brand story",
          {
            displayWidth: "scroll",
            aspectRatio: "auto",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectCredits",
      _key: "csCredits",
      items: [
        {
          _key: "csCredit1",
          role: "Brand identity & digital design",
          name: "Thrun Design Co.",
        },
        {
          _key: "csCredit2",
          role: "Tools",
          name: "Illustrator, Figma",
        },
      ],
    },
    {
      _type: "projectCta",
      _key: "csCta",
      eyebrow: "Next step",
      heading: "Start a brand project",
      label: "Request a quote",
      href: "/quote",
    },
  ];
}

function buildDocument() {
  return {
    _type: "project",
    title: "C$ Athletics",
    slug: { _type: "slug", current: SLUG },
    industry: "Athletic apparel · Performance streetwear",
    services: "Brand identity · Visual system · Apparel concepts · Website",
    workCategory: "branding-strategy",
    summary:
      "A performance-streetwear brand system — C$ monogram, gold-and-charcoal palette, apparel language, and a high-contrast storefront built around earned effort.",
    featured: true,
    order: 0,
    cover: {
      _type: "mediaAsset",
      alt: "C$ Athletics monogram and wordmark on textured gray",
      blobUrl: `${IMG}/logo-mark.png`,
      displayWidth: "full",
      aspectRatio: "3/2",
      objectFit: "contain",
    },
    modules: buildModules(),
    seo: {
      title: "C$ Athletics — Brand identity",
      description:
        "Brand identity for C$ Athletics: monogram, visual system, apparel concepts, and ecommerce storefront.",
    },
  };
}

const existing = await client.fetch(
  `*[_type == "project" && slug.current == $slug][0]{ _id, title }`,
  { slug: SLUG },
);

const doc = buildDocument();

if (existing?._id) {
  const { _type, ...fields } = doc;
  await client
    .patch(existing._id)
    .set(fields)
    .commit({ autoGenerateArrayKeys: true });
  console.log(`Updated ${existing.title || SLUG} (${existing._id})`);
} else {
  const created = await client.create(doc, { autoGenerateArrayKeys: true });
  console.log(`Created ${created.title} (${created._id})`);
}

console.log("Done.");
