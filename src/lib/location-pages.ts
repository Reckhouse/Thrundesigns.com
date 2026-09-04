import type { FaqItem } from "@/components/seo/faq-json-ld";
import type {
  TopicLink,
  TopicSection,
} from "@/components/marketing/topic-marketing-page";
import { STUDIO_AREA_LABEL, STUDIO_SERVICE_AREA_SUMMARY } from "@/lib/studio-location";

export type LocationPageDefinition = {
  slug: "branding" | "web-design" | "graphic-design";
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: TopicSection[];
  faqs: FaqItem[];
  relatedLinks: TopicLink[];
  cta: {
    heading: string;
    copy: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export const COLORADO_SPRINGS_HUB = {
  metadataTitle: `Brand, Web & Graphic Design in ${STUDIO_AREA_LABEL}`,
  metadataDescription:
    "Thrun Design Co. is a Colorado Springs studio for branding, website design/development, and graphic design—built for startups and growing businesses across the Front Range.",
  eyebrow: "Colorado Springs",
  title: "Brand, web, and graphic design for Colorado Springs businesses",
  intro: `${STUDIO_SERVICE_AREA_SUMMARY} We help founders and owners clarify identity, ship sharper websites, and produce materials that match how the business actually sells.`,
  sections: [
    {
      title: "Why local searchers land here",
      paragraphs: [
        "Colorado Springs companies often need more than a logo file or a template site. They need a system that holds up across a homepage, sales deck, packaging, and launch campaign—without agency theater.",
        "Thrun Design Co. focuses on brand identity, website design and development, graphic design, and practical marketing audits for startups and growing businesses.",
      ],
      list: [
        "Brand identity systems founders can hand to a team",
        "Marketing websites with clear conversion paths",
        "Graphic design for collateral, packaging, and campaigns",
        "Scoped quotes with plain-language next steps",
      ],
    },
    {
      title: "Who we help in the Springs and beyond",
      paragraphs: [
        "Local service businesses, product startups, and owners preparing a rebrand or site rebuild. We also work remotely with clients nationwide when the collaboration stays direct and scoped.",
      ],
    },
  ] satisfies TopicSection[],
  faqs: [
    {
      question: "Is Thrun Design Co. based in Colorado Springs?",
      answer:
        "Yes. We are based in Colorado Springs, CO, and serve clients across the Front Range as well as remote engagements nationwide.",
    },
    {
      question: "Do you work with startups?",
      answer:
        "Yes. Many engagements begin with early-stage founders who need a coherent brand system, a launch website, or both before they scale marketing spend.",
    },
    {
      question: "What services do you offer locally?",
      answer:
        "Brand identity, website design and development, graphic and campaign design, and brand/marketing audits.",
    },
  ] satisfies FaqItem[],
  relatedLinks: [
    {
      label: "Branding in Colorado Springs",
      href: "/colorado-springs/branding",
      description: "Identity systems, naming support, and guidelines.",
    },
    {
      label: "Web design in Colorado Springs",
      href: "/colorado-springs/web-design",
      description: "Marketing sites with clear structure and CMS handoff.",
    },
    {
      label: "Graphic design in Colorado Springs",
      href: "/colorado-springs/graphic-design",
      description: "Collateral, packaging, and campaign assets.",
    },
    {
      label: "Design for startups",
      href: "/startups",
      description: "Brand and website systems for early-stage teams.",
    },
  ] satisfies TopicLink[],
  cta: {
    heading: "Tell us what you need to ship next",
    copy: "Share a short brief about the business, audience, and deadline. We reply within a few business days with scope options.",
    primaryLabel: "Request a quote",
    primaryHref: "/quote",
    secondaryLabel: "About the studio",
    secondaryHref: "/about",
  },
};

export const COLORADO_SPRINGS_PAGES: LocationPageDefinition[] = [
  {
    slug: "branding",
    metadataTitle: `Branding Agency in ${STUDIO_AREA_LABEL}`,
    metadataDescription:
      "Brand identity and system design for Colorado Springs startups and growing businesses—marks, guidelines, and rollout assets that stay coherent.",
    eyebrow: "Colorado Springs · Branding",
    title: "Branding and brand identity for Colorado Springs businesses",
    intro:
      "When the mark, voice, and materials no longer match how you sell, we build a brand system Colorado Springs founders can actually use—across the site, decks, and day-to-day assets.",
    sections: [
      {
        title: "What branding work includes",
        paragraphs: [
          "Brand identity here means more than a logo contest. We clarify positioning when needed, then design marks, type, color, and usage rules your team can apply without reinterpretation every week.",
        ],
        list: [
          "Positioning and verbal direction when the brief needs it",
          "Primary and secondary marks with clear rules",
          "Color, type, and photography direction",
          "Practical guidelines and core rollout assets",
        ],
      },
      {
        title: "Built for startups and growing owners",
        paragraphs: [
          "Early-stage teams need a system that can stretch into a website, pitch deck, and packaging without a redesign every quarter. Local owners get direct collaboration—no layers between the brief and the designer.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you offer branding for Colorado Springs startups?",
        answer:
          "Yes. Startup branding is a core fit: identity systems sized for launch, fundraising, and first marketing channels.",
      },
      {
        question: "Is this only logo design?",
        answer:
          "No. A mark is one piece. The useful deliverable is a brand system that holds together across digital and print touchpoints.",
      },
      {
        question: "Can branding connect to a website project?",
        answer:
          "Yes. Brand and web often run as a sequence or combined engagement so the site inherits the system.",
      },
    ],
    relatedLinks: [
      {
        label: "Brand identity service",
        href: "/services/brand-identity",
        description: "Full service detail, process, and deliverables.",
      },
      {
        label: "Web design in Colorado Springs",
        href: "/colorado-springs/web-design",
      },
      {
        label: "Startups hub",
        href: "/startups",
      },
    ],
    cta: {
      heading: "Discuss a brand identity project",
      copy: "Send a short brief. We’ll reply with scope options for a rebrand, refresh, or from-scratch identity.",
      primaryLabel: "Request a branding quote",
      primaryHref: "/quote?type=brand",
      secondaryLabel: "See brand identity service",
      secondaryHref: "/services/brand-identity",
    },
  },
  {
    slug: "web-design",
    metadataTitle: `Web Design & Development in ${STUDIO_AREA_LABEL}`,
    metadataDescription:
      "Website design and development for Colorado Springs businesses and startups—clear structure, conversion paths, and a CMS your team can maintain.",
    eyebrow: "Colorado Springs · Web design",
    title: "Website design and development for Colorado Springs",
    intro:
      "Replace an outdated site or launch a clear digital front door. We design and build marketing websites for Colorado Springs companies that need hierarchy, proof, and a path to inquire.",
    sections: [
      {
        title: "Design and development in one engagement",
        paragraphs: [
          "Strategic web design here includes information architecture, key templates, responsive build, and CMS structure—not just mockups. Most marketing sites use a modern front end with an editor-friendly CMS so your team can update content after launch.",
        ],
        list: [
          "Sitemap and page priority based on visitor jobs",
          "Design for home, services, work, and contact templates",
          "Responsive build with performance and accessibility in mind",
          "Launch support and optional maintenance",
        ],
      },
      {
        title: "For local businesses and remote founders",
        paragraphs: [
          "Whether you serve customers in El Paso County or sell nationally from Colorado Springs, the site still needs a sharp story, fast pages, and a quote or contact path that works on mobile.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you develop the website as well as design it?",
        answer:
          "Yes. Engagements typically include design and front-end development with a maintainable CMS, confirmed during scoping.",
      },
      {
        question: "Can you redesign an existing Colorado Springs business site?",
        answer:
          "Yes. Many projects start with a content and conversion review of what you have, then rebuild the templates that matter most.",
      },
      {
        question: "Do startups need a full marketing site on day one?",
        answer:
          "Not always. We help founders choose between a lean launch site and a fuller system once positioning is clear—often after brand work.",
      },
    ],
    relatedLinks: [
      {
        label: "Web design service",
        href: "/services/web-design",
        description: "Process, deliverables, and FAQs.",
      },
      {
        label: "Branding in Colorado Springs",
        href: "/colorado-springs/branding",
      },
      {
        label: "Startups hub",
        href: "/startups",
      },
    ],
    cta: {
      heading: "Discuss a website project",
      copy: "Tell us about the business, the audience, and what the site must accomplish. We’ll reply with scope options.",
      primaryLabel: "Request a website quote",
      primaryHref: "/quote?type=website",
      secondaryLabel: "See web design service",
      secondaryHref: "/services/web-design",
    },
  },
  {
    slug: "graphic-design",
    metadataTitle: `Graphic Design in ${STUDIO_AREA_LABEL}`,
    metadataDescription:
      "Graphic design for Colorado Springs businesses—collateral, packaging, decks, and campaign assets that match your brand system.",
    eyebrow: "Colorado Springs · Graphic design",
    title: "Graphic design for Colorado Springs brands and campaigns",
    intro:
      "When decks, packaging, ads, or leave-behinds look like different companies, we design production-ready graphic assets that extend the brand into the places customers actually meet you.",
    sections: [
      {
        title: "What graphic design covers here",
        paragraphs: [
          "Collateral and campaign design for print and digital: sales decks, packaging language, launch kits, event materials, and reusable templates. Strongest when it extends an existing brand system—or ships alongside one.",
        ],
        list: [
          "Campaign and collateral concepts aligned to the brand",
          "Layouts for print and digital formats",
          "Production-ready file prep and vendor notes",
          "Templates your team can reuse",
        ],
      },
      {
        title: "Local launches and ongoing materials",
        paragraphs: [
          "Colorado Springs businesses often need a burst of graphic design for a launch, trade show, or seasonal campaign—then templates so the next piece does not start from zero.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you offer graphic design separately from branding?",
        answer:
          "Yes. Graphic and campaign design can follow a brand project or stand alone when a usable system already exists.",
      },
      {
        question: "Do you handle printing?",
        answer:
          "We prepare production files and can coordinate with your printer or recommend vendors. Physical printing is usually billed by the vendor.",
      },
      {
        question: "Is this the same as logo design?",
        answer:
          "Logo and identity systems live under brand identity. Graphic design here focuses on the materials and campaigns that carry that identity into market.",
      },
    ],
    relatedLinks: [
      {
        label: "Graphic design service",
        href: "/services/graphic-design",
        description: "Full service detail and deliverables.",
      },
      {
        label: "Print & digital campaigns",
        href: "/services/print-digital",
      },
      {
        label: "Branding in Colorado Springs",
        href: "/colorado-springs/branding",
      },
    ],
    cta: {
      heading: "Discuss graphic design needs",
      copy: "Share the formats, deadline, and whether a brand system already exists. We’ll reply with a scoped plan.",
      primaryLabel: "Request a graphic design quote",
      primaryHref: "/quote?type=print",
      secondaryLabel: "See graphic design service",
      secondaryHref: "/services/graphic-design",
    },
  },
];

export function getColoradoSpringsPage(slug: string) {
  return COLORADO_SPRINGS_PAGES.find((page) => page.slug === slug);
}

export const STARTUPS_PAGE = {
  metadataTitle: "Brand & Website Design for Startups",
  metadataDescription:
    "Brand identity, website design, and graphic systems for startups and early-stage founders—based in Colorado Springs, available nationwide.",
  eyebrow: "Startups",
  title: "Brand and website systems for startups and early-stage founders",
  intro:
    "Launch with clarity instead of a pile of mismatched files. We help startups define identity, ship a focused website, and produce the graphic materials needed for fundraising, sales, and first campaigns.",
  sections: [
    {
      title: "What startups usually need first",
      paragraphs: [
        "Most early-stage teams do not need an enterprise rebrand. They need a coherent mark and system, a site that explains the offer, and a short set of assets that look like the same company in a deck, one-pager, and product UI screenshot.",
      ],
      list: [
        "Brand identity sized for launch and next hires",
        "A lean marketing site or fuller site when the offer is clear",
        "Graphic design for pitch, packaging, or launch kits",
        "Optional audit when messaging and touchpoints already conflict",
      ],
    },
    {
      title: "Colorado Springs base, remote-friendly process",
      paragraphs: [
        `${STUDIO_SERVICE_AREA_SUMMARY} Founders get direct collaboration with the designer responsible for the work—scoped in plain language so momentum stays real.`,
      ],
    },
    {
      title: "How engagements typically sequence",
      paragraphs: [
        "Brand first when positioning is fuzzy. Website first when the offer is clear but the digital front door is weak. Combined when launch timing requires both. We confirm the sequence in the quote reply.",
      ],
    },
  ] satisfies TopicSection[],
  faqs: [
    {
      question: "Do you work with startups outside Colorado Springs?",
      answer:
        "Yes. We are based in Colorado Springs and regularly collaborate remotely with founders across the United States.",
    },
    {
      question: "Can you help before we have funding?",
      answer:
        "Often yes, with a scoped phase that matches runway—identity essentials and a lean site rather than an open-ended retainer.",
    },
    {
      question: "Do you invent case-study metrics?",
      answer:
        "No. Public concept studies are labeled as concepts until real client work replaces them. We do not invent outcomes.",
    },
  ] satisfies FaqItem[],
  relatedLinks: [
    {
      label: "Brand identity",
      href: "/services/brand-identity",
    },
    {
      label: "Web design",
      href: "/services/web-design",
    },
    {
      label: "Colorado Springs hub",
      href: "/colorado-springs",
    },
    {
      label: "Graphic design",
      href: "/services/graphic-design",
    },
  ] satisfies TopicLink[],
  cta: {
    heading: "Send a founder-ready brief",
    copy: "Tell us the stage, audience, and what must ship next. We reply within a few business days with options.",
    primaryLabel: "Request a startup project quote",
    primaryHref: "/quote",
    secondaryLabel: "Browse concept studies",
    secondaryHref: "/work",
  },
};
