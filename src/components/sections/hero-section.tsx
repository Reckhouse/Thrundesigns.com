"use client";

import {
  PrimaryButtonLink,
  TextLink,
} from "@/components/site/primitives";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { HeroLogoDraw } from "@/components/site/hero-logo-draw";
import { motion, useReducedMotion } from "framer-motion";

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

const ease = [0.22, 1, 0.36, 1] as const;

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
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, ease, delay },
        };

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden border-b border-line pt-[80px] md:min-h-[920px] md:pt-[96px] lg:min-h-[100svh]"
      aria-label="Introduction"
    >
      <HeroBackdrop imageSrc={imageSrc} />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-80px)] w-full max-w-[1440px] items-end gap-8 px-5 pb-12 pt-8 md:min-h-[calc(920px-96px)] md:items-center md:gap-10 md:px-10 md:pb-16 md:pt-10 lg:min-h-[calc(100svh-96px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-8 lg:px-[74px] lg:pb-20">
        <div className="order-2 max-w-xl lg:order-1 lg:max-w-[34rem]">
          <motion.p
            className="text-balance font-display text-[34px] leading-[1.05] tracking-[-0.02em] text-gold sm:text-[42px] md:text-[48px] lg:text-[56px] lg:leading-[1.02]"
            {...item(0.05)}
          >
            {eyebrow || "Thrun Design Co."}
          </motion.p>

          <motion.div
            className="mt-5 h-px w-16 origin-left bg-gold md:mt-7 md:w-24"
            aria-hidden
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.25 }}
          />

          <motion.h1
            className="mt-5 text-balance font-display text-[24px] leading-8 tracking-[-0.02em] text-fg md:mt-7 md:text-[34px] md:leading-[42px] lg:text-[44px] lg:leading-[52px]"
            {...item(0.2)}
          >
            {headline ||
              "Strategic design for businesses ready to move forward."}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg md:mt-6 md:text-base md:leading-7 md:text-fg/90"
            {...item(0.32)}
          >
            {support ||
              "We help founders and owners build clearer brands, websites, and marketing systems — so your next chapter feels confident, not chaotic."}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-stretch gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5"
            {...item(0.42)}
          >
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
          </motion.div>

          {servicesMeta ? (
            <motion.p
              className="mt-10 border-t border-line/80 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-contrast md:mt-12 md:pt-6"
              {...item(0.52)}
            >
              {servicesMeta}
            </motion.p>
          ) : null}
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end lg:self-center">
          <div className="relative w-[min(88vw,420px)] sm:w-[min(70vw,480px)] md:w-[520px] lg:w-[560px] xl:w-[640px]">
            <HeroLogoDraw />
          </div>
        </div>
      </div>

      {imageAlt ? <span className="sr-only">{imageAlt}</span> : null}
    </section>
  );
}
