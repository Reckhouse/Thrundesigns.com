import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "headline", type: "string" }),
        defineField({ name: "support", type: "text", rows: 3 }),
        defineField({ name: "primaryCta", type: "cta" }),
        defineField({ name: "secondaryCta", type: "cta" }),
        defineField({ name: "servicesMeta", type: "string" }),
        defineField({ name: "image", type: "mediaAsset" }),
      ],
    }),
    defineField({
      name: "servicesIntro",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "intro", type: "text" }),
      ],
    }),
    defineField({
      name: "processIntro",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
      ],
    }),
    defineField({
      name: "workIntro",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "intro", type: "text" }),
      ],
    }),
    defineField({
      name: "artifact",
      title: "Credibility sample",
      description:
        "A non-fictional sample (audit lens, guidelines snippet, etc.). Never invent client results or testimonials.",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "intro", type: "text", rows: 3 }),
        defineField({
          name: "items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "label", type: "string" }),
                defineField({ name: "detail", type: "text", rows: 2 }),
              ],
              preview: {
                select: { title: "label" },
              },
            },
          ],
        }),
        defineField({ name: "footnote", type: "string" }),
        defineField({ name: "ctaLabel", type: "string" }),
        defineField({ name: "ctaHref", type: "string" }),
      ],
    }),
    defineField({
      name: "engage",
      title: "How we engage",
      type: "object",
      fields: [
        defineField({ name: "heading", type: "string" }),
        defineField({
          name: "steps",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "title", type: "string" }),
                defineField({ name: "copy", type: "text", rows: 2 }),
              ],
            },
          ],
        }),
        defineField({ name: "replyHeading", type: "string" }),
        defineField({
          name: "replyPoints",
          type: "array",
          of: [{ type: "string" }],
        }),
      ],
    }),
    defineField({
      name: "whyThrun",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
        defineField({
          name: "bullets",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "credibilityEyebrow", type: "string" }),
        defineField({ name: "credibilityHeading", type: "string" }),
        defineField({
          name: "proofPoints",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "num", type: "string" }),
                defineField({ name: "label", type: "string" }),
              ],
            },
          ],
        }),
      ],
    }),

    defineField({
      name: "finalCta",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heading", type: "string" }),
        defineField({ name: "copy", type: "text" }),
        defineField({ name: "primaryCta", type: "cta" }),
        defineField({ name: "secondaryCta", type: "cta" }),
      ],
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
