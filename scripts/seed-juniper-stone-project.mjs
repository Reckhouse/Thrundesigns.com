/**
 * Create or update the Juniper & Stone Coffee branding case study.
 *
 * Usage:
 *   npm run seed:juniper-stone
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

const SLUG = "juniper-and-stone-coffee";
const IMG = "/images/juniper-stone";

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
      _key: "jsBrief",
      heading: "Built from a blank slate",
      body: [
        portableParagraph(
          "Juniper & Stone Coffee Co. needed a complete brand before the first bag shipped — mark, system, packaging language, and a digital storefront rooted in Colorado Springs. The brief was place-first: Front Range light, red rock geology, and the quiet ritual of a daily cup. Nothing existed to evolve; every decision had to invent the voice and make it feel inevitable.",
          "jsBrief1",
        ),
        portableParagraph(
          "We designed the identity end to end: a topographic coffee-bean mark that reads as both landscape and roast, an earthy palette of forest green and layered stone, lockups for cup and signage, and a website that carries the same grounded restraint from hero to product detail.",
          "jsBrief2",
        ),
      ],
    },
    {
      _type: "projectProcess",
      _key: "jsProcess",
      heading: "From place to system",
      steps: [
        {
          _key: "jsStep1",
          title: "Discover",
          body: "Map the landscape metaphors — juniper, layered stone, Front Range ritual — and the tone of a specialty coffee brand that feels local without becoming costume.",
        },
        {
          _key: "jsStep2",
          title: "Mark",
          body: "Shape the bean as a vertical icon: topographic contour in the crown, sediment bands below, center fissure as a quiet mountain peak.",
        },
        {
          _key: "jsStep3",
          title: "System",
          body: "Lock type, palette, and horizontal/wordmark lockups so packaging, signage, and web share one artisanal voice.",
        },
        {
          _key: "jsStep4",
          title: "Apply",
          body: "Extend the system into ecommerce frames, kraft bag labels, takeaway cups, and an exterior hanging sign.",
        },
      ],
    },
    {
      _type: "projectSplit",
      _key: "jsMark",
      mediaPosition: "left",
      media: media("jsMarkMedia", "bean-mark-color.png", "Color topographic coffee bean mark for Juniper & Stone", {
        displayWidth: "half",
        aspectRatio: "3/2",
        objectFit: "contain",
      }),
      body: [
        {
          _type: "block",
          _key: "jsMarkH3",
          style: "h3",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "jsMarkH3C",
              marks: [],
              text: "A bean that holds the landscape",
            },
          ],
        },
        portableParagraph(
          "The mark splits like a roast fissure. Upper contours suggest juniper growth and topo maps; lower bands read as stone strata. Forest green, terracotta, and charcoal keep the icon warm and grounded — readable at cup size and on a hanging sign.",
          "jsMarkP",
        ),
      ],
    },
    {
      _type: "projectGallery",
      _key: "jsFoundations",
      layout: "grid",
      caption: "Foundations — mark study, Illustrator lockups, and Figma system frames",
      items: [
        media("jsFound1", "bean-mark-bw.png", "Black-and-white topographic coffee bean mark study", {
          displayWidth: "third",
          aspectRatio: "3/2",
          objectFit: "contain",
        }),
        media("jsFound2", "illustrator-lockups.png", "Illustrator artboard with logo lockups and color swatches", {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        }),
        media("jsFound3", "figma-desktop-system.png", "Figma desktop website frames for home shop and product detail", {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        }),
      ],
    },
    {
      _type: "projectGallery",
      _key: "jsDigital",
      layout: "fullBleed",
      caption: "Digital product — full site composition",
      items: [
        media("jsDigital1", "website-full-scroll.png", "Full-page website design mockup for Juniper & Stone Coffee", {
          displayWidth: "scroll",
          aspectRatio: "auto",
          objectFit: "contain",
        }),
      ],
    },
    {
      _type: "projectGallery",
      _key: "jsWorld",
      layout: "grid",
      caption: "In the world — brand board, cup, and storefront sign",
      items: [
        media("jsWorld1", "brand-board.png", "Brand identity showcase board with logo packaging and site", {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        }),
        media("jsWorld2", "cup-mockup.png", "Takeaway cup mockup with Juniper & Stone logo", {
          displayWidth: "half",
          aspectRatio: "3/2",
          objectFit: "cover",
        }),
        media("jsWorld3", "storefront-sign.png", "Circular exterior storefront sign hanging on cafe facade", {
          displayWidth: "half",
          aspectRatio: "4/3",
          objectFit: "cover",
        }),
      ],
    },
    {
      _type: "projectCredits",
      _key: "jsCredits",
      items: [
        {
          _key: "jsCredit1",
          role: "Brand identity & digital design",
          name: "Thrun Design Co.",
        },
        {
          _key: "jsCredit2",
          role: "Tools",
          name: "Illustrator, Figma",
        },
      ],
    },
    {
      _type: "projectCta",
      _key: "jsCta",
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
    title: "Juniper & Stone Coffee",
    slug: { _type: "slug", current: SLUG },
    industry: "Specialty coffee · Colorado Springs",
    services: "Brand identity · Visual system · Packaging · Website",
    workCategory: "branding-strategy",
    summary:
      "A from-scratch specialty coffee brand — topographic mark, packaging language, and digital storefront rooted in Colorado Springs.",
    featured: true,
    order: 0,
    cover: {
      _type: "mediaAsset",
      alt: "Juniper & Stone takeaway cup on a granite counter",
      blobUrl: `${IMG}/cup-mockup.png`,
      displayWidth: "full",
      aspectRatio: "3/2",
      objectFit: "cover",
    },
    modules: buildModules(),
    seo: {
      title: "Juniper & Stone Coffee — Brand identity",
      description:
        "From-scratch brand identity for a Colorado Springs specialty coffee company: mark, system, packaging, and website.",
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
  await client.patch(existing._id).set(fields).commit({ autoGenerateArrayKeys: true });
  console.log(`Updated ${existing.title || SLUG} (${existing._id})`);
} else {
  const created = await client.create(doc, { autoGenerateArrayKeys: true });
  console.log(`Created ${created.title} (${created._id})`);
}

console.log("Done.");
