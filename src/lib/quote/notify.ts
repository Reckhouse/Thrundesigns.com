import { Resend } from "resend";
import {
  findOption,
  labelFor,
  projectTypeDisplayLabel,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import type { QuoteFields } from "@/lib/quote/schema";
import { logQuoteSecurity } from "@/lib/quote/security-log";

type NotifyQuoteInput = QuoteFields & {
  attachmentPathnames: string[];
  studioUrl?: string;
  formConfig: QuoteFormConfig;
};

function buildPlainText(input: NotifyQuoteInput): string {
  const { formConfig } = input;
  const projectOption = findOption(
    formConfig.projectTypes,
    input.projectType,
  );
  const lines = [
    "New quote request stored in Sanity.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company ?? "—"}`,
    `Project: ${projectTypeDisplayLabel(formConfig.projectTypes, input.projectType)}`,
  ];

  if (projectOption?.service?.title) {
    lines.push(`Service: ${projectOption.service.title}`);
  }

  lines.push(
    `Budget: ${labelFor(formConfig.budgetRanges, input.budget)}`,
    `Timeline: ${labelFor(formConfig.timelines, input.timeline)}`,
    "",
    "Message:",
    input.message,
    "",
    `Attachments: ${input.attachmentPathnames.length}`,
  );

  if (input.attachmentPathnames.length > 0) {
    lines.push(
      "(Private Blob — open Studio / use QUOTE_READ_WRITE_TOKEN to download)",
      ...input.attachmentPathnames.map((path) => `- ${path}`),
    );
  }

  if (input.studioUrl) {
    lines.push("", `Studio: ${input.studioUrl}`);
  }

  return lines.join("\n");
}

/**
 * Notify after Sanity write succeeds. Never throws — email failure must not
 * fail the quote submission response.
 */
export async function notifyQuoteStored(input: NotifyQuoteInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_NOTIFY_TO?.trim();
  const from =
    process.env.QUOTE_NOTIFY_FROM?.trim() ||
    "Thrun Design Co <onboarding@resend.dev>";

  if (!apiKey) {
    logQuoteSecurity("quote.email_skipped", { reason: "missing_api_key" });
    return;
  }
  if (!to) {
    logQuoteSecurity("quote.email_skipped", { reason: "missing_notify_to" });
    return;
  }

  const projectLabel = projectTypeDisplayLabel(
    input.formConfig.projectTypes,
    input.projectType,
  );

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: input.email,
      subject: `New quote — ${projectLabel}`,
      text: buildPlainText(input),
    });

    if (error) {
      logQuoteSecurity("quote.email_failed", {
        reason: "resend_error",
        code: typeof error.name === "string" ? error.name : "unknown",
        statusCode:
          typeof error.statusCode === "number" ? error.statusCode : undefined,
      });
      return;
    }

    logQuoteSecurity("quote.email_sent", {
      attachmentCount: input.attachmentPathnames.length,
    });
  } catch {
    logQuoteSecurity("quote.email_failed", { reason: "exception" });
  }
}
