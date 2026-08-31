"use client";

import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import { TextLink } from "@/components/site/primitives";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { isControlledChaosSlug } from "@/lib/controlled-chaos-media";
import { groupProjectsByWorkCategory } from "@/lib/work-categories";
import type { WorkMarqueeProject } from "@/components/sections/work-category-marquee";

type WorkCategoryIndexProps = {
  projects: WorkMarqueeProject[];
};

export function WorkCategoryIndex({ projects }: WorkCategoryIndexProps) {
  const rows = groupProjectsByWorkCategory(projects);

  if (rows.length === 0) {
    return (
      <p className="mx-auto max-w-[1440px] px-5 py-16 font-sans text-body text-fg drop-shadow-[0_2px_16px_rgba(12,13,12,0.85)] md:px-10 lg:px-[74px]">
        No concept studies are published yet.
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 py-16 md:px-10 md:py-20 lg:px-[74px]">
      {rows.map((row) => (
        <section key={row.key} aria-labelledby={`work-cat-${row.key}`}>
          <h2
            id={`work-cat-${row.key}`}
            className="font-mono text-label uppercase tracking-[0.16em] text-gold drop-shadow-[0_2px_16px_rgba(12,13,12,0.8)]"
          >
            {row.label}
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {row.projects.map((project) => {
              const slug = project.slug?.current
                ? stegaClean(project.slug.current)
                : "";
              const href = slug ? `/work/${slug}` : "/work";
              const raw = project.imageSrc || project.cover?.blobUrl || null;
              const src = raw ? stegaClean(raw) : null;
              const alt = project.cover?.alt
                ? stegaClean(project.cover.alt)
                : project.title || "Concept study";
              const imageFitClass = isControlledChaosSlug(slug)
                ? "object-contain object-center"
                : "object-cover";

              return (
                <li key={project._id} className="flex h-full flex-col">
                  <Link
                    href={href}
                    className="relative block overflow-hidden bg-bg-raised ring-1 ring-line transition-[ring-color] duration-300 hover:ring-gold/55"
                  >
                    <AspectRatio ratio={286 / 390}>
                      {src ? (
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className={`${imageFitClass} grayscale transition duration-500 hover:grayscale-0`}
                          sizes="(max-width: 768px) 100vw, 286px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(160deg,#222522,#0c0d0c)]" />
                      )}
                    </AspectRatio>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-deep/80 via-transparent to-transparent" />
                  </Link>
                  <p className="mt-5 font-mono text-label uppercase tracking-[0.14em] text-gold">
                    {project.industry}
                  </p>
                  <h3 className="mt-3 font-display text-[26px] leading-8 text-fg">
                    {project.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-6 text-fg-muted">
                    {project.summary?.trim() || project.services}
                  </p>
                  <div className="min-h-8 flex-1" aria-hidden />
                  <div className="border-t border-line pt-5">
                    <TextLink href={href}>View concept</TextLink>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
