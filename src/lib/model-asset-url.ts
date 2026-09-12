import { dataset, projectId } from "@/sanity/env";

// Only immutable public GLB assets belonging to this site's Sanity dataset.
export function modelAssetFilename(value: string): string | null {
  try {
    const url = new URL(value);
    const prefix = `/files/${projectId}/${dataset}/`;
    if (
      url.origin !== "https://cdn.sanity.io" ||
      !url.pathname.startsWith(prefix)
    )
      return null;
    const filename = url.pathname.slice(prefix.length);
    return /^[a-f0-9]{40}\.glb$/.test(filename) ? filename : null;
  } catch {
    return null;
  }
}
export function modelAssetUrl(value: string): string {
  const filename = modelAssetFilename(value);
  return filename ? `/api/model-assets/${filename}` : value;
}
