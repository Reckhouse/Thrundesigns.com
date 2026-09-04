import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  Eyebrow,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { FaqJsonLd, type FaqItem } from "@/components/seo/faq-json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";

export type TopicSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type TopicLink = {
  label: string;
  href: string;
  description?: string;
};

type TopicMarketingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: TopicSection[];
  faqs?: FaqItem[];
  relatedLinks?: TopicLink[];
  cta: {
    heading: string;
    copy: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
  metadata: {
    title: string;
    description: string;
    path: string;
  };
};

export function topicPageMetadata(
  input: TopicMarketingPageProps["metadata"],
): Metadata {
  return buildPageMetadata(input);
}

export async function TopicMarketingPage({
  eyebrow,
  title,
  intro,
  sections,
  faqs = [],
  relatedLinks = [],
  cta,
}: Omit<TopicMarketingPageProps, "metadata">) {
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
      {faqs.length ? <FaqJsonLd faqs={faqs} /> : null}
      <SiteHeader nav={settings?.nav} />
      <main className="flex-1 pt-[120px] md:pt-[136px] lg:pt-[152px]">
        <article>
          <section className="border-b border-line">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px] lg:py-24">
              <Eyebrow>{eyebrow}</Eyebrow>
              <SectionHeading as="h1" className="mt-4 max-w-[22ch]">
                {title}
              </SectionHeading>
              <p className="mt-6 max-w-[56ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                {intro}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PrimaryButtonLink href={cta.primaryHref}>
                  {cta.primaryLabel}
                </PrimaryButtonLink>
                {cta.secondaryHref && cta.secondaryLabel ? (
                  <TextLink href={cta.secondaryHref}>
                    {cta.secondaryLabel}
                  </TextLink>
                ) : null}
              </div>
            </div>
          </section>

          {sections.map((section) => (
            <section key={section.title} className="border-b border-line">
              <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
                <div className="mx-auto max-w-[720px]">
                  <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                    {section.title}
                  </h2>
                  <div className="mt-6 space-y-4">
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
                    <ul className="mt-6 space-y-3">
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
                </div>
              </div>
            </section>
          ))}

          {relatedLinks.length ? (
            <section className="border-b border-line bg-bg-raised/40">
              <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  Related pages
                </h2>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group block border border-line bg-bg-deep/60 p-5 transition-[border-color] hover:border-gold/55"
                      >
                        <p className="font-display text-xl text-fg group-hover:text-gold">
                          {link.label}
                        </p>
                        {link.description ? (
                          <p className="mt-3 text-sm leading-6 text-fg-muted">
                            {link.description}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {faqs.length ? (
            <section className="border-b border-line">
              <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr] md:px-10 md:py-20 lg:px-[74px]">
                <div>
                  <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                    Common questions
                  </h2>
                </div>
                <dl className="space-y-8">
                  {faqs.map((faq) => (
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
          ) : null}

          <section>
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                {cta.heading}
              </h2>
              <p className="mt-6 max-w-[52ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                {cta.copy}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PrimaryButtonLink href={cta.primaryHref}>
                  {cta.primaryLabel}
                </PrimaryButtonLink>
                {cta.secondaryHref && cta.secondaryLabel ? (
                  <TextLink href={cta.secondaryHref}>
                    {cta.secondaryLabel}
                  </TextLink>
                ) : null}
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
