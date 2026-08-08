"use client";

import { stegaClean } from "@sanity/client/stega";
import { ClipHeading } from "@/components/site/clip-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { SceneSection } from "@/components/site/scene-section";
import { SecondaryButtonLink, TextLink } from "@/components/site/primitives";
import { Badge } from "@/components/ui/badge";
import { quoteHrefForProjectType } from "@/lib/quote/project-type";

export type ArtifactItem = {
  label?: string | null;
  detail?: string | null;
};

type ArtifactSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  items?: ArtifactItem[] | null;
  footnote?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export function ArtifactSection({
  eyebrow,
  heading,
  intro,
  items,
  footnote,
  ctaLabel,
  ctaHref,
}: ArtifactSectionProps) {
  const list = items?.filter((item) => item?.label) ?? [];
  if (!list.length) return null;

  const href = ctaHref ? stegaClean(ctaHref) : quoteHrefForProjectType("audit");

  return (
    <SceneSection id="sample" tone="glass" reveal="wipe-up">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:gap-14 md:px-10 md:py-24 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16 lg:px-[74px] lg:py-28">
        <Reveal variant="left">
          <Badge
            variant="outline"
            className="rounded-none border-gold/50 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          >
            {eyebrow || "Sample lens"}
          </Badge>
          <ClipHeading className="mt-5 text-balance font-display text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-fg">
            {heading || "What a marketing audit actually looks for."}
          </ClipHeading>
          <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8 md:text-base">
            {intro ||
              "Not a case study and not invented metrics: a plain excerpt of the questions we bring to a first review so you can judge the fit before you quote."}
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5">
            <SecondaryButtonLink
              href={href}
              className="w-full justify-center sm:w-auto"
            >
              {ctaLabel || "Request an audit quote"}
            </SecondaryButtonLink>
            <TextLink href="/quote" className="justify-center sm:justify-start">
              Or start a broader brief
            </TextLink>
          </div>
        </Reveal>

        <Stagger className="space-y-0 border border-line bg-bg-raised/80" stagger={0.08}>
          {list.map((item, index) => (
            <StaggerItem key={`${item.label}-${index}`} variant="up">
              <div className="grid gap-3 border-b border-line px-5 py-6 last:border-b-0 md:grid-cols-[auto_1fr] md:gap-8 md:px-7 md:py-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-[1.15rem] leading-snug text-fg md:text-[1.25rem]">
                    {item.label}
                  </p>
                  {item.detail ? (
                    <p className="mt-2 max-w-[52ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
              </div>
            </StaggerItem>
          ))}
          {footnote ? (
            <p className="border-t border-line px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted md:px-7">
              {footnote}
            </p>
          ) : null}
        </Stagger>
      </div>
    </SceneSection>
  );
}
