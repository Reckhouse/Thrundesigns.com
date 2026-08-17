import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";

export const projectVideo = defineType({
  name: "projectVideo",
  title: "Video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "file",
      title: "Uploaded video",
      type: "file",
      options: { accept: "video/*" },
      description:
        "MP4 or WebM preferred. Used instead of the embed URL when set.",
    }),
    defineField({
      name: "url",
      title: "YouTube or Vimeo URL",
      type: "url",
      description: "Optional when an uploaded video is set.",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"] }).custom((value) => {
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
  validation: (rule) =>
    rule.custom((value) => {
      const hasFile = Boolean(
        value &&
          typeof value === "object" &&
          "file" in value &&
          value.file &&
          typeof value.file === "object" &&
          "asset" in value.file &&
          value.file.asset,
      );
      const hasUrl = Boolean(
        value &&
          typeof value === "object" &&
          "url" in value &&
          typeof value.url === "string" &&
          value.url.trim().length > 0,
      );
      if (hasFile || hasUrl) return true;
      return "Add an uploaded video or a YouTube/Vimeo URL";
    }),
  preview: {
    select: {
      title: "caption",
      url: "url",
      filename: "file.asset.originalFilename",
      media: "poster.image",
    },
    prepare({ title, url, filename, media }) {
      const source = filename ? "Uploaded video" : "Video embed";
      return {
        title: title || filename || url || "Video",
        subtitle: source,
        media: media ?? PlayIcon,
      };
    },
  },
});
