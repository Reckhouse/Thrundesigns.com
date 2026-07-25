"use client";

import Image from "next/image";
import Link from "next/link";
import { TextLink } from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { SceneSection } from "@/components/site/scene-section";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

type Project = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  industry?: string | null;
  services?: string | null;
  cover?: {
    alt?: string | null;
    blobUrl?: string | null;
    image?: { asset?: unknown } | null;
  } | null;
  imageSrc?: string | null;
};

type WorkSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  projects: Project[];
};

export function WorkSection({
  eyebrow,
  heading,
  intro,
  projects,
}: WorkSectionProps) {
  const reduce = useReducedMotion();

  return (
    <SceneSection id="work" tone="plate" reveal="wipe-left">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:gap-14 md:px-10 md:py-24 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16 lg:px-[74px] lg:py-28">
        <Reveal variant="blur">
          <Badge
            variant="outline"
            className="rounded-none border-gold/50 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          >
            {eyebrow || "Concept studies"}
          </Badge>
          <ClipHeading className="mt-5 text-balance font-display text-[clamp(1.85rem,4vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-fg">
            {heading || "Speculative work with production intent."}
          </ClipHeading>
          <p className="mt-6 max-w-[40ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8 md:text-base">
            {intro ||
              "These are concept projects — not client case studies — until we replace them with real engagements."}
          </p>
        </Reveal>

        <Stagger
          className="grid gap-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
          stagger={0.12}
        >
          {projects.map((project, index) => {
            const href = project.slug?.current
              ? `/work/${project.slug.current}`
              : "/work";
            const src = project.imageSrc || project.cover?.blobUrl || null;

            return (
              <StaggerItem
                key={project._id}
                className="h-full"
                variant={index % 2 === 0 ? "up" : "scale"}
              >
                <HoverCard openDelay={180} closeDelay={80}>
                  <article className="group flex h-full flex-col">
                    <HoverCardTrigger asChild>
                      <Link
                        href={href}
                        className="relative block overflow-hidden bg-bg-raised ring-1 ring-line transition-[ring-color] duration-300 hover:ring-gold/55"
                      >
                        <AspectRatio ratio={286 / 390}>
                          {src ? (
                            <motion.div
                              className="absolute inset-0"
                              initial={
                                reduce
                                  ? false
                                  : { clipPath: "inset(100% 0 0 0)" }
                              }
                              whileInView={{ clipPath: "inset(0% 0 0 0)" }}
                              viewport={{ once: true, amount: 0.3 }}
                              transition={{
                                duration: motionTokens.durationSlow,
                                ease: motionTokens.easeOut,
                              }}
                            >
                              <motion.div
                                className="absolute inset-0"
                                whileHover={
                                  reduce ? undefined : { scale: 1.05 }
                                }
                                transition={{
                                  duration: 0.55,
                                  ease: motionTokens.easeOut,
                                }}
                              >
                                <Image
                                  src={src}
                                  alt={
                                    project.cover?.alt ||
                                    project.title ||
                                    "Concept study"
                                  }
                                  fill
                                  className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                                  sizes="(max-width: 768px) 100vw, 286px"
                                />
                              </motion.div>
                            </motion.div>
                          ) : (
                            <div className="absolute inset-0 bg-[linear-gradient(160deg,#222522,#0c0d0c)]" />
                          )}
                        </AspectRatio>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-deep/80 via-transparent to-transparent" />
                      </Link>
                    </HoverCardTrigger>

                    <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                      {project.industry}
                    </p>
                    <h3 className="mt-3 font-display text-[26px] leading-8 text-fg">
                      {project.title}
                    </h3>
                    <p className="mt-3 font-sans text-sm leading-6 text-fg-muted">
                      {project.services}
                    </p>
                    <div className="min-h-8 flex-1" aria-hidden />
                    <div className="border-t border-line pt-5">
                      <TextLink href={href}>View concept</TextLink>
                    </div>
                  </article>

                  <HoverCardContent
                    side="top"
                    className="w-64 rounded-none border-line bg-bg-raised p-4 text-fg shadow-none"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                      Concept study
                    </p>
                    <p className="mt-2 font-display text-lg text-fg">
                      {project.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">
                      {project.services}. Speculative work with production
                      intent — not a client case study.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </SceneSection>
  );
}
