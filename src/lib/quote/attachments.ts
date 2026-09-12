import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS } from "@/lib/quote/options";

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
export type AttachmentCheck =
  | { ok: true; files: File[] }
  | { ok: false; reason: "count" | "size" | "type" | "content" };

export async function validateAttachments(
  entries: FormDataEntryValue[],
): Promise<AttachmentCheck> {
  if (entries.some((entry) => !(entry instanceof File)))
    return { ok: false, reason: "type" };
  const files = (entries as File[]).filter((file) => file.size > 0);
  if (files.length > MAX_ATTACHMENTS) return { ok: false, reason: "count" };
  const validated: File[] = [];
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) return { ok: false, reason: "size" };
    const ext = file.name.toLowerCase().split(".").pop() || "";
    const mime = EXT_MIME[ext];
    if (!mime || (file.type && file.type !== mime))
      return { ok: false, reason: "type" };
    const bytes = Buffer.from(await file.arrayBuffer());
    try {
      let output: Uint8Array;
      if (mime === "application/pdf") {
        if (
          !/^%PDF-(1\.[0-7]|2\.0)/.test(bytes.subarray(0, 8).toString("ascii"))
        )
          return { ok: false, reason: "content" };
        const pdf = await PDFDocument.load(bytes, {
          throwOnInvalidObject: true,
        });
        if (pdf.getPageCount() < 1 || pdf.getPageCount() > 200)
          return { ok: false, reason: "content" };
        // Structural validation is not a malware scan; always download PDFs as attachments.
        output = bytes;
      } else {
        const decoder = sharp(bytes, {
          limitInputPixels: 40_000_000,
          failOn: "warning",
        });
        const metadata = await decoder.metadata();
        const format = ext === "jpg" ? "jpeg" : ext;
        if (metadata.format !== format || (metadata.pages || 1) > 1)
          return { ok: false, reason: "content" };
        output = await decoder
          .rotate()
          .toFormat(format as "jpeg" | "png" | "webp")
          .toBuffer();
      }
      if (output.byteLength > MAX_ATTACHMENT_BYTES)
        return { ok: false, reason: "size" };
      validated.push(
        new File([new Uint8Array(output)], file.name, { type: mime }),
      );
    } catch {
      return { ok: false, reason: "content" };
    }
  }
  return { ok: true, files: validated };
}
