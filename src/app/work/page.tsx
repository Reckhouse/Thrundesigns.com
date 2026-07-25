import type { Metadata } from "next";
import Link from "next/link";
import { WorkSection } from "@/components/sections/work-section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Eyebrow, SectionHeading } from "@/components/site/primitives";
import { defaultHomeContent } from "@/lib/default-content";
import { sanityFetch } from "@/sanity/lib/live";
import { projectsQuery, siteSettingsQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected concept and client work from Thrun Design Co.",
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
    nav?: { label?: string | null; href?: string | null }[] | null;
    tagline?: string | null;
    footerColumns?:
      | {
          heading?: string | null;
          links?: { label?: string | null; href?: string | null }[] | null;
        }[]
      | null;
  } | null;

  const fetched = asArray<(typeof defaultHomeContent.projects)[number]>(
    projectsRes.data,
  );
  const projects = fetched.length ? fetched : defaultHomeContent.projects;

  return (
    <>
      <SiteHeader nav={settings?.nav} />
      <main className="flex-1 pt-[84px]">
        <section className="border-b border-line">
          <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 lg:px-[74px]">
            <Eyebrow>Work index</Eyebrow>
            <SectionHeading className="mt-4 max-w-3xl">
              Selected work
            </SectionHeading>
            <p className="mt-6 max-w-2xl font-sans text-[15px] leading-7 text-fg-muted">
              Concept projects now; later mixes of real and concept work live
              here.
            </p>
            <Link
              href="/quote"
              className="mt-8 inline-flex font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
            >
              Start a project →
            </Link>
          </div>
        </section>
        <WorkSection
          eyebrow="Case studies"
          heading="Projects with production intent."
          intro="Explore advisory, construction, and systems narratives."
          projects={projects.map((project, index) => ({
            ...project,
            imageSrc:
              project.cover?.blobUrl || `/images/project-0${index + 1}.jpg`,
          }))}
        />
      </main>
      <SiteFooter
        tagline={settings?.tagline}
        columns={settings?.footerColumns}
      />
    </>
  );
}
