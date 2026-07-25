import {
  ALLOWED_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from "@/lib/quote/options";

const EXT_MIME: Record<string, (typeof ALLOWED_ATTACHMENT_MIME)[number]> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

export type AttachmentCheck =
  | { ok: true; files: File[] }
  | { ok: false; reason: "count" | "size" | "type" };

export function validateAttachments(entries: FormDataEntryValue[]): AttachmentCheck {
  const files = entries.filter(
    (entry): entry is File => entry instanceof File && entry.size > 0,
  );

  if (files.length > MAX_ATTACHMENTS) {
    return { ok: false, reason: "count" };
  }

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return { ok: false, reason: "size" };
    }

    const name = file.name.toLowerCase();
    const ext = Object.keys(EXT_MIME).find((suffix) => name.endsWith(suffix));
    const mimeFromExt = ext ? EXT_MIME[ext] : null;
    const declared = file.type as (typeof ALLOWED_ATTACHMENT_MIME)[number] | "";

    const allowedByType =
      Boolean(declared) &&
      (ALLOWED_ATTACHMENT_MIME as readonly string[]).includes(declared);
    const allowedByExt = Boolean(mimeFromExt);

    if (!allowedByType && !allowedByExt) {
      return { ok: false, reason: "type" };
    }

    // If both are present, they must agree.
    if (allowedByType && allowedByExt && declared !== mimeFromExt) {
      return { ok: false, reason: "type" };
    }
  }

  return { ok: true, files };
}
