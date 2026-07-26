import { LaunchIcon } from "@sanity/icons/Launch";
import { defineField, defineType } from "sanity";

export const projectCta = defineType({
  name: "projectCta",
  title: "Call to action",
  type: "object",
  icon: LaunchIcon,
  fields: [
    defineField({ name: "eyebrow", type: "string" }),
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      type: "string",
      validation: (r) => r.required(),
      initialValue: "/quote",
    }),
  ],
  preview: {
    select: {
      title: "heading",
      label: "label",
      href: "href",
    },
    prepare({ title, label, href }) {
      return {
        title: title || label || "Call to action",
        subtitle: href ? `CTA · ${href}` : "CTA",
        media: LaunchIcon,
      };
    },
  },
});
