import { PROJECT_TYPES } from "@/lib/quote/options";

export type ProjectType = (typeof PROJECT_TYPES)[number];

const iconToProjectType: Record<string, ProjectType> = {
  brand: "brand",
  web: "website",
  website: "website",
  audit: "audit",
  print: "print",
};

export function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

/** Map a service icon (or slug hint) to a quote project-type value. */
export function projectTypeFromServiceIcon(
  icon?: string | null,
): ProjectType | null {
  if (!icon) return null;
  return iconToProjectType[icon] ?? null;
}

/** Build a quote URL that prefills project type. */
export function quoteHrefForProjectType(
  type?: ProjectType | null,
): string {
  if (!type) return "/quote";
  return `/quote?type=${encodeURIComponent(type)}`;
}

export function parseProjectTypeParam(
  value: string | string[] | undefined,
): ProjectType | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const cleaned = raw.trim().toLowerCase();
  return isProjectType(cleaned) ? cleaned : undefined;
}
