import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";

export const projectVideo = defineType({
  name: "projectVideo",
  title: "Video embed",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "url",
      title: "YouTube or Vimeo URL",
      type: "url",
      validation: (r) =>
        r
          .required()
          .uri({ scheme: ["http", "https"] })
          .custom((value) => {
            if (!value) return true;
            try {
              const host = new URL(value).hostname.replace(/^www\./, "");
              const ok = [
                "youtube.com",
                "youtu.be",
                "vimeo.com",
                "player.vimeo.com",
              ].includes(host);
              return ok || "Use a YouTube or Vimeo URL";
            } catch {
              return "Enter a valid URL";
            }
          }),
    }),
    defineField({
      name: "poster",
      type: "mediaAsset",
      description: "Optional poster image shown before play.",
    }),
    defineField({ name: "caption", type: "string" }),
  ],
  preview: {
    select: {
      title: "caption",
      url: "url",
      media: "poster.image",
    },
    prepare({ title, url, media }) {
      return {
        title: title || url || "Video",
        subtitle: "Video embed",
        media: media ?? PlayIcon,
      };
    },
  },
});
