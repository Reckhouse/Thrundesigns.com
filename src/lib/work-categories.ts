/**
 * Shared work / case-study category taxonomy.
 * Keep Studio `workCategory` options in sync with these values.
 */

export const WORK_CATEGORY_KEYS = [
  "animation-studies",
  "web-design",
  "branding-strategy",
] as const;

export type WorkCategoryKey = (typeof WORK_CATEGORY_KEYS)[number];

export const WORK_CATEGORY_LABELS: Record<WorkCategoryKey, string> = {
  "animation-studies": "Animation Studies",
  "web-design": "Web Design",
  "branding-strategy": "Branding Strategy",
};

/** Display order for homepage rows and /work sections. */
export const WORK_CATEGORY_ORDER: WorkCategoryKey[] = [
  "animation-studies",
  "web-design",
  "branding-strategy",
];

export function isWorkCategoryKey(value: unknown): value is WorkCategoryKey {
  return (
    typeof value === "string" &&
    (WORK_CATEGORY_KEYS as readonly string[]).includes(value)
  );
}

export function workCategoryLabel(
  key: WorkCategoryKey | string | null | undefined,
): string {
  if (isWorkCategoryKey(key)) return WORK_CATEGORY_LABELS[key];
  return "Work";
}

/**
 * Group projects into non-empty category buckets in display order.
 * Unknown / missing categories are omitted from rows.
 */
export function groupProjectsByWorkCategory<
  T extends { workCategory?: string | null },
>(projects: T[]): { key: WorkCategoryKey; label: string; projects: T[] }[] {
  const buckets = new Map<WorkCategoryKey, T[]>();
  for (const key of WORK_CATEGORY_ORDER) {
    buckets.set(key, []);
  }

  for (const project of projects) {
    if (!isWorkCategoryKey(project.workCategory)) continue;
    buckets.get(project.workCategory)?.push(project);
  }

  return WORK_CATEGORY_ORDER.flatMap((key) => {
    const list = buckets.get(key) ?? [];
    if (list.length === 0) return [];
    return [{ key, label: WORK_CATEGORY_LABELS[key], projects: list }];
  });
}
