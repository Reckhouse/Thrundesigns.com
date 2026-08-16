import { ModuleShell } from "@/components/project/module-shell";
import { ProjectPortableText } from "@/components/project/portable-text";
import { ProjectMediaFrame } from "@/components/project/project-media-frame";
import {
  isScrollableDisplay,
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
  const displayWidth = resolveDisplayWidth(module.media);
  const scrollable = isScrollableDisplay(displayWidth);
  const aspect = scrollable ? "auto" : resolveAspectRatio(module.media);
  const fit = resolveObjectFit(module.media);
  const src = resolveMediaUrl(module.media, {
    width: scrollable ? 1400 : 1600,
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
          scrollable && "lg:grid-cols-1",
        )}
      >
        {src ? (
          <ProjectMediaFrame
            src={src}
            alt={resolveMediaAlt(module.media, "Project visual")}
            displayWidth={displayWidth}
            aspectRatio={aspect}
            objectFit={fit}
            objectPosition={objectPosition}
            aspectFallback="aspect-[4/3]"
            sizes={
              scrollable
                ? "(max-width: 1024px) 100vw, 1024px"
                : "(max-width: 1024px) 100vw, 50vw"
            }
            dataSanity={projectMediaDataAttribute({
              documentId,
              path: moduleMediaPath(module._key, "media"),
            })}
          />
        ) : (
          <div
            className="aspect-[4/3] bg-bg-raised"
            aria-hidden
          />
        )}
        <ProjectPortableText value={module.body} />
      </div>
    </ModuleShell>
  );
}
