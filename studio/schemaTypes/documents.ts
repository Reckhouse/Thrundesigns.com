import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      type: "string",
      description: "brand | web | audit | print",
    }),
    defineField({ name: "summary", type: "text", rows: 3 }),
    defineField({ name: "linkLabel", type: "string", initialValue: "Learn more" }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});

export const processStep = defineType({
  name: "processStep",
  title: "Process step",
  type: "document",
  fields: [
    defineField({ name: "number", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "copy", type: "text", rows: 3 }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "industry", type: "string" }),
    defineField({ name: "services", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 4 }),
    defineField({ name: "cover", type: "mediaAsset" }),
    defineField({
      name: "gallery",
      type: "array",
      of: [{ type: "mediaAsset" }],
    }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({ name: "featured", type: "boolean", initialValue: true }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "seo", type: "seo" }),
  ],
});

export const quoteSubmission = defineType({
  name: "quoteSubmission",
  title: "Quote submission",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Read", value: "read" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "new",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "company", type: "string", readOnly: true }),
    defineField({
      name: "projectType",
      title: "Project type (slug)",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "budget",
      title: "Budget (slug)",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "timeline",
      title: "Timeline (slug)",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "message", type: "text", readOnly: true }),
    defineField({
      name: "attachments",
      title: "Attachment pathnames",
      description:
        "Private Vercel Blob pathnames (not public URLs). Download with QUOTE_READ_WRITE_TOKEN.",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
    }),
    defineField({ name: "submittedAt", type: "datetime", readOnly: true }),
  ],
  orderings: [
    {
      title: "Submitted (newest)",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      email: "email",
      projectType: "projectType",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ title, email, projectType, status, submittedAt }) {
      const when = submittedAt
        ? new Date(submittedAt).toLocaleDateString()
        : "—";
      return {
        title: title || "Untitled submission",
        subtitle: `${status || "new"} · ${projectType || "—"} · ${email || "—"} · ${when}`,
      };
    },
  },
});
