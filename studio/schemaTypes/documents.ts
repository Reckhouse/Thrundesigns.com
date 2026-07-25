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
    defineField({ name: "icon", type: "string", description: "brand | web | print" }),
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
    defineField({ name: "name", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "projectType", type: "string" }),
    defineField({ name: "budget", type: "string" }),
    defineField({ name: "timeline", type: "string" }),
    defineField({ name: "message", type: "text" }),
    defineField({
      name: "attachments",
      type: "array",
      of: [{ type: "url" }],
    }),
    defineField({ name: "submittedAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "name", subtitle: "email" },
  },
});
