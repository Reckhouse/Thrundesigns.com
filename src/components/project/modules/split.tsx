import Image from "next/image";
import { ModuleShell } from "@/components/project/module-shell";
import { ProjectPortableText } from "@/components/project/portable-text";
import { resolveMediaAlt, resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ProjectSplitModule } from "@/types/project-modules";

export function SplitModule({ module }: { module: ProjectSplitModule }) {
  const src = resolveMediaUrl(module.media);
  if (!src && !module.body?.length) return null;

  const mediaRight = module.mediaPosition === "right";

  return (
    <ModuleShell>
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
          mediaRight && "[&>*:first-child]:lg:order-2",
        )}
      >
        {src ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-bg-raised">
            <Image
              src={src}
              alt={resolveMediaAlt(module.media, "Project visual")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-bg-raised" aria-hidden />
        )}
        <ProjectPortableText value={module.body} />
      </div>
    </ModuleShell>
  );
}
