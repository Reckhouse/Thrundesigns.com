import { defineField, defineType } from "sanity";

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", type: "string", validation: (r) => r.required() }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "ogImage",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});

export const mediaAsset = defineType({
  name: "mediaAsset",
  title: "Media asset",
  type: "object",
  fields: [
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description:
        "Sanity CDN image. Hotspot/crop apply on the site. Prefer this over Blob URL when you need focal crop.",
    }),
    defineField({
      name: "blobUrl",
      title: "Blob URL or site path",
      type: "url",
      description:
        "Vercel Blob https URL, or a site-relative path like /images/cover.jpg or /experiences/…. Relative paths are allowed. Display width/fit apply; Sanity hotspot/crop do not.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["http", "https"],
        }),
    }),
    defineField({ name: "alt", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "displayWidth",
      title: "Display width",
      type: "string",
      description: "Relative width inside the module or hero frame.",
      options: {
        list: [
          { title: "Full", value: "full" },
          { title: "Wide", value: "wide" },
          { title: "Half", value: "half" },
          { title: "Third", value: "third" },
        ],
        layout: "radio",
      },
      initialValue: "full",
    }),
    defineField({
      name: "aspectRatio",
      title: "Aspect ratio",
      type: "string",
      description:
        "Frame ratio on the site. Auto keeps the layout default (or natural size in masonry).",
      options: {
        list: [
          { title: "Auto", value: "auto" },
          { title: "16:9", value: "16/9" },
          { title: "4:3", value: "4/3" },
          { title: "3:2", value: "3/2" },
          { title: "1:1", value: "1/1" },
          { title: "9:16", value: "9/16" },
        ],
        layout: "radio",
      },
      initialValue: "auto",
    }),
    defineField({
      name: "objectFit",
      title: "Object fit",
      type: "string",
      description: "How the image fills its frame.",
      options: {
        list: [
          { title: "Cover (crop to fill)", value: "cover" },
          { title: "Contain (letterbox)", value: "contain" },
        ],
        layout: "radio",
      },
      initialValue: "cover",
    }),
  ],
});

/** Curated reference to an application-stored creation (ID only — no payload JSON). */
export const featuredCreation = defineType({
  name: "featuredCreation",
  title: "Featured creation",
  type: "object",
  fields: [
    defineField({
      name: "creationId",
      title: "Creation ID",
      type: "string",
      validation: (r) => r.required(),
      description:
        "Immutable ID from the portfolio creations API. Do not paste full creation JSON here.",
    }),
    defineField({
      name: "displayTitle",
      title: "Display title",
      type: "string",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "curatorNote",
      title: "Curator note",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail override",
      type: "mediaAsset",
      description: "Optional override when the stored creation has no thumbnail.",
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
    }),
  ],
  preview: {
    select: {
      title: "displayTitle",
      creationId: "creationId",
      media: "thumbnail.image",
    },
    prepare({ title, creationId, media }) {
      return {
        title: title || creationId || "Featured creation",
        subtitle: creationId ? `Creation · ${creationId}` : "Featured creation",
        media,
      };
    },
  },
});
