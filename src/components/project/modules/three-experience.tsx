import { ExperienceClientBoundary } from "@/components/experiences/ExperienceClientBoundary";
import { ExperienceLaunchLink } from "@/components/experiences/ExperienceLaunchLink";
import { ModuleShell } from "@/components/project/module-shell";
import {
  Eyebrow,
  SectionHeading,
} from "@/components/site/primitives";
import { formatCompatibilityWarning } from "@/experiences/compatibility";
import { withLabReturnPath } from "@/experiences/controlled-chaos/parseLabSearchParams";
import { mapSanityExperienceConfig } from "@/experiences/mapSanityExperienceConfig";
import type { ExperienceMode } from "@/experiences/types";
import { resolveFileLabel, resolveFileUrl } from "@/lib/file-asset";
import { resolveMediaAlt, resolveMediaUrl } from "@/lib/media";
import type { ProjectThreeExperienceModule } from "@/types/project-modules";
import type { ThreeExperienceBlockValue } from "@/types/three-experience";
import Image from "next/image";

type ThreeExperienceSectionProps = {
  value: ThreeExperienceBlockValue;
  /** When false, omit ModuleShell (e.g. nested usage). Default true. */
  shelled?: boolean;
  caseStudyPath?: string;
};

function asMode(value: unknown): ExperienceMode {
  if (value === "preview" || value === "inline" || value === "replay") {
    return value;
  }
  return "preview";
}

function ExperiencePoster({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 1200px"
    />
  );
}

function ExperienceFallbackVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  return (
    <video
      className="h-full w-full object-cover"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={label}
    />
  );
}

export function ThreeExperienceSection({
  value,
  shelled = true,
  caseStudyPath,
}: ThreeExperienceSectionProps) {
  const mapped = mapSanityExperienceConfig(value);
  const posterSrc = resolveMediaUrl(value.posterImage, 1600);
  const posterAlt = resolveMediaAlt(
    value.posterImage,
    value.heading || "Interactive experience poster",
  );
  const videoSrc = resolveFileUrl(value.fallbackVideo ?? null);
  const videoLabel = resolveFileLabel(
    value.fallbackVideo ?? null,
    "Fallback experience video",
  );

  if (!mapped.ok) {
    console.warn(formatCompatibilityWarning(mapped));
  }

  const heading = mapped.ok
    ? mapped.value.presentation.heading || value.heading
    : value.heading;
  const description = mapped.ok
    ? mapped.value.presentation.description || value.description
    : value.description;
  const launchUrl = mapped.ok
    ? caseStudyPath
      ? withLabReturnPath(mapped.value.launchUrl, caseStudyPath)
      : mapped.value.launchUrl
    : null;
  const showFullscreen = mapped.ok
    ? mapped.value.presentation.showFullscreenAction
    : Boolean(value.showFullscreenAction);
  const fullscreenLabel = mapped.ok
    ? mapped.value.presentation.fullscreenLabel
    : value.fullscreenLabel || "Launch full experience";

  const stage = (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <Eyebrow>Interactive experience</Eyebrow>
        {heading ? (
          <SectionHeading className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)]">
            {heading}
          </SectionHeading>
        ) : null}
        {description ? (
          <p className="mt-5 max-w-xl font-sans text-[15px] leading-7 text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>

      {posterSrc ? (
        mapped.ok ? (
          <ExperienceClientBoundary
            experienceKey={mapped.value.experienceKey}
            mode={asMode(mapped.value.configuration.mode)}
            configuration={mapped.value.configuration}
            loadBehavior={mapped.value.presentation.loadBehavior}
            height={
              typeof mapped.value.configuration.height === "number"
                ? mapped.value.configuration.height
                : 720
            }
            poster={<ExperiencePoster src={posterSrc} alt={posterAlt} />}
            fallbackVideo={
              videoSrc ? (
                <ExperienceFallbackVideo
                  src={videoSrc}
                  poster={posterSrc}
                  label={videoLabel}
                />
              ) : undefined
            }
          />
        ) : (
          <div className="relative min-h-[420px] w-full overflow-hidden bg-bg-raised">
            <ExperiencePoster src={posterSrc} alt={posterAlt} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-deep/90 to-transparent p-6 md:p-8">
              <p role="status" className="max-w-md font-sans text-[14px] text-fg">
                The interactive version is temporarily unavailable. The case
                study content above still explains the project.
              </p>
            </div>
          </div>
        )
      ) : (
        <div
          role="status"
          className="border border-line bg-bg-raised px-6 py-10 font-sans text-[15px] text-fg-muted"
        >
          Interactive experience poster is missing, so the embed cannot be shown.
        </div>
      )}

      {showFullscreen && launchUrl && mapped.ok ? (
        <ExperienceLaunchLink
          href={launchUrl}
          experienceKey={mapped.value.experienceKey}
        >
          {fullscreenLabel}
        </ExperienceLaunchLink>
      ) : null}
    </div>
  );

  if (!shelled) return stage;
  return <ModuleShell>{stage}</ModuleShell>;
}

export function ThreeExperienceModule({
  module,
  caseStudyPath,
}: {
  module: ProjectThreeExperienceModule;
  caseStudyPath?: string;
}) {
  return (
    <ThreeExperienceSection value={module} caseStudyPath={caseStudyPath} />
  );
}
