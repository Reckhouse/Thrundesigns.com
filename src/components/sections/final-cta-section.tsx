"use client";

import { stegaClean } from "@sanity/client/stega";
import {
  PrecisionMark,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { Reveal } from "@/components/site/reveal";
import { SceneSection } from "@/components/site/scene-section";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

type FinalCtaSectionProps = {
  heading?: string | null;
  copy?: string | null;
  primaryCta?: { label?: string | null; href?: string | null } | null;
  secondaryCta?: { label?: string | null; href?: string | null } | null;
};

export function FinalCtaSection({
  heading,
  copy,
  primaryCta,
  secondaryCta,
}: FinalCtaSectionProps) {
  const reduce = useReducedMotion();

  return (
    <SceneSection tone="clear" reveal="rise" className="border-b-0">
      <div className="relative overflow-hidden">
        {/* Mountain returns — lighter veil so the ridge reappears */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-bg-deep/50 via-bg-deep/30 to-bg-deep/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 editorial-depth opacity-70"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:px-[74px] lg:py-32">
          <motion.div
            className="absolute right-8 top-10 hidden md:right-[74px] md:top-16 md:block"
            aria-hidden
            initial={reduce ? false : { opacity: 0, rotate: -12, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: motionTokens.durationSlow,
              ease: motionTokens.easeOut,
            }}
          >
            <PrecisionMark className="size-[72px] text-gold lg:size-[96px]" />
          </motion.div>

          <Reveal variant="scale">
            <SectionHeading className="max-w-3xl text-balance drop-shadow-[0_2px_20px_rgba(12,13,12,0.45)]">
              {heading || "Tell us where the brand needs to go next."}
            </SectionHeading>
            <p className="mt-6 max-w-[60ch] text-pretty font-sans text-[15px] leading-7 text-fg md:mt-8 md:text-base md:text-fg/95">
              {copy ||
                "Share a short brief about your business, audience, and goal. We’ll reply within a few business days with scope options and clear next steps. No pressure, no invented promises."}
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
              <PrimaryButtonLink
                href={
                  primaryCta?.href ? stegaClean(primaryCta.href) : "/quote"
                }
                className="w-full justify-center sm:w-auto"
              >
                {primaryCta?.label || "Request a project quote"}
              </PrimaryButtonLink>
              <TextLink
                href={
                  secondaryCta?.href ? stegaClean(secondaryCta.href) : "/work"
                }
                className="justify-center text-fg hover:text-gold sm:justify-start"
              >
                {secondaryCta?.label || "Browse concept studies"}
              </TextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </SceneSection>
  );
}
