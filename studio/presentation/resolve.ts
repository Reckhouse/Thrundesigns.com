import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    homePage: defineLocations({
      select: { title: "hero.headline" },
      resolve: () => ({
        locations: [
          { title: "Home", href: "/" },
          { title: "Sample lens", href: "/#sample" },
        ],
      }),
    }),
    siteSettings: defineLocations({
      select: { title: "title" },
      resolve: () => ({
        locations: [
          { title: "Home", href: "/" },
          { title: "Work index", href: "/work" },
          { title: "Quote", href: "/quote" },
        ],
      }),
    }),
    project: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Project",
            href: doc?.slug ? `/work/${doc.slug}` : "/work",
          },
          { title: "Work index", href: "/work" },
          { title: "Home", href: "/" },
        ],
      }),
    }),
    service: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Service", href: "/#services" },
          { title: "Home", href: "/" },
        ],
      }),
    }),
    processStep: defineLocations({
      select: { title: "title" },
      resolve: () => ({
        locations: [
          { title: "Process", href: "/#process" },
          { title: "Home", href: "/" },
        ],
      }),
    }),
    quoteForm: defineLocations({
      select: { title: "headline" },
      resolve: () => ({
        locations: [{ title: "Quote form", href: "/quote" }],
      }),
    }),
  },
};
