import { ImagesIcon } from "@sanity/icons/Images";
import { defineArrayMember, defineField, defineType } from "sanity";

export const projectGallery = defineType({
  name: "projectGallery",
  title: "Gallery",
  type: "object",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "layout",
      type: "string",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Full bleed", value: "fullBleed" },
          { title: "Masonry", value: "masonry" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "mediaAsset" })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "caption",
      type: "string",
      description: "Optional caption under the gallery.",
    }),
  ],
  preview: {
    select: {
      layout: "layout",
      caption: "caption",
      media: "items.0.image",
      count: "items",
    },
    prepare({ layout, caption, media, count }) {
      const n = Array.isArray(count) ? count.length : 0;
      return {
        title: caption || `${n} image${n === 1 ? "" : "s"}`,
        subtitle: `Gallery · ${layout || "grid"}`,
        media: media ?? ImagesIcon,
      };
    },
  },
});
