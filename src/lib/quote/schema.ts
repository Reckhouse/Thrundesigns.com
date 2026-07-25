import { z } from "zod";
import { BUDGET_RANGES, PROJECT_TYPES, TIMELINES } from "@/lib/quote/options";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const quoteFieldsSchema = z
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
    projectType: z.enum(PROJECT_TYPES),
    budget: z.enum(BUDGET_RANGES),
    timeline: z.enum(TIMELINES),
    message: z.string().trim().min(10).max(3000),
  })
  .strict();

/** Client form schema — same rules with friendlier messages. */
export const quoteClientSchema = z.object({
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
  projectType: z.enum(PROJECT_TYPES, {
    error: "Select a project type",
  }),
  budget: z.enum(BUDGET_RANGES, {
    error: "Select a budget range",
  }),
  timeline: z.enum(TIMELINES, {
    error: "Select a timeline",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more")
    .max(3000, "Message is too long"),
});

export type QuoteFields = z.infer<typeof quoteFieldsSchema>;
export type QuoteClientValues = z.infer<typeof quoteClientSchema>;
