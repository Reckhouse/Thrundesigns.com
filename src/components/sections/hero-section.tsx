"use client";

import { useRef } from "react";
import { stegaClean } from "@sanity/client/stega";
import { SecondaryButtonLink } from "@/components/site/primitives";
import { HorseParticlesLazy } from "@/components/hero/horse-particles-lazy";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

type HeroSectionProps = {
  eyebrow?: string | null;
  headline?: string | null;
  support?: string | null;
  servicesMeta?: string | null;
  /** @deprecated Hero shows a single studies CTA; kept for CMS compatibility. */
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
  secondaryCta,
  imageAlt,
}: HeroSectionProps) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 36 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: motionTokens.durationBase,
            ease: motionTokens.easeOut,
            delay,
          },
        };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden border-b border-line/40 pt-[120px] md:min-h-[920px] md:pt-[136px] lg:min-h-[100svh] lg:pt-[152px]"
      aria-label="Introduction"
    >
      {/* Full-hero Living Engraving stage — static pose when reduced motion */}
      <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
        <HorseParticlesLazy
          staticMode={Boolean(reduce)}
          ctaRef={ctaRef}
          sectionRef={sectionRef}
        />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[calc(100svh-120px)] w-full max-w-[1440px] flex-col justify-end px-5 pb-16 pt-10 md:min-h-[calc(920px-136px)] md:justify-center md:px-10 md:pb-20 md:pt-12 lg:min-h-[calc(100svh-152px)] lg:px-[74px] lg:pb-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:gap-12 xl:gap-16">
          <div className="pointer-events-auto max-w-xl lg:max-w-[42rem]">
            <motion.p
              className="text-balance font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-gold drop-shadow-[0_2px_24px_rgba(12,13,12,0.45)]"
              {...item(0.08)}
            >
              {eyebrow || "Thrun Design Co."}
            </motion.p>

            <motion.div
              className="mt-6 h-px w-20 origin-left bg-gold md:mt-8 md:w-28"
              aria-hidden
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: motionTokens.durationSlow,
                ease: motionTokens.easeOut,
                delay: 0.28,
              }}
            />

            <motion.h1
              className="mt-6 max-w-[18ch] text-balance font-display text-[clamp(1.5rem,2.8vw,2.75rem)] leading-[1.15] tracking-[-0.02em] text-fg drop-shadow-[0_2px_18px_rgba(12,13,12,0.55)] md:mt-8"
              {...item(0.22)}
            >
              {headline ||
                "Strategic design for businesses ready to move forward."}
            </motion.h1>

            <motion.p
              className="mt-6 max-w-[46ch] text-pretty font-sans text-body leading-7 text-fg md:mt-7 md:text-base md:leading-7 md:text-fg/95"
              {...item(0.34)}
            >
              {support ||
                "We help founders and owners build clearer brands, websites, and marketing systems so your next chapter feels confident, not chaotic."}
            </motion.p>

            <motion.div
              className="mt-9 flex flex-col items-stretch gap-4 sm:mt-11 sm:flex-row sm:items-center sm:gap-5"
              {...item(0.44)}
            >
              <div ref={ctaRef} className="w-full sm:w-auto">
                <SecondaryButtonLink
                  href={
                    secondaryCta?.href ? stegaClean(secondaryCta.href) : "/work"
                  }
                  className="w-full justify-center sm:w-auto"
                >
                  {secondaryCta?.label || "Browse concept studies"}
                </SecondaryButtonLink>
              </div>
            </motion.div>

            {servicesMeta ? (
              <motion.p
                className="mt-10 border-t border-line/70 pt-5 font-mono text-caption uppercase tracking-[0.16em] text-fg-muted md:mt-12 md:pt-6"
                {...item(0.54)}
              >
                {servicesMeta}
              </motion.p>
            ) : null}
          </div>

          {/* Layout spacer — composition column for the engraving */}
          <div
            className="relative mx-auto hidden min-h-[min(48vw,400px)] w-full max-w-[400px] lg:mx-0 lg:block lg:min-h-[min(52vh,440px)]"
            aria-hidden
          />
        </div>

        <motion.div
          className="mt-14 flex items-center gap-3 md:mt-20"
          aria-hidden
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <span className="font-mono text-caption uppercase tracking-[0.18em] text-fg-muted">
            Scroll
          </span>
          {!reduce ? (
            <motion.span
              className="block h-10 w-px origin-top bg-gold"
              animate={{ scaleY: [0.35, 1, 0.35], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <span className="block h-10 w-px bg-gold/70" />
          )}
        </motion.div>
      </div>

      {imageAlt ? <span className="sr-only">{imageAlt}</span> : null}
    </section>
  );
}
