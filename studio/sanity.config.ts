import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { resolve } from "./presentation/resolve";
import { quoteSubmission } from "./schemaTypes/documents";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "fbuy6kak";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  process.env.SANITY_STUDIO_SITE_URL ||
  "https://www.thrundesigns.com";

const quoteDataset = process.env.SANITY_STUDIO_QUOTE_DATASET;
if (quoteDataset && quoteDataset === dataset) {
  throw new Error("Quote workspace must use a separate private dataset");
}

export default defineConfig([
  {
    name: "thrundesign",
    title: "Thrun Design Co.",
    basePath: "/content",
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
      types: schemaTypes.filter((schema) => schema.name !== "quoteSubmission"),
    },
  },
  ...(quoteDataset
    ? [
        {
          name: "quotes",
          title: "Private quotes",
          basePath: "/quotes",
          projectId,
          dataset: quoteDataset,
          plugins: [structureTool()],
          schema: { types: [quoteSubmission] },
        },
      ]
    : []),
]);
