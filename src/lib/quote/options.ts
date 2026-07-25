/** Canonical select values — keep UI and server enums in sync. */

export const PROJECT_TYPES = [
  "brand",
  "website",
  "audit",
  "print",
  "mixed",
] as const;

export const BUDGET_RANGES = ["5-15k", "15-40k", "40k+", "unsure"] as const;

export const TIMELINES = ["asap", "1-3", "3-6", "exploring"] as const;

export const ALLOWED_ATTACHMENT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
/** Soft cap for non-file form fields (bytes). */
export const MAX_FIELD_BYTES = 20 * 1024;
