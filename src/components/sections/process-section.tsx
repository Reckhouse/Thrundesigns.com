"use client";

import {
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";

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
  return (
    <section id="process" className="border-b border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 md:px-10 md:py-16 lg:px-[74px] lg:py-20">
        <Reveal className="flex max-w-3xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading className="max-w-xl text-balance">
            {heading || "A clear path from brief to launch."}
          </SectionHeading>
          <TextLink href="/quote" className="shrink-0 self-start md:self-auto">
            Start with a quote
          </TextLink>
        </Reveal>

        <Stagger
          className="mt-10 grid list-none gap-8 sm:grid-cols-2 md:mt-14 md:gap-10 lg:grid-cols-3"
          stagger={0.12}
        >
          {steps.map((step) => (
            <StaggerItem key={step._id}>
              <div className="relative border-t border-line pt-6">
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

        <div className="mt-10 md:mt-12 lg:hidden">
          <PrimaryButtonLink href="/quote" className="w-full justify-center">
            Request a project quote
          </PrimaryButtonLink>
        </div>
      </div>
    </section>
  );
}
