import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "fbuy6kak";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "thrundesign",
  title: "Thrun Design Co.",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
