import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";
import { SERVICES } from "@/lib/services";
import { client } from "@/sanity/lib/client";

type ProjectSlug = {
  slug?: string | null;
  _updatedAt?: string | null;
};

/**
 * Sitemap lastmod should reflect meaningful content updates—not deploy time.
 * Static marketing pages omit lastModified unless we have a real content date.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

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
    { url: `${base}/` },
    { url: `${base}/work` },
    { url: `${base}/about` },
    { url: `${base}/privacy` },
    { url: `${base}/accessibility` },
    { url: `${base}/quote` },
    { url: `${base}/colorado-springs` },
    { url: `${base}/colorado-springs/branding` },
    { url: `${base}/colorado-springs/web-design` },
    { url: `${base}/colorado-springs/graphic-design` },
    { url: `${base}/startups` },
    ...SERVICES.map((service) => ({
      url: `${base}/services/${service.slug}`,
    })),
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => Boolean(project.slug))
    .map((project) => ({
      url: `${base}/work/${project.slug}`,
      ...(project._updatedAt
        ? { lastModified: new Date(project._updatedAt) }
        : {}),
    }));

  return [...staticRoutes, ...projectRoutes];
}
