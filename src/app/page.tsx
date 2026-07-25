import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { WorkSection } from "@/components/sections/work-section";
import { WhySection } from "@/components/sections/why-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { defaultHomeContent } from "@/lib/default-content";
import { sanityFetch } from "@/sanity/lib/live";
import {
  featuredProjectsQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function HomePage() {
  const [settingsRes, projectsRes] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null })),
    sanityFetch({ query: featuredProjectsQuery }).catch(() => ({ data: null })),
  ]);

  const settings = (settingsRes.data || null) as {
    tagline?: string | null;
  } | null;

  // Homepage persuasion copy is owned by defaultHomeContent for this pass
  // (trust framing + PRODUCT offer). Re-wire CMS sections after Studio content
  // matches PRODUCT.md.
  const home = defaultHomeContent.home;
  const resolvedServices = defaultHomeContent.services;
  const resolvedSteps = defaultHomeContent.processSteps;
  const projects = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );
  const resolvedProjects = projects.length
    ? projects.map((project) => ({
        ...project,
        industry: project.industry?.includes("Concept")
          ? project.industry
          : project.industry
            ? `${project.industry} · Concept`
            : "Concept",
      }))
    : defaultHomeContent.projects;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection
          eyebrow={home.hero?.eyebrow}
          headline={home.hero?.headline}
          support={home.hero?.support}
          servicesMeta={home.hero?.servicesMeta}
          primaryCta={home.hero?.primaryCta}
          secondaryCta={home.hero?.secondaryCta}
          imageSrc="/images/hero-mountain.jpg"
          imageAlt={home.hero?.image?.alt || "Dramatic mountain landscape"}
        />
        <ServicesSection
          heading={home.servicesIntro?.heading}
          intro={home.servicesIntro?.intro}
          services={resolvedServices}
        />
        <ProcessSection
          heading={home.processIntro?.heading}
          steps={resolvedSteps}
        />
        <WorkSection
          eyebrow={home.workIntro?.eyebrow}
          heading={home.workIntro?.heading}
          intro={home.workIntro?.intro}
          projects={resolvedProjects.map((project, index) => ({
            ...project,
            imageSrc:
              project.cover?.blobUrl || `/images/project-0${index + 1}.jpg`,
          }))}
        />
        <WhySection
          heading={home.whyThrun?.heading}
          bullets={home.whyThrun?.bullets}
          credibilityHeading={home.whyThrun?.credibilityHeading}
          proofPoints={home.whyThrun?.proofPoints}
        />
        <FinalCtaSection
          heading={home.finalCta?.heading}
          copy={home.finalCta?.copy}
          primaryCta={home.finalCta?.primaryCta}
          secondaryCta={home.finalCta?.secondaryCta}
        />
      </main>
      <SiteFooter tagline={settings?.tagline} />
    </>
  );
}
