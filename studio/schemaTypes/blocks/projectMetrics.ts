import { ChartUpwardIcon } from "@sanity/icons/ChartUpward";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectMetrics = defineType({
  name: "projectMetrics",
  title: "Metrics",
  type: "object",
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "metric",
          fields: [
            defineField({
              name: "value",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "label",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({ name: "detail", type: "string" }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
      validation: (r) => r.required().min(1).max(6),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      const n = Array.isArray(items) ? items.length : 0;
      const first = items?.[0];
      return {
        title: first
          ? `${first.value} · ${first.label}`
          : "Metrics",
        subtitle: `Metrics · ${n} item${n === 1 ? "" : "s"}`,
        media: ChartUpwardIcon,
      };
    },
  },
});
