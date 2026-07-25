import Image from "next/image";
import {
  Eyebrow,
  PrimaryButtonLink,
  PrecisionMark,
  TextLink,
} from "@/components/site/primitives";
import { ContourOverlay } from "@/components/site/contour-overlay";
import { HeroCanvas } from "@/components/site/hero-canvas";
import { Reveal } from "@/components/site/reveal";

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
    <section className="relative min-h-[820px] overflow-hidden border-b border-line pt-[84px]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 pb-16 pt-10 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-[74px] lg:pb-10 lg:pt-12">
        <Reveal className="relative z-10 flex max-w-xl flex-col justify-center">
          <Eyebrow>{eyebrow || "Thrun Design Co."}</Eyebrow>
          <h1 className="mt-5 font-display text-[30px] leading-10 text-fg md:text-[34px] md:leading-[46px] lg:text-[56px] lg:leading-[70px]">
            {headline ||
              "Strategic design for businesses ready to move forward."}
          </h1>
          <p className="mt-6 max-w-[500px] font-sans text-[15px] leading-7 text-fg-muted md:text-base">
            {support ||
              "Cohesive brand identities, websites, and marketing materials built for clarity, consistency, and confidence."}
          </p>

          <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <PrimaryButtonLink href={primaryCta?.href || "/quote"}>
              {primaryCta?.label || "Request a project quote"}
            </PrimaryButtonLink>
            <TextLink href={secondaryCta?.href || "/work"}>
              {secondaryCta?.label || "Explore our work"}
            </TextLink>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
            {servicesMeta ||
              "Brand identity  ·  Website design  ·  Print & marketing"}
          </p>
        </Reveal>

        <div className="relative min-h-[420px] lg:min-h-[736px]">
          <div className="absolute inset-0 overflow-hidden bg-bg-raised">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt || "Mountain landscape hero"}
                fill
                priority
                className="object-cover object-center grayscale contrast-125"
                sizes="(max-width: 1024px) 100vw, 820px"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2b3033,transparent_45%),linear-gradient(160deg,#111417,#090b0d)]" />
            )}
            <ContourOverlay className="absolute inset-0 hidden md:block" />
            <HeroCanvas className="absolute inset-0 hidden opacity-70 lg:block" />
            <PrecisionMark className="absolute right-8 top-10 hidden lg:block" />
            <p className="absolute bottom-6 right-6 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-gold md:block">
              39.7392° N  ·  104.9903° W
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
