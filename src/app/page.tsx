import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { WorkSection } from "@/components/sections/work-section";
import { ArtifactSection } from "@/components/sections/artifact-section";
import { EngageSection } from "@/components/sections/engage-section";
import { WhySection } from "@/components/sections/why-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { MountainScene } from "@/components/site/mountain-scene";
import { withConceptLabel } from "@/lib/concept-label";
import { defaultHomeContent } from "@/lib/default-content";
import { sanityFetch } from "@/sanity/lib/live";
import {
  featuredProjectsQuery,
  homePageQuery,
  processStepsQuery,
  servicesQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({
    query: homePageQuery,
    stega: false,
  }).catch(() => ({ data: null }));
  const seo = (data as { seo?: { title?: string; description?: string } } | null)
    ?.seo;
  const hero = (data as { hero?: { headline?: string; support?: string } } | null)
    ?.hero;
  return {
    title: seo?.title || undefined,
    description:
      seo?.description ||
      hero?.support ||
      defaultHomeContent.home.hero.support,
    alternates: { canonical: "/" },
    openGraph: {
      title: seo?.title || hero?.headline || "Thrun Design Co.",
      description:
        seo?.description ||
        hero?.support ||
        defaultHomeContent.home.hero.support,
    },
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

type Cta = { label?: string | null; href?: string | null } | null | undefined;

function pickCta(preferred: Cta, fallback: { label: string; href: string }) {
  if (preferred?.label && preferred?.href) {
    return { label: preferred.label, href: preferred.href };
  }
  return fallback;
}

export default async function HomePage() {
  const [settingsRes, homeRes, servicesRes, stepsRes, projectsRes] =
    await Promise.all([
      sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: homePageQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: servicesQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: processStepsQuery }).catch(() => ({ data: null })),
      sanityFetch({ query: featuredProjectsQuery }).catch(() => ({
        data: null,
      })),
    ]);

  const settings = (settingsRes.data || null) as {
    tagline?: string | null;
    nav?: { label?: string | null; href?: string | null }[] | null;
  } | null;

  const cmsHome = (homeRes.data || null) as
    | (typeof defaultHomeContent.home & Record<string, unknown>)
    | null;
  const defaults = defaultHomeContent.home;

  const home = {
    hero: {
      ...defaults.hero,
      ...cmsHome?.hero,
      primaryCta: pickCta(
        cmsHome?.hero?.primaryCta,
        defaults.hero.primaryCta,
      ),
      secondaryCta: pickCta(
        cmsHome?.hero?.secondaryCta,
        defaults.hero.secondaryCta,
      ),
      image: {
        ...defaults.hero.image,
        ...cmsHome?.hero?.image,
      },
    },
    servicesIntro: {
      ...defaults.servicesIntro,
      ...cmsHome?.servicesIntro,
    },
    processIntro: {
      ...defaults.processIntro,
      ...cmsHome?.processIntro,
    },
    workIntro: {
      ...defaults.workIntro,
      ...cmsHome?.workIntro,
    },
    artifact: {
      ...defaults.artifact,
      ...cmsHome?.artifact,
      items:
        asArray<(typeof defaults.artifact.items)[number]>(
          cmsHome?.artifact?.items,
        ).length > 0
          ? asArray<(typeof defaults.artifact.items)[number]>(
              cmsHome?.artifact?.items,
            )
          : defaults.artifact.items,
    },
    engage: {
      ...defaults.engage,
      ...cmsHome?.engage,
      steps:
        asArray<(typeof defaults.engage.steps)[number]>(cmsHome?.engage?.steps)
          .length > 0
          ? asArray<(typeof defaults.engage.steps)[number]>(
              cmsHome?.engage?.steps,
            )
          : defaults.engage.steps,
      replyPoints:
        asArray<string>(cmsHome?.engage?.replyPoints).length > 0
          ? asArray<string>(cmsHome?.engage?.replyPoints)
          : defaults.engage.replyPoints,
    },
    whyThrun: {
      ...defaults.whyThrun,
      ...cmsHome?.whyThrun,
      bullets:
        asArray<string>(cmsHome?.whyThrun?.bullets).length > 0
          ? asArray<string>(cmsHome?.whyThrun?.bullets)
          : defaults.whyThrun.bullets,
      proofPoints:
        asArray<(typeof defaults.whyThrun.proofPoints)[number]>(
          cmsHome?.whyThrun?.proofPoints,
        ).length > 0
          ? asArray<(typeof defaults.whyThrun.proofPoints)[number]>(
              cmsHome?.whyThrun?.proofPoints,
            )
          : defaults.whyThrun.proofPoints,
    },
    finalCta: {
      ...defaults.finalCta,
      ...cmsHome?.finalCta,
      primaryCta: pickCta(
        cmsHome?.finalCta?.primaryCta,
        defaults.finalCta.primaryCta,
      ),
      secondaryCta: pickCta(
        cmsHome?.finalCta?.secondaryCta,
        defaults.finalCta.secondaryCta,
      ),
    },
  };

  const cmsServices = asArray<(typeof defaultHomeContent.services)[number]>(
    servicesRes.data,
  );
  const resolvedServices =
    cmsServices.length > 0 ? cmsServices : defaultHomeContent.services;

  const cmsSteps = asArray<(typeof defaultHomeContent.processSteps)[number]>(
    stepsRes.data,
  );
  const resolvedSteps =
    cmsSteps.length > 0 ? cmsSteps : defaultHomeContent.processSteps;

  const projects = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );
  const resolvedProjects = (projects.length
    ? projects
    : defaultHomeContent.projects
  ).map((project) => ({
    ...project,
    industry: withConceptLabel(project.industry),
  }));

  const mountainSrc = "/images/hero-mountain.jpg";
  const mountainAlt =
    home.hero?.image?.alt ||
    "Snow-capped mountain ridge under a pale dawn sky";

  return (
    <>
      <MountainScene imageSrc={mountainSrc} />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <SiteHeader nav={settings?.nav} />
        <main className="flex-1">
          <HeroSection
            eyebrow={home.hero?.eyebrow}
            headline={home.hero?.headline}
            support={home.hero?.support}
            servicesMeta={home.hero?.servicesMeta}
            primaryCta={home.hero?.primaryCta}
            secondaryCta={home.hero?.secondaryCta}
            imageSrc={mountainSrc}
            imageAlt={mountainAlt}
          />
          <ServicesSection
            heading={home.servicesIntro?.heading}
            intro={home.servicesIntro?.intro}
            services={resolvedServices}
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
          <ArtifactSection
            eyebrow={home.artifact?.eyebrow}
            heading={home.artifact?.heading}
            intro={home.artifact?.intro}
            items={home.artifact?.items}
            footnote={home.artifact?.footnote}
            ctaLabel={home.artifact?.ctaLabel}
            ctaHref={home.artifact?.ctaHref}
          />
          <ProcessSection
            heading={home.processIntro?.heading}
            steps={resolvedSteps}
          />
          <EngageSection
            heading={home.engage?.heading}
            engageSteps={home.engage?.steps}
            replyHeading={home.engage?.replyHeading}
            replyPoints={home.engage?.replyPoints}
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
      </div>
    </>
  );
}
