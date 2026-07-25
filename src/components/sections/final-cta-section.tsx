"use client";

import {
  PrecisionMark,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { Reveal } from "@/components/site/reveal";
import { motion, useReducedMotion } from "framer-motion";

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
    <section className="editorial-depth relative overflow-hidden border-b border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 md:px-10 md:py-20 lg:px-[74px] lg:py-28">
        <motion.div
          className="absolute right-8 top-10 hidden md:right-[74px] md:top-14 md:block"
          aria-hidden
          initial={reduce ? false : { opacity: 0, rotate: -12, scale: 0.9 }}
          whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <PrecisionMark className="size-[72px] lg:size-[96px]" />
        </motion.div>

        <Reveal variant="scale">
          <SectionHeading className="max-w-3xl text-balance">
            {heading || "Tell us where the brand needs to go next."}
          </SectionHeading>
          <p className="mt-6 max-w-[60ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8 md:text-base">
            {copy ||
              "Share a short brief about your business, audience, and goal. We’ll reply within a few business days with scope options and clear next steps — no pressure, no invented promises."}
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
        </Reveal>
      </div>
    </section>
  );
}
