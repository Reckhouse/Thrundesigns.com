import { Resend } from "resend";
import { filenameFromPathname } from "@/lib/quote/attachment-download";
import {
  findOption,
  labelFor,
  projectTypeDisplayLabel,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import type { QuoteFields } from "@/lib/quote/schema";
import { logQuoteSecurity } from "@/lib/quote/security-log";
import { getSiteUrl } from "@/lib/site-url";

type NotifyQuoteInput = QuoteFields & {
  attachmentPathnames: string[];
  recordPathname?: string;
  formConfig: QuoteFormConfig;
};

async function buildPlainText(input: NotifyQuoteInput): Promise<string> {
  const { formConfig } = input;
  const projectOption = findOption(formConfig.projectTypes, input.projectType);
  const lines = [
    "New quote request stored privately.",
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
    try {
      const downloads = input.attachmentPathnames.map((pathname) => {
        const url = new URL("/api/quote/attachments/download", getSiteUrl());
        url.searchParams.set("pathname", pathname);
        return { pathname, url: url.toString() };
      });
      lines.push(
        "(Private downloads — operator sign-in required)",
        ...downloads.map(
          (item) => `- ${filenameFromPathname(item.pathname)}: ${item.url}`,
        ),
      );
    } catch {
      lines.push(
        "(Private file paths — open the quote storage dashboard)",
        ...input.attachmentPathnames.map((path) => `- ${path}`),
      );
    }
  }

  if (input.recordPathname) {
    const url = new URL("/api/quote/attachments/download", getSiteUrl());
    url.searchParams.set("pathname", input.recordPathname);
    lines.push("", `Quote record (operator sign-in required): ${url}`);
  }

  return lines.join("\n");
}

/**
 * Notify after private storage succeeds. Never throws — email failure must not
 * fail the quote submission response.
 */
export async function notifyQuoteStored(
  input: NotifyQuoteInput,
): Promise<void> {
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
    const text = await buildPlainText(input);
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: input.email,
      subject: `New quote — ${projectLabel}`,
      text,
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
