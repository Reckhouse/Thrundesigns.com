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
      title: "Blob URL",
      type: "url",
      description: "Optional Vercel Blob public URL for generated/production media.",
    }),
    defineField({ name: "alt", type: "string", validation: (r) => r.required() }),
  ],
});
