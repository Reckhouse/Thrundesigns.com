import { defineLive } from "next-sanity/live";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  }),
  serverToken: token,
  // Keep dataset credentials server-side. Studio Presentation retains its own
  // authenticated live connection; standalone shared draft previews do not.
  browserToken: false,
});
