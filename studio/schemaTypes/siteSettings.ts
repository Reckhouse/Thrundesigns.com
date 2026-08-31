import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Thrun Design Co." }),
    defineField({
      name: "tagline",
      type: "string",
      initialValue: "Strategic design for businesses ready to move forward.",
    }),
    defineField({
      name: "nav",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "href", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "footerColumns",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "heading", type: "string" }),
            defineField({
              name: "links",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "label", type: "string" }),
                    defineField({ name: "href", type: "string" }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "seo",
      type: "seo",
      description:
        "Optional sitewide SEO defaults. Most pages prefer their own SEO fields; homepage falls back to hero copy when blank.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
