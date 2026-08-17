/**
 * Create or update Hollowbeam branding + website case studies.
 *
 * Usage:
 *   npm run seed:hollowbeam
 *
 * Requires SANITY_API_WRITE_TOKEN (or READ) and Sanity project env.
 * Safe to re-run: patches existing documents by slug.
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

const IMG = "/images/hollowbeam";

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

function brandingModules() {
  return [
    {
      _type: "projectRichText",
      _key: "hbBrandBrief",
      heading: "Architectural soul, modular clarity",
      body: [
        portableParagraph(
          "Hollowbeam is a modular furniture system built for rooms that change. The brand needed a mark as structural as the product — a hollow H beam that reads as both letter and architecture — plus a restrained palette of plaster, anodized silver, oxide, and moss.",
          "hbBrandBrief1",
        ),
        portableParagraph(
          "We defined lockups, inverse treatments, scale tests from favicon to desktop header, and applications on business cards and hang tags so the system stays crisp in trade contexts and on the shop floor.",
          "hbBrandBrief2",
        ),
      ],
    },
    {
      _type: "projectProcess",
      _key: "hbBrandProcess",
      heading: "From beam to system",
      steps: [
        {
          _key: "hbBStep1",
          title: "Concept",
          body: "Distill furniture modularity into a hollow-beam H — structural, empty at the center, built to reconfigure.",
        },
        {
          _key: "hbBStep2",
          title: "Mark",
          body: "Draw the vertical H frame, wordmark tracking, and inverse treatments for dark architectural surfaces.",
        },
        {
          _key: "hbBStep3",
          title: "Palette",
          body: "Set Structural Black, Warm Plaster, Anodized Silver, Oxide, and Muted Moss for product and UI.",
        },
        {
          _key: "hbBStep4",
          title: "Apply",
          body: "Extend lockups to cards, hang tags, and digital scale tests so the mark holds from 16px to header.",
        },
      ],
    },
    {
      _type: "projectGallery",
      _key: "hbBrandMarks",
      layout: "grid",
      caption: "Identity — lockups and palette",
      items: [
        media(
          "hbBrandMarks1",
          "logo-lockups.png",
          "Hollowbeam logo lockups and color palette",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
        media(
          "hbBrandMarks2",
          "logo-applications.png",
          "Hollowbeam logo applications: cards, hang tag, and scale tests",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectSplit",
      _key: "hbBrandUi",
      mediaPosition: "left",
      media: media(
        "hbBrandUiMedia",
        "ui-system.png",
        "Hollowbeam UI system sheet with type, color, and components",
        {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        },
      ),
      body: [
        {
          _type: "block",
          _key: "hbBrandUiH3",
          style: "h3",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "hbBrandUiH3C",
              marks: [],
              text: "UI foundations",
            },
          ],
        },
        portableParagraph(
          "Neue Haas Grotesk for display and text, IBM Plex Mono for specs, Oxide as the primary action. The UI system sheet locks buttons, inputs, data cards, and an 8–64px spacing ladder so ecommerce and the configurator share one architectural voice.",
          "hbBrandUiP",
        ),
      ],
    },
    {
      _type: "projectCredits",
      _key: "hbBrandCredits",
      items: [
        {
          _key: "hbBrandCredit1",
          role: "Brand identity & UI system",
          name: "Thrun Design Co.",
        },
        {
          _key: "hbBrandCredit2",
          role: "Tools",
          name: "Figma, Illustrator",
        },
      ],
    },
    {
      _type: "projectCta",
      _key: "hbBrandCta",
      eyebrow: "Next step",
      heading: "Start a brand project",
      label: "Request a quote",
      href: "/quote",
    },
  ];
}

function websiteModules() {
  return [
    {
      _type: "projectRichText",
      _key: "hbWebBrief",
      heading: "Room to change — on the web",
      body: [
        portableParagraph(
          "Hollowbeam’s site turns modular seating into a clear path: explore the system, configure a layout, and land on a product detail that still feels architectural. Warm plaster fields, Oxide CTAs, and monospace specs keep the digital experience aligned with the brand sheet.",
          "hbWebBrief1",
        ),
        portableParagraph(
          "Key surfaces include the homepage narrative, HB-S1 product page, and a 2D configurator for building L-shaped systems with live dimensions and pricing.",
          "hbWebBrief2",
        ),
      ],
    },
    {
      _type: "projectProcess",
      _key: "hbWebProcess",
      heading: "From story to system builder",
      steps: [
        {
          _key: "hbWStep1",
          title: "Story",
          body: "Homepage hero and process strip — start small, configure, reconfigure, expand.",
        },
        {
          _key: "hbWStep2",
          title: "Product",
          body: "HB-S1 detail page with starting configurations, materials, and compatible additions.",
        },
        {
          _key: "hbWStep3",
          title: "Configure",
          body: "2D workspace with module adders, fabric/frame controls, and a live system summary.",
        },
        {
          _key: "hbWStep4",
          title: "System",
          body: "Carry UI kit tokens — Oxide primary, plaster surfaces, mono data — across every frame.",
        },
      ],
    },
    {
      _type: "projectGallery",
      _key: "hbWebHome",
      layout: "fullBleed",
      caption: "Homepage — room to change",
      items: [
        media(
          "hbWebHome1",
          "homepage-full.png",
          "Hollowbeam homepage full-page design",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
        media(
          "hbWebHome2",
          "homepage-hero.png",
          "Hollowbeam homepage hero with Build Yours CTA",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectSplit",
      _key: "hbWebPdp",
      mediaPosition: "left",
      media: media(
        "hbWebPdpMedia",
        "product-page.png",
        "Hollowbeam HB-S1 modular seating product page",
        {
          displayWidth: "wide",
          aspectRatio: "16/9",
          objectFit: "contain",
        },
      ),
      body: [
        {
          _type: "block",
          _key: "hbWebPdpH3",
          style: "h3",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: "hbWebPdpH3C",
              marks: [],
              text: "HB-S1 product detail",
            },
          ],
        },
        portableParagraph(
          "Starting configurations, material swatches, and a Build Your System CTA lead into compatible additions — corner, ottoman, side table, storage — so shoppers see the system, not a single SKU.",
          "hbWebPdpP",
        ),
      ],
    },
    {
      _type: "projectGallery",
      _key: "hbWebConfig",
      layout: "fullBleed",
      caption: "Configurator — build your system",
      items: [
        media(
          "hbWebConfig1",
          "configurator.png",
          "Hollowbeam HB-S1 2D modular seating configurator",
          {
            displayWidth: "wide",
            aspectRatio: "16/9",
            objectFit: "contain",
          },
        ),
      ],
    },
    {
      _type: "projectCredits",
      _key: "hbWebCredits",
      items: [
        {
          _key: "hbWebCredit1",
          role: "Website & configurator design",
          name: "Thrun Design Co.",
        },
        {
          _key: "hbWebCredit2",
          role: "Tools",
          name: "Figma",
        },
      ],
    },
    {
      _type: "projectCta",
      _key: "hbWebCta",
      eyebrow: "Next step",
      heading: "Start a website project",
      label: "Request a quote",
      href: "/quote?type=web",
    },
  ];
}

const projects = [
  {
    id: "project-hollowbeam",
    slug: "hollowbeam",
    doc: {
      _type: "project",
      title: "Hollowbeam",
      slug: { _type: "slug", current: "hollowbeam" },
      industry: "Architectural furniture · Concept",
      services: "Brand identity · Visual system · UI foundations",
      workCategory: "branding-strategy",
      summary:
        "A modular furniture brand built around a hollow-beam H — lockups, palette, and UI foundations for spaces that change.",
      featured: true,
      order: 2,
      cover: {
        _type: "mediaAsset",
        alt: "Hollowbeam logo lockups and color palette",
        blobUrl: `${IMG}/logo-lockups.png`,
        displayWidth: "wide",
        aspectRatio: "16/9",
        objectFit: "contain",
      },
      modules: brandingModules(),
      seo: {
        title: "Hollowbeam — Brand identity",
        description:
          "Brand identity for Hollowbeam modular furniture: mark, palette, applications, and UI system.",
      },
    },
  },
  {
    id: "project-hollowbeam-website",
    slug: "hollowbeam-website",
    doc: {
      _type: "project",
      title: "Hollowbeam",
      slug: { _type: "slug", current: "hollowbeam-website" },
      industry: "Architectural furniture · Concept",
      services: "Website design · Product configurator · Ecommerce UX",
      workCategory: "web-design",
      summary:
        "Ecommerce and configurator UX for Hollowbeam — homepage, HB-S1 product detail, and a 2D system builder.",
      featured: true,
      order: 3,
      cover: {
        _type: "mediaAsset",
        alt: "Hollowbeam homepage design Room to Change",
        blobUrl: `${IMG}/homepage-full.png`,
        displayWidth: "wide",
        aspectRatio: "16/9",
        objectFit: "contain",
      },
      modules: websiteModules(),
      seo: {
        title: "Hollowbeam — Website design",
        description:
          "Website and configurator design for Hollowbeam modular seating systems.",
      },
    },
  },
];

for (const project of projects) {
  const existing = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{ _id, title }`,
    { slug: project.slug },
  );

  if (existing?._id) {
    const { _type, ...fields } = project.doc;
    await client
      .patch(existing._id)
      .set(fields)
      .commit({ autoGenerateArrayKeys: true });
    console.log(`Updated ${existing.title || project.slug} (${existing._id})`);
  } else {
    const created = await client.create(
      { _id: project.id, ...project.doc },
      { autoGenerateArrayKeys: true },
    );
    console.log(`Created ${created.title} (${created._id})`);
  }
}

console.log("Done.");
