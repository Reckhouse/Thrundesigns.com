import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreationReplayClient } from "@/app/creation/[creationId]/creation-replay-client";
import { DuplicateCreationButton } from "@/app/creation/[creationId]/duplicate-button";
import { ExperienceLaunchLink } from "@/components/experiences/ExperienceLaunchLink";
import { withLabReturnPath } from "@/experiences/controlled-chaos/parseLabSearchParams";
import { validateExperienceEmbedConfig } from "@/experiences/compatibility";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";
import type { ControlledChaosEmbedConfig } from "@thrun-design/controlled-chaos/schemas";
import { loadCreation } from "@/lib/creations/store";
import { isSafeHttpUrl, safeMetaText } from "@/lib/safe-meta";
import { getSiteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ creationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { creationId } = await params;
  const loaded = await loadCreation(creationId);
  if (!loaded.ok) {
    return {
      title: "Creation not found",
      robots: { index: false, follow: false },
    };
  }

  const title = safeMetaText(
    loaded.value.meta.title,
    `${controlledChaosManifest.title} creation`,
  );
  const description = `A saved ${controlledChaosManifest.title} outcome from Thrun Design Co.`;
  const thumb = loaded.value.meta.thumbnailUrl;

  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      ...(isSafeHttpUrl(thumb) ? { images: [{ url: thumb! }] } : {}),
    },
  };
}

export default async function CreationPage({
  params,
  searchParams,
}: PageProps) {
  const { creationId } = await params;
  const query = await searchParams;
  const from = firstValue(query.from);
  const caseStudyHref =
    from && from.startsWith("/") && !from.startsWith("//") ? from : "/work";

  const loaded = await loadCreation(creationId);
  if (!loaded.ok) {
    if (loaded.status === 404 || loaded.status === 400) notFound();
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-start justify-center gap-4 px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
          Creation unavailable
        </p>
        <p className="font-sans text-[15px] leading-7 text-fg">
          {loaded.message}
        </p>
        <Link
          href="/work"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted hover:text-gold"
        >
          ← Back to work
        </Link>
      </div>
    );
  }

  const embed = validateExperienceEmbedConfig(
    controlledChaosManifest.experienceKey,
    {
      mode: "replay",
      initialCreationId: creationId,
      initialPresetKey: loaded.value.payload.presetKey,
      quality: "auto",
      controls: "minimal",
      autoplay: false,
      height: controlledChaosManifest.defaultHeight,
      allowTextEditing: false,
      allowSvgUpload: false,
      allowAudio: false,
      allowExport: false,
      embedConfigVersion: controlledChaosManifest.embedConfigVersion,
      assetBaseUrl: `${getSiteUrl()}${controlledChaosManifest.assetBasePath}`,
    },
  );

  const title = safeMetaText(
    loaded.value.meta.title,
    controlledChaosManifest.title,
  );
  const editHref = withLabReturnPath(
    `/lab/controlled-chaos?mode=inline&creation=${encodeURIComponent(creationId)}${
      loaded.value.payload.presetKey
        ? `&preset=${encodeURIComponent(loaded.value.payload.presetKey)}`
        : ""
    }`,
    `/creation/${creationId}`,
  );

  return (
    <div className="flex min-h-full flex-col bg-bg-deep text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 md:px-10 lg:px-[74px]">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Saved creation
            </p>
            <h1 className="truncate font-display text-[1.15rem] leading-tight tracking-[-0.02em]">
              {title}
            </h1>
          </div>
          <nav className="flex shrink-0 items-center gap-5">
            <Link
              href={caseStudyHref}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold"
            >
              ← Case study
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-10 px-6 py-12 md:px-10 lg:px-[74px]">
        {loaded.value.meta.thumbnailUrl ? (
          <div className="relative aspect-[9/16] max-w-sm overflow-hidden bg-bg-raised">
            <Image
              src={loaded.value.meta.thumbnailUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
              loading="lazy"
            />
          </div>
        ) : null}

        <p className="max-w-xl font-sans text-[15px] leading-7 text-fg-muted">
          This page replays a saved poster creation. Visitor phrases and private
          assets are not indexed for search.
        </p>

        {embed.ok ? (
          <CreationReplayClient
            creationId={creationId}
            creation={loaded.value.payload}
            configuration={
              embed.value.configuration as ControlledChaosEmbedConfig
            }
          />
        ) : (
          <div
            role="alert"
            className="border border-line bg-bg-raised p-6 font-sans text-[15px] text-fg"
          >
            {embed.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <ExperienceLaunchLink
            href={editHref}
            experienceKey={controlledChaosManifest.experienceKey}
          >
            Edit this version
          </ExperienceLaunchLink>
          <DuplicateCreationButton creationId={creationId} />
        </div>
      </main>
    </div>
  );
}
