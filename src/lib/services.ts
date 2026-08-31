import type { ProjectType } from "@/lib/quote/project-type";

export type ServiceSlug =
  | "brand-identity"
  | "web-design"
  | "marketing-audit"
  | "print-digital";

export type ServiceDefinition = {
  slug: ServiceSlug;
  icon: "brand" | "web" | "audit" | "print";
  title: string;
  shortTitle: string;
  description: string;
  situation: string;
  forWhom: string[];
  notFor: string[];
  deliverables: string[];
  process: { title: string; copy: string }[];
  faqs: { question: string; answer: string }[];
  quoteType: ProjectType;
  relatedProjectSlugs: string[];
  relatedServiceSlugs: ServiceSlug[];
  ctaLabel: string;
};

export const SERVICES: ServiceDefinition[] = [
  {
    slug: "brand-identity",
    icon: "brand",
    title: "Brand identity & system design",
    shortTitle: "Brand identity",
    description:
      "Naming, visual language, and guidelines that stay coherent as a growing business adds channels and people.",
    situation:
      "You are renaming, refreshing, or building a brand from scratch, and the current mark, voice, or guidelines cannot keep up with how the business actually sells.",
    forWhom: [
      "Founders and owners preparing a rebrand or launch",
      "Teams whose materials no longer match the product or sales story",
      "Businesses that need a system other people can apply without the designer in the room",
    ],
    notFor: [
      "One-off logo contests with no strategy or rollout plan",
      "Trend-chasing refreshes that ignore positioning",
      "Enterprises that need a large retained branding department",
    ],
    deliverables: [
      "Positioning and verbal direction when the brief needs it",
      "Primary and secondary marks with clear usage rules",
      "Color, type, and photography direction",
      "A practical guidelines document your team can follow",
      "Core rollout assets (profiles, templates, or launch kits as scoped)",
    ],
    process: [
      {
        title: "Diagnose",
        copy: "We clarify audience, competitive frame, and what must stay true as the brand scales.",
      },
      {
        title: "Design the system",
        copy: "Identity work is built as a system—marks, type, color, and voice that hold together across touchpoints.",
      },
      {
        title: "Hand off for use",
        copy: "You leave with files, rules, and examples your team can ship without reinterpretation every week.",
      },
    ],
    faqs: [
      {
        question: "Do you only design logos?",
        answer:
          "No. A mark is one piece. The useful deliverable is a system—how the brand shows up in sales decks, packaging, the site, and day-to-day materials.",
      },
      {
        question: "Can this connect to a website project?",
        answer:
          "Yes. Brand and web often run as a sequence or a combined engagement so the site inherits the system instead of inventing a parallel one.",
      },
    ],
    quoteType: "brand",
    relatedProjectSlugs: [
      "juniper-and-stone-coffee",
      "hollowbeam",
      "northline-advisory",
    ],
    relatedServiceSlugs: ["web-design", "print-digital"],
    ctaLabel: "Discuss a brand identity project",
  },
  {
    slug: "web-design",
    icon: "web",
    title: "Strategic web design",
    shortTitle: "Web design",
    description:
      "Marketing and portfolio sites with clear hierarchy, conversion paths, and a maintenance plan after launch.",
    situation:
      "Your site is outdated, confusing, or hard to update—and it no longer reflects how you sell or what customers need to decide.",
    forWhom: [
      "Owners who need a sharper marketing or portfolio site",
      "Teams launching a new offer that needs a clear digital front door",
      "Businesses that want a CMS they can actually maintain",
    ],
    notFor: [
      "Fully custom app platforms outside a marketing-site scope",
      "Template swaps with no information architecture work",
      "Projects with no one accountable for content after launch",
    ],
    deliverables: [
      "Sitemap and page priority based on real visitor jobs",
      "Design for key templates (home, work/services, contact, and more as scoped)",
      "Responsive build with performance and accessibility in mind",
      "CMS structure and editor guidance",
      "Launch support and optional maintenance",
    ],
    process: [
      {
        title: "Map the journey",
        copy: "We define what each page must accomplish and what proof a visitor needs before they inquire.",
      },
      {
        title: "Design and build",
        copy: "Layout, content hierarchy, and implementation stay aligned so the live site matches the strategy.",
      },
      {
        title: "Launch and steady",
        copy: "You get a shippable site plus a clear way to update it—and optional ongoing care.",
      },
    ],
    faqs: [
      {
        question: "Do you build on a specific CMS?",
        answer:
          "Most marketing sites here use a headless CMS with a Next.js front end so editors stay productive and the site stays fast. We confirm the stack in scoping.",
      },
      {
        question: "Can you redesign an existing site?",
        answer:
          "Yes. Many projects start with a content and conversion audit of what you have, then rebuild the templates that matter most.",
      },
    ],
    quoteType: "website",
    relatedProjectSlugs: [
      "juniper-and-stone-website",
      "hollowbeam-website",
      "orbit-systems",
    ],
    relatedServiceSlugs: ["brand-identity", "marketing-audit"],
    ctaLabel: "Discuss a website project",
  },
  {
    slug: "marketing-audit",
    icon: "audit",
    title: "Brand & marketing audit",
    shortTitle: "Marketing audit",
    description:
      "A practical review of messaging, touchpoints, and materials so you know what to fix first—and what can wait.",
    situation:
      "Marketing feels busy but unclear. The homepage, sales talk, and leave-behinds disagree, and you need a plain-language priority list before a bigger redesign.",
    forWhom: [
      "Owners who sense the brand is off but lack a diagnosis",
      "Teams preparing to invest in a rebrand or new site",
      "Businesses that want scoped options instead of a vague pitch",
    ],
    notFor: [
      "Vanity reports packed with invented metrics",
      "SEO-only technical crawls with no brand or message review",
      "Ongoing retainers disguised as a one-time audit",
    ],
    deliverables: [
      "Review of primary digital and key offline touchpoints",
      "Message-versus-reality notes in plain language",
      "Friction points ranked by trust and conversion risk",
      "A prioritized action plan with scope options",
      "Clear recommendation on whether to fix, refresh, or rebuild",
    ],
    process: [
      {
        title: "Collect",
        copy: "We gather the homepage, key pages, and representative materials you already use to sell.",
      },
      {
        title: "Diagnose",
        copy: "We compare promises, proof, and follow-through across touchpoints—not just visual polish.",
      },
      {
        title: "Prescribe",
        copy: "You receive a written plan with priorities and realistic next-step options.",
      },
    ],
    faqs: [
      {
        question: "Is an audit required before other work?",
        answer:
          "Not always. It is useful when the problem is unclear or when you want evidence before funding a larger brand or web project.",
      },
      {
        question: "How long does it take?",
        answer:
          "Most audits resolve in days to a couple of weeks depending on how many touchpoints you include. Timing is confirmed in the quote reply.",
      },
    ],
    quoteType: "audit",
    relatedProjectSlugs: ["northline-advisory", "summit-construction"],
    relatedServiceSlugs: ["brand-identity", "web-design"],
    ctaLabel: "Request a marketing audit quote",
  },
  {
    slug: "print-digital",
    icon: "print",
    title: "Print & digital campaign design",
    shortTitle: "Print & digital",
    description:
      "Collateral and campaigns that extend the brand into the places your customers actually meet you.",
    situation:
      "You have a brand on paper, but decks, packaging, ads, or launch kits still look and sound like different companies.",
    forWhom: [
      "Teams shipping a launch, event, or seasonal campaign",
      "Businesses that need sales and leave-behind materials to match the site",
      "Owners who want production-ready files, not just mood boards",
    ],
    notFor: [
      "One-off social posts with no brand system underneath",
      "Print-only vendors who ignore digital continuity",
      "Open-ended content mills",
    ],
    deliverables: [
      "Campaign or collateral concepts aligned to the brand system",
      "Layouts for print and digital formats as scoped",
      "Production-ready file prep and vendor notes when needed",
      "Templates your team can reuse for related pieces",
      "Coordination with brand or web work so everything shares one voice",
    ],
    process: [
      {
        title: "Frame the job",
        copy: "We define the audience moment—what someone should understand or do when they meet the piece.",
      },
      {
        title: "Design for production",
        copy: "Concepts move quickly into formats that print shops, platforms, and your team can actually use.",
      },
      {
        title: "Ship and reuse",
        copy: "You get final files plus patterns for the next related piece without starting from zero.",
      },
    ],
    faqs: [
      {
        question: "Do you handle printing?",
        answer:
          "We prepare production files and can coordinate with your printer or recommend vendors. Physical printing is usually billed separately by the vendor.",
      },
      {
        question: "Can this follow a brand project?",
        answer:
          "Ideally yes. Campaign work is strongest when it extends an existing system instead of inventing a parallel look.",
      },
    ],
    quoteType: "print",
    relatedProjectSlugs: ["juniper-and-stone-coffee", "hollowbeam"],
    relatedServiceSlugs: ["brand-identity", "web-design"],
    ctaLabel: "Discuss print & digital assets",
  },
];

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export function getServiceByIcon(
  icon?: string | null,
): ServiceDefinition | undefined {
  if (!icon) return undefined;
  return SERVICES.find((service) => service.icon === icon);
}

export function primaryServiceForProject(input: {
  services?: string | null;
  workCategory?: string | null;
}): ServiceDefinition {
  const blob = `${input.workCategory || ""} ${input.services || ""}`.toLowerCase();
  if (blob.includes("audit")) return getServiceBySlug("marketing-audit")!;
  if (
    blob.includes("web") ||
    blob.includes("website") ||
    blob.includes("ecommerce") ||
    input.workCategory === "web-design"
  ) {
    return getServiceBySlug("web-design")!;
  }
  if (
    blob.includes("print") ||
    blob.includes("packaging") ||
    blob.includes("campaign")
  ) {
    return getServiceBySlug("print-digital")!;
  }
  return getServiceBySlug("brand-identity")!;
}
