import { z } from "zod";
import {
  enabledOptions,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import { BUDGET_RANGES, PROJECT_TYPES, TIMELINES } from "@/lib/quote/options";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function enumFromValues(values: string[], message: string) {
  if (values.length === 0) {
    throw new Error("Quote form has no enabled options for validation");
  }
  return z.string().trim().refine((value) => values.includes(value), {
    message,
  });
}

/** Server schema — allow-lists come from CMS-enabled options. */
export function createQuoteFieldsSchema(config: QuoteFormConfig) {
  return z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z
        .string()
        .trim()
        .max(254)
        .email()
        .transform((value) => normalizeEmail(value)),
      company: z
        .string()
        .trim()
        .max(150)
        .optional()
        .transform((value) => (value && value.length > 0 ? value : undefined)),
      projectType: enumFromValues(
        enabledOptions(config.projectTypes).map((o) => o.value),
        "Invalid project type",
      ),
      budget: enumFromValues(
        enabledOptions(config.budgetRanges).map((o) => o.value),
        "Invalid budget",
      ),
      timeline: enumFromValues(
        enabledOptions(config.timelines).map((o) => o.value),
        "Invalid timeline",
      ),
      message: z.string().trim().min(10).max(3000),
    })
    .strict();
}

/** Client form schema — same rules with friendlier messages. */
export function createQuoteClientSchema(config: QuoteFormConfig) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required")
      .max(100, "Name is too long"),
    email: z
      .string()
      .trim()
      .max(254, "Email is too long")
      .email("Valid email required"),
    company: z
      .string()
      .trim()
      .max(150, "Company name is too long")
      .optional()
      .or(z.literal("")),
    projectType: enumFromValues(
      enabledOptions(config.projectTypes).map((o) => o.value),
      "Select a project type",
    ),
    budget: enumFromValues(
      enabledOptions(config.budgetRanges).map((o) => o.value),
      "Select a budget range",
    ),
    timeline: enumFromValues(
      enabledOptions(config.timelines).map((o) => o.value),
      "Select a timeline",
    ),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more")
      .max(3000, "Message is too long"),
  });
}

/** Fallback static schema for tooling / tests when no CMS config is loaded. */
export const quoteFieldsSchema = createQuoteFieldsSchema({
  headline: "Tell us what you're building.",
  support: "",
  stepLabels: ["Contact", "Project", "Details"],
  successHeading: "",
  successBody: "",
  submitLabel: "Submit quote",
  nameField: { label: "Name" },
  emailField: { label: "Email" },
  companyField: { label: "Company" },
  projectTypeField: { label: "Project type" },
  budgetField: { label: "Budget" },
  timelineField: { label: "Timeline" },
  messageField: { label: "Project notes" },
  attachmentsField: { label: "Attachments" },
  projectTypes: PROJECT_TYPES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
  budgetRanges: BUDGET_RANGES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
  timelines: TIMELINES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
});

export const quoteClientSchema = createQuoteClientSchema({
  headline: "Tell us what you're building.",
  support: "",
  stepLabels: ["Contact", "Project", "Details"],
  successHeading: "",
  successBody: "",
  submitLabel: "Submit quote",
  nameField: { label: "Name" },
  emailField: { label: "Email" },
  companyField: { label: "Company" },
  projectTypeField: { label: "Project type" },
  budgetField: { label: "Budget" },
  timelineField: { label: "Timeline" },
  messageField: { label: "Project notes" },
  attachmentsField: { label: "Attachments" },
  projectTypes: PROJECT_TYPES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
  budgetRanges: BUDGET_RANGES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
  timelines: TIMELINES.map((value) => ({
    value,
    label: value,
    enabled: true,
  })),
});

export type QuoteFields = z.infer<typeof quoteFieldsSchema>;
export type QuoteClientValues = z.infer<typeof quoteClientSchema>;
