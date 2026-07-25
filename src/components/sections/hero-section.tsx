import {
  PrimaryButtonLink,
  TextLink,
} from "@/components/site/primitives";
import { Reveal } from "@/components/site/reveal";
import { BrandLogo } from "@/components/icons/brand-logo";
import { HeroBackdrop } from "@/components/site/hero-backdrop";

type HeroSectionProps = {
  eyebrow?: string | null;
  headline?: string | null;
  support?: string | null;
  servicesMeta?: string | null;
  primaryCta?: { label?: string | null; href?: string | null } | null;
  secondaryCta?: { label?: string | null; href?: string | null } | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
};

export function HeroSection({
  eyebrow,
  headline,
  support,
  servicesMeta,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
}: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[100svh] overflow-hidden border-b border-line pt-[72px] md:min-h-[920px] md:pt-[84px] lg:min-h-[100svh]"
      aria-label="Introduction"
    >
      <HeroBackdrop imageSrc={imageSrc} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-[1440px] flex-col justify-end px-5 pb-12 pt-10 md:min-h-[calc(920px-84px)] md:justify-center md:px-10 md:pb-20 md:pt-12 lg:min-h-[calc(100svh-84px)] lg:px-[74px] lg:pb-24">
        <Reveal className="max-w-xl lg:max-w-[34rem]">
          <div className="flex items-center gap-4 md:gap-5">
            <BrandLogo className="hidden w-16 shrink-0 sm:block md:w-[4.5rem] lg:w-20" />
            <p className="text-balance font-display text-[34px] leading-9 tracking-[-0.02em] text-gold sm:text-[40px] sm:leading-10 md:text-[48px] md:leading-[1.05] lg:text-[56px] lg:leading-[1.02]">
              {eyebrow || "Thrun Design Co."}
            </p>
          </div>

          <div className="mt-6 h-px w-16 bg-gold md:mt-8 md:w-20" aria-hidden />

          <h1 className="mt-6 text-balance font-display text-[26px] leading-8 tracking-[-0.02em] text-fg md:mt-8 md:text-[34px] md:leading-[42px] lg:text-[44px] lg:leading-[52px]">
            {headline ||
              "Strategic design for businesses ready to move forward."}
          </h1>

          <p className="mt-5 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg md:mt-6 md:text-base md:leading-7 md:text-fg/90">
            {support ||
              "We help founders and owners build clearer brands, websites, and marketing systems — so your next chapter feels confident, not chaotic."}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
            <PrimaryButtonLink
              href={primaryCta?.href || "/quote"}
              className="w-full justify-center sm:w-auto"
            >
              {primaryCta?.label || "Request a project quote"}
            </PrimaryButtonLink>
            <TextLink
              href={secondaryCta?.href || "/work"}
              className="justify-center text-fg hover:text-gold sm:justify-start"
            >
              {secondaryCta?.label || "Browse concept studies"}
            </TextLink>
          </div>

          {servicesMeta ? (
            <p className="mt-10 border-t border-line/80 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-contrast md:mt-12 md:pt-6">
              {servicesMeta}
            </p>
          ) : null}
        </Reveal>
      </div>

      {/* Screen-reader alt for the decorative full-bleed image */}
      {imageAlt ? <span className="sr-only">{imageAlt}</span> : null}
    </section>
  );
}
