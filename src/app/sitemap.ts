import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { client } from "@/sanity/lib/client";

type ProjectSlug = {
  slug?: string | null;
  _updatedAt?: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  let projects: ProjectSlug[] = [];
  try {
    projects = await client
      .withConfig({ useCdn: false })
      .fetch<ProjectSlug[]>(
        `*[_type == "project" && defined(slug.current)]{
          "slug": slug.current,
          _updatedAt
        }`,
      );
  } catch {
    projects = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/work`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/quote`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/lab/controlled-chaos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/lab/living-engraving`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/lab/counterspace`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => Boolean(project.slug))
    .map((project) => ({
      url: `${base}/work/${project.slug}`,
      lastModified: project._updatedAt
        ? new Date(project._updatedAt)
        : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...projectRoutes];
}
