import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Eyebrow, SectionHeading } from "@/components/site/primitives";
import { buildPageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";

export type LegalSection = {
  id?: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  metadata: {
    title: string;
    description: string;
    path: string;
  };
};

export function legalDocumentMetadata({
  title,
  description,
  path,
}: LegalDocumentPageProps["metadata"]): Metadata {
  return buildPageMetadata({ title, description, path });
}

export async function LegalDocumentPage({
  eyebrow,
  title,
  intro,
  sections,
}: Omit<LegalDocumentPageProps, "metadata">) {
  const settingsRes = await sanityFetch({ query: siteSettingsQuery }).catch(
    () => ({ data: null }),
  );
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

  return (
    <>
      <SiteHeader nav={settings?.nav} />
      <main className="flex-1 pt-[120px] md:pt-[136px] lg:pt-[152px]">
        <article>
          <section className="border-b border-line">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px] lg:py-24">
              <Eyebrow>{eyebrow}</Eyebrow>
              <SectionHeading as="h1" className="mt-4 max-w-[20ch]">
                {title}
              </SectionHeading>
              <p className="mt-6 max-w-[52ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                {intro}
              </p>
              <p className="mt-4 font-mono text-caption uppercase tracking-[0.12em] text-fg-muted">
                Last updated: August 31, 2026
              </p>
            </div>
          </section>

          <section>
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <div className="mx-auto max-w-[720px] space-y-12">
                {sections.map((section) => (
                  <section
                    key={section.id || section.title}
                    id={section.id}
                    className="scroll-mt-32"
                  >
                    <h2 className="font-display text-[clamp(1.35rem,2.2vw,1.85rem)] tracking-[-0.02em] text-fg">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="font-sans text-body leading-7 text-fg-muted"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.list?.length ? (
                      <ul className="mt-4 space-y-3">
                        {section.list.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 font-sans text-body leading-7 text-fg-muted"
                          >
                            <span
                              className="mt-2 size-1.5 shrink-0 bg-gold"
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

              <p className="mx-auto mt-16 max-w-[720px] border-t border-line pt-8 font-sans text-sm leading-6 text-fg-muted">
                Questions about this policy?{" "}
                <Link href="/quote" className="text-fg underline-offset-2 hover:text-gold hover:underline">
                  Request a quote
                </Link>{" "}
                and include your question—we read every inquiry.
              </p>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter
        tagline={settings?.tagline}
        columns={settings?.footerColumns}
      />
    </>
  );
}
