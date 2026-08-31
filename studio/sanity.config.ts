import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { resolve } from "./presentation/resolve";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "fbuy6kak";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  process.env.SANITY_STUDIO_SITE_URL ||
  "https://www.thrundesigns.com";

export default defineConfig({
  name: "thrundesign",
  title: "Thrun Design Co.",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        origin: previewOrigin,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
