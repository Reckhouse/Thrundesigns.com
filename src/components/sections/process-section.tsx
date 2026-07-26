"use client";

import {
  PrimaryButtonLink,
  TextLink,
} from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { SceneSection } from "@/components/site/scene-section";
import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { motionTokens } from "@/lib/motion-tokens";

type ProcessSectionProps = {
  heading?: string | null;
  steps: {
    _id: string;
    number?: string | null;
    title?: string | null;
    copy?: string | null;
  }[];
};

export function ProcessSection({ heading, steps }: ProcessSectionProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 55%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <SceneSection id="process" tone="clear" reveal="rise">
      <div ref={ref} className="relative">
        <div
          className="absolute inset-0 bg-bg-deep/35 md:bg-bg-deep/28"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24 lg:px-[74px] lg:py-28">
          <Reveal className="flex max-w-3xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge
                variant="outline"
                className="rounded-none border-gold/50 bg-bg-deep/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
              >
                Process
              </Badge>
              <ClipHeading className="mt-5 max-w-xl text-balance font-display text-[clamp(1.85rem,4vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-fg drop-shadow-[0_2px_16px_rgba(12,13,12,0.5)]">
                {heading || "How a project runs — from brief to handoff."}
              </ClipHeading>
            </div>
            <TextLink
              href="/quote"
              className="shrink-0 self-start text-fg hover:text-gold md:self-auto"
            >
              Start with a quote
            </TextLink>
          </Reveal>

          <div className="relative mt-14 md:mt-16">
            <div
              className="absolute left-0 right-0 top-0 hidden h-px bg-line lg:block"
              aria-hidden
            />
            {!reduce ? (
              <motion.div
                aria-hidden
                className="absolute left-0 top-0 hidden h-px origin-left bg-gold lg:block"
                style={{ scaleX: lineScale }}
              />
            ) : null}

            <Stagger
              className="grid list-none gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
              stagger={0.12}
            >
              {steps.map((step) => (
                <StaggerItem key={step._id} variant="up">
                  <div className="relative border border-line bg-surface-glass p-6 pt-7 md:p-7 lg:pt-10">
                    <motion.span
                      aria-hidden
                      className="absolute left-6 top-0 hidden size-2.5 -translate-y-1/2 bg-gold lg:left-7 lg:block"
                      initial={reduce ? false : { scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: motionTokens.durationFast,
                        ease: motionTokens.easeOut,
                      }}
                    />
                    <p className="font-mono text-[12px] text-gold">
                      {step.number}
                    </p>
                    <h3 className="mt-4 font-display text-2xl text-fg">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[36ch] font-sans text-sm leading-6 text-fg-muted">
                      {step.copy}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="mt-10 md:mt-12 lg:hidden">
            <PrimaryButtonLink href="/quote" className="w-full justify-center">
              Request a project quote
            </PrimaryButtonLink>
          </div>
        </div>
      </div>
    </SceneSection>
  );
}
