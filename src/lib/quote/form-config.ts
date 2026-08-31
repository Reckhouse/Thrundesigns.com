import {
  BUDGET_RANGES,
  PROJECT_TYPES,
  TIMELINES,
} from "@/lib/quote/options";

export type LinkedService = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  summary?: string | null;
  icon?: string | null;
};

export type QuoteFormOption = {
  value: string;
  label: string;
  enabled?: boolean | null;
  /** Present on project-type options when a Service is linked. */
  service?: LinkedService | null;
};

export type QuoteFormFieldCopy = {
  label: string;
  placeholder?: string | null;
  helperText?: string | null;
};

export type QuoteFormConfig = {
  eyebrow?: string | null;
  headline: string;
  support: string;
  stepLabels: [string, string, string];
  successHeading: string;
  successBody: string;
  submitLabel: string;
  nameField: QuoteFormFieldCopy;
  emailField: QuoteFormFieldCopy;
  companyField: QuoteFormFieldCopy;
  projectTypeField: QuoteFormFieldCopy;
  budgetField: QuoteFormFieldCopy;
  timelineField: QuoteFormFieldCopy;
  messageField: QuoteFormFieldCopy;
  attachmentsField: QuoteFormFieldCopy;
  projectTypes: QuoteFormOption[];
  budgetRanges: QuoteFormOption[];
  timelines: QuoteFormOption[];
  seo?: {
    title?: string | null;
    description?: string | null;
    ogImage?: unknown | null;
  } | null;
};

const projectLabels: Record<(typeof PROJECT_TYPES)[number], string> = {
  brand: "Brand & system architecture",
  website: "Web design & maintenance",
  audit: "Business marketing audit",
  print: "Print & digital assets",
  mixed: "Mixed engagement",
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
  exploring: "Exploring",
};

function optionsFrom(
  values: readonly string[],
  labels: Record<string, string>,
): QuoteFormOption[] {
  return values.map((value) => ({
    value,
    label: labels[value] ?? value,
    enabled: true,
  }));
}

/** Code fallbacks — used when Sanity is empty or offline. */
export const defaultQuoteFormConfig: QuoteFormConfig = {
  eyebrow: null,
  headline: "Tell us what you're building.",
  support:
    "A short brief is enough. We'll reply within a few business days with scope options and next steps.",
  stepLabels: ["Contact", "Project", "Details"],
  successHeading: "Thanks — your brief is in.",
  successBody:
    "We'll review it and reply within a few business days with scope options and clear next steps. No need to resubmit unless something changes.",
  submitLabel: "Submit quote",
  nameField: { label: "Name" },
  emailField: { label: "Email" },
  companyField: { label: "Company" },
  projectTypeField: { label: "Project type" },
  budgetField: { label: "Budget" },
  timelineField: { label: "Timeline" },
  messageField: {
    label: "Project notes",
    placeholder: "Goals, audience, constraints, references…",
  },
  attachmentsField: {
    label: "Attachments (optional)",
    helperText: "Up to 5 files · 8MB each · JPG, PNG, WEBP, PDF",
  },
  projectTypes: optionsFrom(PROJECT_TYPES, projectLabels),
  budgetRanges: optionsFrom(BUDGET_RANGES, budgetLabels),
  timelines: optionsFrom(TIMELINES, timelineLabels),
};

function asField(
  value: Partial<QuoteFormFieldCopy> | null | undefined,
  fallback: QuoteFormFieldCopy,
): QuoteFormFieldCopy {
  return {
    label: value?.label?.trim() || fallback.label,
    placeholder: value?.placeholder ?? fallback.placeholder ?? null,
    helperText: value?.helperText ?? fallback.helperText ?? null,
  };
}

function asService(
  value: LinkedService | null | undefined,
): LinkedService | null {
  if (!value?._id) return null;
  return {
    _id: value._id,
    title: value.title ?? null,
    slug: value.slug ?? null,
    summary: value.summary ?? null,
    icon: value.icon ?? null,
  };
}

function asOptions(
  value: QuoteFormOption[] | null | undefined,
  fallback: QuoteFormOption[],
  withService = false,
): QuoteFormOption[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const cleaned = value
    .map((item) => {
      const option: QuoteFormOption = {
        value: String(item?.value || "").trim(),
        label: String(item?.label || "").trim(),
        enabled: item?.enabled !== false,
      };
      if (withService) {
        option.service = asService(item?.service);
      }
      return option;
    })
    .filter((item) => item.value && item.label);
  return cleaned.length > 0 ? cleaned : fallback;
}

function asStepLabels(
  value: string[] | null | undefined,
  fallback: [string, string, string],
): [string, string, string] {
  if (!Array.isArray(value) || value.length !== 3) return fallback;
  const labels = value.map((item) => String(item || "").trim());
  if (labels.some((item) => !item)) return fallback;
  return [labels[0], labels[1], labels[2]];
}

/** Merge CMS document with code defaults. */
export function resolveQuoteFormConfig(
  cms: Partial<QuoteFormConfig> | null | undefined,
): QuoteFormConfig {
  const d = defaultQuoteFormConfig;
  return {
    eyebrow: cms?.eyebrow ?? d.eyebrow,
    headline: cms?.headline?.trim() || d.headline,
    support: cms?.support?.trim() || d.support,
    stepLabels: asStepLabels(cms?.stepLabels, d.stepLabels),
    successHeading: cms?.successHeading?.trim() || d.successHeading,
    successBody: cms?.successBody?.trim() || d.successBody,
    submitLabel: cms?.submitLabel?.trim() || d.submitLabel,
    nameField: asField(cms?.nameField, d.nameField),
    emailField: asField(cms?.emailField, d.emailField),
    companyField: asField(cms?.companyField, d.companyField),
    projectTypeField: asField(cms?.projectTypeField, d.projectTypeField),
    budgetField: asField(cms?.budgetField, d.budgetField),
    timelineField: asField(cms?.timelineField, d.timelineField),
    messageField: asField(cms?.messageField, d.messageField),
    attachmentsField: asField(cms?.attachmentsField, d.attachmentsField),
    projectTypes: asOptions(cms?.projectTypes, d.projectTypes, true),
    budgetRanges: asOptions(cms?.budgetRanges, d.budgetRanges),
    timelines: asOptions(cms?.timelines, d.timelines),
    seo: cms?.seo ?? null,
  };
}

export function enabledOptions(options: QuoteFormOption[]): QuoteFormOption[] {
  return options.filter((option) => option.enabled !== false);
}

export function optionValues(options: QuoteFormOption[]): string[] {
  return enabledOptions(options).map((option) => option.value);
}

export function labelMap(options: QuoteFormOption[]): Record<string, string> {
  return Object.fromEntries(
    options.map((option) => [option.value, option.label]),
  );
}

export function labelFor(
  options: QuoteFormOption[],
  value: string,
): string {
  return labelMap(options)[value] ?? value;
}

export function findOption(
  options: QuoteFormOption[],
  value: string,
): QuoteFormOption | undefined {
  return options.find((option) => option.value === value);
}

/** Prefer form label; fall back to linked service title. */
export function projectTypeDisplayLabel(
  options: QuoteFormOption[],
  value: string,
): string {
  const option = findOption(options, value);
  if (!option) return value;
  return option.label || option.service?.title || value;
}
