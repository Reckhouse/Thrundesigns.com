import type { Metadata } from "next";
import Link from "next/link";
import { WorkCategoryIndex } from "@/components/sections/work-category-index";
import { ScrollScene } from "@/components/scroll/scroll-scene";
import { ScrollStoryRoot } from "@/components/scroll/scroll-story-root";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { MountainScene } from "@/components/site/mountain-scene";
import { withConceptLabel } from "@/lib/concept-label";
import { resolveControlledChaosCardSrc } from "@/lib/controlled-chaos-media";
import { resolveCounterspaceCardSrc } from "@/lib/counterspace-media";
import { defaultHomeContent } from "@/lib/default-content";
import { resolveMediaUrl } from "@/lib/media";
import { sanityFetch } from "@/sanity/lib/live";
import { projectsQuery, siteSettingsQuery } from "@/sanity/lib/queries";

/** Keep the work index fresh when projects are added in Sanity. */
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Concept studies",
  description:
    "Concept projects from Thrun Design Co.: speculative studies until real client work replaces them.",
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
    nav?: { label?: string | null; href?: string | null }[] | null;
  } | null;

  const fetched = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );
  const projects = (fetched.length ? fetched : defaultHomeContent.projects).map(
    (project, index) => ({
      ...project,
      industry: withConceptLabel(project.industry),
      imageSrc:
        resolveCounterspaceCardSrc(
          project.slug?.current,
          resolveControlledChaosCardSrc(
            project.slug?.current,
            resolveMediaUrl(project.cover),
          ),
        ) || `/images/project-0${index + 1}.jpg`,
    }),
  );

  const mountainSrc = "/images/hero-mountain.jpg";

  return (
    <>
      <MountainScene imageSrc={mountainSrc} />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <SiteHeader nav={settings?.nav} />
        <main className="flex-1">
          <ScrollStoryRoot>
            <ScrollScene transition="wipe-up" soft ariaLabel="Concept studies">
              <header className="relative flex min-h-[72svh] flex-col justify-end pb-16 pt-[144px] md:min-h-[78svh] md:pb-20 md:pt-[156px] lg:min-h-[84svh] lg:pb-24 lg:pt-[172px]">
                <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10 lg:px-[74px]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold drop-shadow-[0_2px_18px_rgba(12,13,12,0.75)]">
                    Concept studies
                  </p>
                  <h1 className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] text-fg drop-shadow-[0_2px_28px_rgba(12,13,12,0.85)]">
                    Speculative work with production intent.
                  </h1>
                  <p className="mt-6 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg drop-shadow-[0_2px_20px_rgba(12,13,12,0.9)] md:text-base md:leading-7">
                    Speculative projects that show how we think, not client case
                    studies. Real work will replace these as engagements ship.
                  </p>
                </div>
              </header>
            </ScrollScene>

            <ScrollScene transition="wipe-left" fillViewport={false}>
              <WorkCategoryIndex projects={projects} />

              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-5 py-16 md:px-10 md:py-20 lg:px-[74px]">
                <p className="max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-fg drop-shadow-[0_2px_16px_rgba(12,13,12,0.85)]">
                  Ready to talk about a real engagement? Send a short brief and
                  we’ll reply with scope options.
                </p>
                <Link
                  href="/quote"
                  className="inline-flex min-h-11 w-fit items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold drop-shadow-[0_2px_14px_rgba(12,13,12,0.8)]"
                >
                  Request a project quote →
                </Link>
              </div>
            </ScrollScene>
          </ScrollStoryRoot>
        </main>
        <SiteFooter tagline={settings?.tagline} />
      </div>
    </>
  );
}
