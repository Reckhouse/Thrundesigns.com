import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { validateAttachments } from "@/lib/quote/attachments";
import { verifyFormToken } from "@/lib/quote/form-token";
import { findOption } from "@/lib/quote/form-config";
import { getQuoteFormConfig } from "@/lib/quote/get-form-config";
import { notifyQuoteStored } from "@/lib/quote/notify";
import {
  enforceQuoteRateLimits,
  enforceQuoteRequestRateLimit,
  isDuplicateSubmission,
  releaseDuplicateSubmission,
} from "@/lib/quote/rate-limit";
import {
  assertQuoteRequestGuards,
  fieldsTooLarge,
  genericError,
  genericSuccess,
  getClientIp,
} from "@/lib/quote/request-guards";
import { createQuoteFieldsSchema } from "@/lib/quote/schema";
import { hashIdentifier, logQuoteSecurity } from "@/lib/quote/security-log";
import { verifyTurnstileToken } from "@/lib/quote/turnstile";
import { trackAcceptedQuoteVolume } from "@/lib/quote/volume-alert";
import { privateQuoteClient, quoteStoreConfig } from "@/lib/quote/store-config";
import { readBoundedFormData, RequestBodyError } from "@/lib/quote/body";

export async function POST(request: Request) {
  const guard = assertQuoteRequestGuards(request);
  if (guard) {
    logQuoteSecurity("quote.request_rejected", { stage: "guards" });
    return guard;
  }

  const ip = getClientIp(request);
  const ingress = await enforceQuoteRequestRateLimit(ip);
  if (!ingress.success)
    return genericError(ingress.unavailable ? 503 : 429, ingress.retryAfterSec);
  try {
    quoteStoreConfig();
  } catch {
    return genericError(503);
  }
  let form: FormData;
  try {
    form = await readBoundedFormData(request, 45 * 1024 * 1024);
  } catch (error) {
    logQuoteSecurity("quote.request_rejected", { stage: "formdata" });
    return genericError(error instanceof RequestBodyError ? error.status : 400);
  }

  // Honeypot — silent success so bots think it worked.
  const honeypot = String(form.get("website_confirm") || "");
  if (honeypot.trim().length > 0) {
    logQuoteSecurity("quote.honeypot", {
      ipHash: hashIdentifier(ip),
    });
    return genericSuccess();
  }

  const rawFields = {
    name: String(form.get("name") || ""),
    email: String(form.get("email") || ""),
    company: String(form.get("company") || ""),
    projectType: String(form.get("projectType") || ""),
    budget: String(form.get("budget") || ""),
    timeline: String(form.get("timeline") || ""),
    message: String(form.get("message") || ""),
  };

  if (fieldsTooLarge(rawFields)) {
    logQuoteSecurity("quote.request_rejected", { stage: "field_size" });
    return genericError(413);
  }

  const formConfig = await getQuoteFormConfig();
  const quoteFieldsSchema = createQuoteFieldsSchema(formConfig);
  const parsed = quoteFieldsSchema.safeParse({
    ...rawFields,
    company: rawFields.company || undefined,
  });
  if (!parsed.success) {
    logQuoteSecurity("quote.schema_invalid", {
      ipHash: hashIdentifier(ip),
    });
    return genericError(400);
  }

  const formToken = String(form.get("formToken") || "");
  const tokenResult = verifyFormToken(formToken);
  if (!tokenResult.ok) {
    if (tokenResult.reason === "too_fast") {
      logQuoteSecurity("quote.too_fast", {
        ipHash: hashIdentifier(ip),
      });
      return genericSuccess();
    }
    logQuoteSecurity("quote.form_token_invalid", {
      reason: tokenResult.reason,
      ipHash: hashIdentifier(ip),
    });
    return genericError(400);
  }

  const turnstileToken = String(
    form.get("cf-turnstile-response") || form.get("turnstileToken") || "",
  );
  const turnstile = await verifyTurnstileToken({
    token: turnstileToken || null,
    ip,
  });
  if (!turnstile.ok) {
    logQuoteSecurity("quote.turnstile_failed", {
      reason: turnstile.reason,
      ipHash: hashIdentifier(ip),
    });
    return genericError(400);
  }

  const attachmentCheck = await validateAttachments(form.getAll("files"));
  if (!attachmentCheck.ok) {
    logQuoteSecurity("quote.request_rejected", {
      stage: "attachments",
      reason: attachmentCheck.reason,
    });
    return genericError(400);
  }

  const rate = await enforceQuoteRateLimits({ ip, email: parsed.data.email });
  if (!rate.success) {
    logQuoteSecurity("quote.rate_limited", {
      ipHash: hashIdentifier(ip),
      limiter: rate.limiter,
    });
    return genericError(rate.unavailable ? 503 : 429, rate.retryAfterSec);
  }

  let writeClient: Awaited<ReturnType<typeof privateQuoteClient>>;
  try {
    writeClient = await privateQuoteClient();
  } catch {
    logQuoteSecurity("quote.storage_failed", { stage: "private_dataset" });
    return genericError(503);
  }

  // Prefer private quote store token; never fall back to the public media store.
  const blobToken = process.env.QUOTE_READ_WRITE_TOKEN;
  const attachments: string[] = [];
  if (attachmentCheck.files.length && !blobToken) return genericError(503);

  try {
    if (await isDuplicateSubmission(parsed.data)) return genericSuccess();
  } catch {
    return genericError(503);
  }

  try {
    if (attachmentCheck.files.length > 0) {
      if (!blobToken) {
        logQuoteSecurity("quote.storage_failed", { stage: "blob_config" });
        return NextResponse.json(
          { error: "Unable to process request" },
          { status: 500 },
        );
      }

      for (const file of attachmentCheck.files) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
        const blob = await put(`quotes/${Date.now()}-${safeName}`, file, {
          access: "private",
          token: blobToken,
          addRandomSuffix: true,
          contentType: file.type || undefined,
        });
        attachments.push(blob.pathname);
      }
    }

    const linkedService = findOption(
      formConfig.projectTypes,
      parsed.data.projectType,
    )?.service;

    await writeClient.create({
      _type: "quoteSubmission",
      status: "new",
      ...parsed.data,
      ...(linkedService?._id
        ? {
            serviceSnapshot: {
              _type: "object" as const,
              id: linkedService._id,
              title: linkedService.title,
            },
          }
        : {}),
      attachments,
      submittedAt: new Date().toISOString(),
    });
  } catch {
    await releaseDuplicateSubmission(parsed.data).catch(() => {
      logQuoteSecurity("quote.storage_failed", { stage: "duplicate_release" });
    });
    if (blobToken && attachments.length) {
      await del(attachments, { token: blobToken }).catch(() => {
        logQuoteSecurity("quote.storage_failed", { stage: "blob_cleanup" });
      });
    }
    logQuoteSecurity("quote.storage_failed", { stage: "sanity_write" });
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }

  logQuoteSecurity("quote.stored", {
    ipHash: hashIdentifier(ip),
    emailHash: hashIdentifier(parsed.data.email),
    projectType: parsed.data.projectType,
    attachmentCount: attachments.length,
  });

  // Notify after store — failures are logged only; client still gets success.
  await notifyQuoteStored({
    ...parsed.data,
    attachmentPathnames: attachments,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    formConfig,
  });

  await trackAcceptedQuoteVolume();

  return genericSuccess();
}
