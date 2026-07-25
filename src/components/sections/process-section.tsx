"use client";

import {
  PrimaryButtonLink,
  TextLink,
} from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 55%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      ref={ref}
      className="editorial-depth border-b border-line"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 md:px-10 md:py-20 lg:px-[74px] lg:py-24">
        <Reveal className="flex max-w-3xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge
              variant="outline"
              className="rounded-none border-gold/40 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
            >
              Process
            </Badge>
            <ClipHeading className="mt-5 max-w-xl text-balance font-display text-[30px] leading-10 tracking-[-0.02em] text-fg md:text-[34px] md:leading-[46px] lg:text-[56px] lg:leading-[70px]">
              {heading || "A clear path from brief to launch."}
            </ClipHeading>
          </div>
          <TextLink href="/quote" className="shrink-0 self-start md:self-auto">
            Start with a quote
          </TextLink>
        </Reveal>

        <div className="relative mt-12 md:mt-16">
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
            className="grid list-none gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3"
            stagger={0.14}
          >
            {steps.map((step) => (
              <StaggerItem key={step._id}>
                <div className="relative border-t border-line pt-7 lg:border-t-0 lg:pt-10">
                  <motion.span
                    aria-hidden
                    className="absolute left-0 top-0 hidden size-2.5 -translate-y-1/2 bg-gold lg:block"
                    initial={reduce ? false : { scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <p className="font-mono text-[12px] text-gold">{step.number}</p>
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
    </section>
  );
}
