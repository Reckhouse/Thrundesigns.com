import Image from "next/image";
import { ModuleShell } from "@/components/project/module-shell";
import { ProjectPortableText } from "@/components/project/portable-text";
import {
  mediaAspectRatioClass,
  mediaDisplayWidthClass,
  mediaObjectFitClass,
  resolveAspectRatio,
  resolveDisplayWidth,
  resolveMediaAlt,
  resolveMediaObjectPosition,
  resolveMediaUrl,
  resolveObjectFit,
} from "@/lib/media";
import {
  moduleMediaPath,
  projectMediaDataAttribute,
} from "@/lib/sanity-data-attribute";
import { cn } from "@/lib/utils";
import type { ProjectSplitModule } from "@/types/project-modules";

type SplitModuleProps = {
  module: ProjectSplitModule;
  documentId?: string | null;
};

export function SplitModule({ module, documentId }: SplitModuleProps) {
  const aspect = resolveAspectRatio(module.media);
  const fit = resolveObjectFit(module.media);
  const width = resolveDisplayWidth(module.media);
  const src = resolveMediaUrl(module.media, {
    width: 1600,
    aspectRatio: aspect,
    objectFit: fit,
  });
  if (!src && !module.body?.length) return null;

  const mediaRight = module.mediaPosition === "right";
  const objectPosition = resolveMediaObjectPosition(module.media);

  return (
    <ModuleShell>
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
          mediaRight && "[&>*:first-child]:lg:order-2",
        )}
      >
        {src ? (
          <div
            className={cn(
              "relative overflow-hidden bg-bg-raised",
              mediaDisplayWidthClass(width),
              mediaAspectRatioClass(aspect, "aspect-[4/3]"),
            )}
            data-sanity={projectMediaDataAttribute({
              documentId,
              path: moduleMediaPath(module._key, "media"),
            })}
          >
            <Image
              src={src}
              alt={resolveMediaAlt(module.media, "Project visual")}
              fill
              className={mediaObjectFitClass(fit)}
              style={
                objectPosition ? { objectPosition } : undefined
              }
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div
            className={cn(
              "bg-bg-raised",
              mediaAspectRatioClass(aspect, "aspect-[4/3]"),
            )}
            aria-hidden
          />
        )}
        <ProjectPortableText value={module.body} />
      </div>
    </ModuleShell>
  );
}
