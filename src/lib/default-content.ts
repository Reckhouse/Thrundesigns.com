export const defaultHomeContent = {
  home: {
    hero: {
      eyebrow: "Thrun Design Co.",
      headline: "Strategic design for businesses ready to move forward.",
      support:
        "Cohesive brand identities, websites, and marketing materials built for clarity, consistency, and confidence.",
      servicesMeta: "Brand identity  ·  Website design  ·  Print & marketing",
      primaryCta: { label: "Request a project quote", href: "/quote" },
      secondaryCta: { label: "Explore our work", href: "/work" },
      image: {
        blobUrl: "/images/hero-mountain.jpg",
        alt: "Dramatic desaturated mountain ridge with open sky",
      },
    },
    servicesIntro: {
      eyebrow: "Services",
      heading: "Design systems that hold under pressure.",
      intro:
        "Brand, web, and marketing work engineered for clarity across every touchpoint.",
    },
    processIntro: {
      eyebrow: "Process",
      heading: "A clear path from brief to brand.",
    },
    workIntro: {
      eyebrow: "Selected work",
      heading: "Concept projects with production intent.",
      intro:
        "A focused set of case studies spanning advisory, construction, and systems brands.",
    },
    whyThrun: {
      eyebrow: "Why Thrun",
      heading: "Design with consequence.",
      bullets: [
        "Editorial systems with operational clarity",
        "Brand architecture that scales across channels",
        "Precision craft without decorative excess",
        "Partner pace from discovery through launch",
      ],
      credibilityEyebrow: "Proof of craft",
      credibilityHeading: "Built for teams that need signal, not noise.",
      proofPoints: [
        { num: "01", label: "Identity systems with durable guidelines" },
        { num: "02", label: "Web experiences built for conversion" },
        { num: "03", label: "Print and marketing with consistent voice" },
        { num: "04", label: "Clear process and accountable delivery" },
      ],
    },
    finalCta: {
      eyebrow: "Start a project",
      heading: "Ready when your next chapter is.",
      copy: "Tell us about the brand, the audience, and the outcome. We’ll return with a clear scope and next steps.",
      primaryCta: { label: "Request a project quote", href: "/quote" },
      secondaryCta: { label: "View selected work", href: "/work" },
    },
  },
  services: [
    {
      _id: "service-brand",
      title: "Brand Identity",
      icon: "brand",
      summary:
        "Naming systems, visual language, and guidelines that stay coherent as you grow.",
      linkLabel: "Start a brand project",
    },
    {
      _id: "service-web",
      title: "Website Design",
      icon: "web",
      summary:
        "High-signal marketing sites with clear hierarchy, motion, and conversion paths.",
      linkLabel: "Plan a website",
    },
    {
      _id: "service-print",
      title: "Print & Marketing",
      icon: "print",
      summary:
        "Collateral and campaigns that extend the brand into the physical world.",
      linkLabel: "Discuss marketing",
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
      copy: "Craft interfaces, identity, and assets with editorial precision.",
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
      copy: "Ship, measure, and refine with a clear handoff.",
    },
  ],
  projects: [
    {
      _id: "project-northline",
      title: "Northline Advisory",
      slug: { current: "northline-advisory" },
      industry: "Professional services",
      services: "Brand identity · Website",
      cover: {
        blobUrl: "/images/project-01.jpg",
        alt: "Mountain ridgeline for Northline Advisory",
      },
    },
    {
      _id: "project-summit",
      title: "Summit Construction",
      slug: { current: "summit-construction" },
      industry: "Construction",
      services: "Brand system · Marketing",
      cover: {
        blobUrl: "/images/project-02.jpg",
        alt: "Modern architecture for Summit Construction",
      },
    },
    {
      _id: "project-orbit",
      title: "Orbit Systems",
      slug: { current: "orbit-systems" },
      industry: "Technology",
      services: "Website · Product narrative",
      cover: {
        blobUrl: "/images/project-03.jpg",
        alt: "Technical landscape for Orbit Systems",
      },
    },
  ],
};
