/**
 * Create or update the Juniper & Stone Coffee website design case study.
 *
 * Usage:
 *   npm run seed:juniper-stone-web
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

const SLUG = "juniper-and-stone-website";
const IMG = "/images/juniper-stone-web";

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
      _key: "jswBrief",
      heading: "A storefront rooted in place",
      body: [
        portableParagraph(
          "With the Juniper & Stone identity locked, the website had to carry the same Front Range restraint into ecommerce — cream fields, forest green structure, and photography of red rock and ritual coffee. The work spans homepage storytelling, seasonal shop browsing, and a product detail path that makes tasting notes feel as considered as the roast.",
          "jswBrief1",
        ),
        portableParagraph(
          "This case study focuses on the digital product: desktop page system, long-scroll homepage composition, and how packaging language lands beside the UI. A live walkthrough video will be added once the demo capture is ready.",
          "jswBrief2",
        ),
      ],
    },
    {
      _type: "projectProcess",
      _key: "jswProcess",
      heading: "From IA to detail",
      steps: [
        {
          _key: "jswStep1",
          title: "Structure",
          body: "Map the shopper path — home, shop, product detail, visit — so seasonal coffee and café visits share one calm hierarchy.",
        },
        {
          _key: "jswStep2",
          title: "System",
          body: "Translate brand type, palette, and mark into Figma components for nav, product cards, filters, and PDPs.",
        },
        {
          _key: "jswStep3",
          title: "Compose",
          body: "Build the long-scroll homepage: hero, three-coffee ritual, Source–Roast–Rest–Brew, landscape story, and visit gallery.",
        },
        {
          _key: "jswStep4",
          title: "Detail",
          body: "Finish shop and product frames so tasting notes, grind options, and add-to-cart feel grounded rather than template ecommerce.",
        },
      ],
    },
    {
      _type: "projectGallery",
      _key: "jswScroll",
      layout: "fullBleed",
      caption: "Homepage — full scroll composition",
      items: [
        media(
          "jswScroll1",
          "homepage-scroll.png",
          "Full-page homepage design for Juniper & Stone Coffee Co.",
          {
            displayWidth: "scroll",
            aspectRatio: "auto",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectSplit",
      _key: "jswSystem",
      mediaPosition: "left",
      media: media(
        "jswSystemMedia",
        "figma-desktop-pages.png",
        "Figma desktop frames for home, shop, and product detail",
        {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        },
      ),
      body: [
        {
          _type: "block",
          _key: "jswSystemH3",
          style: "h3",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "jswSystemH3C",
              marks: [],
              text: "Desktop page system",
            },
          ],
        },
        portableParagraph(
          "Home, shop, and product detail share one Figma system: serif headlines, forest-green CTAs, and product cards that keep origin and tasting notes readable. Filters and PDP options stay quiet so the coffee — and the landscape photography — stay loud.",
          "jswSystemP",
        ),
      ],
    },
    {
      _type: "projectGallery",
      _key: "jswWorld",
      layout: "grid",
      caption: "Brand on screen and in hand",
      items: [
        media(
          "jswWorld1",
          "brand-web-composite.png",
          "Website and packaging composite for Juniper & Stone Coffee Co.",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
        media(
          "jswWorld2",
          "cup-mockup.png",
          "Juniper & Stone takeaway cup mockup",
          {
            displayWidth: "half",
            aspectRatio: "3/2",
            objectFit: "cover",
          },
        ),
      ],
    },
    {
      _type: "projectRichText",
      _key: "jswVideoNote",
      heading: "Walkthrough video",
      body: [
        portableParagraph(
          "A recorded website demonstration will live here as a Video module once the capture is ready — uploaded directly in Sanity alongside these frames.",
          "jswVideoNote1",
        ),
      ],
    },
    {
      _type: "projectCredits",
      _key: "jswCredits",
      items: [
        {
          _key: "jswCredit1",
          role: "Website design",
          name: "Thrun Design Co.",
        },
        {
          _key: "jswCredit2",
          role: "Tools",
          name: "Figma",
        },
      ],
    },
    {
      _type: "projectCta",
      _key: "jswCta",
      eyebrow: "Next step",
      heading: "Start a website project",
      label: "Request a quote",
      href: "/quote?type=web",
    },
  ];
}

function buildDocument() {
  return {
    _type: "project",
    title: "Juniper & Stone Coffee Co.",
    slug: { _type: "slug", current: SLUG },
    industry: "Specialty coffee · Colorado Springs",
    services: "Website design · Ecommerce UX · Design system",
    workCategory: "web-design",
    summary:
      "A place-rooted ecommerce site for Juniper & Stone — long-scroll homepage, seasonal shop, and product detail frames that extend the brand into digital.",
    featured: true,
    order: 1,
    cover: {
      _type: "mediaAsset",
      alt: "Juniper & Stone Coffee Co. homepage scroll design",
      blobUrl: `${IMG}/homepage-scroll.png`,
      displayWidth: "scroll",
      aspectRatio: "auto",
      objectFit: "contain",
    },
    modules: buildModules(),
    seo: {
      title: "Juniper & Stone Coffee Co. — Website design",
      description:
        "Website design case study for Juniper & Stone Coffee Co.: homepage scroll, Figma page system, and ecommerce product detail.",
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
  const created = await client.create(
    { _id: "project-juniper-stone-website", ...doc },
    { autoGenerateArrayKeys: true },
  );
  console.log(`Created ${created.title} (${created._id})`);
}

console.log("Done.");
