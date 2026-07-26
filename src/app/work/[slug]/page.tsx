import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectModules } from "@/components/project/project-modules";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  Eyebrow,
  PrimaryButtonLink,
  SectionHeading,
} from "@/components/site/primitives";
import { defaultHomeContent } from "@/lib/default-content";
import {
  resolveMediaAlt,
  resolveMediaUrl,
  type MediaAssetValue,
} from "@/lib/media";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import {
  projectBySlugQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import type { ProjectModule } from "@/types/project-modules";
import type { ProjectBySlugQueryResult } from "@/sanity/types";
import type { SanityImageSource } from "@sanity/image-url";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type ProjectDoc = Partial<
  Omit<NonNullable<ProjectBySlugQueryResult>, "modules" | "cover" | "seo">
> & {
  cover?: MediaAssetValue;
  seo?: {
    title?: string | null;
    description?: string | null;
    ogImage?: SanityImageSource | null;
  } | null;
  modules?: ProjectModule[] | null;
};

function coverFallback(slug: string) {
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

  const imageSrc = resolveMediaUrl(project.cover) || coverFallback(slug);

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
                <PrimaryButtonLink href="/quote" className="mt-10">
                  Request a project quote
                </PrimaryButtonLink>
              </div>
              <div className="relative min-h-[420px] overflow-hidden bg-bg-raised lg:min-h-[620px]">
                <Image
                  src={imageSrc}
                  alt={resolveMediaAlt(project.cover, project.title || "Project")}
                  fill
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>
            </div>
          </section>
          <ProjectModules modules={project.modules} />
        </article>
      </main>
      <SiteFooter
        tagline={settings?.tagline}
        columns={settings?.footerColumns}
      />
    </>
  );
}
