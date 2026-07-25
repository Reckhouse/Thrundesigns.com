import Image from "next/image";
import {
  PrimaryButtonLink,
  TextLink,
} from "@/components/site/primitives";
import { ContourOverlay } from "@/components/site/contour-overlay";
import { HeroCanvas } from "@/components/site/hero-canvas";
import { Reveal } from "@/components/site/reveal";
import { BrandLogo } from "@/components/icons/brand-logo";

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
    <section className="relative overflow-hidden border-b border-line pt-[72px] md:min-h-[900px] md:pt-[84px] lg:min-h-[820px]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 pb-12 pt-8 md:gap-10 md:px-10 md:pb-16 md:pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-[74px] lg:pb-10 lg:pt-12">
        <Reveal className="relative z-10 flex max-w-xl flex-col justify-center order-1">
          <div className="flex items-center gap-4">
            <BrandLogo className="hidden w-14 shrink-0 sm:block md:w-16" />
            <p className="font-display text-[28px] leading-8 tracking-[-0.02em] text-gold md:text-[34px] md:leading-10 lg:text-[40px] lg:leading-[44px]">
              {eyebrow || "Thrun Design Co."}
            </p>
          </div>
          <h1 className="mt-5 text-balance font-display text-[28px] leading-9 tracking-[-0.02em] text-fg md:mt-6 md:text-[32px] md:leading-[42px] lg:text-[48px] lg:leading-[58px]">
            {headline ||
              "Strategic design for businesses ready to move forward."}
          </h1>
          <p className="mt-5 max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-6 md:text-base md:leading-7">
            {support ||
              "We help founders and owners build clearer brands, websites, and marketing systems — so your next chapter feels confident, not chaotic."}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
            <PrimaryButtonLink
              href={primaryCta?.href || "/quote"}
              className="w-full justify-center sm:w-auto"
            >
              {primaryCta?.label || "Request a project quote"}
            </PrimaryButtonLink>
            <TextLink
              href={secondaryCta?.href || "/work"}
              className="justify-center sm:justify-start"
            >
              {secondaryCta?.label || "Browse concept studies"}
            </TextLink>
          </div>

          {servicesMeta ? (
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted md:mt-10">
              {servicesMeta}
            </p>
          ) : null}
        </Reveal>

        <div className="relative order-2 min-h-[320px] md:min-h-[480px] lg:min-h-[736px]">
          <div className="absolute inset-0 overflow-hidden bg-bg-raised">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt || "Mountain landscape hero"}
                fill
                priority
                className="object-cover object-center grayscale contrast-125"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 820px"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2b3033,transparent_45%),linear-gradient(160deg,#111417,#090b0d)]" />
            )}
            <ContourOverlay className="absolute inset-0 hidden md:block" />
            <HeroCanvas className="absolute inset-0 hidden opacity-70 lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
