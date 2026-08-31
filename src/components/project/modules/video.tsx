import { ModuleShell } from "@/components/project/module-shell";
import { resolveFileLabel, resolveFileUrl } from "@/lib/file-asset";
import { resolveMediaUrl } from "@/lib/media";
import { toEmbedUrl } from "@/lib/video-embed";
import type { ProjectVideoModule } from "@/types/project-modules";

export function VideoModule({ module }: { module: ProjectVideoModule }) {
  const fileUrl = resolveFileUrl(module.file ?? null);
  const posterSrc = resolveMediaUrl(module.poster) || undefined;
  const label =
    module.caption?.trim() ||
    (module.file ? resolveFileLabel(module.file, "Project video") : null) ||
    "Project video";

  if (fileUrl) {
    return (
      <ModuleShell>
        <div className="relative aspect-video w-full overflow-hidden bg-bg-raised">
          <video
            className="absolute inset-0 h-full w-full object-contain"
            src={fileUrl}
            controls
            playsInline
            preload="metadata"
            poster={posterSrc}
            title={label}
          />
        </div>
        {module.caption ? (
          <p className="mt-4 font-mono text-label uppercase tracking-[0.14em] text-fg-muted">
            {module.caption}
          </p>
        ) : null}
      </ModuleShell>
    );
  }

  const embed = module.url ? toEmbedUrl(module.url) : null;
  if (!embed) return null;

  return (
    <ModuleShell>
      <div className="relative aspect-video w-full overflow-hidden bg-bg-raised">
        <iframe
          src={embed}
          title={label}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {module.caption ? (
        <p className="mt-4 font-mono text-label uppercase tracking-[0.14em] text-fg-muted">
          {module.caption}
        </p>
      ) : null}
    </ModuleShell>
  );
}
