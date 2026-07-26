import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectRichText = defineType({
  name: "projectRichText",
  title: "Rich text",
  type: "object",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "heading",
      type: "string",
      description: "Optional section heading above the copy.",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    validation: (r) =>
                      r.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading", body: "body" },
    prepare({ title, body }) {
      const first = body?.[0]?.children?.[0]?.text;
      return {
        title: title || first || "Rich text",
        subtitle: "Rich text",
        media: DocumentTextIcon,
      };
    },
  },
});
