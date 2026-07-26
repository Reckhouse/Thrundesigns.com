import { defineArrayMember, defineField, defineType } from "sanity";

/** Stable option ids — allow current values like `40k+` and `1-3`. */
const slugPattern = /^[a-z0-9][a-z0-9+.-]*$/;

function uniqueValuesRule(listTitle: string) {
  return (Rule: {
    custom: (
      fn: (
        value: { value?: string; enabled?: boolean }[] | undefined,
      ) => true | string,
    ) => unknown;
  }) =>
    Rule.custom((items) => {
      if (!items?.length) return `${listTitle} needs at least one option`;
      const values = items
        .map((item) => item?.value?.trim())
        .filter((value): value is string => Boolean(value));
      if (values.length !== items.length) {
        return "Every option needs a value slug";
      }
      if (new Set(values).size !== values.length) {
        return "Option values must be unique";
      }
      if (!items.some((item) => item.enabled !== false)) {
        return `${listTitle} needs at least one enabled option`;
      }
      return true;
    });
}

export const quoteFormOption = defineType({
  name: "quoteFormOption",
  title: "Form option",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value (slug)",
      type: "string",
      description:
        "Stable id stored on submissions and sent by the form (e.g. brand). Do not rename lightly.",
      validation: (Rule) =>
        Rule.required()
          .regex(slugPattern, {
            name: "slug",
            invert: false,
          })
          .error("Use lowercase letters, numbers, hyphens, +, and dots"),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required().min(1).max(80),
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "value", enabled: "enabled" },
    prepare({ title, subtitle, enabled }) {
      return {
        title: title || subtitle || "Option",
        subtitle: `${subtitle || "—"}${enabled === false ? " · disabled" : ""}`,
      };
    },
  },
});

/** Project-type option with optional link to a Service document. */
export const quoteFormProjectTypeOption = defineType({
  name: "quoteFormProjectTypeOption",
  title: "Project type option",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value (slug)",
      type: "string",
      description:
        "Stable id stored on submissions (e.g. brand). Keep even when a Service is linked.",
      validation: (Rule) =>
        Rule.required()
          .regex(slugPattern, {
            name: "slug",
            invert: false,
          })
          .error("Use lowercase letters, numbers, hyphens, +, and dots"),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        "Shown in the form. Prefer matching the linked Service title when one is set.",
      validation: (Rule) => Rule.required().min(1).max(80),
    }),
    defineField({
      name: "service",
      title: "Linked service",
      type: "reference",
      to: [{ type: "service" }],
      description:
        "Optional. Ties this option to a Services document for summary copy and inbox context. Leave empty for options like Mixed.",
      weak: true,
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "value",
      enabled: "enabled",
      serviceTitle: "service.title",
    },
    prepare({ title, subtitle, enabled, serviceTitle }) {
      const bits = [subtitle || "—"];
      if (serviceTitle) bits.push(`→ ${serviceTitle}`);
      if (enabled === false) bits.push("disabled");
      return {
        title: title || subtitle || "Project type",
        subtitle: bits.join(" · "),
      };
    },
  },
});

export const quoteFormField = defineType({
  name: "quoteFormField",
  title: "Form field copy",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "placeholder",
      type: "string",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "helperText",
      type: "string",
      validation: (Rule) => Rule.max(200),
    }),
  ],
});

export const quoteForm = defineType({
  name: "quoteForm",
  title: "Quote form",
  type: "document",
  groups: [
    { name: "page", title: "Page copy", default: true },
    { name: "fields", title: "Field labels" },
    { name: "options", title: "Options" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      group: "page",
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: "headline",
      type: "string",
      group: "page",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "support",
      type: "text",
      rows: 3,
      group: "page",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "stepLabels",
      title: "Step labels",
      type: "array",
      group: "page",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.required().min(3).max(3),
      description: "Exactly three labels: Contact, Project, Details (or your wording).",
    }),
    defineField({
      name: "successHeading",
      type: "string",
      group: "page",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "successBody",
      type: "text",
      rows: 4,
      group: "page",
      validation: (Rule) => Rule.required().max(600),
    }),
    defineField({
      name: "submitLabel",
      type: "string",
      group: "page",
      initialValue: "Submit quote",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "nameField",
      title: "Name field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "emailField",
      title: "Email field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "companyField",
      title: "Company field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "projectTypeField",
      title: "Project type field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "budgetField",
      title: "Budget field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "timelineField",
      title: "Timeline field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messageField",
      title: "Message field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "attachmentsField",
      title: "Attachments field",
      type: "quoteFormField",
      group: "fields",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "projectTypes",
      title: "Project types",
      type: "array",
      group: "options",
      of: [defineArrayMember({ type: "quoteFormProjectTypeOption" })],
      validation: uniqueValuesRule("Project types"),
      description:
        "Each option can optionally reference a Service. The option value slug is what submissions store.",
    }),
    defineField({
      name: "budgetRanges",
      title: "Budget ranges",
      type: "array",
      group: "options",
      of: [defineArrayMember({ type: "quoteFormOption" })],
      validation: uniqueValuesRule("Budget ranges"),
    }),
    defineField({
      name: "timelines",
      title: "Timelines",
      type: "array",
      group: "options",
      of: [defineArrayMember({ type: "quoteFormOption" })],
      validation: uniqueValuesRule("Timelines"),
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Quote form" };
    },
  },
});
