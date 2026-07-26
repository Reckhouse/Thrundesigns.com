import { InlineIcon } from "@sanity/icons/Inline";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectSplit = defineType({
  name: "projectSplit",
  title: "Split image + copy",
  type: "object",
  icon: InlineIcon,
  fields: [
    defineField({
      name: "mediaPosition",
      title: "Media position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "media",
      type: "mediaAsset",
      validation: (r) => r.required(),
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
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: {
      media: "media.image",
      position: "mediaPosition",
      body: "body",
    },
    prepare({ media, position, body }) {
      const first = body?.[0]?.children?.[0]?.text;
      return {
        title: first || "Split section",
        subtitle: `Split · media ${position || "left"}`,
        media: media ?? InlineIcon,
      };
    },
  },
});
