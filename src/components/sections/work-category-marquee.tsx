"use client";
import { useHydratedReducedMotion as useReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import {
  MotionToggle,
  useMotionPreference,
} from "@/components/site/motion-controls";

import Image from "next/image";
import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { isControlledChaosSlug } from "@/lib/controlled-chaos-media";

export type WorkMarqueeProject = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  industry?: string | null;
  services?: string | null;
  summary?: string | null;
  workCategory?: string | null;
  cover?: {
    alt?: string | null;
    blobUrl?: string | null;
  } | null;
  imageSrc?: string | null;
};

type WorkCategoryMarqueeProps = {
  /** Category heading; omit on the homepage mixed featured marquee. */
  label?: string;
  projects: WorkMarqueeProject[];
  /** Slightly different duration per row so tracks feel independent. */
  durationSeconds?: number;
};

function projectHref(project: WorkMarqueeProject): string {
  const slug = project.slug?.current ? stegaClean(project.slug.current) : "";
  return slug ? `/work/${slug}` : "/work";
}

function projectSrc(project: WorkMarqueeProject): string | null {
  const raw = project.imageSrc || project.cover?.blobUrl || null;
  return raw ? stegaClean(raw) : null;
}

function projectAlt(project: WorkMarqueeProject): string {
  if (project.cover?.alt) return stegaClean(project.cover.alt);
  return project.title || "Concept study";
}

function projectBlurb(project: WorkMarqueeProject): string {
  const summary = project.summary?.trim();
  if (summary) return summary;
  if (project.services) return `${stegaClean(project.services)}.`;
  return "Speculative work with production intent.";
}

function MarqueeCard({
  project,
  duplicate,
}: {
  project: WorkMarqueeProject;
  duplicate?: boolean;
}) {
  const slug = project.slug?.current ? stegaClean(project.slug.current) : "";
  const src = projectSrc(project);
  const href = projectHref(project);
  const imageFitClass = isControlledChaosSlug(slug)
    ? "object-contain object-center"
    : "object-cover";

  return (
    <HoverCard openDelay={160} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Link
          href={href}
          tabIndex={duplicate ? -1 : 0}
          aria-hidden={duplicate ? true : undefined}
          className="group relative block w-[200px] shrink-0 overflow-hidden bg-bg-raised ring-1 ring-line transition-[ring-color] duration-300 hover:ring-gold/55 sm:w-[240px]"
        >
          <div className="relative aspect-[286/390] w-full">
            {src ? (
              <Image
                src={src}
                alt={duplicate ? "" : projectAlt(project)}
                fill
                className={`${imageFitClass} grayscale transition duration-500 group-hover:grayscale-0`}
                sizes="240px"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(160deg,#222522,#0c0d0c)]" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-deep/85 via-transparent to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <p className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
              {project.industry}
            </p>
            <p className="mt-1 truncate font-display text-[1.05rem] leading-tight text-fg">
              {project.title}
            </p>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        className="w-72 rounded-none border-line bg-bg-raised p-4 text-fg shadow-none"
      >
        <p className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
          Concept study
        </p>
        <p className="mt-2 font-display text-lg text-fg">{project.title}</p>
        <p className="mt-2 text-sm leading-6 text-fg-muted">
          {projectBlurb(project)}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

export function WorkCategoryMarquee({
  label,
  projects,
  durationSeconds = 42,
}: WorkCategoryMarqueeProps) {
  const reduce = useReducedMotion();
  const { paused } = useMotionPreference();

  if (projects.length === 0) return null;

  // Repeat enough cards that short categories still fill a looping track.
  const loopSource =
    projects.length >= 4
      ? projects
      : Array.from(
          { length: Math.ceil(4 / projects.length) },
          () => projects,
        ).flat();

  if (reduce) {
    return (
      <div className="flex w-full flex-col gap-4">
        {label ? (
          <p className="px-5 font-mono text-label uppercase tracking-[0.16em] text-gold md:px-10 lg:px-[74px]">
            {label}
          </p>
        ) : null}
        <div className="flex gap-4 overflow-x-auto px-5 pb-2 md:px-10 lg:px-[74px]">
          {projects.map((project) => (
            <MarqueeCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="group/marquee flex w-full flex-col gap-4">
      <div className="px-6">
        <MotionToggle />
      </div>
      {label ? (
        <p className="px-5 font-mono text-label uppercase tracking-[0.16em] text-gold md:px-10 lg:px-[74px]">
          {label}
        </p>
      ) : null}
      <div className="relative w-full overflow-hidden">
        <div
          className="work-marquee-track flex w-max gap-4 py-1 group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]"
          style={{
            animationDuration: `${durationSeconds}s`,
            animationPlayState: paused ? "paused" : undefined,
          }}
        >
          <div className="flex gap-4" aria-hidden={false}>
            {loopSource.map((project, index) => (
              <MarqueeCard
                key={`${project._id}-a-${index}`}
                project={project}
              />
            ))}
          </div>
          {/*
            Duplicate half for a seamless CSS loop. Keep aria-hidden +
            tabIndex={-1} so AT/keyboard only see one set, but do NOT use
            `inert` — that disables pointer events, so cards become
            unclickable whenever this half is on screen.
          */}
          <div className="flex gap-4" aria-hidden>
            {loopSource.map((project, index) => (
              <MarqueeCard
                key={`${project._id}-b-${index}`}
                project={project}
                duplicate
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
