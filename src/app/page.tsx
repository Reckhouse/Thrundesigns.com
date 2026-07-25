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
  homePageQuery,
  processStepsQuery,
  servicesQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function HomePage() {
  const [settingsRes, homeRes, servicesRes, stepsRes, projectsRes] =
    await Promise.all([
      sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: homePageQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: servicesQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: processStepsQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: featuredProjectsQuery }).catch(() => ({ data: null })),
    ]);

  const settings = (settingsRes.data || null) as {
    nav?: { label?: string | null; href?: string | null }[] | null;
    tagline?: string | null;
    footerColumns?:
      | {
          heading?: string | null;
          links?: { label?: string | null; href?: string | null }[] | null;
        }[]
      | null;
  } | null;

  const home = (homeRes.data ||
    defaultHomeContent.home) as typeof defaultHomeContent.home;
  const services = asArray<(typeof defaultHomeContent.services)[number]>(
    servicesRes.data,
  );
  const steps = asArray<(typeof defaultHomeContent.processSteps)[number]>(
    stepsRes.data,
  );
  const projects = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );

  const resolvedServices = services.length
    ? services
    : defaultHomeContent.services;
  const resolvedSteps = steps.length ? steps : defaultHomeContent.processSteps;
  const resolvedProjects = projects.length
    ? projects
    : defaultHomeContent.projects;

  return (
    <>
      <SiteHeader nav={settings?.nav} />
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
          eyebrow={home.servicesIntro?.eyebrow}
          heading={home.servicesIntro?.heading}
          intro={home.servicesIntro?.intro}
          services={resolvedServices}
        />
        <ProcessSection
          eyebrow={home.processIntro?.eyebrow}
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
          eyebrow={home.whyThrun?.eyebrow}
          heading={home.whyThrun?.heading}
          bullets={home.whyThrun?.bullets}
          credibilityEyebrow={home.whyThrun?.credibilityEyebrow}
          credibilityHeading={home.whyThrun?.credibilityHeading}
          proofPoints={home.whyThrun?.proofPoints}
        />
        <FinalCtaSection
          eyebrow={home.finalCta?.eyebrow}
          heading={home.finalCta?.heading}
          copy={home.finalCta?.copy}
          primaryCta={home.finalCta?.primaryCta}
          secondaryCta={home.finalCta?.secondaryCta}
        />
      </main>
      <SiteFooter
        tagline={settings?.tagline}
        columns={settings?.footerColumns}
      />
    </>
  );
}
