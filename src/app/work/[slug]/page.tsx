import { ExperienceLaunchLink } from "@/components/experiences/ExperienceLaunchLink";
import { FeaturedCreationsGallery } from "@/components/project/featured-creations-gallery";
import { ProjectMediaFrame } from "@/components/project/project-media-frame";
import { ProjectModules } from "@/components/project/project-modules";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Eyebrow, SectionHeading } from "@/components/site/primitives";
import { mapSanityExperienceConfig } from "@/experiences/mapSanityExperienceConfig";
import { withLabReturnPath } from "@/experiences/controlled-chaos/parseLabSearchParams";
import {
  isControlledChaosSlug,
  resolveControlledChaosCoverSrc,
} from "@/lib/controlled-chaos-media";
import { resolveCounterspaceCoverSrc } from "@/lib/counterspace-media";
import { defaultHomeContent } from "@/lib/default-content";
import {
  isScrollableDisplay,
  mediaAspectRatioClass,
  mediaDisplayWidthClass,
  mediaObjectFitClass,
  resolveAspectRatio,
  resolveDisplayWidth,
  resolveMediaAlt,
  resolveMediaObjectPosition,
  resolveMediaUrl,
  resolveObjectFit,
  type MediaAssetValue,
} from "@/lib/media";
import { projectMediaDataAttribute } from "@/lib/sanity-data-attribute";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import {
  projectBySlugQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import type { ProjectModule } from "@/types/project-modules";
import type {
  FeaturedCreationValue,
  ThreeExperienceBlockValue,
} from "@/types/three-experience";
import type { ProjectBySlugQueryResult } from "@/sanity/types";
import type { SanityImageSource } from "@sanity/image-url";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ProjectDoc = Partial<
  Omit<
    NonNullable<ProjectBySlugQueryResult>,
    "modules" | "cover" | "seo" | "primaryExperience" | "featuredCreations"
  >
> & {
  cover?: MediaAssetValue;
  seo?: {
    title?: string | null;
    description?: string | null;
    ogImage?: SanityImageSource | null;
  } | null;
  modules?: ProjectModule[] | null;
  primaryExperience?: ThreeExperienceBlockValue | null;
  featuredCreations?: FeaturedCreationValue[] | null;
};

function coverFallback(slug: string) {
  if (slug === "juniper-and-stone-coffee") {
    return "/images/juniper-stone/cup-mockup.png";
  }
  if (slug === "northline-advisory") return "/images/project-01.jpg";
  if (slug === "summit-construction") return "/images/project-02.jpg";
  return "/images/project-03.jpg";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
    stega: false,
  }).catch(() => ({ data: null }));
  const cms = data as ProjectDoc | null;
  const fallback =
    defaultHomeContent.projects.find((item) => item.slug.current === slug) ||
    null;

  const title =
    cms?.seo?.title || cms?.title || fallback?.title || "Project";
  const description =
    cms?.seo?.description ||
    cms?.summary ||
    cms?.services ||
    fallback?.services ||
    "Case study from Thrun Design Co.";

  let ogImage: string | undefined;
  if (cms?.seo?.ogImage) {
    try {
      ogImage = urlFor(cms.seo.ogImage)
        .width(1200)
        .height(630)
        .auto("format")
        .url();
    } catch {
      ogImage = undefined;
    }
  }
  if (!ogImage) {
    ogImage = resolveMediaUrl(cms?.cover, 1200) || undefined;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [settingsRes, projectRes] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null })),
    sanityFetch({
      query: projectBySlugQuery,
      params: { slug },
    }).catch(() => ({ data: null })),
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

  const fallback = defaultHomeContent.projects.find(
    (item) => item.slug.current === slug,
  );
  const project = (projectRes.data || fallback) as ProjectDoc | undefined;

  if (!project) notFound();

  const coverWidth = resolveDisplayWidth(project.cover);
  const coverScrollable = isScrollableDisplay(coverWidth);
  const coverAspect = coverScrollable
    ? "auto"
    : resolveAspectRatio(project.cover);
  const coverFit = resolveObjectFit(project.cover);
  const imageSrc = resolveCounterspaceCoverSrc(
    slug,
    resolveControlledChaosCoverSrc(
      slug,
      resolveMediaUrl(project.cover, {
        width: coverScrollable ? 1400 : 1600,
        aspectRatio: coverAspect,
        objectFit: coverFit,
      }) || coverFallback(slug),
    ),
  );
  const isPosterCover = isControlledChaosSlug(slug);
  const coverObjectPosition = resolveMediaObjectPosition(project.cover);
  const coverFrameClass = isPosterCover
    ? cn(
        "relative mx-auto w-full overflow-hidden bg-bg-raised sm:max-w-[360px] lg:ml-auto lg:mr-0 lg:max-w-[400px]",
        mediaDisplayWidthClass(coverWidth),
        mediaAspectRatioClass(coverAspect, "aspect-[9/16] max-w-[320px]"),
      )
    : cn(
        "relative overflow-hidden bg-bg-raised",
        mediaDisplayWidthClass(coverWidth),
        mediaAspectRatioClass(
          coverAspect,
          "min-h-[420px] lg:min-h-[620px]",
        ),
      );
  const primaryMapped = project.primaryExperience
    ? mapSanityExperienceConfig(project.primaryExperience)
    : null;
  const primaryLaunch =
    primaryMapped?.ok && primaryMapped.value.presentation.showFullscreenAction
      ? {
          href: withLabReturnPath(
            primaryMapped.value.launchUrl,
            `/work/${slug}`,
          ),
          label: primaryMapped.value.presentation.fullscreenLabel,
          experienceKey: primaryMapped.value.experienceKey,
        }
      : null;

  return (
    <>
      <SiteHeader nav={settings?.nav} />
      <main className="flex-1 pt-[96px] md:pt-[112px] lg:pt-[120px]">
        <article>
          <section className="border-b border-line">
            <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_1.2fr] lg:px-[74px]">
              <div>
                <Link
                  href="/work"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted hover:text-gold"
                >
                  ← Back to work
                </Link>
                <Eyebrow className="mt-8">{project.industry}</Eyebrow>
                <SectionHeading className="mt-4">{project.title}</SectionHeading>
                <p className="mt-6 font-sans text-[15px] text-fg-muted">
                  {project.services}
                </p>
                <p className="mt-8 max-w-md font-sans text-[15px] leading-7 text-fg-muted">
                  {project.summary ||
                    "A focused case study exploring brand systems, digital presence, and production-ready visual language."}
                </p>
                {primaryLaunch ? (
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <ExperienceLaunchLink
                      href={primaryLaunch.href}
                      experienceKey={primaryLaunch.experienceKey}
                      variant="button"
                    >
                      {primaryLaunch.label}
                    </ExperienceLaunchLink>
                  </div>
                ) : null}
              </div>
              {/* Poster case studies use a 9:16 frame so the cover fills
                  without pillarboxing. Other projects keep the wide hero box.
                  CMS displayWidth / aspectRatio / objectFit override defaults.
                  Scrollable page uses an in-frame scrollbar for tall shots. */}
              {isPosterCover || !coverScrollable ? (
                <div
                  className={coverFrameClass}
                  data-sanity={projectMediaDataAttribute({
                    documentId: project._id,
                    path: "cover",
                  })}
                >
                  <Image
                    src={imageSrc}
                    alt={resolveMediaAlt(
                      project.cover,
                      project.title || "Project",
                    )}
                    fill
                    className={cn(
                      mediaObjectFitClass(coverFit),
                      !coverObjectPosition && "object-center",
                    )}
                    style={
                      coverObjectPosition
                        ? { objectPosition: coverObjectPosition }
                        : undefined
                    }
                    sizes={
                      isPosterCover
                        ? "(max-width: 1024px) 360px, 400px"
                        : "(max-width: 1024px) 100vw, 60vw"
                    }
                    priority
                  />
                </div>
              ) : (
                <ProjectMediaFrame
                  src={imageSrc}
                  alt={resolveMediaAlt(
                    project.cover,
                    project.title || "Project",
                  )}
                  displayWidth={coverWidth}
                  aspectRatio={coverAspect}
                  objectFit={coverFit}
                  objectPosition={coverObjectPosition}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  dataSanity={projectMediaDataAttribute({
                    documentId: project._id,
                    path: "cover",
                  })}
                />
              )}
            </div>
          </section>
          <ProjectModules
            modules={project.modules}
            caseStudyPath={`/work/${slug}`}
            documentId={project._id}
          />
          <FeaturedCreationsGallery
            items={project.featuredCreations}
            caseStudyPath={`/work/${slug}`}
            documentId={project._id}
          />
        </article>
      </main>
      <SiteFooter
        tagline={settings?.tagline}
        columns={settings?.footerColumns}
      />
    </>
  );
}
