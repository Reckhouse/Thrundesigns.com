import { createClient } from "next-sanity";
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
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

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
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
