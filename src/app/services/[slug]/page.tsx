import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  Eyebrow,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { defaultHomeContent } from "@/lib/default-content";
import { quoteHrefForProjectType } from "@/lib/quote/project-type";
import { buildPageMetadata } from "@/lib/seo";
import { SERVICES, getServiceBySlug } from "@/lib/services";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return buildPageMetadata({
    title: service.title,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

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

  const relatedProjects = service.relatedProjectSlugs
    .map((projectSlug) =>
      defaultHomeContent.projects.find(
        (project) => project.slug.current === projectSlug,
      ),
    )
    .filter(Boolean);

  const relatedServices = service.relatedServiceSlugs
    .map((relatedSlug) => getServiceBySlug(relatedSlug))
    .filter(Boolean);

  return (
    <>
      <SiteHeader nav={settings?.nav} />
      <main className="flex-1 pt-[120px] md:pt-[136px] lg:pt-[152px]">
        <article>
          <section className="border-b border-line">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px] lg:py-24">
              <Eyebrow>Service</Eyebrow>
              <SectionHeading as="h1" className="mt-4 max-w-[16ch]">
                {service.title}
              </SectionHeading>
              <p className="mt-6 max-w-[48ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                {service.description}
              </p>
              <p className="mt-8 max-w-[52ch] text-pretty font-sans text-body leading-7 text-fg">
                {service.situation}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PrimaryButtonLink
                  href={quoteHrefForProjectType(service.quoteType)}
                >
                  {service.ctaLabel}
                </PrimaryButtonLink>
                <TextLink href="/work">Browse concept studies</TextLink>
              </div>
            </div>
          </section>

          <section className="border-b border-line">
            <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20 lg:gap-20 lg:px-[74px]">
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Who it is for
                </h2>
                <ul className="mt-6 space-y-4">
                  {service.forWhom.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-sans text-body leading-7 text-fg-muted"
                    >
                      <span className="mt-2 size-1.5 shrink-0 bg-gold" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Who it is not for
                </h2>
                <ul className="mt-6 space-y-4">
                  {service.notFor.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-sans text-body leading-7 text-fg-muted"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 bg-fg-muted/50"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="border-b border-line bg-bg-raised/40">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                What you walk away with
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    className="border border-line bg-bg-deep/60 px-5 py-4 font-sans text-body leading-7 text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border-b border-line">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                How collaboration runs
              </h2>
              <ol className="mt-10 grid gap-8 md:grid-cols-3">
                {service.process.map((step, index) => (
                  <li key={step.title}>
                    <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
                      0{index + 1}
                    </p>
                    <h3 className="mt-3 font-display text-xl text-fg">
                      {step.title}
                    </h3>
                    <p className="mt-3 font-sans text-body leading-7 text-fg-muted">
                      {step.copy}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {relatedProjects.length ? (
            <section className="border-b border-line">
              <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Relevant concept studies
                </h2>
                <ul className="mt-8 grid gap-4 md:grid-cols-3">
                  {relatedProjects.map((project) =>
                    project ? (
                      <li key={project._id}>
                        <Link
                          href={`/work/${project.slug.current}`}
                          className="group block border border-line bg-bg-raised/70 p-5 transition-[border-color] hover:border-gold/55"
                        >
                          <p className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
                            {project.industry}
                          </p>
                          <p className="mt-2 font-display text-xl text-fg">
                            {project.title}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-fg-muted">
                            {project.summary}
                          </p>
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="border-b border-line">
            <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:px-10 md:py-20 lg:px-[74px]">
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Questions prospects ask
                </h2>
              </div>
              <dl className="space-y-8">
                {service.faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="font-display text-lg text-fg">
                      {faq.question}
                    </dt>
                    <dd className="mt-3 font-sans text-body leading-7 text-fg-muted">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section>
            <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[1.2fr_1fr] lg:px-[74px]">
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Related services
                </h2>
                <ul className="mt-6 space-y-3">
                  {relatedServices.map((related) =>
                    related ? (
                      <li key={related.slug}>
                        <TextLink href={`/services/${related.slug}`}>
                          {related.shortTitle}
                        </TextLink>
                      </li>
                    ) : null,
                  )}
                  <li>
                    <TextLink href="/about">About the studio</TextLink>
                  </li>
                </ul>
              </div>
              <div className="border border-line bg-bg-raised/70 p-6 md:p-8">
                <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
                  Next step
                </p>
                <p className="mt-4 font-display text-[clamp(1.4rem,2vw,1.85rem)] leading-tight text-fg">
                  Tell us where the brand needs to go next.
                </p>
                <p className="mt-4 font-sans text-body leading-7 text-fg-muted">
                  Share a short brief. We reply within a few business days with
                  scope options—not a hard sell.
                </p>
                <PrimaryButtonLink
                  href={quoteHrefForProjectType(service.quoteType)}
                  className="mt-8"
                >
                  {service.ctaLabel}
                </PrimaryButtonLink>
              </div>
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
