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
    { url: `${base}/`, lastModified: now },
    { url: `${base}/work`, lastModified: now },
    { url: `${base}/quote`, lastModified: now },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => Boolean(project.slug))
    .map((project) => ({
      url: `${base}/work/${project.slug}`,
      lastModified: project._updatedAt
        ? new Date(project._updatedAt)
        : now,
    }));

  return [...staticRoutes, ...projectRoutes];
}
