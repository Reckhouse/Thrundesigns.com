import { Resend } from "resend";
import {
  BUDGET_RANGES,
  PROJECT_TYPES,
  TIMELINES,
} from "@/lib/quote/options";
import type { QuoteFields } from "@/lib/quote/schema";
import { logQuoteSecurity } from "@/lib/quote/security-log";

const projectLabels: Record<(typeof PROJECT_TYPES)[number], string> = {
  brand: "Brand identity",
  website: "Website / digital",
  audit: "Audit / refresh",
  print: "Print / packaging",
  mixed: "Mixed / other",
};

const budgetLabels: Record<(typeof BUDGET_RANGES)[number], string> = {
  "5-15k": "$5k–$15k",
  "15-40k": "$15k–$40k",
  "40k+": "$40k+",
  unsure: "Not sure yet",
};

const timelineLabels: Record<(typeof TIMELINES)[number], string> = {
  asap: "ASAP",
  "1-3": "1–3 months",
  "3-6": "3–6 months",
  exploring: "Just exploring",
};

type NotifyQuoteInput = QuoteFields & {
  attachmentPathnames: string[];
  studioUrl?: string;
};

function buildPlainText(input: NotifyQuoteInput): string {
  const lines = [
    "New quote request stored in Sanity.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company ?? "—"}`,
    `Project: ${projectLabels[input.projectType]}`,
    `Budget: ${budgetLabels[input.budget]}`,
    `Timeline: ${timelineLabels[input.timeline]}`,
    "",
    "Message:",
    input.message,
    "",
    `Attachments: ${input.attachmentPathnames.length}`,
  ];

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

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: input.email,
      subject: `New quote — ${projectLabels[input.projectType]}`,
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
