import { ModuleShell } from "@/components/project/module-shell";
import { toEmbedUrl } from "@/lib/video-embed";
import type { ProjectVideoModule } from "@/types/project-modules";

export function VideoModule({ module }: { module: ProjectVideoModule }) {
  const embed = module.url ? toEmbedUrl(module.url) : null;
  if (!embed) return null;

  return (
    <ModuleShell>
      <div className="relative aspect-video w-full overflow-hidden bg-bg-raised">
        <iframe
          src={embed}
          title={module.caption || "Project video"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {module.caption ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
          {module.caption}
        </p>
      ) : null}
    </ModuleShell>
  );
}
