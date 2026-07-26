import { StackCompactIcon } from "@sanity/icons/StackCompact";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectProcess = defineType({
  name: "projectProcess",
  title: "Process steps",
  type: "object",
  icon: StackCompactIcon,
  fields: [
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "processStepItem",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "body",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading", steps: "steps" },
    prepare({ title, steps }) {
      const n = Array.isArray(steps) ? steps.length : 0;
      return {
        title: title || steps?.[0]?.title || "Process steps",
        subtitle: `Process · ${n} step${n === 1 ? "" : "s"}`,
        media: StackCompactIcon,
      };
    },
  },
});
