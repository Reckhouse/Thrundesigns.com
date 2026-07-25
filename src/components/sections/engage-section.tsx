"use client";

import { TextLink } from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 md:gap-12 md:px-10 md:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-[74px] lg:py-24">
        <Reveal variant="left">
          <Badge
            variant="outline"
            className="rounded-none border-gold/40 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          >
            Engagement
          </Badge>
          <ClipHeading className="mt-5 max-w-lg text-balance font-display text-[28px] leading-9 tracking-[-0.02em] text-fg md:text-[34px] md:leading-[42px] lg:text-[42px] lg:leading-[46px]">
            {heading || "How we engage — and what you’ll get in a reply."}
          </ClipHeading>
          <p className="mt-6 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
            No invented case studies required. This is the real first step with
            Thrun Design Co.
          </p>
          <div className="mt-8">
            <TextLink href="/quote">Request a project quote</TextLink>
          </div>
        </Reveal>

        <Stagger className="grid gap-5" stagger={0.1}>
          <StaggerItem>
            <Card className="editorial-panel bg-bg py-0">
              <CardHeader className="border-b border-line pt-6">
                <CardTitle className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  How we engage
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="step-0"
                  className="w-full"
                >
                  {steps.map((step, index) => (
                    <AccordionItem
                      key={step.title}
                      value={`step-${index}`}
                      className="border-line"
                    >
                      <AccordionTrigger className="py-4 text-left font-sans text-[15px] font-medium text-fg hover:no-underline hover:text-gold [&[data-state=open]]:text-gold">
                        <span className="mr-3 font-mono text-[12px] text-gold">
                          0{index + 1}
                        </span>
                        {step.title}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-6 text-fg-muted">
                        {step.copy}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="editorial-panel bg-contrast py-0 text-ink ring-contrast">
              <CardHeader className="border-b border-ink/15 pt-6">
                <CardTitle className="font-mono text-[11px] uppercase tracking-[0.14em] text-bronze">
                  {replyHeading || "What’s in a reply"}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-5">
                <ul className="space-y-4">
                  {replies.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span
                        className="mt-2 size-1.5 shrink-0 bg-bronze"
                        aria-hidden
                      />
                      <p className="font-sans text-[15px] leading-6 text-ink/85">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
