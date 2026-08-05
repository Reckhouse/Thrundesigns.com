import type { Metadata } from "next";
import Link from "next/link";
import { WorkCategoryIndex } from "@/components/sections/work-category-index";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { withConceptLabel } from "@/lib/concept-label";
import { resolveControlledChaosCardSrc } from "@/lib/controlled-chaos-media";
import { defaultHomeContent } from "@/lib/default-content";
import { resolveMediaUrl } from "@/lib/media";
import { sanityFetch } from "@/sanity/lib/live";
import { projectsQuery, siteSettingsQuery } from "@/sanity/lib/queries";

/** Keep the work index fresh when projects are added in Sanity. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Concept studies",
  description:
    "Concept projects from Thrun Design Co. — speculative studies until real client work replaces them.",
  alternates: { canonical: "/work" },
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export default async function WorkIndexPage() {
  const [settingsRes, projectsRes] = await Promise.all([
    sanityFetch({ query: siteSettingsQuery }).catch(() => ({ data: null })),
    sanityFetch({ query: projectsQuery }).catch(() => ({ data: null })),
  ]);

  const settings = (settingsRes.data || null) as {
    tagline?: string | null;
  } | null;

  const fetched = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );
  const projects = (fetched.length ? fetched : defaultHomeContent.projects).map(
    (project, index) => ({
      ...project,
      industry: withConceptLabel(project.industry),
      imageSrc:
        resolveControlledChaosCardSrc(
          project.slug?.current,
          resolveMediaUrl(project.cover),
        ) || `/images/project-0${index + 1}.jpg`,
    }),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[96px] md:pt-[112px] lg:pt-[120px]">
        <header className="border-b border-line">
          <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16 lg:px-[74px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
              Concept studies
            </p>
            <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-fg">
              Speculative work with production intent.
            </h1>
            <p className="mt-6 max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
              Speculative projects that show how we think — not client case
              studies. Real work will replace these as engagements ship.
            </p>
          </div>
        </header>
        <WorkCategoryIndex projects={projects} />
        <section className="border-b border-line">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 py-12 md:px-10 lg:px-[74px]">
            <p className="max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
              Ready to talk about a real engagement? Send a short brief and
              we’ll reply with scope options.
            </p>
            <Link
              href="/quote"
              className="inline-flex min-h-11 w-fit items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              Request a project quote →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter tagline={settings?.tagline} />
    </>
  );
}
