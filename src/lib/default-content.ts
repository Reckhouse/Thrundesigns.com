export const defaultHomeContent = {
  home: {
    hero: {
      eyebrow: "Thrun Design Co.",
      headline: "Strategic design when a rebrand, launch, or outdated site can’t wait.",
      support:
        "For founders and owners facing a messy brand, a launch that needs to land, or marketing that no longer matches the business, we build clearer systems, websites, and materials so the next step is concrete.",
      servicesMeta: "Brand systems  ·  Web  ·  Audits  ·  Print & digital",
      primaryCta: { label: "Browse concept studies", href: "/work" },
      secondaryCta: { label: "Browse concept studies", href: "/work" },
      image: {
        blobUrl: "/images/hero-mountain.jpg",
        alt: "Snow-capped mountain ridge under a pale dawn sky",
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
      heading: "How a project runs, from brief to handoff.",
    },
    workIntro: {
      eyebrow: "Concept studies",
      heading: "Speculative work with production intent.",
      intro:
        "These are concept projects, not client case studies, until we replace them with real engagements. They show how we think about advisory, construction, and systems brands.",
    },
    artifact: {
      eyebrow: "Sample lens",
      heading: "What a marketing audit actually looks for.",
      intro:
        "Not a case study and not invented metrics: a plain excerpt of the questions we bring to a first review so you can judge the fit before you quote.",
      items: [
        {
          label: "Message vs. reality",
          detail:
            "Does the homepage promise match what a real customer hears on a sales call or in the product?",
        },
        {
          label: "Touchpoint friction",
          detail:
            "Where do brand, site, and leave-behinds disagree, and which mismatch costs trust first?",
        },
        {
          label: "Priority order",
          detail:
            "What to fix this quarter vs. later, written in plain language with scope options.",
        },
        {
          label: "Maintenance load",
          detail:
            "What your team can keep current without a redesign every time something ships.",
        },
      ],
      footnote: "Sample review lens, not results from a named client.",
      ctaLabel: "Request an audit quote",
      ctaHref: "/quote?type=audit",
    },
    engage: {
      heading: "How an inquiry works, and what’s in our reply.",
      steps: [
        {
          title: "Send a short brief",
          copy: "About five minutes on your business, audience, and the outcome you need.",
        },
        {
          title: "Get a scoped reply",
          copy: "Within a few business days we write back with options, not a hard sell.",
        },
        {
          title: "Choose your next step",
          copy: "Move forward, adjust the scope, or pause. You’re in control either way.",
        },
      ],
      replyHeading: "What’s in a reply",
      replyPoints: [
        "A plain-language read of your goals and constraints",
        "Scope options (and ballpark ranges when we can estimate)",
        "Clear next steps if we both want to continue",
      ],
    },
    whyThrun: {
      eyebrow: null,
      heading: "A partner when the stakes feel real.",
      bullets: [
        "Systems that stay coherent as you grow",
        "Brand architecture that works across channels",
        "Clear craft without decorative excess",
        "Steady pace from discovery through launch",
      ],
      credibilityEyebrow: null,
      credibilityHeading: "What you get when we work together.",
      proofPoints: [
        { num: "01", label: "Identity systems and guidelines your team can actually use" },
        { num: "02", label: "Websites designed for clarity and conversion, then maintained" },
        { num: "03", label: "Marketing audits that show what’s working and what isn’t" },
        { num: "04", label: "Print and digital assets that speak in one voice" },
      ],
    },
    finalCta: {
      eyebrow: null,
      heading: "Tell us where the brand needs to go next.",
      copy: "Share a short brief about your business, audience, and goal. We’ll reply within a few business days with scope options and clear next steps. No pressure, no invented promises.",
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
        "Marketing sites with clear hierarchy and conversion paths, plus ongoing care after launch.",
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
      title: "Discover & define",
      copy: "We clarify audience, constraints, positioning, and the outcome that matters before any design work starts.",
    },
    {
      _id: "step-2",
      number: "02",
      title: "Design & build",
      copy: "Identity, site, and assets take shape together, then we implement with performance and CMS readiness in mind.",
    },
    {
      _id: "step-3",
      number: "03",
      title: "Launch & handoff",
      copy: "We ship, leave you with a clear way to maintain the system, and stay available for the next chapter.",
    },
  ],
  projects: [
    {
      _id: "project-northline",
      title: "Northline Advisory",
      slug: { current: "northline-advisory" },
      industry: "Professional services · Concept",
      services: "Brand identity · Website",
      workCategory: "branding-strategy",
      summary:
        "A speculative advisory brand system exploring calm authority and a clear digital presence.",
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
      workCategory: "branding-strategy",
      summary:
        "A construction brand concept focused on durable systems and marketing clarity.",
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
      workCategory: "web-design",
      summary:
        "A technology product narrative and marketing site concept with crisp hierarchy.",
      cover: {
        blobUrl: "/images/project-03.jpg",
        alt: "Technical landscape for Orbit Systems concept study",
      },
    },
  ],
};
