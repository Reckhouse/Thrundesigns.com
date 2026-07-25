"use client";

import { SectionHeading, TextLink } from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";

type EngageSectionProps = {
  heading?: string | null;
  engageSteps?: { title: string; copy: string }[] | null;
  replyHeading?: string | null;
  replyPoints?: string[] | null;
};

const defaultSteps = [
  {
    title: "Send a short brief",
    copy: "About five minutes on your business, audience, and the outcome you need.",
  },
  {
    title: "Get a scoped reply",
    copy: "Within a few business days we write back with options — not a hard sell.",
  },
  {
    title: "Choose your next step",
    copy: "Move forward, adjust the scope, or pause. You’re in control either way.",
  },
];

const defaultReplyPoints = [
  "A plain-language read of your goals and constraints",
  "Scope options (and ballpark ranges when we can estimate)",
  "Clear next steps if we both want to continue",
];

export function EngageSection({
  heading,
  engageSteps,
  replyHeading,
  replyPoints,
}: EngageSectionProps) {
  const steps = engageSteps?.length ? engageSteps : defaultSteps;
  const replies = replyPoints?.length ? replyPoints : defaultReplyPoints;

  return (
    <section id="engage" className="border-b border-line bg-bg-raised">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-[74px] lg:py-20">
        <Reveal variant="left">
          <SectionHeading className="max-w-lg text-balance text-[28px] leading-9 md:text-[34px] md:leading-[42px] lg:text-[42px] lg:leading-[46px]">
            {heading || "How we engage — and what you’ll get in a reply."}
          </SectionHeading>
          <p className="mt-6 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
            No invented case studies required. This is the real first step with
            Thrun Design Co.
          </p>
          <div className="mt-8">
            <TextLink href="/quote">Request a project quote</TextLink>
          </div>
        </Reveal>

        <Stagger className="grid gap-8 sm:grid-cols-2 sm:gap-10" stagger={0.1}>
          <StaggerItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              How we engage
            </p>
            <ol className="mt-5 space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    className="font-mono text-[12px] text-gold"
                    aria-hidden
                  >
                    0{index + 1}
                  </span>
                  <div>
                    <p className="font-sans text-[15px] font-medium text-fg">
                      {step.title}
                    </p>
                    <p className="mt-1 font-sans text-sm leading-6 text-fg-muted">
                      {step.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </StaggerItem>

          <StaggerItem>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              {replyHeading || "What’s in a reply"}
            </p>
            <ul className="mt-5 space-y-4">
              {replies.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    className="mt-2 size-1.5 shrink-0 bg-gold"
                    aria-hidden
                  />
                  <p className="font-sans text-[15px] leading-6 text-fg">
                    {point}
                  </p>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
