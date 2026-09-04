import { defineField, defineType } from "sanity";
import { AttachmentPathnamesInput } from "../components/AttachmentPathnamesInput";

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
      description: "brand | web | audit | print | graphic",
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
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "experience", title: "Experience" },
    { name: "modules", title: "Page modules" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "identity",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "identity",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "industry", type: "string", group: "identity" }),
    defineField({ name: "services", type: "string", group: "identity" }),
    defineField({
      name: "workCategory",
      title: "Work category",
      type: "string",
      group: "identity",
      description:
        "/work section grouping. Empty categories are hidden on the work index.",
      options: {
        list: [
          { title: "Animation Studies", value: "animation-studies" },
          { title: "Web Design", value: "web-design" },
          { title: "Branding Strategy", value: "branding-strategy" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 4,
      group: "identity",
    }),
    defineField({ name: "cover", type: "mediaAsset", group: "identity" }),
    defineField({
      name: "featured",
      title: "Homepage featured",
      type: "boolean",
      group: "identity",
      description:
        "Show this project in the homepage work marquee. The /work index still lists all projects by category.",
      initialValue: false,
    }),
    defineField({ name: "order", type: "number", group: "identity" }),
    defineField({
      name: "primaryExperience",
      title: "Primary experience",
      type: "projectThreeExperience",
      group: "experience",
      description:
        "Optional project-level experience for hero preview, fullscreen launch, and metadata. Inline modules may still embed the same experience in preview mode.",
    }),
    defineField({
      name: "featuredCreations",
      title: "Featured creations",
      type: "array",
      group: "experience",
      of: [{ type: "featuredCreation" }],
      description:
        "Curated creation IDs only. Full payloads live in the application creations store.",
    }),
    defineField({
      name: "modules",
      title: "Page modules",
      type: "array",
      group: "modules",
      description:
        "Compose the case study below the fixed project hero. Drag to reorder.",
      of: [
        { type: "projectRichText" },
        { type: "projectGallery" },
        { type: "projectSplit" },
        { type: "projectMetrics" },
        { type: "projectProcess" },
        { type: "projectQuote" },
        { type: "projectVideo" },
        { type: "projectThreeExperience" },
        { type: "projectCta" },
        { type: "projectCredits" },
      ],
      options: {
        insertMenu: {
          views: [{ name: "grid" }, { name: "list" }],
        },
      },
    }),
    defineField({
      name: "gallery",
      type: "array",
      of: [{ type: "mediaAsset" }],
      group: "modules",
      hidden: true,
      deprecated: {
        reason: "Use a Gallery page module instead.",
      },
    }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block" }],
      group: "modules",
      hidden: true,
      deprecated: {
        reason: "Use a Rich text page module instead.",
      },
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      industry: "industry",
      media: "cover.image",
    },
    prepare({ title, industry, media }) {
      return {
        title: title || "Untitled project",
        subtitle: industry || "Project",
        media,
      };
    },
  },
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
      name: "service",
      title: "Linked service",
      type: "reference",
      to: [{ type: "service" }],
      readOnly: true,
      weak: true,
      description:
        "Filled automatically when the chosen project type option links a Service.",
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
      title: "Attachments",
      description:
        "Private Vercel Blob pathnames. Use Download to open a short-lived signed link (requires Studio attachment secret).",
      type: "array",
      of: [{ type: "string" }],
      readOnly: true,
      components: {
        input: AttachmentPathnamesInput,
      },
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
      serviceTitle: "service.title",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ title, email, projectType, serviceTitle, status, submittedAt }) {
      const when = submittedAt
        ? new Date(submittedAt).toLocaleDateString()
        : "—";
      const project = serviceTitle || projectType || "—";
      return {
        title: title || "Untitled submission",
        subtitle: `${status || "new"} · ${project} · ${email || "—"} · ${when}`,
      };
    },
  },
});
