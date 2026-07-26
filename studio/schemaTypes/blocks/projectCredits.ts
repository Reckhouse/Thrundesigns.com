import { UsersIcon } from "@sanity/icons/Users";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectCredits = defineType({
  name: "projectCredits",
  title: "Credits",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "credit",
          fields: [
            defineField({
              name: "role",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "name",
              type: "string",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }) {
      const n = Array.isArray(items) ? items.length : 0;
      const first = items?.[0];
      return {
        title: first ? `${first.role}: ${first.name}` : "Credits",
        subtitle: `Credits · ${n}`,
        media: UsersIcon,
      };
    },
  },
});
