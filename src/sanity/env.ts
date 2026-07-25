export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

/** Public Sanity project id — safe to commit / default for local dev. */
export const projectId = readPublicEnv(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "fbuy6kak",
);

/** Public dataset name — safe to commit / default for local dev. */
export const dataset = readPublicEnv(
  "NEXT_PUBLIC_SANITY_DATASET",
  "production",
);

function readPublicEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}
