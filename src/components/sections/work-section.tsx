"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { motion, useReducedMotion } from "framer-motion";

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
    <section id="work" className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[340px_1fr] lg:gap-16 lg:px-[74px] lg:py-20">
        <Reveal variant="blur">
          {eyebrow ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading className={eyebrow ? "mt-4 text-balance" : "text-balance"}>
            {heading || "Speculative work with production intent."}
          </SectionHeading>
          <p className="mt-6 max-w-[40ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8">
            {intro ||
              "These are concept projects — not client case studies — until we replace them with real engagements."}
          </p>
        </Reveal>

        <Stagger className="grid gap-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-3" stagger={0.12}>
          {projects.map((project) => {
            const href = project.slug?.current
              ? `/work/${project.slug.current}`
              : "/work";
            const src = project.imageSrc || project.cover?.blobUrl || null;

            return (
              <StaggerItem key={project._id}>
                <article className="group flex flex-col">
                  <Link
                    href={href}
                    className="relative block aspect-[286/390] overflow-hidden bg-bg-raised"
                  >
                    {src ? (
                      <motion.div
                        className="absolute inset-0"
                        whileHover={reduce ? undefined : { scale: 1.05 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(160deg,#15191c,#090b0d)]" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-80" />
                  </Link>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                    {project.industry}
                  </p>
                  <h3 className="mt-3 font-display text-[26px] leading-8 text-fg">
                    {project.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm text-fg-muted">
                    {project.services}
                  </p>
                  <div className="mt-8 border-t border-line pt-5">
                    <TextLink href={href}>View concept</TextLink>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
