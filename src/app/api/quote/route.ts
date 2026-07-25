import { createClient } from "next-sanity";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  projectType: z.string().min(1),
  budget: z.string().min(1),
  timeline: z.string().min(1),
  message: z.string().min(10),
  attachments: z.array(z.string().url()).max(5).optional(),
});

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  // Multipart path: upload files to Blob, then create Sanity submission.
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const values = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      company: String(form.get("company") || "") || undefined,
      projectType: String(form.get("projectType") || ""),
      budget: String(form.get("budget") || ""),
      timeline: String(form.get("timeline") || ""),
      message: String(form.get("message") || ""),
    };

    const parsed = bodySchema.omit({ attachments: true }).safeParse(values);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const files = form
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 attachments" },
        { status: 400 },
      );
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const attachments: string[] = [];

    if (files.length > 0) {
      if (!blobToken) {
        return NextResponse.json(
          { error: "Blob storage is not configured" },
          { status: 500 },
        );
      }

      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File ${file.name} exceeds 8MB` },
            { status: 400 },
          );
        }

        const blob = await put(`quotes/${Date.now()}-${file.name}`, file, {
          access: "public",
          token: blobToken,
          addRandomSuffix: true,
        });
        attachments.push(blob.url);
      }
    }

    return createSubmission({ ...parsed.data, attachments });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  return createSubmission(parsed.data);
}

async function createSubmission(data: z.infer<typeof bodySchema>) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Write token not configured" },
      { status: 500 },
    );
  }

  const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  await writeClient.create({
    _type: "quoteSubmission",
    ...data,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
