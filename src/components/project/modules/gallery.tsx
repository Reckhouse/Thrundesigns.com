import Image from "next/image";
import { ModuleShell } from "@/components/project/module-shell";
import { resolveMediaAlt, resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ProjectGalleryModule } from "@/types/project-modules";

export function GalleryModule({ module }: { module: ProjectGalleryModule }) {
  const items = (module.items || [])
    .map((item, index) => {
      const src = resolveMediaUrl(item);
      if (!src) return null;
      return {
        key: `gallery-${index}`,
        src,
        alt: resolveMediaAlt(item, "Project image"),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!items.length) return null;

  const layout = module.layout || "grid";

  if (layout === "fullBleed") {
    return (
      <ModuleShell contained={false} className="bg-bg-raised">
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.key}
              className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[21/9]"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        {module.caption ? (
          <p className="mx-auto max-w-[1440px] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted md:px-10 lg:px-[74px]">
            {module.caption}
          </p>
        ) : null}
      </ModuleShell>
    );
  }

  return (
    <ModuleShell>
      <div
        className={cn(
          layout === "masonry" &&
            "columns-1 gap-4 md:columns-2 md:gap-5 lg:columns-3 [&>*]:mb-4 md:[&>*]:mb-5",
          layout === "grid" &&
            "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6",
        )}
      >
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "relative overflow-hidden bg-bg-raised",
              layout === "grid" && "aspect-[4/3]",
              layout === "masonry" && "break-inside-avoid",
            )}
          >
            {layout === "masonry" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        ))}
      </div>
      {module.caption ? (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
          {module.caption}
        </p>
      ) : null}
    </ModuleShell>
  );
}
