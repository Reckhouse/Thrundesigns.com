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
    }),
    defineField({
      name: "blobUrl",
      title: "Blob URL or site path",
      type: "url",
      description:
        "Vercel Blob https URL, or a site-relative path like /images/cover.jpg or /experiences/…. Relative paths are allowed.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["http", "https"],
        }),
    }),
    defineField({ name: "alt", type: "string", validation: (r) => r.required() }),
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
