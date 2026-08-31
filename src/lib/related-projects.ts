import { defaultHomeContent } from "@/lib/default-content";
import {
  primaryServiceForProject,
  type ServiceDefinition,
} from "@/lib/services";

export type RelatedProjectCard = {
  slug: string;
  title: string;
  summary: string;
  industry?: string | null;
  services?: string | null;
  workCategory?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
};

const PROJECT_PAIRS: Record<string, string> = {
  "juniper-and-stone-coffee": "juniper-and-stone-website",
  "juniper-and-stone-website": "juniper-and-stone-coffee",
  hollowbeam: "hollowbeam-website",
  "hollowbeam-website": "hollowbeam",
};

function fromDefaults(slug: string): RelatedProjectCard | null {
  const match = defaultHomeContent.projects.find(
    (project) => project.slug.current === slug,
  );
  if (!match) return null;
  return {
    slug,
    title: match.title,
    summary: match.summary,
    industry: match.industry,
    services: match.services,
    workCategory: match.workCategory,
    imageSrc: match.cover?.blobUrl || null,
    imageAlt: match.cover?.alt || match.title,
  };
}

export function relatedProjectsForSlug(
  slug: string,
  candidates: RelatedProjectCard[] = [],
): RelatedProjectCard[] {
  const pool = [
    ...candidates,
    ...defaultHomeContent.projects.map((project) => ({
      slug: project.slug.current,
      title: project.title,
      summary: project.summary,
      industry: project.industry,
      services: project.services,
      workCategory: project.workCategory,
      imageSrc: project.cover?.blobUrl || null,
      imageAlt: project.cover?.alt || project.title,
    })),
  ].filter((project, index, arr) => {
    if (!project.slug || project.slug === slug) return false;
    return arr.findIndex((item) => item.slug === project.slug) === index;
  });

  const selected: RelatedProjectCard[] = [];
  const seen = new Set<string>();
  const push = (project: RelatedProjectCard | null | undefined) => {
    if (!project?.slug || seen.has(project.slug) || project.slug === slug) return;
    seen.add(project.slug);
    selected.push(project);
  };

  const pairSlug = PROJECT_PAIRS[slug];
  if (pairSlug) {
    push(pool.find((project) => project.slug === pairSlug) || fromDefaults(pairSlug));
  }

  const current =
    candidates.find((project) => project.slug === slug) || fromDefaults(slug);
  if (current?.workCategory) {
    for (const project of pool) {
      if (selected.length >= 2) break;
      if (project.workCategory === current.workCategory) push(project);
    }
  }

  for (const project of pool) {
    if (selected.length >= 2) break;
    push(project);
  }

  return selected.slice(0, 2);
}

export function serviceContextForProject(input: {
  services?: string | null;
  workCategory?: string | null;
}): ServiceDefinition {
  return primaryServiceForProject(input);
}
