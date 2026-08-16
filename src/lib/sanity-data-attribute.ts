import { createDataAttribute } from "next-sanity";

type ProjectMediaPathProps = {
  documentId?: string | null;
  path: string;
};

/** Presentation click-to-edit attribute for a project field path. */
export function projectMediaDataAttribute({
  documentId,
  path,
}: ProjectMediaPathProps): string | undefined {
  const id = documentId?.replace(/^drafts\./, "").trim();
  if (!id || !path) return undefined;
  return createDataAttribute({
    id,
    type: "project",
    path,
  }).toString();
}

export function moduleMediaPath(moduleKey: string, field = "media"): string {
  return `modules[_key=="${moduleKey}"].${field}`;
}

export function galleryItemMediaPath(
  moduleKey: string,
  itemKey: string,
): string {
  return `modules[_key=="${moduleKey}"].items[_key=="${itemKey}"]`;
}
