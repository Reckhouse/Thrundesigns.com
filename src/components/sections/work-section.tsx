"use client";

import { Badge } from "@/components/ui/badge";
import { ClipHeading } from "@/components/site/clip-heading";
import { Reveal } from "@/components/site/reveal";
import { SceneSection } from "@/components/site/scene-section";
import {
  WorkCategoryMarquee,
  type WorkMarqueeProject,
} from "@/components/sections/work-category-marquee";

type WorkSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  projects: WorkMarqueeProject[];
};

export function WorkSection({
  eyebrow,
  heading,
  intro,
  projects,
}: WorkSectionProps) {
  return (
    <SceneSection id="work" tone="plate" reveal="wipe-left">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-16 md:px-10 md:pt-24 lg:px-[74px] lg:pt-28">
        <Reveal variant="blur">
          <div className="max-w-[40rem]">
            <Badge
              variant="outline"
              className="rounded-none border-gold/50 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
            >
              {eyebrow || "Concept studies"}
            </Badge>
            <ClipHeading className="mt-5 text-balance font-display text-[clamp(1.85rem,4vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-fg">
              {heading || "Speculative work with production intent."}
            </ClipHeading>
            <p className="mt-6 max-w-[48ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8 md:text-base">
              {intro ||
                "These are concept projects, not client case studies, until we replace them with real engagements."}
            </p>
          </div>
        </Reveal>
      </div>

      {projects.length > 0 ? (
        <div className="mt-12 w-full pb-16 md:mt-14 md:pb-24 lg:pb-28">
          <WorkCategoryMarquee projects={projects} durationSeconds={40} />
        </div>
      ) : (
        <p className="mx-auto w-full max-w-[1440px] px-5 pb-16 font-sans text-[15px] text-fg-muted md:px-10 md:pb-24 lg:px-[74px] lg:pb-28">
          No concept studies are published yet.
        </p>
      )}
    </SceneSection>
  );
}
