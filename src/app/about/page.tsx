import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  Eyebrow,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { SERVICES } from "@/lib/services";
import { buildPageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/sanity/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "About the studio",
  description:
    "Thrun Design Co. is a brand and web design studio for founders and owners who need clearer systems, sites, and materials—with direct collaboration from brief to handoff.",
  path: "/about",
});

export default async function AboutPage() {
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
              <Eyebrow>About</Eyebrow>
              <SectionHeading as="h1" className="mt-4 max-w-[18ch]">
                A design partner when the stakes feel real.
              </SectionHeading>
              <p className="mt-6 max-w-[48ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                Thrun Design Co. helps founders and owners steady a messy brand,
                launch with clarity, or replace an outdated site—without the
                agency layers that slow decisions down.
              </p>
            </div>
          </section>

          <section className="border-b border-line">
            <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-20 lg:gap-20 lg:px-[74px]">
              <div>
                <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                  How we work
                </h2>
                <p className="mt-6 max-w-[48ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                  You collaborate directly with the designer responsible for the
                  work. Engagements stay scoped, written in plain language, and
                  paced for businesses that need momentum—not theater.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Systems that stay coherent as you grow",
                    "Brand architecture that works across channels",
                    "Clear craft without decorative excess",
                    "Steady pace from discovery through launch",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 font-sans text-body leading-7 text-fg"
                    >
                      <span className="mt-2 size-1.5 shrink-0 bg-gold" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-line bg-bg-raised/70 p-6 md:p-8">
                <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
                  Service area
                </p>
                <p className="mt-4 font-sans text-body leading-7 text-fg">
                  We work with growing businesses across the United States,
                  primarily remote, with selective on-site collaboration when a
                  project needs it.
                </p>
                <p className="mt-6 font-sans text-body leading-7 text-fg-muted">
                  Current public studies are concept work with production
                  intent. Real client case studies will replace them as
                  engagements ship—we do not invent outcomes.
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-line">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                What we take on
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <TextLink href={`/services/${service.slug}`}>
                      {service.shortTitle}
                    </TextLink>
                    <p className="mt-2 max-w-[36ch] font-sans text-sm leading-6 text-fg-muted">
                      {service.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 md:py-20 lg:px-[74px]">
              <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.1rem)] tracking-[-0.02em] text-fg">
                Start with a short brief
              </h2>
              <p className="mt-6 max-w-[48ch] text-pretty font-sans text-body leading-7 text-fg-muted">
                Tell us about the business, the audience, and the outcome you
                need. We reply within a few business days with scope options and
                clear next steps.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <PrimaryButtonLink href="/quote">
                  Request a project quote
                </PrimaryButtonLink>
                <TextLink href="/work">Browse concept studies</TextLink>
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
