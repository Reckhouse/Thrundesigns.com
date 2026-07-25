export const defaultHomeContent = {
  home: {
    hero: {
      eyebrow: "Thrun Design Co.",
      headline: "Strategic design for businesses ready to move forward.",
      support:
        "We help founders and owners build clearer brands, websites, and marketing systems — so your next chapter feels confident, not chaotic.",
      servicesMeta: "Brand systems  ·  Web  ·  Audits  ·  Print & digital",
      primaryCta: { label: "Request a project quote", href: "/quote" },
      secondaryCta: { label: "Browse concept studies", href: "/work" },
      image: {
        blobUrl: "/images/hero-mountain.jpg",
        alt: "Dramatic desaturated mountain ridge with open sky",
      },
    },
    servicesIntro: {
      eyebrow: null,
      heading: "Four ways we steady a growing brand.",
      intro:
        "From the system that holds your identity together to the site you maintain and the materials your team ships every week.",
    },
    processIntro: {
      eyebrow: null,
      heading: "A clear path from brief to launch.",
    },
    workIntro: {
      eyebrow: "Concept studies",
      heading: "Speculative work with production intent.",
      intro:
        "These are concept projects — not client case studies — until we replace them with real engagements. They show how we think about advisory, construction, and systems brands.",
    },
    whyThrun: {
      eyebrow: null,
      heading: "A partner when the stakes feel real.",
      bullets: [
        "Systems that stay coherent as you grow",
        "Brand architecture that works across channels",
        "Careful craft without decorative excess",
        "Steady pace from discovery through launch",
      ],
      credibilityEyebrow: null,
      credibilityHeading: "What you get when we work together.",
      proofPoints: [
        { num: "01", label: "Identity systems and guidelines your team can actually use" },
        { num: "02", label: "Websites designed for clarity and conversion — then maintained" },
        { num: "03", label: "Marketing audits that show what’s working and what isn’t" },
        { num: "04", label: "Print and digital assets that speak in one voice" },
      ],
    },
    finalCta: {
      eyebrow: null,
      heading: "Tell us where the brand needs to go next.",
      copy: "Share a short brief about your business, audience, and goal. We’ll reply within a few business days with scope options and clear next steps — no pressure, no invented promises.",
      primaryCta: { label: "Request a project quote", href: "/quote" },
      secondaryCta: { label: "Browse concept studies", href: "/work" },
    },
  },
  services: [
    {
      _id: "service-brand",
      title: "Brand & system architecture",
      icon: "brand",
      summary:
        "Naming, visual language, and guidelines that stay coherent as the business grows.",
      linkLabel: "Start a brand project",
    },
    {
      _id: "service-web",
      title: "Web design & maintenance",
      icon: "web",
      summary:
        "Marketing sites with clear hierarchy and conversion paths — plus ongoing care after launch.",
      linkLabel: "Plan a website",
    },
    {
      _id: "service-audit",
      title: "Business marketing audits",
      icon: "audit",
      summary:
        "A practical review of messaging, touchpoints, and materials so you know what to fix first.",
      linkLabel: "Request an audit",
    },
    {
      _id: "service-print",
      title: "Print & digital assets",
      icon: "print",
      summary:
        "Collateral and campaigns that extend the brand into the world your customers actually meet.",
      linkLabel: "Discuss assets",
    },
  ],
  processSteps: [
    {
      _id: "step-1",
      number: "01",
      title: "Discover",
      copy: "Clarify audience, constraints, and the outcome that matters.",
    },
    {
      _id: "step-2",
      number: "02",
      title: "Define",
      copy: "Lock positioning, messaging, and the system architecture.",
    },
    {
      _id: "step-3",
      number: "03",
      title: "Design",
      copy: "Craft identity, interfaces, and assets with editorial precision.",
    },
    {
      _id: "step-4",
      number: "04",
      title: "Build",
      copy: "Implement with performance, accessibility, and CMS readiness.",
    },
    {
      _id: "step-5",
      number: "05",
      title: "Launch",
      copy: "Ship, hand off, and leave you with a clear path to maintain.",
    },
  ],
  projects: [
    {
      _id: "project-northline",
      title: "Northline Advisory",
      slug: { current: "northline-advisory" },
      industry: "Professional services · Concept",
      services: "Brand identity · Website",
      cover: {
        blobUrl: "/images/project-01.jpg",
        alt: "Mountain ridgeline for Northline Advisory concept study",
      },
    },
    {
      _id: "project-summit",
      title: "Summit Construction",
      slug: { current: "summit-construction" },
      industry: "Construction · Concept",
      services: "Brand system · Marketing",
      cover: {
        blobUrl: "/images/project-02.jpg",
        alt: "Modern architecture for Summit Construction concept study",
      },
    },
    {
      _id: "project-orbit",
      title: "Orbit Systems",
      slug: { current: "orbit-systems" },
      industry: "Technology · Concept",
      services: "Website · Product narrative",
      cover: {
        blobUrl: "/images/project-03.jpg",
        alt: "Technical landscape for Orbit Systems concept study",
      },
    },
  ],
};
