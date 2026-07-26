import { BlockquoteIcon } from "@sanity/icons/Blockquote";
import { defineField, defineType } from "sanity";

export const projectQuote = defineType({
  name: "projectQuote",
  title: "Pull quote",
  type: "object",
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({ name: "attribution", type: "string" }),
    defineField({ name: "role", type: "string" }),
  ],
  preview: {
    select: {
      title: "quote",
      attribution: "attribution",
      role: "role",
    },
    prepare({ title, attribution, role }) {
      const credit = [attribution, role].filter(Boolean).join(" · ");
      return {
        title: title || "Pull quote",
        subtitle: credit ? `Quote · ${credit}` : "Quote",
        media: BlockquoteIcon,
      };
    },
  },
});
